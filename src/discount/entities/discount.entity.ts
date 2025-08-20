import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Rate } from "../../rate/entities/rate.entity";

@Entity({ name: "discounts" })
export class Discount {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "decimal", precision: 5, scale: 2 })
  percentage: number;

  @Column({ type: "date" })
  startDate: Date;

  @Column({ type: "date", nullable: true })
  endDate: Date;

  @Column({ type: "int" })
  startHour: number;

  @Column({ type: "int" })
  endHour: number;

  @ManyToOne(() => Rate, rate => rate.discounts)
  @JoinColumn({ name: "rateId" })
  rate: Rate;
}
