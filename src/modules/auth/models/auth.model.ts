import { ApiProperty } from '@nestjs/swagger'

export class ImageCaptcha {
  @ApiProperty({ description: 'base64格式的svg图片' })
  img: string

  @ApiProperty({ description: '验证码对应的唯一ID' })
  id: string
}

export class LoginToken {
  @ApiProperty({ description: '访问令牌' })
  token: string

  @ApiProperty({ description: '刷新令牌' })
  refreshToken: string
}
