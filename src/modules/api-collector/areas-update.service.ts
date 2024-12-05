import { HttpService } from '@nestjs/axios';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { Area } from 'src/entities/area.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AreasUpdateService implements OnModuleInit {
    private readonly secureHeaders: {
        Authorization: string;
        'HH-User-Agent': string;
    };
    constructor(
        @InjectRepository(Area)
        private readonly areaRepository: Repository<Area>,
        private readonly httpService: HttpService,
        private readonly configService: ConfigService
    ) {
        this.secureHeaders = {
            Authorization: `Bearer ${this.configService.get<string>('HH_ACCESS_TOKEN')}`,
            'HH-User-Agent': this.configService.get<string>('HH-User-Agent'),
        };
    }

    @Cron('0 2 * * *')
    async updateAreas(): Promise<void> {
        return this.processAreas();
    }

    async onModuleInit() {
        this.processAreas();
    }

    private async processAreas(): Promise<void> {
        try {
            const response = await firstValueFrom(
                this.httpService.get('/areas', {
                    headers: this.secureHeaders,
                })
            );

            const rootAreas = response.data || [];
            const stack: { area: any; parentPath: string[] }[] = rootAreas.map((area) => ({
                area,
                parentPath: [],
            }));

            while (stack.length > 0) {
                const { area, parentPath } = stack.pop();

                const existingArea = await this.areaRepository.findOne({ where: { id: area.id } });

                if (!existingArea) {
                    const newArea = this.areaRepository.create({
                        id: area.id,
                        title: area.name,
                        parentPath: [...parentPath, area.parent_id].filter(Boolean),
                        parentArea: area.parent_id
                            ? await this.areaRepository.findOne({ where: { id: area.parent_id } })
                            : null,
                    });

                    await this.areaRepository.save(newArea);
                }

                if (area.areas?.length) {
                    stack.push(
                        ...area.areas.map((subArea) => ({
                            area: subArea,
                            parentPath: [...parentPath, area.id],
                        }))
                    );
                }
            }
        } catch (error) {
            console.error('Failed to update areas', error.message);
        }
    }
}
