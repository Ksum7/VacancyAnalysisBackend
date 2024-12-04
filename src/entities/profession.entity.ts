import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('professions')
export class Profession {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column('text', { array: true, nullable: false })
    synonyms: string[];
}
