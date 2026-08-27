import type { Health } from "./models";

export interface HealthDTO {
  status: string;
  timestamp: string;
  service: string;
  version: string;
}

export function toDTO(health: Health): HealthDTO {
  return { ...health };
}
