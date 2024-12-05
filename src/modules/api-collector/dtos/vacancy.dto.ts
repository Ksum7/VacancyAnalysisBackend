import { Expose, Transform } from 'class-transformer';
import { IsString, IsOptional, IsDate, IsNumber, IsBoolean, IsObject, IsInstance } from 'class-validator';

export class VacancyDto {
    @IsObject()
    @Transform(({ obj }) => {
        return {
            id: obj.area?.id,
        };
    })
    @Expose()
    area: { id: number };

    @IsDate()
    @Transform(({ obj }) => (obj.published_at ? new Date(obj.published_at) : null))
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
    @IsString()
    @Transform(({ obj }) => obj.employer?.name)
    @Expose()
    employerName: string;

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
