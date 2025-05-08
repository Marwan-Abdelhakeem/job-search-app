import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Put,
  ForbiddenException,
  Query,
} from '@nestjs/common';
import { JobService } from './job.service';
import { CreateJobDto } from './dto/create-job.dto';
import { IdParamDto, UpdateJobDto } from './dto/update-job.dto';
import { currentUser } from 'src/decorators/current-user.decorator';
import { User } from 'src/schemas/user.schema';
import { AuthGuard } from 'src/guards/auth.guard';
import { AuthorizationGuard } from 'src/guards/authorization.guard';
import { userRoles } from 'src/user/user.constants';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApplicationDto } from './dto/application.dto';
import { multerCloudOptions } from 'src/utils/multerCloud.config';
import { CompanyService } from 'src/company/company.service';

@Controller('job')
export class JobController {
  constructor(
    private readonly jobService: JobService,
    private readonly companyService: CompanyService,
  ) {}

  @Post()
  @UseGuards(AuthGuard, new AuthorizationGuard(userRoles.CompanyHR))
  async create(@Body() body: CreateJobDto, @currentUser() user: User) {
    await this.companyService.getCompany(body.company);
    return this.jobService.createJob(body, user);
  }

  @Put(':id')
  @UseGuards(AuthGuard, new AuthorizationGuard(userRoles.CompanyHR))
  async updateJob(
    @Body() body: UpdateJobDto,
    @currentUser() user: User,
    @Param() params: IdParamDto,
  ) {
    const job = await this.jobService.getJob(params.id);
    if (user._id.toString() !== job.data.addedBy.toString()) {
      throw new ForbiddenException('you are not the owner');
    }
    return this.jobService.updateJob(job.data, body);
  }

  @Post('apply-app')
  @UseGuards(AuthGuard, new AuthorizationGuard(userRoles.User))
  @UseInterceptors(FileInterceptor('application', multerCloudOptions))
  async applyToJob(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: ApplicationDto,
    @currentUser() user: User,
  ) {
    await this.jobService.getJob(body.job);
    if (!file) {
      throw new BadRequestException('Application file is required.');
    }
    return this.jobService.applyToJob(user, body, file);
  }

  @Get()
  @UseGuards(AuthGuard)
  async jobFilter(@Query() filters: UpdateJobDto) {
    return this.jobService.jobFilter(filters);
  }

  @Get('getCompanyJobs/:id')
  getCompanyJobs(@Param() params: IdParamDto) {
    return this.jobService.getCompanyJobs(params.id);
  }

  @Get(':id')
  @UseGuards(AuthGuard, new AuthorizationGuard(userRoles.CompanyHR))
  getJob(@Param() params: IdParamDto) {
    return this.jobService.getJob(params.id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, new AuthorizationGuard(userRoles.CompanyHR))
  async deleteJob(
    @Body() body: UpdateJobDto,
    @currentUser() user: User,
    @Param() params: IdParamDto,
  ) {
    const job = await this.jobService.getJob(params.id);
    if (user._id.toString() !== job.data.addedBy.toString()) {
      throw new ForbiddenException('you are not the owner');
    }
    return this.jobService.deleteJob(job.data);
  }
}
