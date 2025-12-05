// This file previously handled Neon database connection.
// Neon integration has been removed as per request.
// The application will now rely on mock data provided in app/actions/trade-actions.ts.

const sql: any = null

console.info(
  "Neon database integration has been removed. " +
    "The application is configured to use mock data for trade operations. " +
    "All calls to database functions will now operate on in-memory mock data if the database connection was previously the sole source.",
)

export default sql
