import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ResponseGenreSimpleDto {
  @Expose()
  id: number;

  @Expose()
  name: string;
}
