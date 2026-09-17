import { IsString, IsOptional, IsEnum } from 'class-validator';
import { Source } from '@prisma/client';

export class CreateApplicationDto {
  @IsString()
  candidateId: string;

  @IsString()
  jobId: string;

  @IsOptional()
  @IsEnum(Source)
  source?: Source;
}
