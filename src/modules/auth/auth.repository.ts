import { pool } from "../../config/db";
import { UserRole } from "../../types/express";

export interface UserRecord {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

export type PublicUser = Omit<UserRecord, "password">;

export const authRepository = {
  async findByEmail(email: string): Promise<UserRecord | null> {
    const result = await pool.query<UserRecord>(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    return result.rows[0] ?? null;
  },

  async createUser(
    name: string,
    email: string,
    hashedPassword: string,
    role: UserRole
  ): Promise<PublicUser> {
    const result = await pool.query<PublicUser>(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at, updated_at`,
      [name, email, hashedPassword, role]
    );
    return result.rows[0];
  },
};