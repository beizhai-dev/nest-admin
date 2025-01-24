import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { SummaryController } from './summary.controller'
import { SummaryEntity } from './summary.entity'
import { SummaryService } from './summary.service'

const services = [SummaryService]

@Module({
  imports: [TypeOrmModule.forFeature([SummaryEntity])],
  controllers: [SummaryController],
  providers: [...services],
  exports: [TypeOrmModule, ...services],
})
export class SummaryModule {}
