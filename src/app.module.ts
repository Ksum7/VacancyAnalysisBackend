import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ApiCollectorModule } from './api-collector/api-collector.module';
import { DataAggregationModule } from './data-aggregation/data-aggregation.module';
import { AdminModule } from './admin/admin.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                type: 'postgres',
                url: configService.get<string>('DATABASE_URL'),
                synchronize: true,
                entities: ['dist/**/*.entity{.ts,.js}'],
            }),
            inject: [ConfigService],
        }),
        AuthModule,
        ApiCollectorModule,
        DataAggregationModule,
        AdminModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
