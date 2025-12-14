import { IsNotEmpty, IsString } from 'class-validator';

export class OrderStatusLookupDto {
  @IsString()
  @IsNotEmpty()
  orderNumber: string;

  @IsString()
  @IsNotEmpty()
  phone: string;
}
