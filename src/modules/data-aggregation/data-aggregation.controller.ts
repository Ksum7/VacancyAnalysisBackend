import { Controller, Get } from '@nestjs/common';
import { DataAggregationService } from './data-aggregation.service';

@Controller('da')
export class DataAggregationController {
    constructor(
        private readonly dataAggregationService: DataAggregationService
    ) {}

    @Get()
    getDAHello(): string {
        return this.dataAggregationService.getHello();
    }
}
