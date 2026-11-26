import { Router } from "express";
import { validate } from "../../middleware/validate";
import { authController } from "./auth.controller";
import { loginSchema, signupSchema } from "./auth.schema";

const router = Router();

router.post("/signup", validate({ body: signupSchema }), authController.signup);
router.post("/login", validate({ body: loginSchema }), authController.login);

export default router;