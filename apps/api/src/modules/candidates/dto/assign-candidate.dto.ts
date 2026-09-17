import { IsString } from 'class-validator';

export class AssignCandidateDto {
  @IsString()
  ownerId: string;
}
