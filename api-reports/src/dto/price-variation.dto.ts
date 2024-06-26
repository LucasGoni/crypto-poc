import { IsString, IsNumber } from 'class-validator';

export class PriceVariationDto {
  @IsString()
  name: string;

  @IsString()
  symbol: string;

  @IsNumber()
  percent_change_24h: number;
}