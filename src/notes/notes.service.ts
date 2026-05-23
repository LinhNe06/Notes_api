import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Note, NoteDocument } from './schemas/note.schema';
import { Model } from 'mongoose';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NotesService {
  constructor(
    @InjectModel(Note.name)
    private readonly noteModel: Model<NoteDocument>,
  ) {}

  async create(createNoteDto: CreateNoteDto) {
    return this.noteModel.create({
      ...createNoteDto,
      userId: 'demo-user',
    });
  }

  async findAll() {
    return this.noteModel
      .find({
        userId: 'demo-user',
      })
      .sort({ createdAt: -1 });
  }

  async findOne(id: string) {
    const note = await this.noteModel.findOne({
      _id: id,
      userId: 'demo-user',
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    return note;
  }

  async update(id: string, updateNoteDto: UpdateNoteDto) {
    const note = await this.noteModel.findOneAndUpdate(
      {
        _id: id,
        userId: 'demo-user',
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

  async remove(id: string) {
    const note = await this.noteModel.findOneAndDelete({
      _id: id,
      userId: 'demo-user',
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    return {
      message: 'Delete note successfully',
    };
  }
}
