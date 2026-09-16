import { Type } from 'class-transformer';
import {
  IsDefined,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';

class BootstrapUserDto {
  @IsUUID() id: string;
  @IsEmail() @MaxLength(320) email: string;
  @IsString() @MaxLength(200) name: string;
}

class BootstrapOrganizationDto {
  @IsUUID() id: string;
  @IsString() @IsNotEmpty() @MaxLength(200) name: string;
  @IsString() @MaxLength(200) slug: string;
  @IsIn(['OWNER', 'ADMIN', 'MEMBER', 'USER']) role: string;
}

class BootstrapOAuthDto {
  @IsString() @IsNotEmpty() @MaxLength(200) client_id: string;
  @IsString() @IsNotEmpty() @MaxLength(2048) state: string;
}

export class BootstrapDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => BootstrapUserDto)
  user: BootstrapUserDto;
  @IsDefined()
  @ValidateNested()
  @Type(() => BootstrapOrganizationDto)
  organization: BootstrapOrganizationDto;
  @IsDefined()
  @ValidateNested()
  @Type(() => BootstrapOAuthDto)
  oauth: BootstrapOAuthDto;
}
