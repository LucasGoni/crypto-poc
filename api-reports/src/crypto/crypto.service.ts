// src/crypto/crypto.service.ts
import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { map, catchError } from 'rxjs/operators';
import { Observable, throwError, forkJoin } from 'rxjs';
import * as dotenv from 'dotenv';
import { PriceInARSDto } from '../dto/price-in-ars.dto';
import { PriceVariationDto } from '../dto/price-variation.dto';

dotenv.config();

@Injectable()
export class CryptoService {
  private readonly logger = new Logger(CryptoService.name);
  // private coinMarketCapApiUrl = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest';
  // private criptoYaApiUrl = 'https://criptoya.com/api';
  private coinMarketCapApiUrl = process.env.COINMARKETCAP_API_URL;
  private criptoYaApiUrl = process.env.CRIPTOYA_API_URL;
  private coinMarketCapApiKey = process.env.COINMARKETCAP_API_KEY;


  constructor(private readonly httpService: HttpService) {}

  getTopCryptocurrencies(): Observable<any> {
    this.logger.log('Fetching top cryptocurrencies');
    return this.httpService.get(this.coinMarketCapApiUrl, {
      headers: {
        'X-CMC_PRO_API_KEY': this.coinMarketCapApiKey,
      },
    }).pipe(
      map((response: AxiosResponse) => response.data.data.slice(0, 5)),
      catchError(error => {
        this.logger.error('Error fetching top cryptocurrencies', error);
        return throwError(new HttpException(error.response.data, error.response.status));
      })
    );
  }

  getPriceVariation(): Observable<PriceVariationDto[]> {
    this.logger.log('Fetching price variation for top cryptocurrencies');
    return this.getTopCryptocurrencies().pipe(
      map(cryptocurrencies => cryptocurrencies.map(crypto => ({
        name: crypto.name,
        symbol: crypto.symbol,
        percent_change_24h: crypto.quote.USD.percent_change_24h,
      } as PriceVariationDto))),
      catchError(error => {
        this.logger.error('Error fetching price variation', error);
        return throwError(new HttpException(error.response.data, error.response.status));
      })
    );
  }

  getUSDTPrice(): Observable<any> {
    this.logger.log('Fetching USDT price');
    return this.httpService.get(`${this.criptoYaApiUrl}/tiendacrypto/usdt/ars`).pipe(
      map((response: AxiosResponse) => response.data),
      catchError(error => {
        this.logger.error('Error fetching USDT price', error);
        return throwError(new HttpException(error.response.data, error.response.status));
      })
    );
  }

  getPricesInARS(): Observable<PriceInARSDto[]> {
    this.logger.log('Fetching prices in ARS for top cryptocurrencies');
    return forkJoin([this.getTopCryptocurrencies(), this.getUSDTPrice()]).pipe(
      map(([cryptocurrencies, usdtPrice]) => {
        return cryptocurrencies.map(crypto => {
          const priceInUSD = crypto.quote.USD.price;
          const priceInARS = priceInUSD * usdtPrice.totalBid;
          return {
            name: crypto.name,
            symbol: crypto.symbol,
            price_usd: priceInUSD,
            price_ars: priceInARS,
          } as PriceInARSDto;
        });
      }),
      catchError(error => {
        this.logger.error('Error fetching prices in ARS', error);
        return throwError(new HttpException('Failed to fetch cryptocurrency data', HttpStatus.BAD_REQUEST));
      })
    );
  }

  getCryptocurrencyBySymbol(symbol: string): Observable<any> {
    this.logger.log(`Fetching data for cryptocurrency: ${symbol}`);
    const url = `${this.criptoYaApiUrl}/${symbol.toLowerCase()}/ars/1`;
    return this.httpService.get(url).pipe(
      map((response: AxiosResponse) => response.data),
      catchError(error => {
        this.logger.error(`Error fetching data for cryptocurrency: ${symbol}`, error);
        return throwError(new HttpException(error.response.data, error.response.status));
      })
    );
  }
}
