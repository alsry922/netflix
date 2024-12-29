import { IsOptional, IsString } from 'class-validator';
import { CursorPaginationDto } from '../../common/dto/cursor-pagination.dto';
import { ApiProperty } from '@nestjs/swagger';

export class GetMoviesDto extends CursorPaginationDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: '영화 제목',
    example: '프로메테우스',
  })
  title: string;
}
