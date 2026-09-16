import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ConsumeTicketDto {
  @IsString()
  @IsNotEmpty()
  ticket: string;

  @IsString()
  @IsOptional()
  redirect_to?: string;
}
