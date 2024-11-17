import { Genre } from '../../genre/entity/genre.entity';
import { MovieDetail } from '../entity/movie-detail.entity';
import { Director } from '../../director/entity/director.entity';
import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class ResponseMovieDto {
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose()
  @Type(() => Genre)
  genres: Genre[];

  @Expose()
  @Type(() => MovieDetail)
  detail: MovieDetail;

  @Expose()
  @Type(() => Director)
  director: Director;
}
