import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { FtxApiConfig } from '../types';
export interface FtxApiClient extends AxiosInstance {
    get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
    delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
    post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
}
export declare const createClient: (axiosConfig: AxiosRequestConfig, ftxConfig: FtxApiConfig) => FtxApiClient;
export default axios;
