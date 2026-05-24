import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';

import type { DecodedIdToken } from 'firebase-admin/auth';

import { Note, NoteDocument } from './schemas/note.schema';

import { CreateNoteDto } from './dto/create-note.dto';
import { FindNotesQueryDto } from './dto/find-notes-query.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { firebaseAdmin } from '../config/firebase-admin.config';
import { StorageService } from '../storage/storage.service';
import type { UploadedImageFile } from '../storage/uploaded-image-file.type';
import { UsersService } from '../users/users.service';

@Injectable()
export class NotesService {
  private readonly logger = new Logger(NotesService.name);

  constructor(
    @InjectModel(Note.name)
    private readonly noteModel: Model<NoteDocument>,
    private readonly usersService: UsersService,
    private readonly storageService: StorageService,
  ) {}

  async create(createNoteDto: CreateNoteDto, user: DecodedIdToken) {
    const note = await this.noteModel.create({
      ...createNoteDto,
      userId: user.uid,
    });

    await this.sendNoteCreatedNotification(user.uid, note.id, note.title);

    return note;
  }

  async findAll(user: DecodedIdToken, query: FindNotesQueryDto) {
    const { search, tag, page, limit } = query;
    const filter: Record<string, unknown> = {
      userId: user.uid,
    };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    if (tag) {
      filter.tags = tag;
    }

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.noteModel
        .find(filter)
        .sort({ isPinned: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.noteModel.countDocuments(filter),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
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
        returnDocument: 'after',
      },
    );

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    return note;
  }

  async uploadImage(
    id: string,
    image: UploadedImageFile,
    user: DecodedIdToken,
  ) {
    await this.findOne(id, user);

    const uploadedImage = await this.storageService.uploadNoteImage(
      user.uid,
      image,
    );

    const note = await this.noteModel.findOneAndUpdate(
      {
        _id: id,
        userId: user.uid,
      },
      {
        $set: {
          imageUrl: uploadedImage.url,
        },
        $push: {
          imageKeys: uploadedImage.key,
        },
      },
      { returnDocument: 'after' },
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

  private async sendNoteCreatedNotification(
    firebaseUid: string,
    noteId: string,
    title: string,
  ) {
    const user = await this.usersService.findByFirebaseUid(firebaseUid);

    if (!user?.fcmToken) {
      return;
    }

    try {
      await firebaseAdmin.messaging().send({
        token: user.fcmToken,
        notification: {
          title: 'Note saved',
          body: title,
        },
        data: {
          type: 'NOTE_CREATED',
          noteId,
        },
        android: {
          priority: 'high',
          notification: {
            channelId: 'notes',
            clickAction: 'OPEN_NOTE_DETAIL',
          },
        },
      });
    } catch (error) {
      this.logger.warn(
        `Failed to send note notification: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
