/**
 * Simple logger utility to replace console.log and allow for future extensibility.
 * usage: import { logger } from "@/lib/logger"
 */
type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const isProduction = process.env.NODE_ENV === 'production';

export const logger = {
    info: (message: string, ...args: any[]) => {
        console.info(`[INFO] ${message}`, ...args);
    },
    warn: (message: string, ...args: any[]) => {
        console.warn(`[WARN] ${message}`, ...args);
    },
    error: (message: string, ...args: any[]) => {
        console.error(`[ERROR] ${message}`, ...args);
    },
    debug: (message: string, ...args: any[]) => {
        if (!isProduction) {
            console.debug(`[DEBUG] ${message}`, ...args);
        }
    },
};
