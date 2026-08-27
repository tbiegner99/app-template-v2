import type { Pool, QueryResult, QueryResultRow } from "pg";
import { loggerFromContext } from "./logger";

/** Database is the interface datasources depend on instead of a raw pg Pool directly. */
export interface Database {
  query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: unknown[],
  ): Promise<QueryResult<T>>;
}

/** LoggingDB wraps a pg Pool and logs the duration of every query. */
export class LoggingDB implements Database {
  constructor(private readonly pool: Pool) {}

  async query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: unknown[],
  ): Promise<QueryResult<T>> {
    const start = Date.now();
    try {
      return await this.pool.query<T>(text, params);
    } finally {
      loggerFromContext().debug(
        { query: text, duration_ms: Date.now() - start },
        "sql query",
      );
    }
  }
}
