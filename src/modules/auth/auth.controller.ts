import { Body, Controller, Get, Headers, Post, Request, UnauthorizedException, UseGuards } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'

import { ApiResult } from '~/common/decorators/api-result.decorator'
import { Ip } from '~/common/decorators/http.decorator'

import { UserService } from '../user/user.service'
import { AuthService } from './auth.service'
import { Public } from './decorators/public.decorator'
import { LoginDto, RefreshTokenDto, RegisterDto } from './dto/auth.dto'
import { UserInfoDto } from './dto/user-info.dto'
import { LocalGuard } from './guards/local.guard'
import { LoginToken } from './models/auth.model'
import { CaptchaService } from './services/captcha.service'
import { TokenService } from './services/token.service'

@ApiTags('Auth - 认证模块')
@UseGuards(LocalGuard)
@Public()
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private captchaService: CaptchaService,
    private tokenService: TokenService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: '登录' })
  @ApiResult({ type: LoginToken })
  async login(@Body() dto: LoginDto, @Ip() ip: string, @Headers('user-agent') ua: string): Promise<LoginToken> {
    await this.captchaService.checkImgCaptcha(dto.captchaId, dto.verifyCode)
    const tokens = await this.authService.login(
      dto.username,
      dto.password,
      ip,
      ua,
    )
    return { token: tokens.token, refreshToken: tokens.refreshToken }
  }

  @Post('register')
  @ApiOperation({ summary: '注册' })
  async register(@Body() dto: RegisterDto): Promise<void> {
    await this.userService.register(dto)
  }

  @Get('getUserInfo')
  @ApiOperation({ summary: '获取当前用户信息' })
  @ApiResult({ type: UserInfoDto })
  async getCurrentUser(@Request() req): Promise<UserInfoDto> {
    const user = req.user
    return {
      userId: user.id,
      userName: user.username,
      roles: ['R_SUPER_ADMIN'],
      buttons: user.buttons || [],
    }
  }

  @Post('refreshToken')
  @Public()
  @ApiOperation({ summary: '刷新访问令牌' })
  @ApiResult({ type: LoginToken })
  async refreshToken(@Body() dto: RefreshTokenDto): Promise<LoginToken> {
    if (!dto.refreshToken) {
      throw new UnauthorizedException('请提供刷新令牌')
    }

    const tokens = await this.tokenService.refreshToken(dto.refreshToken)

    return {
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    }
  }
}
