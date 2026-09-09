import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum UserRole{
  ADMIN = "ADMIN",
  MEMBER="MEMBER"
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type:'varchar', unique:true, length:150})
  email:string

  @Column({type:'varchar'})
  passwordHash:string

  @Column({type:'varchar', length:100})
  name:string

  @Column({
    type: 'enum',
    enum: UserRole,
    default:UserRole.MEMBER
  })
  role:UserRole

  @CreateDateColumn({type:'timestamptz'})
  createdAt:Date

  @UpdateDateColumn({type:'timestamptz'})
  updatedAt:Date
}
