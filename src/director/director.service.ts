import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDirectorDto } from './dto/create-director.dto';
import { UpdateDirectorDto } from './dto/update-director.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Director } from './entity/director.entity';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';

@Injectable()
export class DirectorService {
  constructor(
    @InjectRepository(Director)
    private readonly directorRepository: Repository<Director>,
  ) {}

  create(createDirectorDto: CreateDirectorDto) {
    const director = plainToClass(Director, createDirectorDto);
    return this.directorRepository.save(director);
  }

  findAll() {
    return this.directorRepository.find();
  }

  findOne(id: number) {
    return this.directorRepository.findOne({
      where: {
        id: id,
      },
    });
  }

  async update(id: number, updateDirectorDto: UpdateDirectorDto) {
    let director = await this.directorRepository.findOne({
      where: {
        id,
      },
    });

    if (!director) {
      throw new NotFoundException('존재하지 않는 ID의 영화입니다.');
    }

    await this.directorRepository.update(
      {
        id,
      },
      {
        ...updateDirectorDto,
      },
    );

    const newDirector = await this.directorRepository.findOne({
      where: {
        id,
      },
    });
    return newDirector;
  }

  remove(id: number) {
    return this.directorRepository.delete({
      where: {
        id,
      },
    });
  }
}
