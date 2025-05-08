import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { userRoles, userStatus } from 'src/user/user.constants';

@Schema({
  timestamps: { updatedAt: false },
  versionKey: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class User {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, trim: true, lowercase: true })
  recoveryEmail: string;

  @Prop({ trim: true, lowercase: true })
  pendingEmail?: string;

  otp?: string;

  @Prop({ required: true })
  DOB: Date;

  @Prop({ required: true, unique: true })
  mobileNumber: string;

  @Prop({
    required: true,
    enum: Object.values(userRoles),
    default: userRoles.User,
  })
  role: string;

  @Prop({
    required: true,
    enum: Object.values(userStatus),
    default: userStatus.Offline,
  })
  status: string;

  @Prop({ default: false })
  confirmEmail: boolean;

  readonly _id: Types.ObjectId;
}
export type userDocument = User & Document;

const userSchema = SchemaFactory.createForClass(User);

userSchema.virtual('userName').get(function () {
  return this.firstName + ' ' + this.lastName;
});

export const userModel = MongooseModule.forFeature([
  { name: User.name, schema: userSchema },
]);
