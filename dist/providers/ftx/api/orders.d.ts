import { FtxApiConfig, Order, OrderSide, OrderType } from '../types';
import { FtxApiClient } from '../utils/axios';
declare class OrdersClient {
    axiosClient: FtxApiClient;
    constructor(ftxConfig: FtxApiConfig);
    private _placeOrder;
    batchPlaceOrder(orders: {
        market: string;
        side: OrderSide;
        price: number;
        type: OrderType;
        size: number;
        reduceOnly?: boolean;
        ioc?: boolean;
        postOnly?: boolean;
        clientId?: string;
        rejectOnPriceBand?: boolean;
    }[], opts?: {
        autoRetry?: boolean;
    }): Promise<Order[]>;
    placeOrder(params: {
        market: string;
        side: OrderSide;
        price: number;
        type: OrderType;
        size: number;
        reduceOnly?: boolean;
        ioc?: boolean;
        postOnly?: boolean;
        clientId?: string;
        rejectOnPriceBand?: boolean;
    }, opts?: {
        autoRetry?: boolean;
    }): Promise<any>;
    getOrderHistory(params: {
        market?: string;
        side?: OrderSide;
        orderType?: OrderType;
        startTime?: number;
        endTime?: number;
    }): Promise<Order>;
    getOpenOrders(params?: {
        market?: string;
    }): Promise<Order[]>;
    cancelAllOrders(params?: {
        market?: string;
        side?: OrderSide;
        conditionalOrdersOnly?: boolean;
        limitOrdersOnly?: boolean;
    }): Promise<any>;
    cancelOrderByClientId(clientId: string): Promise<any>;
}
export default OrdersClient;
