import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';

import type { DecodedIdToken } from 'firebase-admin/auth';

import { NotesService } from './notes.service';

import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';

import { CurrentUser } from '../auth/decorators/current-user.decorator';

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
  findAll(@CurrentUser() user: DecodedIdToken) {
    return this.notesService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: DecodedIdToken) {
    return this.notesService.findOne(id, user);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateNoteDto: UpdateNoteDto,
    @CurrentUser() user: DecodedIdToken,
  ) {
    return this.notesService.update(id, updateNoteDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: DecodedIdToken) {
    return this.notesService.remove(id, user);
  }
}
