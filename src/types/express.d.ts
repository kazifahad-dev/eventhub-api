export type UserRole = "attendee" | "organizer";

export interface AuthUser {
  id: number;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}