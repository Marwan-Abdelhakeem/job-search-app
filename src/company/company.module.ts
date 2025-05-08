import { Module } from '@nestjs/common';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { companyModel } from 'src/schemas/company.schema';
import { userModel } from 'src/schemas/user.schema';
import { jobModel } from 'src/schemas/job.schema';
import { applicationModel } from 'src/schemas/application.schema';
import { JobModule } from 'src/job/job.module';

@Module({
  controllers: [CompanyController],
  providers: [CompanyService],
  imports: [companyModel, userModel, jobModel, applicationModel, JobModule],
  exports: [CompanyService],
})
export class CompanyModule {}
