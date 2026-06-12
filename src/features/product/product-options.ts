import type { ProductOption } from "@/types/commerce";

export const OFFICE_OPTIONS = [
  { id: "word", label: "Microsoft Word", price: 450 },
  { id: "excel", label: "Microsoft Excel", price: 450 },
  { id: "powerpoint", label: "Microsoft PowerPoint", price: 390 },
] as const satisfies readonly ProductOption[];
