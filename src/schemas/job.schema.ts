import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  jobLocations,
  seniorityLevels,
  workingTimes,
} from 'src/job/job.constants';

@Schema({ timestamps: true, versionKey: false })
export class Job {
  @Prop({ required: true })
  jobTitle: string;

  @Prop({ required: true })
  jobDescription: string;

  @Prop({ required: true })
  technicalSkills: string[];

  @Prop({ required: true })
  softSkills: string[];

  @Prop({ required: true, enum: jobLocations })
  jobLocation: string;

  @Prop({ required: true, enum: workingTimes })
  workingTime: string;

  @Prop({ required: true, enum: seniorityLevels })
  seniorityLevel: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  addedBy: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Company',
    required: true,
  })
  company: Types.ObjectId;

  readonly _id: Types.ObjectId;
}
export type jobDocument = Job & Document;

const jobSchema = SchemaFactory.createForClass(Job);
export const jobModel = MongooseModule.forFeature([
  { name: Job.name, schema: jobSchema },
]);
