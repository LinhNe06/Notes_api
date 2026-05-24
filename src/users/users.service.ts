import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { Model } from 'mongoose';

import { UpdateFcmTokenDto } from './dto/update-fcm-token.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async upsertFromFirebaseUser(user: DecodedIdToken) {
    return this.userModel.findOneAndUpdate(
      { firebaseUid: user.uid },
      {
        $set: {
          name: user.name,
          email: user.email,
          avatar: user.picture,
        },
      },
      { returnDocument: 'after', upsert: true },
    );
  }

  async updateFcmToken(user: DecodedIdToken, dto: UpdateFcmTokenDto) {
    return this.userModel.findOneAndUpdate(
      { firebaseUid: user.uid },
      {
        $set: {
          firebaseUid: user.uid,
          name: user.name,
          email: user.email,
          avatar: user.picture,
          fcmToken: dto.fcmToken,
        },
      },
      { returnDocument: 'after', upsert: true },
    );
  }

  async findByFirebaseUid(firebaseUid: string) {
    return this.userModel.findOne({ firebaseUid });
  }
}
