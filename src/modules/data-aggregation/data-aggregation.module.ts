import { Module } from '@nestjs/common';
import { DataAggregationController } from './data-aggregation.controller';
import { DataAggregationService } from './data-aggregation.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vacancy } from 'src/entities/vacancy.entity';
import { Profession } from 'src/entities/profession.entity';
import { Grade } from 'src/entities/grade.entity';
import { Area } from 'src/entities/area.entity';
import { Experience } from 'src/entities/experience.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Vacancy, Profession, Grade, Area, Experience])],
    controllers: [DataAggregationController],
    providers: [DataAggregationService],
})
export class DataAggregationModule {}
