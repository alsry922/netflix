import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entity/movie.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { MovieDetail } from './entity/movie-detail.entity';
import { Director } from '../director/entity/director.entity';
import { Genre } from '../genre/entity/genre.entity';
import { plainToInstance } from 'class-transformer';
import { ResponseMovieDto } from './dto/response-movie.dto';

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
  ) {}

  async findAll(title?: string) {
    //movie 엔티티에 관해 쿼리빌더를 생성하고 alias를 'movie'로 준다.
    //find처럼 데이터를 읽는 로직은 repository가 편하지만, 특정 조건이 들어가기 시작하는 복잡한 쿼리는 QueryBuilder를 사용하는게 좋다.
    const qb = this.movieRepository
      .createQueryBuilder('movie')
      .leftJoinAndSelect('movie.director', 'director')
      .leftJoinAndSelect('movie.genres', 'genres');

    if (title) {
      qb.where('movie.title LIKE :title', {
        title: `%${title}%`,
      });
    }

    const result = await qb.getMany();
    const response = plainToInstance(ResponseMovieDto, result);
    return response;

    // //todo title 필터 기능 추가하기
    // if (!title) {
    //   const movies = await this.movieRepository.find({
    //     relations: ['director', 'genres'],
    //   });
    //   return movies;
    // }
    // return this.movieRepository.find({
    //   where: { title: Like(`%${title}%`) },
    //   relations: ['director', 'genres'],
    // });
  }

  async findOne(id: number) {
    const movie = await this.movieRepository
      .createQueryBuilder('movie')
      .leftJoinAndSelect('movie.director', 'director')
      .leftJoinAndSelect('movie.genres', 'genres')
      .leftJoinAndSelect('movie.detail', 'detail')
      .where('movie.id = :id', { id: id })
      .getOne();

    // const movie = await this.movieRepository.findOne({
    //   where: {
    //     id,
    //   },
    //   relations: ['detail', 'director', 'genres'],
    // });
    if (!movie) {
      throw new NotFoundException('존재하지 않는 ID의 영화입니다!');
    }

    return movie;
  }

  async createMovie(createMovieDto: CreateMovieDto) {
    //director 찾아옴
    const director = await this.directorRepository.findOne({
      where: {
        id: createMovieDto.directorId,
      },
    });

    if (!director) {
      throw new NotFoundException('존재하지 않는 ID의 감독입니다.');
    }

    //genre 찾아옴
    const genres = await this.genreRepository.find({
      where: {
        id: In(createMovieDto.genreIds),
      },
    });

    if (genres.length !== createMovieDto.genreIds.length) {
      throw new NotFoundException('존재하지 않는 장르가 있습니다.');
    }

    const movieDetail = await this.movieDetailRepository
      .createQueryBuilder()
      .insert()
      .into(MovieDetail)
      .values({
        detail: createMovieDto.detail,
      })
      .execute();

    //저장한 row의 id를 가져올 수 있다. 저장 결과의 identifiers는 리스트이다.
    //우리는 하나만 저장한걸 알기 때문에 [0]인덱스의 id를 가져온다.
    console.log('Console:: ', movieDetail.identifiers);
    const movieDetailId = movieDetail.identifiers[0].id;

    //Repository를 사용해서 연관관계가 있는 필드를 저장해서 연관관계가 있는 테이블까지 한 번에 저장됐던거랑 달리
    //queryBuilder를 사용하면 연관관계가 있는 entity를 먼저 테이블에 저장하고, 그 후에 엔티티의 참조 컬럼에 id 값을 직접 넣어 연결해주어야 한다.
    //예를 들면 movie와 movieDetail은 oneToOne이고 movie가 movieDetail를 참조하는 외래키를 가지고 있기 때문에
    //movieDetail을 먼저 저장하고, movie를 저장하면서 movieDetail을 저장하는 참조 컬럼에 직접 movieDetailId를 지정하여 저장해야 한다.
    //즉 같이 cascade해서 생성하는 것이 안된다.
    const movie = await this.movieRepository
      .createQueryBuilder()
      .insert()
      .into(Movie)
      .values({
        title: createMovieDto.title,
        detail: { id: movieDetailId }, //ManyToOne, OneToMany는 이렇게 저장이 가능함
        director,
        // ManyToMany도 queryBuilder로 저장할 때 한 번에 안된다.
        // genres,
      })
      .execute();

    const movieId = movie.identifiers[0].id;

    await this.movieRepository
      .createQueryBuilder()
      .relation(Movie, 'genres') // Movie 테이블에서 genres와 관계를 조작할 것이다.
      .of(movieId) //해당 movieId를 갖고 있는 Movie와
      .add(genres.map((genre) => genre.id)); //관계를 추가할것이다.

    // const movie = await this.movieRepository.save({
    //   title: createMovieDto.title,
    //   detail: { detail: createMovieDto.detail },
    //   director,
    //   genres,
    // });

    return await this.movieRepository.findOne({
      where: {
        id: movieId,
      },
      relations: ['director', 'genres', 'detail'],
    });
  }

  async update(id: number, updateMovieDto: UpdateMovieDto) {
    const movie = await this.movieRepository.findOne({
      where: { id },
      relations: ['detail', 'director', 'genres'],
    });
    if (!movie) {
      throw new NotFoundException('존재하지 않는 ID의 영화입니다.');
    }

    const { detail, directorId, genreIds, ...movieRest } = updateMovieDto;

    let newDirector;

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
      if (genres.length !== updateMovieDto.genreIds.length) {
        throw new NotFoundException(
          `존재하지 않는 장르가 있습니다! 존재하는 ids -> ${genres.map((genre) => genre.id).join(', ')}`,
        );
      }
      newGenres = genres;
    }

    const movieUpdateFields = {
      ...movieRest,
      ...(newDirector && { director: newDirector }),
    };

    await this.movieRepository
      .createQueryBuilder()
      .update(Movie)
      .set(movieUpdateFields)
      .where('id = :id', { id })
      .execute();

    // await this.movieRepository.update({ id }, movieUpdateFields);

    if (detail) {
      await this.movieDetailRepository
        .createQueryBuilder()
        .update(MovieDetail)
        .set({ detail })
        .where('id = :id', { id: movie.detail.id })
        .execute();

      await this.movieDetailRepository.update(
        {
          id: movie.detail.id,
        },
        {
          detail,
        },
      );
    }
    if (newGenres) {
      await this.movieRepository
        .createQueryBuilder()
        .relation(Movie, 'genres')
        .of(id)
        .addAndRemove(
          newGenres.map((genre) => genre.id),
          movie.genres.map((genre) => genre.id),
        );
    }

    return this.movieRepository.findOne({
      where: {
        id,
      },
      relations: ['detail', 'director', 'genres'],
    });

    // const newMovie = await this.movieRepository.findOne({
    //   where: { id },
    //   relations: ['detail', 'director'],
    // });
    //
    // newMovie.genres = newGenres;
    // return await this.movieRepository.save(newMovie);

    // return this.movieRepository.findOne({
    //   where: { id },
    //   relations: ['detail', 'director', 'genres'],
    // });
    // return newMovie;
  }

  async remove(id: number) {
    const movie = await this.movieRepository.findOne({
      where: { id },
      relations: ['detail'],
    });

    if (!movie) {
      throw new NotFoundException('존재하지 않는 ID의 영화입니다.');
    }
    await this.movieRepository
      .createQueryBuilder()
      .delete()
      .where('id = :id', { id })
      .execute();
    // await this.movieRepository.delete(id);
    await this.movieDetailRepository.delete(movie.detail.id);
    return id;
  }
}
