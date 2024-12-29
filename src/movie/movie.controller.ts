import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { MovieService } from './movie.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { AuthGuard } from '../auth/guard/auth.guard';
import { Public } from '../auth/decorator/public.decorator';
import { RBAC } from '../auth/decorator/rbac.decorator';
import { UserRoleEnum } from '../user/const/user-role.enum';
import { GetMoviesDto } from './dto/get-movies.dto';
import { UserId } from '../user/decorator/user-id.decorator';

@Controller('movie')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(AuthGuard)
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Post()
  @RBAC(UserRoleEnum.ADMIN)
  create(@Body() createMovieDto: CreateMovieDto, @UserId() userId: number) {
    return this.movieService.createMovie(createMovieDto, userId);
  }

  @Public()
  @Get()
  findAll(@Query() queryDto: GetMoviesDto, @UserId() userId?: number) {
    return this.movieService.findAll(queryDto, userId);
  }

  @Get('recent')
  getMoviesRecent() {
    return this.movieService.findRecent();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.movieService.findOne(id);
  }

  @RBAC(UserRoleEnum.ADMIN)
  @Patch(':id')
  update(@Param('id') id: number, @Body() updateMovieDto: UpdateMovieDto) {
    return this.movieService.updateMovie(id, updateMovieDto);
  }

  @RBAC(UserRoleEnum.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.movieService.remove(id);
  }

  @Post(':id/like')
  createMovieLike(@Param('id') movieId: number, @UserId() userId: number) {
    return this.movieService.toggleMovieLike(movieId, userId, true);
  }

  @Post(':id/dislike')
  createMovieDislike(@Param('id') movieId: number, @UserId() userId: number) {
    return this.movieService.toggleMovieLike(movieId, userId, false);
  }
}
