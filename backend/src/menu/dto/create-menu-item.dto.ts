import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsOptional,
  Min,
  IsBoolean,
  IsArray,
  ValidateNested,
  ValidateIf,
} from 'class-validator';
import { MenuCategory } from '@prisma/client';
import { Type, Transform, plainToInstance } from 'class-transformer';

class MenuSizeDto {
  @IsString()
  @IsNotEmpty()
  label: string; // e.g., Small, Medium, Large

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  price: number;
}

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

  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return undefined;
    const num = Number(value);
    return Number.isNaN(num) ? value : num;
  })
  @ValidateIf(o => !o.sizes || o.sizes.length === 0)
  @IsNumber()
  @Min(0)
  price?: number;

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
  @Type(() => Boolean)
  isAvailable?: boolean;

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed.map((item) => plainToInstance(MenuSizeDto, item)) : parsed;
      } catch {
        return value;
      }
    }
    if (Array.isArray(value)) {
      return value.map((item) => plainToInstance(MenuSizeDto, item));
    }
    return value;
  })
  @ValidateNested({ each: true })
  @Type(() => MenuSizeDto)
  sizes?: MenuSizeDto[];
}
