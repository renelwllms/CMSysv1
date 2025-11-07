import { IsString, IsNotEmpty, IsArray, ValidateNested, IsOptional, IsEnum, IsDateString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { Language } from '@prisma/client';

class OrderItemDto {
  @IsString()
  @IsNotEmpty()
  menuItemId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @IsString()
  @IsNotEmpty()
  customerPhone: string;

  @IsEnum(Language)
  @IsNotEmpty()
  language: Language;

  @IsString()
  @IsOptional()
  tableId?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  // For cake orders
  @IsOptional()
  @IsDateString()
  cakePickupDate?: string;

  @IsString()
  @IsOptional()
  cakeNotes?: string;
}
