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
  ORGANIZATION_CREATED = 'organization.created',
  ORGANIZATION_UPDATED = 'organization.updated',
  ORGANIZATION_DELETED = 'organization.deleted',
  ORGANIZATION_MEMBER_ADDED = 'organization.member.added',
  ORGANIZATION_MEMBER_REMOVED = 'organization.member.removed',
  CUSTOMER_CREATED = 'customer.created',
  CUSTOMER_UPDATED = 'customer.updated',
  COMPANY_CREATED = 'company.created',
  COMPANY_UPDATED = 'company.updated',
}

export class DosOrgSyncDataDto {
  @IsString()
  @IsOptional()
  org_id?: string;

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
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty()
  event: string;

  @IsString()
  @IsOptional()
  timestamp?: string;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => DosOrgSyncDataDto)
  data?: DosOrgSyncDataDto;
}
