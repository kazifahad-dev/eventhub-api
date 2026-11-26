import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../../config/env";
import { AppError } from "../../utils/AppError";
import { authRepository } from "./auth.repository";
import { LoginInput, SignupInput } from "./auth.schema";

const SALT_ROUNDS = 10;

export const authService = {
  async signup(input: SignupInput) {
    const existing = await authRepository.findByEmail(input.email);
    if (existing) {
      throw new AppError(409, "Email already registered");
    }

    const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);

    try {
      return await authRepository.createUser(
        input.name,
        input.email,
        hashedPassword,
        input.role ?? "attendee"
      );
    } catch (err) {
      
      if ((err as { code?: string }).code === "23505") {
        throw new AppError(409, "Email already registered");
      }
      throw err;
    }
  },

  async login(input: LoginInput) {
    const user = await authRepository.findByEmail(input.email);

    
    if (!user) {
      throw new AppError(401, "Invalid email or password");
    }

    const isMatch = await bcrypt.compare(input.password, user.password);
    if (!isMatch) {
      throw new AppError(401, "Invalid email or password");
    }

    const token = jwt.sign({ id: user.id, role: user.role }, env.jwtSecret, {
      expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"],
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  },
};