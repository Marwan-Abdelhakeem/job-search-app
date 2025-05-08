import { forwardRef, Module } from '@nestjs/common';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import { jobModel } from 'src/schemas/job.schema';
import { userModel } from 'src/schemas/user.schema';
import { applicationModel } from 'src/schemas/application.schema';
import { CloudinaryService } from 'src/utils/Cloudinary.service';
import { CompanyModule } from 'src/company/company.module';

@Module({
  controllers: [JobController],
  providers: [JobService, CloudinaryService],
  imports: [
    jobModel,
    userModel,
    applicationModel,
    forwardRef(() => CompanyModule),
  ],
  exports: [JobService],
})
export class JobModule {}
