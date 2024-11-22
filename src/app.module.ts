import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { ApiCollectorModule } from './modules/api-collector/api-collector.module';
import { DataAggregationModule } from './modules/data-aggregation/data-aggregation.module';
import { AdminModule } from './modules/admin/admin.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
    imports: [
        ScheduleModule.forRoot(),
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
