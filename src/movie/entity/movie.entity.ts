import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { BaseTable } from '../../common/entity/bast-table.entity';
import { MovieDetail } from './move-detail.entity';
import { Director } from '../../director/entity/director.entity';
import { Genre } from '../../genre/entity/genre.entity';
import { User } from '../../user/entity/user.entity';

// ManyToOne Director -> 감독은 여러 영화를 만들 수 있음
// OneToOne MovieDetail -> 영화는 하나의 상세 내용을 가질 수 있음
// ManyToMany Genre -> 영화는 여러개의 장르를 가질 수 있고 장르는 여러 개의 영화에 속할 수 있음.

@Entity()
@Unique('UQ_MOVIE_TITLE', ['title'])
export class Movie extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @ManyToMany(() => Genre, (genre) => genre.movies)
  @JoinTable()
  genres: Genre[];

  @Column({
    default: 0,
  })
  likeCount: number;

  @OneToOne(() => MovieDetail, (movieDetail) => movieDetail.movie, { cascade: true, nullable: false })
  detail: MovieDetail;

  @ManyToOne(() => User, (user) => user.createdMovies)
  creator: User;

  @Column()
  movieFilePath: string;

  @ManyToOne(() => Director, (director) => director.movies, { cascade: true, nullable: false })
  @JoinColumn({
    foreignKeyConstraintName: 'FK_MOVIE_DIRECTOR',
  })
  director: Director;
}
