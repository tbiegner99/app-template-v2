import supertokens from "supertokens-node";
import type { Datasource } from "./datasource";

export class Service {
  constructor(private readonly datasource: Datasource) {}

  /**
   * Removes each user from both the application users table and SuperTokens.
   * Returns the count of users successfully deleted from the application table.
   */
  async deleteUsers(ids: string[]): Promise<number> {
    let deleted = 0;
    for (const id of ids) {
      let supertokensId: string;
      try {
        supertokensId = await this.datasource.deleteApplicationUser(id);
      } catch {
        continue;
      }
      // Best-effort SuperTokens cleanup
      try {
        await supertokens.deleteUser(supertokensId);
      } catch {
        // ignore
      }
      deleted++;
    }
    return deleted;
  }
}
