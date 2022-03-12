/// <reference types="node" />
import EventEmitter from 'events';
import { FtxStreamConfig } from '../types';
export default class Stream extends EventEmitter {
    private subs;
    private config;
    private keepAliveTimer?;
    private reconnectTimer?;
    private ws?;
    private logger;
    private retryCount;
    constructor(config: FtxStreamConfig);
    private send;
    private sendPing;
    private startKeepAlive;
    private stopKeepAlive;
    private buildAuthMsg;
    private reset;
    auth(): void;
    subscribeChannel(channel: string, data: any, filter: (message: any) => boolean, cb: (message: any) => any): void;
    connect(): Promise<void>;
    disconnect(): void;
    private onWSOpen;
    private onWSClose;
    private onWSError;
    private tryReconnect;
    private reconnect;
    private onWSMessage;
}
