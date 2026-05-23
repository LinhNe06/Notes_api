import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type NoteDocument = HydratedDocument<Note>;

@Schema({ timestamps: true })
export class Note {
  @Prop({ require: true, trim: true })
  title!: string;

  @Prop({ require: true })
  content!: string;

  @Prop({ require: true, trim: true })
  tags!: string[];

  @Prop({ type: [String], default: [] })
  imageKey?: string;

  @Prop()
  imageUrl?: string;

  @Prop({ require: true })
  userId!: string;
}

export const NoteSchema = SchemaFactory.createForClass(Note);
