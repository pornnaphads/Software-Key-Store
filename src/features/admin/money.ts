import { Prisma } from "@prisma/client";

export type MoneyInput = Prisma.Decimal | string | number;

export function toDecimal(value: MoneyInput): Prisma.Decimal {
  return value instanceof Prisma.Decimal ? value : new Prisma.Decimal(value);
}

export function toMoneyString(value: MoneyInput): string {
  return toDecimal(value).toFixed(2);
}

export function formatBaht(value: MoneyInput): string {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(toMoneyString(value)));
}
