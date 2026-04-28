export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MENTOR = 'MENTOR',
  STUDENT = 'STUDENT',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDTO {
  email: string;
  password: string;
  name: string;
  role: Role;
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  isActive?: boolean;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JWTPayload {
  sub: string;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}
