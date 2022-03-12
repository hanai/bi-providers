import { Logger } from '../types';
export declare const createLogger: (name: string, label?: string) => Logger;
export declare const registerLoggerCreator: (creator: (name: string, label?: string | undefined) => Logger) => void;
