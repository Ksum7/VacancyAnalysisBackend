import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('professions')
export class Profession {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column('text', { array: true, nullable: false })
    synonyms: string[];

    @Column({ nullable: true, type: 'timestamptz' })
    last_checked_date: Date;
}
