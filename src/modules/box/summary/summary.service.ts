import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { isEmpty } from 'lodash'
import { Repository } from 'typeorm'

import { BusinessException } from '~/common/exceptions/biz.exception'
import { ErrorEnum } from '~/constants/error-code.constant'
import { paginate } from '~/helper/paginate'
import { Pagination } from '~/helper/paginate/pagination'
import { SummaryDto, SummaryQueryDto } from './summary.dto'
import { SummaryEntity } from './summary.entity'

@Injectable()
export class SummaryService {
  constructor(
    @InjectRepository(SummaryEntity)
    private summaryRepository: Repository<SummaryEntity>,
  ) {}

  /**
   * 分页查询
   */
  async page(dto: SummaryQueryDto): Promise<Pagination<SummaryEntity>> {
    const { environment, customerName, page = 1, pageSize = 10 } = dto

    const queryBuilder = this.summaryRepository.createQueryBuilder('summary')

    if (environment) {
      queryBuilder.andWhere('summary.environment = :environment', { environment })
    }

    if (customerName) {
      queryBuilder.andWhere('summary.customerName LIKE :customerName', {
        customerName: `%${customerName}%`,
      })
    }

    return paginate(queryBuilder, { page, pageSize })
  }

  /**
   * 创建
   */
  async create(dto: SummaryDto): Promise<void> {
    const exists = await this.summaryRepository.findOneBy({
      environment: dto.environment,
      customerName: dto.customerName,
    })

    if (!isEmpty(exists)) {
      throw new BusinessException(ErrorEnum.BOX_SUMMARY_EXISTS)
    }

    await this.summaryRepository.save(dto)
  }

  /**
   * 更新
   */
  async update(id: number, dto: SummaryDto): Promise<void> {
    const exists = await this.summaryRepository.findOneBy({ id })
    if (isEmpty(exists)) {
      throw new BusinessException(ErrorEnum.BOX_SUMMARY_NOT_FOUND)
    }

    await this.summaryRepository.update(id, dto)
  }

  /**
   * 查询单个信息
   */
  async findOne(id: number): Promise<SummaryEntity> {
    const summary = await this.summaryRepository.findOneBy({ id })

    if (isEmpty(summary)) {
      throw new BusinessException(ErrorEnum.BOX_SUMMARY_NOT_FOUND)
    }

    return summary
  }

  /**
   * 删除
   */
  async delete(id: number): Promise<void> {
    const exists = await this.summaryRepository.findOneBy({ id })
    if (isEmpty(exists)) {
      throw new BusinessException(ErrorEnum.BOX_SUMMARY_NOT_FOUND)
    }

    await this.summaryRepository.delete(id)
  }

  async batchDelete(ids: number[]): Promise<void> {
    await this.summaryRepository.delete(ids)
  }
}
