import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Consumption } from "../../consumption/entities/consumption.entity";
import { Rate } from "../../rate/entities/rate.entity";
import { User } from "../../user/entities/user.entity";

@Entity()
export class Contract {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  contractNumber: string;

  @Column()
  supplierName: string;

  @Column({ type: "date" })
  startDate: Date;

  @Column({ type: "date", nullable: true })
  endDate: Date;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: "timestamp", nullable: true })
  deletedAt: Date | null;

  @ManyToOne(() => User, user => user.contracts)
  @JoinColumn({ name: "userId" })
  user: User;

  @ManyToOne(() => Rate, rate => rate.contracts)
  @JoinColumn({ name: "rateId" })
  rate: Rate;

  @OneToMany(() => Consumption, consumption => consumption.contract)
  consumptions: Consumption[];
}
