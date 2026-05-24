import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import type { DecodedIdToken } from 'firebase-admin/auth';

import { NotesService } from './notes.service';

import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { FindNotesQueryDto } from './dto/find-notes-query.dto';

import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import type { UploadedImageFile } from '../storage/uploaded-image-file.type';

@Controller('notes')
@UseGuards(FirebaseAuthGuard)
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  create(
    @Body() createNoteDto: CreateNoteDto,
    @CurrentUser() user: DecodedIdToken,
  ) {
    return this.notesService.create(createNoteDto, user);
  }

  @Get()
  findAll(
    @CurrentUser() user: DecodedIdToken,
    @Query() query: FindNotesQueryDto,
  ) {
    return this.notesService.findAll(user, query);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() user: DecodedIdToken,
  ) {
    return this.notesService.findOne(id, user);
  }

  @Put(':id')
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateNoteDto: UpdateNoteDto,
    @CurrentUser() user: DecodedIdToken,
  ) {
    return this.notesService.update(id, updateNoteDto, user);
  }

  @Post(':id/image')
  @UseInterceptors(FileInterceptor('image'))
  uploadImage(
    @Param('id', ParseObjectIdPipe) id: string,
    @UploadedFile() image: UploadedImageFile,
    @CurrentUser() user: DecodedIdToken,
  ) {
    return this.notesService.uploadImage(id, image, user);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() user: DecodedIdToken,
  ) {
    return this.notesService.remove(id, user);
  }
}
