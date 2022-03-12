export declare class ApiError extends Error {
    originalError?: any;
    data: {
        success: boolean;
        error: string;
    };
    status?: number;
    constructor(args: {
        status?: number;
        data?: {
            success: boolean;
            error: string;
        } | any;
        error?: any;
    });
}
export declare class FtxStreamError extends Error {
    code: StreamErrorCode;
    originalError?: any;
    constructor(args: {
        code: StreamErrorCode;
        error?: any;
    });
}
export interface FtxApiConfig {
    ftxKey: string;
    ftxToken: string;
    ftxSubAccount?: string;
    httpProxy?: string;
    dryRun?: boolean;
}
export interface FtxStreamConfig {
    httpProxy?: string;
    ftxKey: string;
    ftxToken: string;
    ftxSubAccount?: string;
    maxRetryCount?: number;
    endpoint?: string;
    pingInterval?: number;
    reconnectTimeout?: number;
}
export declare type OrderStatus = 'new' | 'open' | 'closed';
export declare type OrderSide = 'buy' | 'sell';
export declare type OrderType = 'market' | 'limit';
export declare enum StreamErrorCode {
    UNKNOWN_ERROR = "UNKNOWN_ERROR",
    EXCEEDED_MAX_RETRY_COUNT = "EXCEEDED_MAX_RETRY_COUNT"
}
export interface Order {
    avgFillPrice: number | null;
    clientId: string | null;
    createdAt: string;
    filledSize: number;
    id: number;
    market: string;
    postOnly: false;
    price: number;
    reduceOnly: boolean;
    remainingSize: number;
    side: OrderSide;
    size: number;
    status: OrderStatus;
    type: OrderType;
}
export declare type OrdersStreamData = {
    status: Exclude<OrderStatus, 'open'>;
} & Order;
export declare type FillsStreamData = {
    baseCurrency: string;
    fee: number;
    feeCurrency: string;
    feeRate: number;
    future: null | string;
    id: number;
    liquidity: 'maker' | 'taker';
    market: string;
    orderId: number;
    price: number;
    quoteCurrency: string;
    side: OrderSide;
    size: number;
    time: string;
    tradeId: number;
    type: 'order';
};
