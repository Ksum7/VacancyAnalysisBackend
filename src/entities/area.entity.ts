import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';

@Entity('areas')
export class Area {
    @PrimaryColumn('int')
    id: number;

    @ManyToOne(() => Area, { nullable: true })
    @JoinColumn({ name: 'parent_area_id' })
    parentArea: Area;

    @Column()
    title: string;

    @Column('text', { array: true, nullable: true })
    parentPath: string[];
}
