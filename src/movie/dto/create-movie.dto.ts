import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateMovieDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  genre: string;

  @IsNotEmpty()
  detail: string;

  @IsNumber()
  @IsNotEmpty()
  directorId: number;
}
