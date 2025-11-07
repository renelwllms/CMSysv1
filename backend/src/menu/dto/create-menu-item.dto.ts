import { IsString, IsNotEmpty, IsNumber, IsEnum, IsOptional, Min, IsBoolean } from 'class-validator';
import { MenuCategory } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateMenuItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  nameId?: string; // Indonesian name

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  descriptionId?: string; // Indonesian description

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  price: number;

  @IsEnum(MenuCategory)
  @IsNotEmpty()
  category: MenuCategory;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  stockQty?: number; // For cabinet food

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;
}
