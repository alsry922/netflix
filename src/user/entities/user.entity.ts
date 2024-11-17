import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { BaseTable } from '../../common/entity/base-table.entity';

export enum Role {
  user = 'USER',
  paidUser = 'PAIDUSER',
  admin = 'ADMIN',
}

export const RoleHierarchy: Record<Role, number> = {
  [Role.user]: 0,
  [Role.paidUser]: 1,
  [Role.admin]: 2,
};

@Entity()
@Unique('unique_email', ['email'])
export class User extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.user,
  })
  role: Role;
}
