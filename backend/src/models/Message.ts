import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  room: string;
  text: string;
  author: mongoose.Types.ObjectId; // Référence vers l'utilisateur
  at: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    room: { type: String, required: true },
    text: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    at: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

export const Message = mongoose.model<IMessage>('Message', MessageSchema);