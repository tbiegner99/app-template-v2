import type { Database } from "../../logger/db";

export interface Datasource {
  deleteApplicationUser(id: string): Promise<string>;
}

/** Postgres-backed testapi datasource. */
export class PgDatasource implements Datasource {
  constructor(private readonly db: Database) {}

  /** Removes the user row by application ID and returns the supertokens_id. */
  async deleteApplicationUser(id: string): Promise<string> {
    const result = await this.db.query<{ supertokens_id: string }>(
      "DELETE FROM users WHERE id = $1 RETURNING supertokens_id",
      [id],
    );
    if (result.rowCount === 0) {
      throw new Error(`user not found: ${id}`);
    }
    return result.rows[0].supertokens_id;
  }
}
