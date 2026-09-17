import { Module } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { PipelineController } from './pipeline.controller';

@Module({
  providers: [ApplicationsService],
  controllers: [ApplicationsController, PipelineController],
  exports: [ApplicationsService],
})
export class ApplicationsModule {}
