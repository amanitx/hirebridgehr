import { IsOptional, IsString, MaxLength, IsInt, Min, Max, IsArray } from 'class-validator';

export class CompleteOnboardingDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  organizationName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  industry?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  companySize?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  website?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  userJobTitle?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  hiringVolume?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hiringRoles?: string[];
}
