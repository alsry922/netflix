import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CursorPaginationDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: '페이지네이션 커서',
    example: 'eyJ2YWx1ZXMiOnsiaWQiOjI3OX0sIm9yZGVyIjpbImlkX0RFU0MiXX0',
  })
  cursor?: string;

  @IsArray()
  @IsString({
    each: true,
  })
  @IsOptional()
  @ApiProperty({
    description: '컬럼별 내림차순 또는 오름차순 정렬',
    example: ['id_DESC', 'id_ASC'],
  })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  order: string[] = ['id_DESC'];

  @IsInt()
  @IsOptional()
  @ApiProperty({ description: '가져올 데이터 갯수', example: 5 })
  take: number = 5;
}
