import { Schema, model } from "mongoose";

const PublicationSchema = Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    DateAndTime: {
        type: String,
        default: () => {
            const current = new Date();
            return current.toISOString().slice(0, 16).replace("T", " ");
        }
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    courses: {
        type: Schema.Types.ObjectId,
        ref: "Courses",
        required: true
    },
    comment: [{
        type: Schema.Types.ObjectId,
        ref: "Comment"
    }],
    estado: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    versionKey: false
});

export default model("Publication", PublicationSchema);