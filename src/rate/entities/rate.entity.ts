import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Contract } from "../../contract/entities/contract.entity";
import { Discount } from "../../discount/entities/discount.entity";

@Entity({ name: "rates" })
export class Rate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 255 })
  name: string;

  @Column({ type: "decimal", precision: 10, scale: 6 })
  peakEnergyPrice: number;

  @Column({ type: "decimal", precision: 10, scale: 6 })
  standardEnergyPrice: number;

  @Column({ type: "decimal", precision: 10, scale: 6 })
  offPeakEnergyPrice: number;

  @Column({ type: "decimal", precision: 10, scale: 6, nullable: true })
  peakPowerPrice: number;

  @Column({ type: "decimal", precision: 10, scale: 6, nullable: true })
  standardPowerPrice: number;

  @Column({ type: "decimal", precision: 10, scale: 6, nullable: true })
  offPeakPowerPrice: number;

  @Column({ type: "date" })
  startDate: Date;

  @Column({ type: "date", nullable: true })
  endDate: Date;

  @OneToMany(() => Discount, discount => discount.rate)
  discounts: Discount[];

  @OneToMany(() => Contract, contract => contract.rate)
  contracts: Contract[];
}
