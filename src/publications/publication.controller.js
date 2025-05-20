import Publication from "./publication.model.js";
import Courses from "../courses/courses.model.js";
import User from "../users/user.model.js"
import { existePublicationById } from "../helpers/db-validator.js";
import { request, response } from "express";

export const addPublication = async (req, res) => {
    try {

        const data = req.body;
        const user = await User.findOne({ username: data.username.toLowerCase() });
        const courses = await Courses.findOne({ name: data.name.toLowerCase() });

        if (!user) {
            return res.status(400).json({
                success: false,
                msg: "Error, el usuario no ha sido encontrado"
            });
        }

        if (!courses) {
            return res.status(400).json({
                success: false,
                msg: "Error,  la categoría no ha sido encontrada"
            });
        }

        const publication = await Publication.create({
            ...data,
            user: user._id,
            username: user.username,
            courses: courses._id,
            name: courses.name
        });

        const publicationDetails = await Publication.findById(publication._id)
            .populate('user')
            .populate('courses');

        const details = {
            detailsPublication: {
                publicationDetails
            }
        }

        res.status(200).json({
            success: true,
            msg: "La publicación se ha guardado exitosamente",
            publication,
            details
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            msg: "Error, no se ha podido guardar la publicación",
            error
        });
    }
}

export const uploadPublicationImage = async (req, res) => {
    try {

        const { id } = req.params || {};
        const { image } = req.body || {};

        await requiredImage(image);
        await existePublicationById(id);

        const publication = await Publication.findById(id);
        await permisoPublication(req, publication);

        publication.image = image;
        await publication.save();

        res.status(200).json({
            success: true,
            msg: "Imagen subida exitosamente!!",
            publication
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: "Error al subir la imagen",
            error: error.message
        })
    }
}

export const getPublications = async (req = request, res = response) => {
    try {
        const { limite = 10, desde = 0 } = req.query;
        const query = { estado: true };
        const [total, publications] = await Promise.all([
            Publication.countDocuments(query),
            Publication.find(query)
           .populate('user')
           .populate('courses')
           .skip(Number(desde))
           .limit(Number(limite))
        ])

        res.status(200).json({
            success: true,
            total,
            publications
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: "Error, no se ha podido encontrar la publicacion",
            error
        });
    }
}

export const getPublicationById = async (req, res) => {
    try {
        const { id } = req.params;
        const publication = await Publication.findById(id).
        populate('user').
        populate('courses');

        if (publication.estado === false) {
            return res.status(400).json({
                success: false,
                msg: "Esta publicación no está disponible"
            });
        }

        if (!publication) {
            return res.status(404).json({
                success: false,
                msg: "La publicación no ha sido encontrado"
            });
        }

        res.status(200).json({
            success: true,
            publication
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: "Error, no se ha podido obtener el ID",
            error
        });
    }
}

export const updatePublication = async (req, res = response) => {
    try {
        const { id } = req.params;
        const { _id, username, ...data } = req.body;
        let { name } = req.body;

        
        if (name) {
            name = name.toLowerCase();
            data.name = name;
        }
        
        const publication = await Publication.findById(id);
        if (!publication) {
            return res.status(400).json({
                success: false,
                msg: "La publicación no ha sido encontrada"
            });
        }

        if (publication.estado === false) {
            return res.status(400).json({
                success: false,
                msg: 'Esta publicación no esta disponible'
            })
        }
        
        const user = await User.findOne({ username: username.toLowerCase() });
        if (!user) {
            return res.status(400).json({
                success: false,
                msg: "El usuario no ha sido encontrado"
            });
        }
        
        const courses = await Courses.findOne({ name });
        if (!courses) {
            return res.status(400).json({
                success: false,
                msg: "La categoria no ha sido encontrado"
            });
        }

        data.courses = courses._id;


        if (req.user._id.toString() !== publication.user.toString() && req.user.role !== "ADMIN") {
            return res.status(400).json({
                success: false,
                msg: "No tiene permiso para actualizar esta publicacion"
            });
        }

        await Publication.findByIdAndUpdate(id, data, { new: true });

        const publicationDetails = await Publication.findById(publication._id)
            .populate('user')
            .populate('categorie');

        const details = {
            detailsPublication: {
                publicationDetails
            }
        }

        res.status(200).json({
            success: true,
            msg: "La publicación ha sido actualizado exitosamente",
            details
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            msg: "Error, no se ha podido actualizar la publicación",
            error
        });
    }
}

export const deletePublication = async (req, res = response) => {
    try {
        const { id } = req.params;
        const authenticatedPublication = req.publication;

        const publication = await Publication.findById(id);
        if (!publication) {
            return res.status(400).json({
                success: false,
                msg: "La publicación no ha sido encontrada"
            });
        }

        if (req.user.id.toString() !== publication.user.toString() && req.user.role !== "ADMIN") {
            return res.status(400).json({
                success: false,
                msg: "Error, no tiene permiso para eliminar esta publicacion"
            });
        }

        const publicationDelete = await Publication.findByIdAndUpdate(id, { estado: false }, { new: true });

        res.status(200).json({
            success: true,
            msg: "La publicación ha sido eliminada exitosamente",
            publicationDelete,
            authenticatedPublication
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: "Error, no se ha podido eliminar la publicación",
            error
        });
    }
}

export const getPublicationsByCourse = async (req, res) => {
    try {
        const { name } = req.params;

        const course = await Courses.findOne({ name: name.toLowerCase(), estado: true });

        if (!course) {
            return res.status(404).json({
                success: false,
                msg: "Curso no encontrado"
            });
        }

        const publications = await Publication.find({ courses: course._id, estado: true })
            .populate("user")
            .populate("courses");

        res.status(200).json({
            success: true,
            course: course.name,
            total: publications.length,
            publications
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            msg: "Error al buscar publicaciones por curso",
            error
        });
    }
}