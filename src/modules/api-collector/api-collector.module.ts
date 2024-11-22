import { Module } from '@nestjs/common';
import { ApiCollectorService } from './api-collector.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vacancy } from 'src/entities/vacancy.entity';
import { MetaData } from 'src/entities/meta_data.entity';

@Module({
    imports: [
        HttpModule.registerAsync({
            useFactory: (configService: ConfigService) => ({
                baseURL: configService.get<string>('HH_API_URL'),
            }),
            inject: [ConfigService],
        }),
        TypeOrmModule.forFeature([Vacancy, MetaData]),
    ],
    controllers: [],
    providers: [ApiCollectorService],
})
export class ApiCollectorModule {}
