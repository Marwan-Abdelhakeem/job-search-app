import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true, versionKey: false })
export class Application {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  user: Types.ObjectId;

  @Prop({ required: true })
  userTechSkills: string[];

  @Prop({ required: true })
  userSoftSkills: string[];

  @Prop({ required: true })
  userResume: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'Job',
    required: true,
  })
  job: Types.ObjectId;

  readonly _id: Types.ObjectId;
}
export type applicationDocument = Application & Document;

const applicationSchema = SchemaFactory.createForClass(Application);
export const applicationModel = MongooseModule.forFeature([
  { name: Application.name, schema: applicationSchema },
]);
