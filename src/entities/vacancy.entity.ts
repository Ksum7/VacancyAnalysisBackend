import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    JoinTable,
    ManyToMany,
} from 'typeorm';
import { Area } from './area.entity';
import { Profession } from './profession.entity';
import { Grade } from './grade.entity';

@Entity('vacancies')
export class Vacancy {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Area, { nullable: true })
    @JoinColumn({ name: 'area_id' })
    area: Area;

    @ManyToOne(() => Profession, { nullable: true })
    @JoinColumn({ name: 'profession_id' })
    profession: Profession;

    @Column({ nullable: true, type: 'timestamp' })
    publishedAt: Date;

    @Column({ nullable: true })
    hhId: string;

    @Column()
    name: string;

    @Column({ nullable: true, type: 'text' })
    snippetRequirement: string;

    @Column({ nullable: true, type: 'text' })
    snippetResponsibility: string;

    @Column({ nullable: true, type: 'numeric' })
    salaryFrom: number;

    @Column({ nullable: true, type: 'numeric' })
    salaryTo: number;

    @Column({ nullable: true })
    salaryCurrency: string;

    @Column({ nullable: true, type: 'boolean' })
    salaryGross: boolean;

    @ManyToMany(() => Grade, (grade) => grade.vacancies, {
        onDelete: 'CASCADE',
    })
    @JoinTable()
    grades: Grade[];
}
