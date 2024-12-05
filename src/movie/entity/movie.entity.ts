import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseTable } from './bast-table.entity';
import { MovieDetail } from './move-detail.entity';

// ManyToOne Director -> 감독은 여러 영화를 만들 수 있음
// OneToOne MovieDetail -> 영화는 하나의 상세 내용을 가질 수 있음
// ManyToMany Genre -> 영화는 여러개의 장르를 가질 수 있고 장르는 여러 개의 영화에 속할 수 있음.

@Entity()
export class Movie extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  genre: string;

  @OneToOne(() => MovieDetail, (movieDetail) => movieDetail.movie)
  detail: MovieDetail;
}