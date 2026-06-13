import { z } from "zod";

const boundedInteger = (fallback: number, minimum: number, maximum: number) =>
  z.coerce
    .number()
    .int()
    .catch(fallback)
    .transform((value) => Math.min(maximum, Math.max(minimum, value)));

const listQuerySchema = z.object({
  page: boundedInteger(1, 1, Number.MAX_SAFE_INTEGER),
  pageSize: boundedInteger(10, 10, 50),
  search: z.string().trim().max(100).catch(""),
  sort: z.enum(["createdAt", "name", "total"]).catch("createdAt"),
  direction: z.enum(["asc", "desc"]).catch("desc"),
});

export type RawSearchParams = Record<
  string,
  string | string[] | undefined
>;

export function parseListQuery(raw: RawSearchParams) {
  const scalar = Object.fromEntries(
    Object.entries(raw).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ]),
  );

  return listQuerySchema.parse(scalar);
}
