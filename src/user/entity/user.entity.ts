import { Column, DeepPartial, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { BaseTable } from '../../common/entity/bast-table.entity';
import { UserRoleEnum } from '../const/user-role.enum';
import { Movie } from '../../movie/entity/movie.entity';

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

  @OneToMany(() => Movie, (movie) => movie.creator)
  createdMovies: Movie[];

  public static from(partialUser: DeepPartial<User>): User {
    const user = new User();
    user.id = partialUser.id;
    user.email = partialUser.email;
    user.password = partialUser.password;
    user.role = partialUser.role;
    return user;
  }
}
