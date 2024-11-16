import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseTable } from '../../common/entity/base-table.entity';
import { MovieDetail } from './movie-detail.entity';
import { Director } from '../../director/entity/director.entity';
import { Genre } from '../../genre/entity/genre.entity';
import { JoinTable } from 'typeorm';

@Entity()
// @Unique('TITLE_UNIQUE', ['title'])
export class Movie extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
  })
  title: string;

  @ManyToMany(() => Genre, (genre) => genre.movies)
  @JoinTable()
  genres: Genre[];

  @OneToOne(
    () => MovieDetail,
    (movieDetail) => movieDetail.movie, //반대 엔티티의 어떤 필드가 현재 엔티티와의 관계를 나타내지 필드를 지정한다.
    {
      cascade: true,
      nullable: false,
    },
  )
  @JoinColumn()
  detail: MovieDetail;

  @ManyToOne(() => Director, (director) => director.id, {
    cascade: true,
    nullable: false,
  })
  director: Director;
}
