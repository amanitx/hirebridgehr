import { IsEmail, IsEnum, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';
import { OrgType } from '@prisma/client';

export class SignupDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(150)
  organizationName: string;

  @IsEnum(OrgType)
  organizationType: OrgType;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  industry?: string;
}
