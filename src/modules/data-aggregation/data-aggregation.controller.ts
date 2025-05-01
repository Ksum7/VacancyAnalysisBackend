import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { DataAggregationService } from './data-aggregation.service';
import { Vacancy } from 'src/entities/vacancy.entity';
import { Grade } from 'src/entities/grade.entity';
import { Area } from 'src/entities/area.entity';
import { Profession } from 'src/entities/profession.entity';
import { Experience } from 'src/entities/experience.entity';
import { parseBoolean } from 'src/utils/parseBoolean.util';

export enum SearchFields {
    OnlyTitle = 'onlyTitle',
    TitleAndRequirements = 'titleAndRequirements',
    TitleAndDescription = 'titleAndDescription',
}

@Controller()
export class DataAggregationController {
    constructor(private readonly dataAggregationService: DataAggregationService) {}

    private validateSearchFields(searchFields?: string): SearchFields {
        if (!searchFields) {
            return SearchFields.TitleAndDescription;
        }

        const validFields = Object.values(SearchFields);
        if (validFields.includes(searchFields as SearchFields)) {
            return searchFields as SearchFields;
        }

        throw new BadRequestException(`Invalid searchFields value. Must be one of: ${validFields.join(', ')}`);
    }

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

    @Get('/experiences')
    getExperiences(): Promise<Experience[]> {
        return this.dataAggregationService.getExperiences();
    }

    @Get('/statistic')
    async getStatistic(
        @Query('areaId') areaId?: number,
        @Query('experienceId') experienceId?: string,
        @Query('professionId') professionId?: string,
        @Query('gradeId') gradeId?: string,
        @Query('from') from?: string,
        @Query('to') to?: string,
        @Query('searchFields') searchFields?: string,
        @Query('includeHourly') includeHourly?: string,
        @Query('minSalary') minSalary?: number
    ): Promise<any> {
        const period = from && to ? { from: new Date(from), to: new Date(to) } : undefined;
        return this.dataAggregationService.getStatistic(
            areaId,
            experienceId,
            professionId,
            gradeId,
            period,
            this.validateSearchFields(searchFields),
            parseBoolean(includeHourly),
            minSalary
        );
    }

    @Get('/vacancies')
    async getVacancies(
        @Query('page') page: number,
        @Query('size') size: number,
        @Query('areaId') areaId?: number,
        @Query('experienceId') experienceId?: string,
        @Query('professionId') professionId?: string,
        @Query('gradeId') gradeId?: string,
        @Query('from') from?: string,
        @Query('to') to?: string,
        @Query('searchFields') searchFields?: string,
        @Query('includeHourly') includeHourly?: string,
        @Query('minSalary') minSalary?: number
    ): Promise<Vacancy[]> {
        let period: { from: Date; to: Date } | undefined;
        if (from && to) {
            const parsedFrom = new Date(from);
            const parsedTo = new Date(to);

            if (isNaN(parsedFrom.getTime()) || isNaN(parsedTo.getTime())) {
                throw new BadRequestException('Invalid date format');
            }

            period = { from: parsedFrom, to: parsedTo };
        }

        return this.dataAggregationService.getVacancies(
            page,
            size,
            areaId,
            experienceId,
            professionId,
            gradeId,
            period,
            this.validateSearchFields(searchFields),
            parseBoolean(includeHourly),
            minSalary
        );
    }

    @Get('/available_dates')
    async get_available_dates(): Promise<{ from: Date; to: Date }> {
        return this.dataAggregationService.get_available_dates();
    }
}
