import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param, ParseIntPipe,
  Patch,
  Post,
  Query,
  UseInterceptors
} from '@nestjs/common';
import { MovieService } from './movie.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { plainToClass } from 'class-transformer';

@Controller('movie')
@UseInterceptors(ClassSerializerInterceptor) //class-transformer를 MovieController에 적용하겠다.
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Get()
  getMovies(@Query('title') title?: string) {
    return this.movieService.findAll(title);
  }

  @Get(':id')
  getMovie(@Param('id') id: number) {
    console.log(typeof id);
    return this.movieService.findOne(+id);
  }

  @Post()
  async postMovie(@Body() body: CreateMovieDto) {
    const movie = await this.movieService.createMovie(body);
    return movie;
  }

  @Patch(':id')
  patchMovie(@Param('id', ParseIntPipe) id: string, @Body() body: UpdateMovieDto) {
    return this.movieService.update(+id, body);
  }

  @Delete(':id')
  deleteMovie(@Param('id', ParseIntPipe) id: string) {
    return this.movieService.remove(+id);
  }
}
