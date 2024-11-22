import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { firstValueFrom } from 'rxjs';
import { Vacancy } from 'src/entities/vacancy.entity';
import { VacancyDto } from './dtos/vacancy.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { validateOrReject } from 'class-validator';

@Injectable()
export class ApiCollectorService {
    private readonly secureHeaders: {
        Authorization: string;
        'HH-User-Agent': string;
    };
    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
        @InjectRepository(Vacancy)
        private vacancyRepository: Repository<Vacancy>
    ) {
        this.secureHeaders = {
            Authorization: `Bearer ${this.configService.get<string>('HH_ACCESS_TOKEN')}`,
            'HH-User-Agent': this.configService.get<string>('HH-User-Agent'),
        };
    }

    async getVacancies() {
        const response = await firstValueFrom(
            this.httpService.get('/endpoint', {
                headers: this.secureHeaders,
            })
        );
        const dto = plainToInstance(VacancyDto, response.data);
        await validateOrReject(dto);

        let dtoObj = {
            ...dto,
            area: dto.areaId ? { id: dto.areaId } : null,
            profession: dto.professionId ? { id: dto.professionId } : null,
        };
        delete dtoObj.areaId;
        delete dtoObj.professionId;

        const vacancy = this.vacancyRepository.create(dtoObj);
        return this.vacancyRepository.save(vacancy);
    }
}
