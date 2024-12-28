import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Movie } from './movie.entity';
import { User } from '../../user/entity/user.entity';

@Entity()
@Unique('UQ_MOVIE_USER', ['movie', 'user'])
export class MovieUserLike {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  isLike: boolean;

  @ManyToOne(() => Movie, (movie) => movie.likedUsers, {
    onDelete: 'CASCADE',
  })
  movie: Movie;

  @ManyToOne(() => User, (user) => user.likedMovies, {
    onDelete: 'CASCADE',
  })
  user: User;
}
