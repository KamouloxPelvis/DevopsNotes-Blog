// Message.ts est le modèle qui concerne les messages du chat !

import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  room: string;
  text: string;
  fromId?: string;
  fromPseudo?: string;
  at: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    room: { type: String, required: true },
    text: { type: String, required: true },
    fromId: { type: String },
    fromPseudo: { type: String },
    at: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

export const Message = mongoose.model<IMessage>('Message', MessageSchema);
