import type { Request } from "express";

export type SortDir = "asc" | "desc";

export type FilterOp = "eq" | "contains" | "gt" | "gte" | "lt" | "lte";

export interface FilterParam {
  field: string;
  op: FilterOp;
  value: string;
}

export interface Params {
  page: number;
  pageSize: number;
  sort: string;
  sortDir: SortDir;
  filters: FilterParam[];
}

export interface PagedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ResolvedFilter {
  column: string;
  op: FilterOp;
  value: string;
}

export interface ResolvedParams {
  page: number;
  pageSize: number;
  sort: string; // DB column
  sortDir: SortDir;
  filters: ResolvedFilter[];
}

/** Thrown when a sort or filter field is not present in the caller's column map. */
export class InvalidFieldError extends Error {
  constructor(public readonly field: string) {
    super(`unknown field: ${field}`);
    this.name = "InvalidFieldError";
  }
}

/** Parses and validates Params from the request body, applying the same defaults/clamps as the Go backend. */
export function decode(req: Request): Params {
  const body = (req.body ?? {}) as Partial<Params>;

  let pageSize = typeof body.pageSize === "number" ? body.pageSize : 25;
  if (pageSize <= 0 || pageSize > 200) {
    pageSize = 25;
  }

  let page = typeof body.page === "number" ? body.page : 0;
  if (page < 0) {
    page = 0;
  }

  const sortDir: SortDir = body.sortDir === "desc" ? "desc" : "asc";

  return {
    page,
    pageSize,
    sort: body.sort ?? "",
    sortDir,
    filters: body.filters ?? [],
  };
}

/** Maps field names to DB columns using the provided columnMap. Throws InvalidFieldError for unknown fields. */
export function resolve(p: Params, columnMap: Record<string, string>): ResolvedParams {
  const resolved: ResolvedParams = {
    page: p.page,
    pageSize: p.pageSize,
    sort: "",
    sortDir: p.sortDir,
    filters: [],
  };

  if (p.sort) {
    const col = columnMap[p.sort];
    if (!col) {
      throw new InvalidFieldError(p.sort);
    }
    resolved.sort = col;
  }

  for (const f of p.filters ?? []) {
    const col = columnMap[f.field];
    if (!col) {
      throw new InvalidFieldError(f.field);
    }
    resolved.filters.push({ column: col, op: f.op, value: f.value });
  }

  return resolved;
}

/** Returns the SQL OFFSET for the current page. */
export function offset(p: ResolvedParams): number {
  return p.page * p.pageSize;
}
