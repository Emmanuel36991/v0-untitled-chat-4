import { logger } from "@/lib/logger"
import { NextResponse } from "next/server"

type ServerActionResponse<T> = {
    success: boolean
    error?: string
    data?: T
    [key: string]: any
}

/**
 * Standardized error message for users
 */
const GENERIC_ERROR_MESSAGE = "An unexpected error occurred. Please try again later."

/**
 * Helper to determine if we should show detailed errors (Dev mode only)
 */
const shouldShowDetailedError = () => process.env.NODE_ENV === "development"

/**
 * Global error handler for Server Actions
 * Wraps a server action and catches any errors, logging them and returning a safe error message.
 */
export async function handleServerActionError<T>(
    actionName: string,
    fn: () => Promise<T>,
    defaultReturn: any = { success: false }
): Promise<T | ServerActionResponse<any>> {
    try {
        return await fn()
    } catch (error: any) {
        logger.error(`[Server Action Error] ${actionName}:`, error)

        const errorMessage = shouldShowDetailedError()
            ? error.message || GENERIC_ERROR_MESSAGE
            : GENERIC_ERROR_MESSAGE

        return {
            ...defaultReturn,
            success: false,
            error: errorMessage,
        }
    }
}

/**
 * Helper to handle error in catch block for Server Actions
 */
export function createErrorResponse(
    actionName: string,
    error: any,
    defaultReturn: any = { success: false }
) {
    logger.error(`[Server Action Error] ${actionName}:`, error)

    const errorMessage = shouldShowDetailedError()
        ? error.message || GENERIC_ERROR_MESSAGE
        : GENERIC_ERROR_MESSAGE

    return {
        ...defaultReturn,
        success: false,
        error: errorMessage,
    }
}

/**
 * Global error handler for API Routes
 * catches errors, logs them, and returns a JSON response with a safe error message.
 */
export async function handleApiError(
    routeContext: string,
    error: any,
    statusCode: number = 500
): Promise<NextResponse> {
    logger.error(`[API Error] ${routeContext}:`, error)

    const errorMessage = shouldShowDetailedError()
        ? error.message || GENERIC_ERROR_MESSAGE
        : GENERIC_ERROR_MESSAGE

    return NextResponse.json(
        {
            success: false,
            error: errorMessage,
        },
        { status: statusCode }
    )
}
