import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('meta_data')
export class MetaData {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    key: string;

    @Column({ nullable: true, type: 'text' })
    value: string;
}
