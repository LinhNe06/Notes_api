import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type NoteDocument = HydratedDocument<Note>;

@Schema({ timestamps: true })
export class Note {
  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ required: true })
  content!: string;

  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop({ type: [String], default: [] })
  imageKeys?: string[];

  @Prop()
  imageUrl?: string;

  @Prop({ required: true, index: true })
  userId!: string;
}

export const NoteSchema = SchemaFactory.createForClass(Note);
