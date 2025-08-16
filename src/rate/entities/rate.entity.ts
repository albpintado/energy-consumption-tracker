import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Discount } from "../../discount/entities/discount.entity";

@Entity()
export class Rate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 255 })
  name: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  peakEnergyPrice: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  standardEnergyPrice: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  offPeakEnergyPrice: number;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  peakPowerPrice: number;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  standardPowerPrice: number;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  offPeakPowerPrice: number;

  @Column({ type: "date" })
  startDate: Date;

  @Column({ type: "date", nullable: true })
  endDate: Date;

  @OneToMany(() => Discount, (discount) => discount.rate)
  discounts: Discount[];
}
