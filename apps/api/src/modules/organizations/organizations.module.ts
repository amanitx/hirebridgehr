import { Module } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { OrganizationsController } from './organizations.controller';
import { OnboardingController } from './onboarding.controller';

@Module({
  providers: [OrganizationsService],
  controllers: [OrganizationsController, OnboardingController],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
