import { Expose, Transform } from 'class-transformer';
import { IsString, IsOptional, IsDate, IsNumber, IsBoolean } from 'class-validator';

export class VacancyDto {
    @IsString()
    @Transform(({ obj }) => obj.area?.id)
    @Expose()
    areaId: string;

    // @IsString()
    // @Expose()
    // professionId: string;

    @IsDate()
    @Transform(({ value }) => (value ? new Date(value) : null))
    @Expose()
    publishedAt: Date;

    @IsString()
    @Transform(({ obj }) => obj.id)
    @Expose()
    hhId: string;

    @IsString()
    @Expose()
    name: string;

    @IsOptional()
    @IsString()
    @Transform(({ obj }) => obj.snippet?.requirement)
    @Expose()
    snippetRequirement: string;

    @IsOptional()
    @IsString()
    @Transform(({ obj }) => obj.snippet?.responsibility)
    @Expose()
    snippetResponsibility: string;

    @IsOptional()
    @IsNumber()
    @Transform(({ obj }) => obj.salary?.from)
    @Expose()
    salaryFrom: number;

    @IsOptional()
    @IsNumber()
    @Transform(({ obj }) => obj.salary?.to)
    @Expose()
    salaryTo: number;

    @IsOptional()
    @IsString()
    @Transform(({ obj }) => obj.salary?.currency)
    @Expose()
    salaryCurrency: string;

    @IsOptional()
    @IsBoolean()
    @Transform(({ obj }) => obj.salary?.gross)
    @Expose()
    salaryGross: boolean;
}
