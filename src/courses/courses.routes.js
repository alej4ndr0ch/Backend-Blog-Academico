import { Router } from "express";
import { check } from "express-validator";
import { existeCoursesById } from "../helpers/db-validator.js";
import { validarCampos } from "../middlewares/validar-campos.js";
import { validarUserJWT } from "../middlewares/validar-jwt.js";
import { validatorCourses } from "../middlewares/validator.js";
import { saveCourses, getCourses, getCoursesById, updateCourses, deleteCourses, restoreCourses } from "./courses.controller.js";

const router = Router();

router.post(
    '/',
    [
        validarUserJWT,
        validatorCourses,
        validarCampos
    ],
    saveCourses
);

router.get(
    '/',
    getCourses
);

router.get(
    '/findCourses/:id',
    [
        check('id', 'No es un ID válido').isMongoId(),
        check('id').custom(existeCoursesById),
        validarCampos
    ],
    getCoursesById
);

router.put(
    '/:id',
    [
        validarUserJWT,
        check('id', 'No es un ID válido').isMongoId(),
        check('id').custom(existeCoursesById),
        validatorCourses,
        validarCampos
    ],
    updateCourses
);

router.delete(
    '/:id',
    [
        validarUserJWT,
        check('id', 'No es un ID válido').isMongoId(),
        check('id').custom(existeCoursesById),
        validarCampos
    ],
    deleteCourses
);

router.put(
    '/restore/:id',
    [
        validarUserJWT,
        check('id', 'No es un ID válido').isMongoId(),
        check('id').custom(existeCoursesById),
        validarCampos
    ],
    restoreCourses
);

export default router;