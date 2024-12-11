import { Column, Entity, ManyToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Movie } from '../../movie/entity/movie.entity';
import { BaseTable } from '../../common/entity/bast-table.entity';

@Entity()
@Unique('UQ_GENRE_NAME', ['name'])
export class Genre extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToMany(() => Movie, (movie) => movie.genres)
  movies: Movie[];
}
