import { Column, DeepPartial, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { BaseTable } from '../../common/entity/bast-table.entity';
import { UserRoleEnum } from '../const/user-role.enum';

@Entity()
@Unique('UQ_USER_EMAIL', ['email'])
export class User extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRoleEnum,
    default: UserRoleEnum.USER,
  })
  role: UserRoleEnum;

  public static from(partialUser: DeepPartial<User>): User {
    const user = new User();
    user.id = partialUser.id;
    user.email = partialUser.email;
    user.password = partialUser.password;
    user.role = partialUser.role;
    return user;
  }
}
