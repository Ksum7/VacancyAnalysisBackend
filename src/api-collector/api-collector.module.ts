import { Module } from '@nestjs/common';
import { ApiCollectorService } from './api-collector.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

@Module({
    imports: [
        HttpModule.registerAsync({
            useFactory: (configService: ConfigService) => ({
                baseURL: configService.get<string>('HH_API_URL'),
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [],
    providers: [ApiCollectorService],
})
export class ApiCollectorModule {}
