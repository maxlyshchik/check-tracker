import { betterAuth } from 'better-auth'
import { Pool } from 'pg'

export const auth = betterAuth({
    database: new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    }),
    secret: process.env.BETTER_AUTH_SECRET!,
    emailAndPassword: {
        enabled: true,
        autoSignIn: false,
    },
    baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
})
