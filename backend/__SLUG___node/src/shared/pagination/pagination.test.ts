import type { Request } from "express";
import { describe, expect, it } from "vitest";
import { InvalidFieldError, decode, offset, resolve } from "./pagination";

function makeRequest(body: unknown): Request {
  return { body } as Request;
}

describe("decode", () => {
  it("applies defaults for an empty body", () => {
    const p = decode(makeRequest({}));
    expect(p.page).toBe(0);
    expect(p.pageSize).toBe(25);
    expect(p.sortDir).toBe("asc");
  });

  it.each([0, -5])("clamps pageSize %d up to 25", (pageSize) => {
    expect(decode(makeRequest({ pageSize })).pageSize).toBe(25);
  });

  it("clamps an oversized pageSize down to 25", () => {
    expect(decode(makeRequest({ pageSize: 999 })).pageSize).toBe(25);
  });

  it("accepts a valid pageSize", () => {
    expect(decode(makeRequest({ pageSize: 50 })).pageSize).toBe(50);
  });

  it("clamps a negative page to 0", () => {
    expect(decode(makeRequest({ page: -1 })).page).toBe(0);
  });

  it("accepts a valid page", () => {
    expect(decode(makeRequest({ page: 3 })).page).toBe(3);
  });

  it("defaults an invalid sortDir to asc", () => {
    expect(decode(makeRequest({ sortDir: "invalid" })).sortDir).toBe("asc");
  });

  it("accepts sortDir desc", () => {
    expect(decode(makeRequest({ sortDir: "desc" })).sortDir).toBe("desc");
  });
});

describe("resolve", () => {
  const colMap = { name: "display_name", email: "email" };

  it("maps a valid sort field to its column", () => {
    const rp = resolve(
      { page: 0, pageSize: 10, sort: "name", sortDir: "asc", filters: [] },
      colMap,
    );
    expect(rp.sort).toBe("display_name");
  });

  it("throws InvalidFieldError for an unknown sort field", () => {
    expect(() =>
      resolve({ page: 0, pageSize: 25, sort: "unknown", sortDir: "asc", filters: [] }, colMap),
    ).toThrow(InvalidFieldError);
  });

  it("maps a valid filter field to its column", () => {
    const rp = resolve(
      {
        page: 0,
        pageSize: 25,
        sort: "",
        sortDir: "asc",
        filters: [{ field: "email", op: "eq", value: "a@b.com" }],
      },
      colMap,
    );
    expect(rp.filters).toEqual([{ column: "email", op: "eq", value: "a@b.com" }]);
  });

  it("throws InvalidFieldError for an unknown filter field", () => {
    expect(() =>
      resolve(
        {
          page: 0,
          pageSize: 25,
          sort: "",
          sortDir: "asc",
          filters: [{ field: "badfield", op: "eq", value: "v" }],
        },
        colMap,
      ),
    ).toThrow(InvalidFieldError);
  });

  it("resolves multiple filters", () => {
    const rp = resolve(
      {
        page: 0,
        pageSize: 25,
        sort: "",
        sortDir: "asc",
        filters: [
          { field: "email", op: "contains", value: "foo" },
          { field: "name", op: "eq", value: "bar" },
        ],
      },
      colMap,
    );
    expect(rp.filters).toHaveLength(2);
  });

  it("leaves sort empty when no sort field is given", () => {
    const rp = resolve({ page: 0, pageSize: 25, sort: "", sortDir: "asc", filters: [] }, colMap);
    expect(rp.sort).toBe("");
  });
});

describe("offset", () => {
  it("computes offset from page and pageSize", () => {
    expect(offset({ page: 2, pageSize: 10, sort: "", sortDir: "asc", filters: [] })).toBe(20);
  });

  it("is zero on the first page", () => {
    expect(offset({ page: 0, pageSize: 25, sort: "", sortDir: "asc", filters: [] })).toBe(0);
  });
});

describe("InvalidFieldError", () => {
  it("carries the offending field in its message", () => {
    expect(new InvalidFieldError("foo").message).toBe("unknown field: foo");
  });
});
