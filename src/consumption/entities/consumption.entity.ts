import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Contract } from "../../contract/entities/contract.entity";

@Entity({ name: "consumptions" })
export class Consumption {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "date" })
  date: Date;

  @Column({ type: "smallint" })
  hour: number;

  @Column({ type: "decimal", precision: 10, scale: 3 })
  energy: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: "timestamp", nullable: true })
  deletedAt: Date | null;

  @ManyToOne(() => Contract, contract => contract.consumptions)
  @JoinColumn({ name: "contractId" })
  contract: Contract;
}
