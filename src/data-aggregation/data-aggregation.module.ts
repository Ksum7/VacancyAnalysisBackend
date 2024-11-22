import { Module } from '@nestjs/common';
import { DataAggregationController } from './data-aggregation.controller';
import { DataAggregationService } from './data-aggregation.service';

@Module({
    imports: [],
    controllers: [DataAggregationController],
    providers: [DataAggregationService],
})
export class DataAggregationModule {}
