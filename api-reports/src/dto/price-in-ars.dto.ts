import { IsString, IsNumber } from 'class-validator';

export class PriceInARSDto {
  @IsString()
  name: string;

  @IsString()
  symbol: string;

  @IsNumber()
  price_usd: number;

  @IsNumber()
  price_ars: number;
}