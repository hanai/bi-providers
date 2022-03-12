import { FtxApiConfig } from '../types';
import { FtxApiClient } from '../utils/axios';
declare class WalletClient {
    axiosClient: FtxApiClient;
    constructor(ftxConfig: FtxApiConfig);
    getBalance: () => Promise<{
        coin: string;
        free: number;
        spotBorrow: number;
        total: number;
        usdValue: number;
        availableWithoutBorrow: number;
    }[]>;
}
export default WalletClient;
