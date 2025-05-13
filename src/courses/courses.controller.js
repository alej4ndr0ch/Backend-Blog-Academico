import Courses from './courses.model.js';
import { request, response } from 'express';

export const saveCourses = async (req, res) => {
    try {
        
        const data = req.body;

        const courses = await Courses.create({
            name: data.name.toLowerCase(),
            description: data.description
        });

        if (req.user.role !== "ADMIN") {
            return res.status(400).json({
                success: false,
                msg: 'No tienes permisos para guardar categorias'
            });
        }

        res.status(200).json({
            success: true,
            msg: 'Cursos guardada exitosamente',
            courses
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            msg: 'Error, no se ha podido guardar la curso',
            error
        });
    }
}

export const getCourses = async (req = request, res = response) => {
    try {
        
        const { limite = 10, desde = 0 } = req.body;
        const query = { estado: true };

        const [ total, courses ] = await Promise.all([
            Courses.countDocuments(query),
            Courses.find(query)
           .skip(Number(desde))
           .limit(Number(limite))
        ])

        res.status(200).json({
            success: true,
            total,
            courses
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error, no se ha podido obtener las cursos',
            error
        });
    }
}

export const getCoursesById = async (req, res) => {
    try {
        
        const { id } = req.params;

        const courses = await Courses.findById(id);

        if (courses.estado === false) {
            return res.status(400).json({
                success: false,
                msg: 'Este curso no esta disponible'
            });
        }

        if (!courses) {
            return res.status(400).json({
                success: false,
                msg: 'cursos no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            courses
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error, no se ha podido obtener la cursos por ID',
            error
        });
    }
}

export const updateCourses = async (req, res = response) => {
    try {
        
        const { id } = req.params;
        const { _id, ...data } = req.body;
        let { name } = req.body;

        if (name) {
            name = name.toLowerCase();
            data.name = name;
        }

        const courses = await Courses.findById(id);

        if (!courses) {
            return res.status(400).json({
                success: false,
                msg: 'cursos no encontrada'
            });
        }

        const coursesGeneral = await Courses.findOne({ name: "General".toLowerCase() });
        
        if (coursesGeneral && id === coursesGeneral._id.toString()) {
            return res.status(400).json({
                success: false,
                msg: 'Error, no se ha podido editar los cursos por defecto General'
            })
        }
        
        if (courses.estado === false) {
            return res.status(400).json({
                success: false,
                msg: 'Este cursos no esta disponible'
            });
        }

        if (req.user.role !== "ADMIN") {
            return res.status(400).json({
                success: false,
                msg: 'Error, permisos denegado para editar cursos'
            });
        }

        const updateCourses = await Courses.findByIdAndUpdate(id, data, { new: true });

        res.status(200).json({
            success: true,
            msg: 'Cursos actualizada exitosamente',
            updateCourses
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error, no se ha podido actualizar la cursos',
            error
        });
    }
}

export const deleteCourses = async (req, res = response) => {
    try {
        
        const { id } = req.params;

        
        const authenticatedCategorie = req.categorie;
        
        if (req.user.role !== "ADMIN") {
            return res.status(400).json({
                success: false,
                msg: 'Error, permisos denegado para eliminar categorias'
            });
        }
        
        const categorieGeneral = await Categorie.findOne({ name: "General".toLowerCase() });
        
        if (categorieGeneral && id === categorieGeneral._id.toString()) {
            return res.status(400).json({
                success: false,
                msg: 'Error, no puedes eliminar la categoría por defecto General'
            })
        }
        
        const categorie = await Categorie.findByIdAndUpdate(id, { estado: false }, { new: true });

        res.status(200).json({
            success: true,
            msg: 'Categoría eliminada exitosamente',
            categorie,
            authenticatedCategorie
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error, no se ha podido eliminar la categoria',
            error
        })
    }
}

export const restoreCourses = async (req, res = response) => {
    try {
        
        const { id } = req.params;

        const courses = await Courses.findByIdAndUpdate(id, { estado: true }, { new: true });

        const authenticatedCourses = req.courses;

        if (req.user.role !== "ADMIN") {
            return res.status(400).json({
                success: false,
                msg: 'No tienes permisos para restaurar cursos'
            });
        }

        res.status(200).json({
            success: true,
            msg: 'Cursos restaurada exitosamente',
            courses,
            authenticatedCourses
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error, no se ha podido restaurar los cursos',
            error
        })
    }
}

export const defaultCourses = async () => {
    try {

        const verifyCourses = await Courses.findOne({ name: "General".toLowerCase() });

        if (!verifyCourses) {
            const coursesGeneral = new Courses({
                name: "General".toLowerCase(),
                description: "curso por defecto para publicaciones sin una categoría especifica. No se puede eliminar ni editar"
            });
    
            await coursesGeneral.save();
    
            console.log("La categoria se ha creado");
        } else {
            console.log("Error, la categoria ya se ha creado");
        }


    } catch (error) {
        console.error("Error, no se ha podido crear la categoria", error);
    }
}