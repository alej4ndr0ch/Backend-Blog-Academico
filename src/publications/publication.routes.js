import { Router } from "express";
import { check } from "express-validator";
import { existePublicationById } from "../helpers/db-validator.js";
import { validarCampos } from "../middlewares/validar-campos.js";
import { validarUserJWT } from "../middlewares/validar-jwt.js";

import {
  addPublication,
  getPublications,
  getPublicationById,
  updatePublication,
  deletePublication,
  getPublicationsByCourse,
} from "./publication.controller.js";

const router = Router();

router.post('/', validarCampos, addPublication);

router.get('/', getPublications);

router.get(
  '/findPublication/:id',
  [
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(existePublicationById),
    validarCampos
  ],
  getPublicationById
);

// ✅ NUEVA RUTA DE FILTRADO POR CURSO
router.get(
  '/by-course/:id',
  [
    check('id', 'No es un ID válido').isMongoId(),
    validarCampos
  ],
  getPublicationsByCourse
);

router.put(
  '/:id',
  [
    validarUserJWT,
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(existePublicationById),
    validarCampos
  ],
  updatePublication
);

router.delete(
  '/:id',
  [
    validarUserJWT,
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(existePublicationById),
    validarCampos
  ],
  deletePublication
);

export default router;
