import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { In, Like, Repository } from 'typeorm';
import { Movie } from './entity/movie.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { MovieDetail } from './entity/move-detail.entity';
import { Director } from '../director/entity/director.entity';
import { Genre } from '../genre/entity/genre.entity';
import { plainToInstance } from 'class-transformer';
import { ResponseMovieListDto } from './dto/response-movie-list.dto';
import { GetMoviesDto } from './dto/get-movies.dto';
import { ResponseMovieSimpleDto } from './dto/response-movie-simple.dto';
import { CommonService } from '../common/common.service';
import { join } from 'node:path';

@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    @InjectRepository(MovieDetail)
    private readonly movieDetailRepository: Repository<MovieDetail>,
    @InjectRepository(Director)
    private readonly directorRepository: Repository<Director>,
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
    private readonly commonService: CommonService,
  ) {}

  async findAll(queryDto: GetMoviesDto) {
    const { title } = queryDto;
    // todo title 기능 구현
    const qb = this.movieRepository
      .createQueryBuilder('movie')
      .leftJoinAndSelect('movie.director', 'director')
      .leftJoinAndSelect('movie.genres', 'genres');

    if (title) {
      qb.where('movie.title LIKE :title', { title: `%${title}%` });
    }

    // this.commonService.applyPagePaginationParamsToQb(qb, queryDto);
    const { nextCursor } = await this.commonService.applyCursorPaginationParamsToQb(qb, queryDto);
    // qb.take(take).skip((page - 1) * take);
    // qb.offset(page * take + 1).limit(take);
    const [movies, count] = await qb.getManyAndCount();

    const responseMovieSimpleDto = plainToInstance(ResponseMovieSimpleDto, movies);
    return plainToInstance(
      ResponseMovieListDto,
      { data: responseMovieSimpleDto, count, nextCursor },
      {
        excludeExtraneousValues: true,
      },
    );
  }

  async findOne(id: number) {
    const movie = await this.movieRepository.findOne({
      where: {
        id,
      },
      relations: ['detail', 'director', 'genres'],
    });

    if (!movie) {
      throw new NotFoundException('존재하지 않는 ID의 영화입니다');
    }

    return movie;
  }

  async createMovie(createMovieDto: CreateMovieDto, movieFileName: string) {
    const director = await this.directorRepository.findOne({
      where: {
        id: createMovieDto.directorId,
      },
    });

    if (!director) {
      throw new NotFoundException('존재하지 않는 ID의 감독입니다');
    }

    const genres = await this.genreRepository.find({
      where: {
        id: In(createMovieDto.genreIds),
      },
    });

    if (genres.length !== createMovieDto.genreIds.length) {
      throw new NotFoundException('존재하지 않는 ID의 장르가 있습니다');
    }

    const movieFolder = join('public', 'movie');

    const movie = await this.movieRepository.save({
      ...createMovieDto,
      detail: {
        detail: createMovieDto.detail,
      },
      director,
      genres,
      movieFilePath: join(movieFolder, movieFileName),
    });

    return movie;
  }

  async updateMovie(id: number, updateMovieDto: UpdateMovieDto) {
    const movie = await this.movieRepository.findOne({
      where: {
        id,
      },
      relations: ['detail'],
    });

    const { detail, directorId, genreIds, ...movieRest } = updateMovieDto;

    let newDirector: Director;

    if (directorId) {
      const director = await this.directorRepository.findOne({
        where: {
          id: directorId,
        },
      });
      if (!director) {
        throw new NotFoundException('존재하지 않는 ID의 감독입니다.');
      }

      newDirector = director;
    }

    let newGenres;

    if (genreIds) {
      const genres = await this.genreRepository.find({
        where: {
          id: In(genreIds),
        },
      });

      if (genres.length !== genreIds.length) {
        throw new NotFoundException('존재하지 않는 ID의 장르가 있습니다');
      }

      newGenres = genres;
    }

    const movieUpdateFields = {
      ...movieRest,
      ...(newDirector && { director: newDirector }),
    };

    await this.movieRepository.update(movie.id, movieUpdateFields);

    if (detail) {
      await this.movieDetailRepository.update(
        {
          id: movie.detail.id,
        },
        { detail },
      );
    }

    const updatedMovie = await this.movieRepository.findOne({
      where: {
        id,
      },
      relations: ['detail', 'director'],
    });

    updatedMovie.genres = newGenres;

    await this.movieRepository.save(updatedMovie);

    return this.movieRepository.findOne({
      where: {
        id,
      },
      relations: ['detail', 'director', 'genres'],
    });
  }

  async remove(id: number) {
    const movie = await this.movieRepository.findOne({
      where: {
        id,
      },
      relations: ['detail'],
    });
    if (!movie) {
      throw new NotFoundException('존재하지 않는 ID의 영화입니다');
    }
    await this.movieDetailRepository.remove(movie.detail);
    await this.movieRepository.remove(movie);
    return id;
  }
}
