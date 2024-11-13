import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entity/movie.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { MovieDetail } from './entity/movie-detail.entity';

@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    @InjectRepository(MovieDetail)
    private readonly movieDetailRepository: Repository<MovieDetail>,
  ) {}

  async findAll(title?: string) {
    //todo title 필터 기능 추가하기
    if (!title) {
      const movies = await this.movieRepository.find();
      return movies;
    }
    return this.movieRepository.find({ where: { title: Like(`%${title}%`) } });
  }

  async findOne(id: number) {
    const movie = await this.movieRepository.findOne({
      where: {
        id,
      },
      relations: ['movieDetail'],
    });
    if (!movie) {
      throw new NotFoundException('존재하지 않는 ID의 영화입니다!');
    }

    return movie;
  }

  async createMovie(createMovieDto: CreateMovieDto) {
    const movieDetail = await this.movieDetailRepository.save({
      detail: createMovieDto.detail,
    });

    const movie = await this.movieRepository.save({
      title: createMovieDto.title,
      genre: createMovieDto.genre,
      movieDetail: { detail: createMovieDto.detail },
    });

    return movie;
  }

  async update(id: number, updateMovieDto: UpdateMovieDto) {
    const movie = await this.movieRepository.findOne({
      where: { id },
      relations: ['movieDetail'],
    });
    if (!movie) {
      throw new NotFoundException('존재하지 않는 ID의 영화입니다.');
    }

    const { detail, ...movieRest } = updateMovieDto;
    //열거 가능하며, 순수하게 본인이 가지고 있는 자체 속성만 복사함
    await this.movieRepository.update({ id }, movieRest);

    if (detail) {
      await this.movieDetailRepository.update(
        {
          id: movie.movieDetail.id,
        },
        {
          detail,
        },
      );
    }
    const newMovie = await this.movieRepository.findOne({
      where: { id },
      relations: ['movieDetail'],
    });

    return newMovie;
  }

  async remove(id: number) {
    const movie = await this.movieRepository.findOne({
      where: { id },
      relations: ['movieDetail'],
    });

    if (!movie) {
      throw new NotFoundException('존재하지 않는 ID의 영화입니다.');
    }
    await this.movieRepository.delete(id);
    await this.movieDetailRepository.delete(movie.movieDetail.id);
    return id;
  }
}
