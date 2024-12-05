import { HttpService } from '@nestjs/axios';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { firstValueFrom } from 'rxjs';
import { Vacancy } from 'src/entities/vacancy.entity';
import { VacancyDto } from './dtos/vacancy.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { validate } from 'class-validator';
import { MetaData } from 'src/entities/meta_data.entity';
import { delay } from 'src/utils/delay.util';
import { Profession } from 'src/entities/profession.entity';
import { Grade } from 'src/entities/grade.entity';

@Injectable()
export class ApiCollectorService implements OnModuleInit {
    private readonly secureHeaders: {
        Authorization: string;
        'HH-User-Agent': string;
    };
    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
        @InjectRepository(Vacancy)
        private vacancyRepository: Repository<Vacancy>,
        @InjectRepository(MetaData)
        private metaDataRepository: Repository<MetaData>,
        @InjectRepository(Grade)
        private gradeRepository: Repository<Grade>,
        @InjectRepository(Profession)
        private professionRepository: Repository<Profession>
    ) {
        this.secureHeaders = {
            Authorization: `Bearer ${this.configService.get<string>('HH_ACCESS_TOKEN')}`,
            'HH-User-Agent': this.configService.get<string>('HH-User-Agent'),
        };
    }

    async onModuleInit() {
        this.runBackgroundTask();
    }

    private async runBackgroundTask() {
        const s = 1000;
        const m = s * 60;
        const h = m * 60;
        while (true) {
            let waitTime;
            try {
                switch (await this.processVacancies()) {
                    case 'error':
                        waitTime = 2 * h;
                        break;
                    case 'added':
                        waitTime = 5 * s;
                        break;
                    case 'up_to_date':
                        console.log('vacancies up to date');
                        waitTime = 24 * h;
                        break;
                }
            } catch (error) {
                console.error('Error during periodic run of "processVacancies":', error);
                waitTime = 2 * h;
            }

            await delay(waitTime);
        }
    }

    private async processVacancies() {
        const metaData = await this.metaDataRepository.findOne({
            where: { key: 'last_checked_date' },
        });

        if (!metaData) {
            console.error('MetaData with last_checked_date not found');
            return 'error';
        }

        const dateFrom = new Date(metaData.value);
        if (isNaN(dateFrom.getTime())) {
            console.error('Invalid date format in meta data');
            return 'error';
        }

        const dateTo = new Date(dateFrom);
        dateTo.setDate(dateFrom.getDate() + 1); /// step 1 day
        dateTo.setHours(12, 0, 0, 0);

        const finalDate = new Date();
        finalDate.setHours(12, 0, 0, 0);

        if (dateTo > finalDate) return 'up_to_date';

        let sumLength = 0;
        const professions = await this.professionRepository.find();
        const grades = await this.gradeRepository.find();

        const sumLengthPromises = await Promise.all(
            professions.map(async (profession) => {
                let page = 0;
                const perPage = 100;
                const synonyms_str = profession.synonyms.join(' OR ');

                let localSum = 0;

                while (true) {
                    const response = await firstValueFrom(
                        this.httpService.get('/vacancies', {
                            headers: this.secureHeaders,
                            params: {
                                text: `NAME:(${synonyms_str}) or DESCRIPTION:(${synonyms_str})`,
                                no_magic: true,
                                only_with_salary: true,
                                date_from: dateFrom.toISOString(),
                                date_to: dateTo.toISOString(),
                                per_page: perPage,
                                page: page,
                            },
                        })
                    );

                    const vacancies: Vacancy[] = [];
                    const items = response.data?.items || [];
                    for (const item of items) {
                        const dto = plainToInstance(VacancyDto, item, { excludeExtraneousValues: true });

                        const errors = await validate(dto);
                        if (errors.length > 0) {
                            console.error('Validation failed for item:', item, errors);
                        } else {
                            const vacancy = this.vacancyRepository.create({ ...dto, profession });

                            const matchingGrades = grades.filter((grade) =>
                                [vacancy.snippetRequirement, vacancy.snippetResponsibility].some(
                                    (value) => typeof value === 'string' && value.includes(grade.title)
                                )
                            );

                            if (matchingGrades.length > 0) {
                                vacancy.grades = matchingGrades;
                            }

                            vacancies.push(vacancy);
                        }
                    }

                    if (vacancies.length > 0) {
                        await this.vacancyRepository.save(vacancies);
                    }

                    localSum += vacancies.length;

                    if (vacancies.length < perPage) {
                        break;
                    }
                    page++;
                }

                return localSum;
            })
        );
        sumLength = sumLengthPromises.reduce((acc, curr) => acc + curr, 0);

        metaData.value = dateTo.toISOString();
        await this.metaDataRepository.save(metaData);
        console.log(`${dateFrom} - ${dateTo} new vacancies added: { ${sumLength} vacancies }`);
        return 'added';
    }
}
