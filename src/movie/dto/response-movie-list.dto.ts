import { Exclude, Expose, Type } from 'class-transformer';
import { ResponseGenreSimpleDto } from '../../genre/dto/response-genre-simple.dto';
import { ResponseDirectorSimpleDto } from '../../director/dto/response-director-simple.dto';

@Exclude()
export class ResponseMovieListDto {
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose()
  @Type(() => ResponseGenreSimpleDto)
  genres: ResponseGenreSimpleDto[];

  @Expose()
  @Type(() => ResponseDirectorSimpleDto)
  director: ResponseDirectorSimpleDto;
}
