import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JobService } from 'src/job/job.service';
import { Application } from 'src/schemas/application.schema';
import { Company, companyDocument } from 'src/schemas/company.schema';
import { Job } from 'src/schemas/job.schema';
import { User } from 'src/schemas/user.schema';

@Injectable()
export class CompanyService {
  constructor(
    @InjectModel(Company.name) private _companyModel: Model<Company>,
    @InjectModel(Job.name) private _jobModel: Model<Job>,
    @InjectModel(Application.name)
    private _applicationModel: Model<Application>,
    private readonly jobService: JobService,
  ) {}

  async createCompany(user: User, body: any) {
    const { companyName, companyEmail } = body;

    const existingCompany = await this._companyModel.findOne({
      $or: [{ companyName }, { companyEmail }],
    });

    if (existingCompany) {
      if (existingCompany.companyEmail === companyEmail) {
        throw new ConflictException('email is already exist');
      }
      if (existingCompany.companyName === companyName) {
        throw new ConflictException('name is already exist');
      }
    }

    body.companyHR = user._id;

    const company = await this._companyModel.create(body);

    return {
      message: 'created',
      data: company,
    };
  }

  async updateCompany(company: companyDocument, body: any) {
    if (body.companyName && body.companyName !== company.companyName) {
      const isName = await this._companyModel.findOne({
        companyName: body.companyName,
      });

      if (isName) throw new ConflictException('name is already exist');
    }

    if (
      body.companyEmail &&
      body.companyEmail.toLowerCase() !== company.companyEmail
    ) {
      const isEmail = await this._companyModel.findOne({
        companyEmail: body.companyEmail,
      });

      if (isEmail) throw new ConflictException('email is already exist');
    }

    Object.assign(company, body);

    await company.save();

    return {
      message: 'updated',
    };
  }

  async deleteCompany(company: companyDocument) {
    const jobs = await this._jobModel.find({ company: company._id.toString() });

    for (const job of jobs) {
      await this.jobService.deleteJob(job);
    }

    await company.deleteOne();
    return {
      message: 'deleted',
    };
  }

  async getCompany(id: any) {
    const company = await this._companyModel.findById(id);
    const jobs = await this._jobModel.find({ company: id });

    if (!company) throw new NotFoundException('company not found');

    return {
      message: 'done',
      data: company,
      jobs,
    };
  }

  async searchByName(companyName: any) {
    const company = await this._companyModel.findOne({ companyName });

    if (!company) throw new NotFoundException('company not found');

    return {
      message: 'done',
      data: company,
    };
  }

  async getApplications(user: User, jobId: any) {
    const job = await this._jobModel.findById(jobId);
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (user._id.toString() !== job.addedBy.toString()) {
      throw new ForbiddenException('You are not the owner');
    }

    const applications = await this._applicationModel
      .find({ job: jobId })
      .populate('user', '-password -recoveryEmail -confirmEmail -createdAt')
      .exec();

    if (applications.length === 0) {
      throw new NotFoundException('No applications found for this job');
    }
    return {
      message: 'done',
      relatedApplications: applications.length,
      data: applications,
    };
  }
}
