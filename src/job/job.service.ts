import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Application } from 'src/schemas/application.schema';
import { Job, jobDocument } from 'src/schemas/job.schema';
import { User } from 'src/schemas/user.schema';
import { CloudinaryService } from 'src/utils/Cloudinary.service';
import { UpdateJobDto } from './dto/update-job.dto';
// import { CompanyService } from 'src/company/company.service';

@Injectable()
export class JobService {
  constructor(
    @InjectModel(Job.name) private jobModel: Model<Job>,
    @InjectModel(Application.name) private ApplicationModel: Model<Application>,
    private cloudinaryService: CloudinaryService,
    // private companyService: CompanyService,
  ) {}

  async createJob(body: any, user: User) {
    // await this.companyService.getCompany(body.company);
    body.addedBy = user._id;
    const job = await this.jobModel.create(body);
    return {
      message: 'done',
      data: job,
    };
  }

  async updateJob(job: jobDocument, body: any) {
    Object.assign(job, body);
    await job.save();
    return {
      message: 'updated',
    };
  }

  async getJob(id: any) {
    const job = await this.jobModel.findById(id);

    if (!job) throw new NotFoundException('job not found');

    return {
      message: 'done',
      data: job,
    };
  }

  async getCompanyJobs(id: any) {
    const jobs = await this.jobModel.find({ company: id });

    if (!jobs.length) throw new NotFoundException('company not found');

    return {
      message: 'done',
      data: jobs,
    };
  }

  async deleteJob(job: jobDocument) {
    await job.deleteOne();
    // delete all related applications
    const apps = await this.ApplicationModel.find({
      job: job._id.toString(),
    });

    await this.ApplicationModel.deleteMany({
      job: job._id.toString(),
    });
    // delete associated files from cloudinary if file exists
    const publicIds = apps.map((app) => {
      const publicId = app.userResume
        .split('/upload/')[1]
        .split('/')
        .slice(1)
        .join('/')
        .split('.')[0];
      return publicId;
    });

    await this.cloudinaryService.deleteFiles(publicIds);

    return {
      message: 'deleted',
    };
  }

  async applyToJob(user: User, body: any, file: any) {
    body.user = user._id;
    body.userTechSkills = JSON.parse(body.userTechSkills);
    body.userSoftSkills = JSON.parse(body.userSoftSkills);

    const { secure_url } = await this.cloudinaryService.uploadFile(file.path);

    body.userResume = secure_url;
    const application = await this.ApplicationModel.create(body);

    return {
      message: 'done',
      data: application,
    };
  }

  async jobFilter(filters: UpdateJobDto) {
    const query: any = {};

    if (filters.workingTime) query.workingTime = filters.workingTime;
    if (filters.jobLocation) query.jobLocation = filters.jobLocation;
    if (filters.seniorityLevel) query.seniorityLevel = filters.seniorityLevel;
    if (filters.jobTitle)
      query.jobTitle = { $regex: filters.jobTitle, $options: 'i' };
    if (filters.technicalSkills)
      query.technicalSkills = { $in: filters.technicalSkills };

    const jobs = await this.jobModel.find(query).exec();
    if (!jobs.length) {
      throw new NotFoundException('No jobs found matching criteria');
    }
    return { message: 'done', matchingJobs: jobs.length, data: jobs };
  }
}
