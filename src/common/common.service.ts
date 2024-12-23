import { Injectable } from '@nestjs/common';
import { SelectQueryBuilder } from 'typeorm';
import { PagePaginationDto } from './dto/page-pagination.dto';

@Injectable()
export class CommonService {
  constructor() {}

  applyPagePaginationParamsToQb<T>(qb: SelectQueryBuilder<T>, dto: PagePaginationDto) {
    const { take, page } = dto;

    qb.take(take).skip((page - 1) * take);
  }
}
