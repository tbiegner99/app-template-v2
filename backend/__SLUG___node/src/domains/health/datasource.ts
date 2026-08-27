/**
 * Datasource for the health domain. Health is stateless, but this class
 * demonstrates the datasource pattern used across every domain.
 */
export class Datasource {
  /** Returns system info (placeholder for demonstration). */
  getSystemInfo(): { service: string; version: string } {
    return { service: "node-backend", version: "1.0.0" };
  }
}
