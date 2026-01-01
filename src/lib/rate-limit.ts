
/**
 * Simple in-memory rate limiter for server actions
 * For production, use @upstash/ratelimit with Redis
 */

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
if (typeof setInterval !== 'undefined') {
    setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of rateLimitMap.entries()) {
            if (entry.resetAt < now) {
                rateLimitMap.delete(key);
            }
        }
    }, 5 * 60 * 1000);
}

export interface RateLimitConfig {
    /** Maximum number of requests allowed in the window */
    maxRequests: number;
    /** Window size in seconds */
    windowSizeSeconds: number;
}

export interface RateLimitResult {
    success: boolean;
    remaining: number;
    resetAt: number;
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier for the client (e.g., IP address, user ID)
 * @param action - Name of the action being rate limited
 * @param config - Rate limit configuration
 */
export function checkRateLimit(
    identifier: string,
    action: string,
    config: RateLimitConfig
): RateLimitResult {
    const key = `${action}:${identifier}`;
    const now = Date.now();
    const windowMs = config.windowSizeSeconds * 1000;

    let entry = rateLimitMap.get(key);

    // If no entry or window has expired, create a new one
    if (!entry || entry.resetAt < now) {
        entry = {
            count: 1,
            resetAt: now + windowMs,
        };
        rateLimitMap.set(key, entry);
        return {
            success: true,
            remaining: config.maxRequests - 1,
            resetAt: entry.resetAt,
        };
    }

    // Check if limit exceeded
    if (entry.count >= config.maxRequests) {
        return {
            success: false,
            remaining: 0,
            resetAt: entry.resetAt,
        };
    }

    // Increment count
    entry.count++;
    return {
        success: true,
        remaining: config.maxRequests - entry.count,
        resetAt: entry.resetAt,
    };
}

/**
 * Predefined rate limit configurations
 */
export const RATE_LIMITS = {
    // Authentication: 5 attempts per 15 minutes
    AUTH: {
        maxRequests: 5,
        windowSizeSeconds: 15 * 60,
    },
    // Bidding: 20 bids per minute
    BID: {
        maxRequests: 20,
        windowSizeSeconds: 60,
    },
    // General API: 100 requests per minute
    GENERAL: {
        maxRequests: 100,
        windowSizeSeconds: 60,
    },
    // Form submissions: 10 per minute
    FORM: {
        maxRequests: 10,
        windowSizeSeconds: 60,
    }
} as const;

/**
 * Get client IP from request headers (works with most proxies)
 */
export function getClientIP(headers: Headers): string {
    return (
        headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        headers.get('x-real-ip') ||
        headers.get('cf-connecting-ip') ||
        'unknown'
    );
}
