import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseTable } from '../../common/entity/bast-table.entity';
import { Movie } from './movie.entity';
import { JoinColumn } from 'typeorm';

@Entity()
export class MovieDetail extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  detail: string;

  @OneToOne(() => Movie, (movie) => movie.detail)
  @JoinColumn()
  movie: Movie;
}
