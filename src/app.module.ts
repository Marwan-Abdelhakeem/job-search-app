import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { CompanyModule } from './company/company.module';
import { JobModule } from './job/job.module';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: './config/.env', isGlobal: true }),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    UserModule,
    CompanyModule,
    {
      module: JwtModule,
      global: true,
    },
    JobModule,
  ],
})
export class AppModule {}
