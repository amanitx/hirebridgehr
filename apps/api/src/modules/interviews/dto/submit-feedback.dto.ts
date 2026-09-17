import { IsEnum, IsInt, Max, MaxLength, Min, IsOptional, IsString } from 'class-validator';
import { Recommendation } from '@prisma/client';

export class SubmitFeedbackDto {
  @IsInt()
  @Min(1)
  @Max(5)
  technical: number;

  @IsInt()
  @Min(1)
  @Max(5)
  communication: number;

  @IsInt()
  @Min(1)
  @Max(5)
  problemSolving: number;

  @IsInt()
  @Min(1)
  @Max(5)
  experience: number;

  @IsInt()
  @Min(1)
  @Max(5)
  overall: number;

  @IsEnum(Recommendation)
  recommendation: Recommendation;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  comments?: string;
}
