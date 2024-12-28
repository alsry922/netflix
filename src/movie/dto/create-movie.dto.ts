import { ArrayNotEmpty, IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMovieDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  detail: string;

  @IsNumber()
  @IsNotEmpty()
  directorId: number;

  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  @Type(() => Number)
  genreIds: number[];

  @IsString()
  @IsNotEmpty()
  movieFileName: string;
}
