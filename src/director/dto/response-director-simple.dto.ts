import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ResponseDirectorSimpleDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  dob: Date;

  @Expose()
  nationality: string;
}
