import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';

import type { DecodedIdToken } from 'firebase-admin/auth';

import { Note, NoteDocument } from './schemas/note.schema';

import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NotesService {
  constructor(
    @InjectModel(Note.name)
    private readonly noteModel: Model<NoteDocument>,
  ) {}

  async create(createNoteDto: CreateNoteDto, user: DecodedIdToken) {
    return this.noteModel.create({
      ...createNoteDto,
      userId: user.uid,
    });
  }

  async findAll(user: DecodedIdToken) {
    return this.noteModel
      .find({
        userId: user.uid,
      })
      .sort({ createdAt: -1 });
  }

  async findOne(id: string, user: DecodedIdToken) {
    const note = await this.noteModel.findOne({
      _id: id,
      userId: user.uid,
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    return note;
  }

  async update(id: string, updateNoteDto: UpdateNoteDto, user: DecodedIdToken) {
    const note = await this.noteModel.findOneAndUpdate(
      {
        _id: id,
        userId: user.uid,
      },
      updateNoteDto,
      {
        new: true,
      },
    );

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    return note;
  }

  async remove(id: string, user: DecodedIdToken) {
    const note = await this.noteModel.findOneAndDelete({
      _id: id,
      userId: user.uid,
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    return {
      message: 'Delete note successfully',
    };
  }
}
