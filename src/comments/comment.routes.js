import { Router } from "express";
import { check } from "express-validator";
import { existeCommentById } from "../helpers/db-validator.js";
import { validarCampos } from "../middlewares/validar-campos.js";
import { validarUserJWT } from "../middlewares/validar-jwt.js";
import {
  addComments,
  getComments,
  getCommentsById,
  updateComments,
  deleteComments,
  getCommentsByPublicationId,
} from "./comment.controller.js";

const router = Router();

router.post(
  "/:id",
  [
    check("id", "No es un ID válido").isMongoId(),
    check("text", "El texto es obligatorio").not().isEmpty(),
    check("username", "El username es obligatorio").not().isEmpty(),
    validarCampos,
  ],
  addComments
);

router.get("/", getComments);

router.get(
  "/:id",
  [
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeCommentById),
    validarCampos,
  ],
  getCommentsById
);

router.put(
  "/:id", 
  [
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeCommentById),
    validarCampos,
  ], 
  updateComments
);

router.delete(
  "/:id",
  [
    check("id", "No es un ID válido").isMongoId(),
    check("id").custom(existeCommentById),
    validarCampos,
  ],
  deleteComments
);

router.get("/publication/:id", getCommentsByPublicationId);

export default router;
