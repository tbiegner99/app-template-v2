import type { Datasource } from "./datasource";
import type { Health } from "./models";

export class Service {
  constructor(private readonly datasource: Datasource) {}

  getHealth(): Health {
    const { service, version } = this.datasource.getSystemInfo();
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      service,
      version,
    };
  }
}
