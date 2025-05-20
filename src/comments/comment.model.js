import { Schema, model } from "mongoose";

const CommentSchema = Schema(
  {
    text: {
      type: String,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    publication: {
      type: Schema.Types.ObjectId,
      ref: "Publication",
      required: true,
    },
    DateAndTime: {
      type: String,
      default: () => {
        const current = new Date();
        return current.toISOString().slice(0, 16).replace("T", " ");
      },
    },
    estado: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default model("Comment", CommentSchema);
