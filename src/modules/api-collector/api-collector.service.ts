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
        private metaDataRepository: Repository<MetaData>
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
        while (true) {
            let waitTime = 60 * 1000;
            try {
                const res = await this.processVacancies();
                if (!res) {
                    waitTime = 2 * 60 * 60 * 1000;
                }
            } catch (error) {
                console.error('Error during periodic run of "processVacancies":', error);
                waitTime = 2 * 60 * 60 * 1000;
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
            return false;
        }

        const dateFrom = new Date(metaData.value);
        if (isNaN(dateFrom.getTime())) {
            console.error('Invalid date format in meta data');
            return false;
        }

        const dateTo = new Date(dateFrom);
        dateTo.setDate(dateFrom.getDate() + 1);
        dateTo.setHours(12, 0, 0, 0);

        const finalDate = new Date();
        finalDate.setHours(12, 0, 0, 0);

        if (dateTo > finalDate) return false;

        const response = await firstValueFrom(
            this.httpService.get('/vacancies', {
                headers: this.secureHeaders,
                params: {
                    date_from: dateFrom.toISOString(),
                    date_to: dateTo.toISOString(),
                },
            })
        );

        const items = response.data?.items || [];
        const vacancies = [];

        for (const item of items) {
            const dto = plainToInstance(VacancyDto, item);

            const errors = await validate(dto);
            if (errors.length > 0) {
                console.error('Validation failed for item:', item, errors);
            } else {
                let dtoObj = {
                    ...dto,
                    area: dto.areaId ? { id: dto.areaId } : null,
                };
                delete dtoObj.areaId;

                vacancies.push(this.vacancyRepository.create(dtoObj));
            }
        }

        if (vacancies.length > 0) {
            await this.vacancyRepository.save(vacancies);
        }

        metaData.value = dateTo.toISOString();
        await this.metaDataRepository.save(metaData);
        return true;
    }
}
