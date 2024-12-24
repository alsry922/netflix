import { Exclude, Expose, Type } from 'class-transformer';
import { ResponseMovieSimpleDto } from './response-movie-simple.dto';

@Exclude()
export class ResponseMovieListDto {
  @Expose()
  @Type(() => ResponseMovieSimpleDto)
  data: ResponseMovieSimpleDto[];

  @Expose()
  count: number;

  @Expose()
  nextCursor: string;
}
