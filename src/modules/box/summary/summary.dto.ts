import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsOptional, IsString } from 'class-validator'
import { PagerDto } from '~/common/dto/pager.dto'

export class SummaryDto {
  @ApiProperty({ description: '环境类型 (X, GO, ICBC)' })
  @IsString()
  environment: string

  @ApiProperty({ description: '是否多租户' })
  @IsBoolean()
  isMultiTenant: boolean

  @ApiProperty({ description: '客户名称' })
  @IsString()
  customerName: string

  @ApiProperty({ description: '服务地址' })
  @IsString()
  serviceUrl: string

  @ApiProperty({ description: '登录用户名' })
  @IsString()
  username: string

  @ApiProperty({ description: '登录密码', required: false })
  @IsString()
  @IsOptional()
  password?: string

  @ApiProperty({ description: '备注', required: false })
  @IsString()
  @IsOptional()
  remark?: string

  @ApiProperty({ description: '运维文档', required: false })
  @IsString()
  @IsOptional()
  opsDoc?: string
}

export class SummaryQueryDto extends PagerDto {
  @ApiProperty({ description: '环境类型', required: false })
  @IsString()
  @IsOptional()
  environment?: string

  @ApiProperty({ description: '客户名称', required: false })
  @IsString()
  @IsOptional()
  customerName?: string
}
