import { FtxApiConfig } from '../types';
import { FtxApiClient } from '../utils/axios';
declare class MarketsClient {
    axiosClient: FtxApiClient;
    constructor(ftxConfig: FtxApiConfig);
    getMarkets: () => Promise<{
        name: string;
        baseCurrency: string;
        quoteCurrency: string;
        quoteVolume24h: number;
        change1h: number;
        change24h: number;
        changeBod: number;
        highLeverageFeeExempt: boolean;
        minProvideSize: number;
        type: 'future' | 'spot';
        underlying?: string | undefined;
        enabled: boolean;
        ask: number;
        bid: number;
        last: number;
        postOnly: boolean;
        price: number;
        priceIncrement: number;
        sizeIncrement: number;
        restricted: boolean;
        volumeUsd24h: number;
    }[]>;
    getSingleMarket: (params: {
        name: string;
    }) => Promise<{
        name: string;
        enabled: boolean;
        postOnly: boolean;
        priceIncrement: number;
        sizeIncrement: number;
        minProvideSize: number;
        last: number;
        bid: number;
        ask: number;
        price: number;
        type: 'spot';
        baseCurrency: string;
        quoteCurrency: string;
        restricted: boolean;
        highLeverageFeeExempt: boolean;
        change1h: number;
        change24h: number;
        changeBod: number;
        quoteVolume24h: number;
        volumeUsd24h: number;
    }>;
    getOrderBook: (params: {
        name: string;
        depth?: number;
    }) => Promise<{
        asks: [number, number][];
        bids: [number, number][];
    }>;
}
export default MarketsClient;
