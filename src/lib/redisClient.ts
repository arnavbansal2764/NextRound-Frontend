import { Redis } from '@upstash/redis'

export const redis = new Redis({
    url: process.env.NEXT_REDIS_URL,
    token: process.env.NEXT_REDIS_TOKEN,
})
