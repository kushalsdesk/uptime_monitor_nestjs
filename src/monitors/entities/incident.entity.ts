import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { Monitor } from './monitor.entity.js';

export enum IncidentStatus {
  HEALTHY = 'HEALTHY',
  SUSPECTED_DOWN = 'SUSPECTED_DOWN',
  CONFIRMED_DOWN = 'CONFIRMED_DOWN',
  RESOLVED = 'RESOLVED',
}

@Entity('incidents')
@Index(['monitor'])
@Index(['status'])
export class Incident {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: IncidentStatus,
    default: IncidentStatus.SUSPECTED_DOWN,
  })
  status: IncidentStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  startedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  resolvedAt: Date | null;

  @ManyToOne(() => Monitor, (monitor) => monitor.incidents, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'monitor_id' })
  monitor: Relation<Monitor>;
}
