import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
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
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('movie')
@UseInterceptors(ClassSerializerInterceptor)
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Post()
  @RBAC(UserRoleEnum.ADMIN)
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor('movie', {
      limits: {
        fileSize: 20000000,
      },
      fileFilter(
        req: any,
        file: {
          fieldname: string;
          originalname: string;
          encoding: string;
          mimetype: string;
          size: number;
          destination: string;
          filename: string;
          path: string;
          buffer: Buffer;
        },
        callback: (error: Error | null, acceptFile: boolean) => void,
      ) {
        if (file.mimetype !== 'video/mp4') {
          return callback(new BadRequestException('MP4 확장자만 업로드 가능합니다'), false);
        }
        return callback(null, true);
      },
    }),
  )
  create(@Body() createMovieDto: CreateMovieDto, @UploadedFile() movie: Express.Multer.File) {
    return this.movieService.createMovie(createMovieDto, movie.filename);
  }

  @Public()
  @Get()
  findAll(@Query() queryDto?: GetMoviesDto) {
    return this.movieService.findAll(queryDto);
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
}
