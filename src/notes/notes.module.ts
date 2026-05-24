import { Module } from '@nestjs/common';
import { NotesService } from './notes.service';
import { NotesController } from './notes.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Note, NoteSchema } from './schemas/note.schema';
import { UsersModule } from '../users/users.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Note.name, schema: NoteSchema }]),
    UsersModule,
    StorageModule,
  ],
  controllers: [NotesController],
  providers: [NotesService],
})
export class NotesModule {}
