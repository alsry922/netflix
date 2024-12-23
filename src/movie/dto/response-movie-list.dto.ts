import { Exclude, Expose, Type } from 'class-transformer';
import { ResponseGenreSimpleDto } from '../../genre/dto/response-genre-simple.dto';
import { ResponseDirectorSimpleDto } from '../../director/dto/response-director-simple.dto';
import { ResponseMovieSimpleDto } from './response-movie-simple.dto';

@Exclude()
export class ResponseMovieListDto {
  @Expose()
  @Type(() => ResponseMovieSimpleDto)
  data: ResponseMovieSimpleDto[];

  @Expose()
  count: number;
}
