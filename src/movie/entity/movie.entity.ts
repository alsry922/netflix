import {
  Column,
  Entity,
  JoinColumn, ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn
} from 'typeorm';
import { BaseTable } from '../../common/entity/base-table.entity';
import { MovieDetail } from './movie-detail.entity';
import { Director } from '../../director/entity/director.entity';

// ManyToOne Director
// OneToOne MovieDetail
// ManyToMany Genre -> 영화는 여러 개의 장르를 가질 수 있음. 장르는 여러 개의 영화에 속할 수 있음

@Entity()
export class Movie extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  genre: string;

  @OneToOne(() => MovieDetail, (movieDetail) => movieDetail.id, {
    cascade: true,
  })
  @JoinColumn()
  movieDetail: MovieDetail;

  @ManyToOne(() => Director, (director) => director.id)
  director: Director;
}
