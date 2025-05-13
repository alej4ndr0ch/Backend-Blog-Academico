import { Router } from "express";
import { login, register } from "../auth/auth.controller.js";
import { validatorLogin, validatorRegister } from "../middlewares/validator.js";

const router = Router();

router.post(
    '/login',
    validatorLogin,
    login
);

router.post(
    '/register',
    validatorRegister,
    register
);

export default router;