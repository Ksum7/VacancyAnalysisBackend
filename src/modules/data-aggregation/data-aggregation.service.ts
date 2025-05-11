import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Area } from 'src/entities/area.entity';
import { Experience } from 'src/entities/experience.entity';
import { Grade } from 'src/entities/grade.entity';
import { Profession } from 'src/entities/profession.entity';
import { Vacancy } from 'src/entities/vacancy.entity';
import { Repository } from 'typeorm';
import { SearchFields } from './data-aggregation.controller';

@Injectable()
export class DataAggregationService {
    constructor(
        @InjectRepository(Area)
        private readonly areaRepository: Repository<Area>,
        @InjectRepository(Profession)
        private readonly professionRepository: Repository<Profession>,
        @InjectRepository(Grade)
        private readonly gradeRepository: Repository<Grade>,
        @InjectRepository(Vacancy)
        private readonly vacancyRepository: Repository<Vacancy>,
        @InjectRepository(Experience)
        private experienceRepository: Repository<Experience>
    ) {}

    async getAreas(): Promise<Area[]> {
        return this.areaRepository.find();
    }

    async getProfessions(): Promise<Profession[]> {
        return this.professionRepository.find();
    }

    async getGrades(): Promise<Grade[]> {
        return this.gradeRepository.find();
    }

    async getExperiences(): Promise<Experience[]> {
        return this.experienceRepository.find();
    }

    async getStatistic(
        areaId?: number,
        experienceId?: string,
        professionId?: string,
        gradeId?: string,
        period?: { from: Date; to: Date },
        searchFields?: SearchFields,
        includeHourly?: boolean,
        minSalary: number = 10000
    ): Promise<any> {
        const query = this.vacancyRepository
            .createQueryBuilder('vacancy')
            .leftJoinAndSelect('vacancy.area', 'area')
            .leftJoinAndSelect('vacancy.profession', 'profession')
            .leftJoinAndSelect('vacancy.grades', 'grades');

        if (areaId) {
            query.andWhere('(area.id = :areaId OR :areaId::text = ANY(area.parentPath))', { areaId });
        }

        if (professionId) {
            query.andWhere('vacancy.profession.id = :professionId', { professionId });
        }

        if (experienceId) {
            query.andWhere('vacancy.experience.id = :experienceId', { experienceId });
        }

        if (gradeId) {
            query.andWhere('grades.id = :gradeId', { gradeId });
        }

        if (period) {
            query.andWhere('vacancy.publishedAt BETWEEN :from AND :to', {
                from: period.from,
                to: period.to,
            });
        }

        switch (searchFields) {
            case SearchFields.TitleAndDescription:
                break;
            case SearchFields.OnlyTitle:
                query.andWhere('vacancy.isMatchedByName');
                break;
            case SearchFields.TitleAndRequirements:
                query.andWhere('(vacancy.isMatchedByName OR vacancy.isMatchedByRequirements)');
                break;
            default:
                break;
        }

        query.andWhere(`vacancy.salary_rangeModeId IN (:...modes)`, {
            modes: includeHourly ? ['HOUR', 'MONTH'] : ['MONTH'],
        });

        if (minSalary !== undefined && minSalary !== null) {
            let salaryFromCondition: string;
            let salaryToCondition: string;

            if (includeHourly) {
                salaryFromCondition = `(
                    (vacancy.salary_rangeModeId = 'HOUR' AND vacancy.salaryFrom * 176 > :minSalary) OR
                    (vacancy.salary_rangeModeId = 'MONTH' AND vacancy.salaryFrom > :minSalary)
                )`;
                salaryToCondition = `(
                    (vacancy.salary_rangeModeId = 'HOUR' AND vacancy.salaryTo * 176 > :minSalary) OR
                    (vacancy.salary_rangeModeId = 'MONTH' AND vacancy.salaryTo > :minSalary)
                )`;
            } else {
                salaryFromCondition = `vacancy.salaryFrom > :minSalary`;
                salaryToCondition = `vacancy.salaryTo > :minSalary`;
            }

            query.andWhere(
                `(
                    (
                        vacancy.salaryFrom IS NOT NULL AND
                        ${salaryFromCondition} AND
                        vacancy.salaryTo IS NOT NULL AND
                        ${salaryToCondition}
                    )
                    OR
                    (
                        vacancy.salaryFrom IS NOT NULL AND
                        ${salaryFromCondition} AND
                        vacancy.salaryTo IS NULL
                    )
                    OR
                    (
                        vacancy.salaryTo IS NOT NULL AND
                        ${salaryToCondition} AND
                        vacancy.salaryFrom IS NULL
                    )
                )`,
                { minSalary }
            );
        }

        query.andWhere("vacancy.salaryCurrency = 'RUR'");

        const data = await query.getMany();

        const salaries = data.flatMap((vacancy) => this.getSalaries(vacancy)).sort((a, b) => a - b);

        return {
            min: salaries[0] || null,
            max: salaries[salaries.length - 1] || null,
            median: this.calculateMedian(salaries),
            q1: this.calculatePercentile(salaries, 0.25),
            q3: this.calculatePercentile(salaries, 0.75),
            monthlyMedians: this.calculateMonthlyMedians(data),
            nVacancies: data.length,
        };
    }

    async getVacancies(
        page: number = 0,
        size: number = 100,
        areaId?: number,
        experienceId?: string,
        professionId?: string,
        gradeId?: string,
        period?: { from: Date; to: Date },
        searchFields?: SearchFields,
        includeHourly?: boolean,
        minSalary: number = 10000
    ): Promise<Vacancy[]> {
        const query = this.vacancyRepository
            .createQueryBuilder('vacancy')
            .leftJoinAndSelect('vacancy.area', 'area')
            .leftJoinAndSelect('vacancy.profession', 'profession')
            .leftJoinAndSelect('vacancy.grades', 'grades');

        if (areaId) {
            query.andWhere('(area.id = :areaId OR :areaId::text = ANY(area.parentPath))', { areaId });
        }

        if (professionId) {
            query.andWhere('vacancy.profession.id = :professionId', { professionId });
        }

        if (experienceId) {
            query.andWhere('vacancy.experience.id = :experienceId', { experienceId });
        }

        if (gradeId) {
            query.andWhere('grades.id = :gradeId', { gradeId });
        }

        if (period) {
            query.andWhere('vacancy.publishedAt BETWEEN :from AND :to', {
                from: period.from,
                to: period.to,
            });
        }

        switch (searchFields) {
            case SearchFields.TitleAndDescription:
                break;
            case SearchFields.OnlyTitle:
                query.andWhere('vacancy.isMatchedByName');
                break;
            case SearchFields.TitleAndRequirements:
                query.andWhere('(vacancy.isMatchedByName OR vacancy.isMatchedByRequirements)');
                break;
            default:
                break;
        }

        query.andWhere(`vacancy.salary_rangeModeId IN (:...modes)`, {
            modes: includeHourly ? ['HOUR', 'MONTH'] : ['MONTH'],
        });

        if (minSalary !== undefined && minSalary !== null) {
            let salaryFromCondition: string;
            let salaryToCondition: string;

            if (includeHourly) {
                salaryFromCondition = `(
                    (vacancy.salary_rangeModeId = 'HOUR' AND vacancy.salaryFrom * 176 > :minSalary) OR
                    (vacancy.salary_rangeModeId = 'MONTH' AND vacancy.salaryFrom > :minSalary)
                )`;
                salaryToCondition = `(
                    (vacancy.salary_rangeModeId = 'HOUR' AND vacancy.salaryTo * 176 > :minSalary) OR
                    (vacancy.salary_rangeModeId = 'MONTH' AND vacancy.salaryTo > :minSalary)
                )`;
            } else {
                salaryFromCondition = `vacancy.salaryFrom > :minSalary`;
                salaryToCondition = `vacancy.salaryTo > :minSalary`;
            }

            query.andWhere(
                `(
                    (
                        vacancy.salaryFrom IS NOT NULL AND
                        ${salaryFromCondition} AND
                        vacancy.salaryTo IS NOT NULL AND
                        ${salaryToCondition}
                    )
                    OR
                    (
                        vacancy.salaryFrom IS NOT NULL AND
                        ${salaryFromCondition} AND
                        vacancy.salaryTo IS NULL
                    )
                    OR
                    (
                        vacancy.salaryTo IS NOT NULL AND
                        ${salaryToCondition} AND
                        vacancy.salaryFrom IS NULL
                    )
                )`,
                { minSalary }
            );
        }

        query.andWhere("vacancy.salaryCurrency = 'RUR'");

        const data = await query
            .take(size)
            .skip(page * size)
            .getMany();

        return data;
    }

    private getSalaries(vacancy: Vacancy): number[] {
        const exchangeRate = this.getExchangeRate(vacancy.salaryCurrency);
        const salaryFrom = vacancy.salaryFrom ? this.convertToRUB(vacancy.salaryFrom, exchangeRate) : null;
        const salaryTo = vacancy.salaryTo ? this.convertToRUB(vacancy.salaryTo, exchangeRate) : null;

        const finalSalaries = [];
        const gross = vacancy.salaryGross ? 0.87 : 1;
        const hourMult = vacancy.salary_rangeModeId == 'HOUR' ? 176 : 1;
        if (salaryFrom !== null && salaryFrom !== 0) {
            finalSalaries.push(salaryFrom * gross * hourMult);
        }

        if (salaryTo !== null && salaryTo !== 0) {
            finalSalaries.push(salaryTo * gross * hourMult);
        }

        return finalSalaries;
    }

    private convertToRUB(amount: number, exchangeRate: number): number {
        return amount * exchangeRate;
    }

    private getExchangeRate(currency: string): number {
        const exchangeRates: Record<string, number> = {
            USD: 90,
            EUR: 95,
            GBP: 110,
            BYR: 32,
            AZN: 61,
            KZT: 0.2,
            UZS: 0.0081,
            KGS: 1.2,
            RUR: 1,
        };

        return exchangeRates[currency] ?? 0;
    }

    private calculateMonthlyMedians(vacancies: Vacancy[]): Record<string, number> {
        const monthlyData: Record<string, number[]> = {};

        vacancies.forEach((vacancy) => {
            const month = vacancy.publishedAt.toISOString().slice(0, 7); // YYYY-MM
            const salaries = this.getSalaries(vacancy);

            if (!monthlyData[month]) {
                monthlyData[month] = [];
            }

            monthlyData[month].push(...salaries);
        });

        const monthlyMedians: Record<string, number> = {};
        for (const [month, salaries] of Object.entries(monthlyData)) {
            monthlyMedians[month] = this.calculateMedian(salaries.sort((a, b) => a - b)) || 0;
        }

        return monthlyMedians;
    }

    private calculateMedian(sorted_values: number[]): number | null {
        if (!sorted_values.length) return null;

        const mid = Math.floor(sorted_values.length / 2);
        return sorted_values.length % 2 !== 0 ? sorted_values[mid] : (sorted_values[mid - 1] + sorted_values[mid]) / 2;
    }

    private calculatePercentile(sorted_values: number[], percentile: number): number | null {
        if (!sorted_values.length) return null;

        const pos = (sorted_values.length - 1) * percentile;
        const base = Math.floor(pos);
        const rest = pos - base;
        return rest
            ? sorted_values[base] + rest * (sorted_values[base + 1] - sorted_values[base])
            : sorted_values[base];
    }

    async get_available_dates(): Promise<{ from: Date; to: Date }> {
        const result = await this.vacancyRepository
            .createQueryBuilder('vacancy')
            .select('MIN(vacancy.publishedAt)', 'from')
            .addSelect('MAX(vacancy.publishedAt)', 'to')
            .getRawOne();

        return {
            from: result.from ? new Date(result.from) : new Date(),
            to: result.to ? new Date(result.to) : new Date(),
        };
    }
}
