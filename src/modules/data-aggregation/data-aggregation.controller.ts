import { Controller, Get, Query } from '@nestjs/common';
import { DataAggregationService } from './data-aggregation.service';
import { Vacancy } from 'src/entities/vacancy.entity';
import { Grade } from 'src/entities/grade.entity';
import { Area } from 'src/entities/area.entity';
import { Profession } from 'src/entities/profession.entity';

@Controller()
export class DataAggregationController {
    constructor(private readonly dataAggregationService: DataAggregationService) {}

    @Get('/areas')
    getAreas(): Promise<Area[]> {
        return this.dataAggregationService.getAreas();
    }

    @Get('/professions')
    getProfessions(): Promise<Profession[]> {
        return this.dataAggregationService.getProfessions();
    }

    @Get('/grades')
    getGrades(): Promise<Grade[]> {
        return this.dataAggregationService.getGrades();
    }

    @Get('/statistic')
    async getStatistic(
        @Query('areaId') areaId?: number,
        @Query('professionId') professionId?: string,
        @Query('gradeId') gradeId?: string,
        @Query('from') from?: string,
        @Query('to') to?: string
    ): Promise<any> {
        const period = from && to ? { from: new Date(from), to: new Date(to) } : undefined;
        return this.dataAggregationService.getStatistic(areaId, professionId, gradeId, period);
    }

    @Get('/vacancies')
    async getVacancies(
        @Query('page') page: number,
        @Query('size') size: number,
        @Query('areaId') areaId?: number,
        @Query('professionId') professionId?: string,
        @Query('gradeId') gradeId?: string,
        @Query('from') from?: string,
        @Query('to') to?: string
    ): Promise<Vacancy[]> {
        let period: { from: Date; to: Date } | undefined;
        if (from && to) {
            const parsedFrom = new Date(from);
            const parsedTo = new Date(to);

            if (isNaN(parsedFrom.getTime()) || isNaN(parsedTo.getTime())) {
                throw new Error('Invalid date format');
            }

            period = { from: parsedFrom, to: parsedTo };
        }

        return this.dataAggregationService.getVacancies(page, size, areaId, professionId, gradeId, period);
    }
}
