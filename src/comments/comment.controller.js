import Comment from "./comment.model.js";
import User from "../users/user.model.js";
import Publication from "../publications/publication.model.js";
import { request, response } from "express";

export const addComments = async (req, res) => {
    try {
        console.log("Datos recibidos en el backend:", req.body);
        
        const { id } = req.params;
        const data = req.body;

        const publication = await Publication.findById(id);

        if (!publication) {
            return res.status(400).json({
                success: false,
                msg: "La publicación no ha sido encontrada"
            });
        }

        const comment = await Comment.create({
            text: data.text,
            username: data.username || "Anónimo",
            publication: publication._id
        });

        publication.comment.push(comment._id);
        await publication.save();

        const commentDetails = await Comment.findById(comment._id)
            .populate({
                path: 'publication',
                select: 'title content',
                populate: {
                    path: 'user',
                    select: 'username',
                }
            });

        const details = { commentDetails };

        res.status(200).json({
            success: true,
            msg: "El comentario ha sido creado exitosamente",
            details
        });
    } catch (error) {
        console.error("Error al crear comentario:", error); 
    return res.status(500).json({
        success: false,
        msg: "Error, no se ha podido crear el comentario",
        error: error.message || error
    });
    }
};

export const getComments = async (req = request, res = response) => {
    try {

        const { limite = 10, desde = 0 } = req.body;
        const query = { estado: true };

        const [total, comments] = await Promise.all([
            Comment.countDocuments(query),
            Comment.find(query)
            .populate('user', 'username')
            .populate({
            path: 'publication',
                select: 'title content',
                populate: {
                    path: 'user',
                    select: 'username'
                }
            })
            .skip(Number(desde))
            .limit(Number(limite))
        ]);

        res.status(200).json({
            success: true,
            total,
            comments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error, no se ha podido obtener los comentario',
            error
        });
    }
}

export const getCommentsById = async (req, res) => {
    try {

        const { id } = req.params;
        const comment = await Comment.findById(id)

        .populate('user', 'username')
        .populate({
        path: 'publication',
            select: 'title content',
            populate: {
                path: 'user',
                select: 'username'
            }
        })

        if (comment.estado === false) {
            return res.status(400).json({
                success: false,
                msg: 'El comentario no esta disponible'
            });
        }

        if (!comment) {
            return res.status(404).json({
                success: false,
                msg: 'El comentario no ha sido encontrado'
            });
        }

        res.status(200).json({
            success: true,
            comment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error, no se ha podido obtener el comentario por ID',
            error
        });
    }
}

export const updateComments = async (req, res = response) => {
    try {

        const { id } = req.params;
        const { _id, username, publication, ...data } = req.body;

        const comment = await Comment.findById(id);
        if (!comment) {
            return res.status(400).json({
                success: false,
                msg: 'El comentario no ha sido encontrado'
            });
        }

        if (comment.estado === false) {
            return res.status(400).json({
                success: false,
                msg: 'comentario no esta disponible'
            });
        }
        
        if (req.user._id.toString() !== comment.user.toString() && req.user.role !== "ADMIN") {
            return res.status(400).json({
                success: false,
                msg: "El usuario no tiene autorizacion para editarlo"
            });
        }
        
        const updateComment = await Comment.findByIdAndUpdate(id, data, { new: true });

        if (comment.text !== updateComment.text) {
            await Publication.updateMany(
                { comment: id },
                { $set: { text: updateComment.text } }
            )
        }
        
        const commentDetails = await Comment.findById(comment._id)

        .populate('user', 'username')
        .populate({
                path: 'publication',
                select: 'title content',
                populate: {
                    path: 'user',
                    select: 'username'
                }
            })
            
            const details = {
                commentDetails
            }
            
            res.status(200).json({
                success: true,
                msg: 'El comentario se ha actualizado exitosamente',
                details
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                msg: 'Error, no se ha podido actualizar el comentario',
                error
            });
        }
    }
    
    export const deleteComments = async (req, res = response) => {
        try {

            const { id } = req.params;
            
            const authenticatedComment = req.comment;
            
            const comment = await Comment.findById(id);
            if (!comment) {
                return res.status(400).json({
                    success: false,
                    msg: 'El comentario no ha sido encontrado'
                });
            }
            
            if (req.user._id.toString() !== comment.user.toString() && req.user.role !== "ADMIN") {
                return res.status(400).json({
                    success: false,
                    msg: "El usuario no tiene autorizacion para eliminar"
                });
            }

            const commentDelete = await Comment.findByIdAndUpdate(id, { estado: false }, { new: true });

            res.status(200).json({
                success: true,
                msg: 'Comentario se ha eliminado exitosamente',
                commentDelete,
                authenticatedComment
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                msg: 'Error, no se ha podido eliminar el comentario',
                error
        });
    }
}