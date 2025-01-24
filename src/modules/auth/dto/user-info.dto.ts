import { ApiProperty } from '@nestjs/swagger'

export class UserInfoDto {
  @ApiProperty({ description: '用户ID' })
  userId: string

  @ApiProperty({ description: '用户名' })
  userName: string

  @ApiProperty({ description: '角色列表', type: [String] })
  roles: string[]

  @ApiProperty({ description: '按钮权限列表', type: [String] })
  buttons: string[]
}
