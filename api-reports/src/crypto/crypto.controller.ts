import { Controller, Get, Param, Logger } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { GetCryptoBySymbolDto } from '../dto/crypto-by-symbol.dto'; 

@Controller('crypto')
export class CryptoController {
  private readonly logger = new Logger(CryptoController.name);

  constructor(private readonly cryptoService: CryptoService) {}

  @Get('top')
  getTopCryptocurrencies() {
    this.logger.log('Received request for top cryptocurrencies');
    return this.cryptoService.getTopCryptocurrencies();
  }

  @Get('price-variation')
  getPriceVariation() {
    this.logger.log('Received request for price variation');
    return this.cryptoService.getPriceVariation();
  }

  @Get('prices-in-ars')
  getPricesInARS() {
    this.logger.log('Received request for prices in ARS');
    return this.cryptoService.getPricesInARS();
  }

  @Get(':symbol')
  getCryptocurrencyBySymbol(@Param() params: GetCryptoBySymbolDto) {
    this.logger.log(`Received request for cryptocurrency: ${params.symbol}`);
    return this.cryptoService.getCryptocurrencyBySymbol(params.symbol);
  }
}
