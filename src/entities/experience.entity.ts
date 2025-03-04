import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('experiences')
export class Experience {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    hhId: string;

    @Column()
    title: string;
}
