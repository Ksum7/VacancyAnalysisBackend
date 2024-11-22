import { Expose, Transform } from 'class-transformer';
import { IsString, IsOptional, IsDate, IsNumber, IsBoolean } from 'class-validator';

export class VacancyDto {
    @IsString()
    @Expose()
    areaId: string;

    @IsString()
    @Expose()
    professionId: string;

    @IsDate()
    @Transform(({ value }) => (value ? new Date(value) : null))
    @Expose()
    publishedAt: Date;

    @IsString()
    @Transform(({ value }) => value?.id)
    @Expose()
    hhId: string;

    @IsString()
    @Expose()
    name: string;

    @IsOptional()
    @IsString()
    @Expose()
    snippetRequirement: string;

    @IsOptional()
    @IsString()
    @Expose()
    snippetResponsibility: string;

    @IsOptional()
    @IsNumber()
    @Expose()
    salaryFrom: number;

    @IsOptional()
    @IsNumber()
    @Expose()
    salaryTo: number;

    @IsOptional()
    @IsString()
    @Expose()
    salaryCurrency: string;

    @IsOptional()
    @IsBoolean()
    @Expose()
    salaryGross: boolean;
}
