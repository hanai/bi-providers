export declare const generateSign: (params: {
    timestamp: number;
    method: string;
    url: string;
    body?: {
        [key: string]: any;
    } | undefined;
    token: string;
}) => string;
export declare const generateWebSocketSign: (params: {
    timestamp: number;
    token: string;
}) => string;
