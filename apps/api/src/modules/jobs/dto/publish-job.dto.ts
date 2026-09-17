import { IsArray, IsEnum, ArrayMinSize } from 'class-validator';
import { Platform } from '@prisma/client';

export class PublishJobDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(Platform, { each: true })
  platforms: Platform[];
}
