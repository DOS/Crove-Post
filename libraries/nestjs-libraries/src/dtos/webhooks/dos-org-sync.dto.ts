import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum DosSyncEvent {
  ORG_CREATED = 'org.created',
  ORG_UPDATED = 'org.updated',
  ORG_DELETED = 'org.deleted',
  ORG_MEMBER_ADDED = 'org.member_added',
  ORG_MEMBER_REMOVED = 'org.member_removed',
}

export class DosOrgSyncDataDto {
  @IsString()
  @IsNotEmpty()
  org_id: string;

  @IsString()
  @IsOptional()
  org_name?: string;

  @IsString()
  @IsOptional()
  user_id?: string;

  @IsString()
  @IsOptional()
  user_email?: string;

  @IsString()
  @IsOptional()
  user_name?: string;

  @IsString()
  @IsOptional()
  role?: 'OWNER' | 'ADMIN' | 'MEMBER';
}

export class DosOrgSyncDto {
  @IsString()
  @IsNotEmpty()
  event: DosSyncEvent;

  @IsString()
  @IsOptional()
  timestamp?: string;

  @IsObject()
  @ValidateNested()
  @Type(() => DosOrgSyncDataDto)
  data: DosOrgSyncDataDto;
}
