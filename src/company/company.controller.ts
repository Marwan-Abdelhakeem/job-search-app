import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { currentUser } from 'src/decorators/current-user.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { User } from 'src/schemas/user.schema';
import { AuthorizationGuard } from 'src/guards/authorization.guard';
import { userRoles } from 'src/user/user.constants';
import { createCompanyDto } from './dto/create-company.dto';
import { updateCompanyDto } from './dto/update-company.dto';
import { IdParamDto } from './dto/company.dto';

@Controller('company')
export class CompanyController {
  constructor(private companyService: CompanyService) {}

  @Post()
  @UseGuards(AuthGuard, new AuthorizationGuard(userRoles.CompanyHR))
  addCompany(@currentUser() user: User, @Body() body: createCompanyDto) {
    return this.companyService.createCompany(user, body);
  }

  @Put(':id')
  @UseGuards(AuthGuard, new AuthorizationGuard(userRoles.CompanyHR))
  async updateCompany(
    @currentUser() user: User,
    @Body() body: updateCompanyDto,
    @Param() params: IdParamDto,
  ) {
    const company = await this.companyService.getCompany(params.id);
    if (user._id.toString() !== company.data.companyHR.toString()) {
      throw new ForbiddenException('you are not the owner');
    }
    return this.companyService.updateCompany(company.data, body);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, new AuthorizationGuard(userRoles.CompanyHR))
  async deleteCompany(@currentUser() user: User, @Param() params: IdParamDto) {
    const company = await this.companyService.getCompany(params.id);
    if (user._id.toString() !== company.data.companyHR.toString()) {
      throw new ForbiddenException('you are not the owner');
    }
    return this.companyService.deleteCompany(company.data);
  }

  @Get('search')
  @UseGuards(AuthGuard)
  searchByName(@Query() query: updateCompanyDto) {
    return this.companyService.searchByName(query.companyName);
  }

  @Get('get_applications/:id')
  @UseGuards(AuthGuard, new AuthorizationGuard(userRoles.CompanyHR))
  async getApplications(
    @currentUser() user: User,
    @Param() params: IdParamDto,
  ) {
    return this.companyService.getApplications(user, params.id);
  }

  @Get(':id')
  @UseGuards(AuthGuard, new AuthorizationGuard(userRoles.CompanyHR))
  getCompany(@Param() params: IdParamDto) {
    return this.companyService.getCompany(params.id);
  }
}
