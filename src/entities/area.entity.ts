import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';

@Entity('areas')
export class Area {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Area, { nullable: true })
    @JoinColumn({ name: 'parent_area_id' })
    parentArea: Area;

    @Column()
    title: string;

    @Column('text', { array: true, nullable: true })
    parentPath: string[];
}
