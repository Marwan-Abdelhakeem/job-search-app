import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Company {
  @Prop({ required: true, unique: true })
  companyName: string;

  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  companyEmail: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  industry: string;

  @Prop({ required: true })
  address: string;

  @Prop({
    required: true,
    type: {
      from: Number,
      to: Number,
    },
  })
  noEmployees: { from: Number; to: Number };

  @Prop({
    type: Types.ObjectId,
    required: true,
    ref: 'User',
  })
  companyHR: Types.ObjectId;

  readonly _id: Types.ObjectId;
}
export type companyDocument = Company & Document;

const companySchema = SchemaFactory.createForClass(Company);
export const companyModel = MongooseModule.forFeature([
  { name: Company.name, schema: companySchema },
]);
