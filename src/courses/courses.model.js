import { Schema, model } from "mongoose";

const CoursesSchema = Schema({
    name: {
        type: String,
        required: [true, "El nombre del curso es obligatorio"],
        unique: true
    },
    description: {
        type: String,
        required: [true, "La descripción del curso es obligatoria"]
    },
    estado: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    versionKey: false
})

export default model("Courses", CoursesSchema);