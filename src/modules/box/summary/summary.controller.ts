import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { ApiResult } from '~/common/decorators/api-result.decorator'
import { IdParam } from '~/common/decorators/id-param.decorator'
import { ApiSecurityAuth } from '~/common/decorators/swagger.decorator'
import { CreatorPipe } from '~/common/pipes/creator.pipe'
import { UpdaterPipe } from '~/common/pipes/updater.pipe'
import { Pagination } from '~/helper/paginate/pagination'
import { definePermission, Perm } from '~/modules/auth/decorators/permission.decorator'
import { SummaryDto, SummaryQueryDto } from './summary.dto'
import { SummaryEntity } from './summary.entity'
import { SummaryService } from './summary.service'

export const permissions = definePermission('box:summary', {
  LIST: 'list',
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
} as const)

@ApiTags('Box - 银企通环境信息')
@ApiSecurityAuth()
@Controller('summary')
export class SummaryController {
  constructor(private readonly summaryService: SummaryService) {}

  @Get()
  @ApiOperation({ summary: '获取银企通环境信息列表' })
  @ApiResult({ type: [SummaryEntity], isPage: true })
  @Perm(permissions.LIST)
  async list(@Query() dto: SummaryQueryDto): Promise<Pagination<SummaryEntity>> {
    return this.summaryService.page(dto)
  }

  @Post()
  @ApiOperation({ summary: '新增银企通环境信息' })
  @Perm(permissions.CREATE)
  async create(@Body(CreatorPipe) dto: SummaryDto): Promise<void> {
    await this.summaryService.create(dto)
  }

  @Get(':id')
  @ApiOperation({ summary: '查询银企通环境信息' })
  @ApiResult({ type: SummaryEntity })
  @Perm(permissions.READ)
  async info(@IdParam() id: number): Promise<SummaryEntity> {
    return this.summaryService.findOne(id)
  }

  @Post(':id')
  @ApiOperation({ summary: '更新银企通环境信息' })
  @Perm(permissions.UPDATE)
  async update(@IdParam() id: number, @Body(UpdaterPipe) dto: SummaryDto): Promise<void> {
    await this.summaryService.update(id, dto)
  }

  @Post('delete/:id')
  @ApiOperation({ summary: '删除银企通环境信息' })
  @Perm(permissions.DELETE)
  async delete(@IdParam() id: number): Promise<void> {
    await this.summaryService.delete(id)
  }

  @Post('batchDelete')
  @ApiOperation({ summary: '批量删除银企通环境信息' })
  @Perm(permissions.DELETE)
  async batchDelete(@Body() ids: number[]): Promise<void> {
    await this.summaryService.batchDelete(ids)
  }
}
