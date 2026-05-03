import path from 'path';
import { config } from 'dotenv';
import { defineConfig } from 'prisma/config';
import { PrismaPg } from '@prisma/adapter-pg';

// Load root .env so DATABASE_URL is available during prisma migrate / generate
config({ path: path.resolve(__dirname, '../../.env') });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrate: {
    async adapter() {
      const { Pool } = await import('pg');
      const pool = new Pool({ connectionString: process.env['DATABASE_URL'] });
      return new PrismaPg(pool);
    },
  },
  datasource: {
    url: process.env['DATABASE_URL']!,
  },
});
