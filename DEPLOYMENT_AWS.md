# Deploying to AWS — attendance-tracker.ayown.me

This targets **one EC2 instance running the existing `docker-compose.yml`**, fronted
by an nginx container doing TLS termination via Let's Encrypt, serving
`attendance-tracker.ayown.me`. This reuses everything that already exists in the repo
(Dockerfiles, compose file, per-service healthchecks) instead of introducing
ECS/Fargate/RDS complexity that's risky to get right for the first time inside a
one-day borrowed-account window.

It's also a legitimate seed for real production later — see the "Path to production"
section at the end for what to upgrade when this becomes more than a demo.

**Before you deploy:** this guide assumes the nginx routing fix already applied in
this repo (`infrastructure/nginx/nginx.conf` was rewritten because the original
config proxied `/api/users/` and `/api/attendance/` — paths that don't match how the
services actually mount their routes — meaning it would have 404'd most of the app).
`docker-compose.yml` now also includes an `nginx` service, which it didn't before.
Both are already committed in this repo; nothing extra to do for that part.

---

## 1. Account & sizing decisions

**Whose AWS account.** You'll deploy on your friend's account for the actual demo
day, since your own account's Free Tier is real but capped to `t2.micro`/`t3.micro`
(1 GB RAM) — see the sizing note below for why that's tight for this app. Ask your
friend for either:

- Full console access to a throwaway region/account, or
- An IAM user scoped to EC2 (+ optionally Route53, only if they're willing to let you
  manage `attendance-tracker.ayown.me`'s DNS through their account — otherwise you
  keep DNS on your own registrar and just point an A record at their EC2 IP, which is
  simpler and doesn't require any Route53 access at all).

**Instance size.** This box runs 5 Node services + Next.js + Postgres + Redis
concurrently. `t2.micro`/`t3.micro` (1 GB RAM) — what Free Tier covers — will likely
swap or OOM under that load. Use **`t3.small` (2 GB)** at minimum;
**`t3.medium` (4 GB)** if you want headroom for a live demo with people actually
clicking around. Neither is Free Tier eligible, but on a borrowed account for a few
hours this is cents, not dollars.

**AWS Free Tier vs. the $100 credit — these are different things.** The $100
promotional credit is separate from the standard 12-month Free Tier (750 hrs/month of
`t2.micro`/`t3.micro`, some free RDS/S3 too), which is active on your own brand-new
account right now with no credit required. It just won't comfortably run this whole
stack. Useful once you're back on your own account: run a **lighter subset** on Free
Tier (e.g. just `web` + `auth-service` + Postgres for a quick personal check), not
the full 8-container stack.

---

## 2. Launch the instance

1. **AMI:** Ubuntu 24.04 LTS.
2. **Instance type:** `t3.small` or `t3.medium` (see above).
3. **Elastic IP:** allocate one and associate it with the instance. Without this,
   stopping/restarting the instance between "borrow the account, set up" and "borrow
   the account again, demo day" gives you a new public IP each time, breaking DNS.
4. **Security Group** — this is the part that actually matters for safety:
   | Port | Source | Why |
   |---|---|---|
   | 22 (SSH) | Your IP only | Never open SSH to `0.0.0.0/0` |
   | 80 (HTTP) | `0.0.0.0/0` | Needed for Certbot's HTTP-01 challenge + redirect to HTTPS |
   | 443 (HTTPS) | `0.0.0.0/0` | The actual app traffic |
   | 3000–3005, 5432, 6379 | **nowhere** | Do not open these publicly — they're only reachable inside the Docker network, via nginx |

## 3. Point DNS at it

Wherever `ayown.me`'s DNS is currently managed (your registrar, or Route53 if you've
already moved it there), add:

```
A    attendance-tracker.ayown.me    →   <Elastic IP>
```

This does **not** require using Route53 or the friend's account for DNS — only the
compute needs to live in AWS. Give it a few minutes to propagate before requesting a
cert (Certbot's HTTP-01 challenge needs the domain already resolving to this box).

## 4. Set up the instance

SSH in, then:

```bash
# Docker + Compose plugin
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
newgrp docker

# Get the code onto the box
git clone <your-repo-url> attendance-tracker
cd attendance-tracker

cp .env.example .env
```

Edit `.env` with **real** production values — this is the part most likely to bite
you if skipped:

```bash
NODE_ENV=production
POSTGRES_PASSWORD=<generate a real random password>
DATABASE_URL=postgresql://postgres:<same password>@postgres:5432/attendance_tracker
JWT_SECRET=<node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
JWT_REFRESH_SECRET=<same command, run again for a different value>
CORS_ORIGIN=https://attendance-tracker.ayown.me

# nginx path-routes everything through one origin, so all four of these
# point at the public domain, not localhost:
NEXT_PUBLIC_AUTH_SERVICE_URL=https://attendance-tracker.ayown.me
NEXT_PUBLIC_USER_SERVICE_URL=https://attendance-tracker.ayown.me
NEXT_PUBLIC_ATTENDANCE_SERVICE_URL=https://attendance-tracker.ayown.me
NEXT_PUBLIC_SCHEDULE_SERVICE_URL=https://attendance-tracker.ayown.me
```

## 5. Bring up the app (before TLS)

```bash
docker compose up -d --build postgres redis auth-service user-service \
  attendance-service schedule-service notification-service web
```

Wait for healthchecks to go green (`docker compose ps`), then run the migration and
seed **inside the running auth-service container** — it already has the Prisma
schema and generated client baked in from the Docker build:

```bash
docker compose exec auth-service npx prisma migrate deploy
docker compose exec auth-service npx tsx src/seed.ts
```

Confirm the backend is healthy directly (before nginx is even up, using the
container's mapped ports, over plain HTTP on the box itself):

```bash
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health
curl http://localhost:3004/health
curl http://localhost:3005/health
```

## 6. Get a TLS certificate, then bring up nginx

Chicken-and-egg: Certbot needs port 80 answering _before_ nginx has a cert to serve
on 443, and nginx's config in this repo listens on `server_name
attendance-tracker.ayown.me` on port 80 already — so the sequence is: start nginx on
80 first (cert-less), get the cert via the webroot method, then add the HTTPS
server block and reload.

```bash
# Bring up nginx on port 80 only, serving the app over HTTP for now
docker compose up -d nginx

# Get the cert (webroot method, using the certbot_www volume nginx already mounts)
docker run --rm \
  -v attendance-tracker_certbot_www:/var/www/certbot \
  -v attendance-tracker_certbot_certs:/etc/letsencrypt \
  certbot/certbot certonly --webroot \
  -w /var/www/certbot \
  -d attendance-tracker.ayown.me \
  --email you@example.com --agree-tos --no-eff-email
```

Then add an HTTPS `server` block to `infrastructure/nginx/nginx.conf` (append,
don't replace the existing port-80 block — keep 80 around so it can redirect):

```nginx
server {
    listen 443 ssl;
    server_name attendance-tracker.ayown.me;

    ssl_certificate     /etc/letsencrypt/live/attendance-tracker.ayown.me/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/attendance-tracker.ayown.me/privkey.pem;

    client_max_body_size 10M;

    # Copy every location block from the existing port-80 server{} here.
}
```

And change the existing port-80 block's `location /` (and only that one — leave the
Certbot webroot path, `/.well-known/acme-challenge/`, served over plain HTTP so
renewals keep working) to redirect:

```nginx
location / {
    return 301 https://$host$request_uri;
}
```

Reload nginx: `docker compose exec nginx nginx -s reload`.

**Auto-renewal:** Certbot certs expire in 90 days. Even for a one-day demo, set this
up now since it costs nothing and saves you from re-doing this manually the next time
you spin the box back up — a cron entry running the same `certbot renew` webroot
command monthly, followed by an nginx reload, is the minimum viable version.

## 7. Verify the live deployment

- `curl -I https://attendance-tracker.ayown.me` → should return a valid response with
  a real cert (no `-k` needed).
- Log in as the seeded super admin at `https://attendance-tracker.ayown.me/login` and
  walk through the same role chain as `TESTING.md` — Super Admin → Admin → Mentor →
  Student — but now through the public domain instead of localhost.
- **Specifically test the QR/Socket.IO flow over HTTPS.** This is the part most
  likely to break behind a reverse proxy, because Socket.IO needs the WebSocket
  upgrade headers to survive the proxy hop. `nginx.conf`'s `/socket.io/` block
  already sets `proxy_set_header Upgrade $http_upgrade;` and
  `proxy_set_header Connection "upgrade";` for exactly this reason — if the student's
  QR page shows "connecting" but never gets a code, check nginx's logs
  (`docker compose logs nginx`) for upgrade failures before assuming it's an app bug.

---

## 8. Running it for one demo day, then tearing down

- **Stopping vs. terminating:** `docker compose stop` on the instance (or `aws ec2
stop-instances`) preserves everything — the EBS volume, the Elastic IP association
  — so you can pick the demo back up later at the cost of EBS storage (cents/month).
  Terminating the instance is cleaner if this really is one-and-done, but **release
  the Elastic IP separately** afterward — an unattached Elastic IP is billed hourly
  even with no instance behind it.
- **Rough cost for a `t3.small` for a few hours to a full day:** a few cents to
  roughly a dollar in compute, plus negligible EBS/data-transfer — trivial on a
  borrowed account, but worth confirming with your friend what they're comfortable
  with regardless of the small amount.
- **Before handing the account back:** rotate or delete anything sensitive you put in
  it — the `.env` on the instance has real JWT secrets and a real DB password;
  terminate the instance (which destroys the EBS volume and its contents) rather than
  leaving it stopped indefinitely on someone else's bill.

---

## 9. Path to real production

You mentioned this could become a longer-lived deployment, not just a demo. When
that becomes real, upgrade these in roughly this order:

1. **Managed Postgres (RDS)** instead of the `postgres` container — automated
   backups, and a DB outage no longer takes the whole EC2 box down with it.
2. **Secrets out of the plaintext `.env` on disk** — AWS Secrets Manager or SSM
   Parameter Store, injected at container start instead of committed to a file on the
   instance's filesystem.
3. **ALB + ACM certificate** instead of self-managed Certbot, if you outgrow a single
   box — gives you managed cert renewal and makes it trivial to add a second instance
   behind it later.
4. **Split to ECS Fargate per-service** once the team is actually committed
   long-term — right now `docker compose` on one box is the right tradeoff for
   "not yet decided if this is permanent," but it doesn't scale past one instance on
   its own.
5. **Close the test-coverage gap** noted in `TESTING.md` (`attendance-service`,
   `schedule-service`, `notification-service` have no automated tests at all) before
   calling anything "production-ready" — a demo can survive untested code; a real
   deployment people rely on shouldn't.
6. If the friend's AWS account becomes the permanent home, move `ayown.me`'s DNS into
   Route53 there too, so DNS + compute + certs are all in one place instead of split
   across your registrar and their AWS account.

---

## Honesty note on this guide

Everything above about the app's own architecture (ports, routes, env vars, the
nginx bug and its fix, the Docker build process) is verified directly against this
repo's code. The AWS-specific steps (EC2 console flow, Security Group setup, Certbot
sequencing) are written correctly from how these AWS services work, but **haven't
been dry-run against a live instance** as part of writing this guide — provisioning
real infrastructure costs money and needs actual account access. When you're ready to
actually deploy, it's worth going through this together in case any step needs
adjusting for the specific state of your friend's account (existing VPC setup,
region, etc.).
