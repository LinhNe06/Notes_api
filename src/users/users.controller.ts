import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import type { DecodedIdToken } from 'firebase-admin/auth';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { UpdateFcmTokenDto } from './dto/update-fcm-token.dto';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(FirebaseAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  findMe(@CurrentUser() user: DecodedIdToken) {
    return this.usersService.upsertFromFirebaseUser(user);
  }

  @Post('me/fcm-token')
  updateFcmToken(
    @CurrentUser() user: DecodedIdToken,
    @Body() dto: UpdateFcmTokenDto,
  ) {
    return this.usersService.updateFcmToken(user, dto);
  }
}
