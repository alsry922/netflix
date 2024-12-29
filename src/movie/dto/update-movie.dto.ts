import { ArrayNotEmpty, IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateMovieDto {
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  title?: string;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  detail?: string;

  @IsNotEmpty()
  @IsOptional()
  @IsNumber()
  directorId?: number;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  @Type(() => Number)
  genreIds?: number[];
}
