import {
      Entity,
      PrimaryGeneratedColumn,
      Column,
      CreateDateColumn,
      ManyToOne,
      JoinColumn,
      Index,
      type Relation
    } from 'typeorm';
    import { Monitor } from './monitor.entity.js';

    @Entity('checks')
    @Index(['monitor', 'checkedAt']) // 🚀 Composite B-Tree Index for Time-Series Queries
    export class Check {
      @PrimaryGeneratedColumn('uuid')
      id: string;

      @Column({ type: 'int' })
      statusCode: number;

      @Column({ type: 'int' })
      responseTimeMs: number;

      @Column({ type: 'boolean' })
      isUp: boolean;

      @Column({ type: 'text', nullable: true })
      errorMessage: string | null;

      @CreateDateColumn({ type: 'timestamptz' })
      checkedAt: Date;

      // Many Checks belong to One Monitor
      @ManyToOne(() => Monitor, (monitor) => monitor.checks, { onDelete: 'CASCADE' })
      @JoinColumn({ name: 'monitor_id' })
      monitor: Relation<Monitor>;
    }
