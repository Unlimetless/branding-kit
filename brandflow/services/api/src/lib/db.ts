import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export { sql }

export const db = {
  query: async <T = unknown>(text: string, params?: string[]): Promise<T[]> => {
    const result = await sql(text, params)
    return result as T[]
  },
}

export type Database = typeof db