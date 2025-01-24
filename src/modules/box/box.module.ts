import { Module } from '@nestjs/common'
import { RouterModule } from '@nestjs/core'
import { SummaryModule } from './summary/summary.module'

const modules = [SummaryModule]

@Module({
  imports: [
    ...modules,
    RouterModule.register([
      {
        path: 'box',
        module: BoxModule,
        children: [...modules],
      },
    ]),
  ],
  exports: [...modules],
})
export class BoxModule {}
