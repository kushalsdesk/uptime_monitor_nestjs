import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Monitor } from "./monitor.entity.js";

@Entity('checks')
@Index(['monitor', 'checkedAt'])
export class Check{
  @PrimaryGeneratedColumn('uuid')
  id:string

  @Column({type:'int'})
  statusCode:number

  @Column({type:'int'})
  responseTimeMs:number

  @Column({type:'boolean'})
  isUp:boolean

  @Column({type:'text', nullable:true})
  errorMessage:string|null

  @CreateDateColumn({type:'timestamptz'})
  checkedAt:Date


  @ManyToOne(()=>Monitor, (monitor)=>monitor.checks, {onDelete:'CASCADE'})
  @JoinColumn({name:'monitor_id'})
  monitor:Monitor
}
