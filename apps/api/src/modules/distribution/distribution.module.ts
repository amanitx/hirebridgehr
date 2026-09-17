import { Module } from '@nestjs/common';
import { DistributionService } from './distribution.service';
import { AdminDistributionController } from './admin-distribution.controller';
import { ConnectorRegistry } from './connectors/connector.registry';
import { LinkedInConnector } from './connectors/linkedin.connector';
import { CareerPageConnector } from './connectors/career-page.connector';

@Module({
  providers: [
    DistributionService,
    ConnectorRegistry,
    LinkedInConnector,
    CareerPageConnector,
  ],
  controllers: [AdminDistributionController],
  exports: [DistributionService, ConnectorRegistry],
})
export class DistributionModule {}
