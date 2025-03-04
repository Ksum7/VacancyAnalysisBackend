import { Module } from '@nestjs/common';
import { ApiCollectorService } from './api-collector.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vacancy } from 'src/entities/vacancy.entity';
import { MetaData } from 'src/entities/meta_data.entity';
import { AreasUpdateService } from './areas-update.service';
import { Grade } from 'src/entities/grade.entity';
import { Area } from 'src/entities/area.entity';
import { Profession } from 'src/entities/profession.entity';
import { Experience } from 'src/entities/experience.entity';

@Module({
    imports: [
        HttpModule.registerAsync({
            useFactory: (configService: ConfigService) => ({
                baseURL: configService.get<string>('HH_API_URL'),
            }),
            inject: [ConfigService],
        }),
        TypeOrmModule.forFeature([Vacancy, MetaData, Grade, Area, Profession, Experience]),
    ],
    controllers: [],
    providers: [ApiCollectorService, AreasUpdateService],
})
export class ApiCollectorModule {}
