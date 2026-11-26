import { RequestHandler } from "express";
import { sendResponse } from "../../utils/sendResponse";
import { authService } from "./auth.service";

export const authController: Record<"signup" | "login", RequestHandler> = {
  async signup(req, res) {
    const user = await authService.signup(req.body);
    sendResponse(res, 201, "User registered successfully", user);
  },

  async login(req, res) {
    const result = await authService.login(req.body);
    sendResponse(res, 200, "Login successful", result);
  },
};