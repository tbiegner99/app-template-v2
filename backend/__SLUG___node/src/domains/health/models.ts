/** Health represents the business model for system health status. */
export interface Health {
  status: string;
  timestamp: string;
  service: string;
  version: string;
}
