import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DirectorService } from './director.service';
import { CreateDirectorDto } from './dto/create-director.dto';
import { UpdateDirectorDto } from './dto/update-director.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('director')
@ApiBearerAuth()
@ApiTags('director')
export class DirectorController {
  constructor(private readonly directorService: DirectorService) {}

  @Post()
  create(@Body() createDirectorDto: CreateDirectorDto) {
    return this.directorService.create(createDirectorDto);
  }

  @Get()
  findAll() {
    return this.directorService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.directorService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateDirectorDto: UpdateDirectorDto) {
    return this.directorService.update(id, updateDirectorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.directorService.remove(id);
  }
}
