import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import dayjs from 'dayjs'
import Redis from 'ioredis'

import { InjectRedis } from '~/common/decorators/inject-redis.decorator'

import { ISecurityConfig, SecurityConfig } from '~/config'
import { genOnlineUserKey } from '~/helper/genRedisKey'
import { RoleService } from '~/modules/system/role/role.service'
import { UserEntity } from '~/modules/user/user.entity'
import { generateUUID } from '~/utils'

import { AccessTokenEntity } from '../entities/access-token.entity'
import { RefreshTokenEntity } from '../entities/refresh-token.entity'

/**
 * 令牌服务
 */
@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,
    private roleService: RoleService,
    @InjectRedis() private redis: Redis,
    @Inject(SecurityConfig.KEY) private securityConfig: ISecurityConfig,
  ) {}

  /**
   * 根据refreshToken刷新AccessToken与RefreshToken
   * @param refreshToken
   */
  async refreshToken(refreshToken: string) {
    try {
      // 验证 refreshToken
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.securityConfig.refreshSecret,
      })

      // 查找对应的 refreshToken 实体
      const refreshTokenEntity = await RefreshTokenEntity.findOne({
        where: { value: refreshToken },
        relations: ['accessToken'],
      })

      if (!refreshTokenEntity) {
        throw new UnauthorizedException('无效的刷新令牌')
      }

      const now = dayjs()
      // 判断 refreshToken 是否过期
      if (now.isAfter(refreshTokenEntity.expired_at)) {
        await this.removeRefreshToken(refreshToken)
        throw new UnauthorizedException('刷新令牌已过期')
      }

      const accessToken = refreshTokenEntity.accessToken
      const userId = accessToken.user.id

      // 获取用户角色
      const roleIds = await this.roleService.getRoleIdsByUser(userId)
      const roleValues = await this.roleService.getRoleValues(roleIds)

      // 生成新的 accessToken和refreshToken
      const newAccessToken = await this.generateAccessToken(userId, roleValues)

      // 删除旧的 token
      await this.removeRefreshToken(refreshToken)

      return newAccessToken
    }
    catch (error) {
      throw new UnauthorizedException('刷新令牌已过期或无效')
    }
  }

  generateJwtSign(payload: any) {
    const jwtSign = this.jwtService.sign(payload)

    return jwtSign
  }

  async generateAccessToken(uid: number, roles: string[] = []) {
    const payload: IAuthUser = {
      uid,
      pv: 1,
      roles,
    }

    const jwtSign = await this.jwtService.signAsync(payload)

    // 生成accessToken
    const accessToken = new AccessTokenEntity()
    accessToken.value = jwtSign
    accessToken.user = { id: uid } as UserEntity
    accessToken.expired_at = dayjs()
      .add(this.securityConfig.jwtExprire, 'second')
      .toDate()

    await accessToken.save()

    // 生成refreshToken
    const refreshToken = await this.generateRefreshToken(accessToken, dayjs())

    return {
      accessToken: jwtSign,
      refreshToken,
    }
  }

  /**
   * 生成新的RefreshToken并存入数据库
   * @param accessToken
   * @param now
   */
  async generateRefreshToken(
    accessToken: AccessTokenEntity,
    now: dayjs.Dayjs,
  ): Promise<string> {
    const refreshTokenPayload = {
      uuid: generateUUID(),
    }

    const refreshTokenSign = await this.jwtService.signAsync(refreshTokenPayload, {
      secret: this.securityConfig.refreshSecret,
    })

    const refreshToken = new RefreshTokenEntity()
    refreshToken.value = refreshTokenSign
    refreshToken.expired_at = now
      .add(this.securityConfig.refreshExpire, 'second')
      .toDate()
    refreshToken.accessToken = accessToken

    await refreshToken.save()

    return refreshTokenSign
  }

  /**
   * 检查accessToken是否存在，并且是否处于有效期内
   * @param value
   */
  async checkAccessToken(value: string) {
    let isValid = false
    try {
      await this.verifyAccessToken(value)
      const res = await AccessTokenEntity.findOne({
        where: { value },
        relations: ['user', 'refreshToken'],
        cache: true,
      })
      isValid = Boolean(res)
    }
    catch (error) {}

    return isValid
  }

  /**
   * 移除AccessToken且自动移除关联的RefreshToken
   * @param value
   */
  async removeAccessToken(value: string) {
    const accessToken = await AccessTokenEntity.findOne({
      where: { value },
    })
    if (accessToken) {
      this.redis.del(genOnlineUserKey(accessToken.id))
      await accessToken.remove()
    }
  }

  /**
   * 移除RefreshToken
   * @param value
   */
  async removeRefreshToken(value: string) {
    const refreshToken = await RefreshTokenEntity.findOne({
      where: { value },
      relations: ['accessToken'],
    })
    if (refreshToken) {
      if (refreshToken.accessToken)
        this.redis.del(genOnlineUserKey(refreshToken.accessToken.id))
      await refreshToken.accessToken.remove()
      await refreshToken.remove()
    }
  }

  /**
   * 验证Token是否正确,如果正确则返回所属用户对象
   * @param token
   */
  async verifyAccessToken(token: string): Promise<IAuthUser> {
    return this.jwtService.verifyAsync(token)
  }
}
