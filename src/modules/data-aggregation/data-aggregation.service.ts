import { Injectable } from '@nestjs/common';

@Injectable()
export class DataAggregationService {
    getHello(): string {
        return 'Hello World!';
    }
}
