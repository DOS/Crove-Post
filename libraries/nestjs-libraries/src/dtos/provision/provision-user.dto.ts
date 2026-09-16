import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ProvisionUserDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  orgId?: string;

  @IsString()
  @IsOptional()
  orgName?: string;

  @IsString()
  @IsOptional()
  role?: 'SUPERADMIN' | 'ADMIN' | 'USER';

  @IsString()
  @IsOptional()
  plan?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}
