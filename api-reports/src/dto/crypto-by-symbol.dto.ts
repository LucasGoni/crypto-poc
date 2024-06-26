import { IsString, IsNotEmpty, Length } from 'class-validator';

export class GetCryptoBySymbolDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 10)
  symbol: string;
}
