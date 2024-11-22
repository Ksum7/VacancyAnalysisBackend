import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Vacancy } from './vacancy.entity';

@Entity('grades')
export class Grade {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @ManyToMany(() => Vacancy, (vacancy) => vacancy.grades, {
        onDelete: 'CASCADE',
    })
    vacancies: Vacancy[];
}
