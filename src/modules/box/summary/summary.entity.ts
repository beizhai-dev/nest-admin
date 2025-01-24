import { ApiProperty } from '@nestjs/swagger'
import { Column, Entity } from 'typeorm'
import { CompleteEntity } from '~/common/entity/common.entity'

@Entity('box_summary')
export class SummaryEntity extends CompleteEntity {
  @ApiProperty({ description: '环境类型 (X, GO, ICBC,LOCAL)' })
  @Column()
  environment: string

  @ApiProperty({ description: '是否多租户' })
  @Column()
  isMultiTenant: boolean

  @ApiProperty({ description: '客户名称' })
  @Column()
  customerName: string

  @ApiProperty({ description: '服务地址' })
  @Column()
  serviceUrl: string

  @ApiProperty({ description: '登录用户名' })
  @Column()
  username: string

  @ApiProperty({ description: '登录密码' })
  @Column({ nullable: true })
  password?: string

  @ApiProperty({ description: '备注' })
  @Column({ nullable: true })
  remark?: string

  @ApiProperty({ description: '运维文档' })
  @Column({ nullable: true })
  opsDoc?: string
}
