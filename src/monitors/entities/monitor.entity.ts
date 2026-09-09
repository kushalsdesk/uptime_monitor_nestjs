import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  type Relation,
} from 'typeorm';
import { Check } from './check.entity.js';
import { Incident } from './incident.entity.js';

export enum MonitorType {
  HTTP = 'HTTP',
  API = 'API',
  PING = 'PING',
}

@Entity('monitors')
export class Monitor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'varchar', length: 500 })
  url: string;

  @Column({
    type: 'enum',
    enum: MonitorType,
    default: MonitorType.HTTP,
  })
  type: MonitorType;

  @Column({ type: 'int', default: 60 })
  intervalSec: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => Check, (check) => check.monitor)
  checks: Relation<Check>[];

  @OneToMany(() => Incident, (incident) => incident.monitor)
  incidents: Relation<Incident>[];
}
