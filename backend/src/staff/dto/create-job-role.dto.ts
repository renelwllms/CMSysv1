import { IsString, IsNotEmpty } from 'class-validator';

export class CreateJobRoleDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
