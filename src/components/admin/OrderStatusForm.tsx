"use client";

import { useActionState } from "react";

import { updateOrderStatusAction } from "@/app/admin/orders/actions";
import {
  INITIAL_ADMIN_ACTION_STATE,
  type AdminActionState,
} from "@/features/admin/action-state";
import type { OrderStatus } from "@/features/admin/order-status";

const NEXT_ACTIONS: Partial<
  Record<OrderStatus, Array<{ status: OrderStatus; label: string; tone: string }>>
> = {
  PENDING: [
    { status: "PAID", label: "ยืนยันว่าชำระแล้ว", tone: "primary" },
    { status: "CANCELLED", label: "ยกเลิกคำสั่งซื้อ", tone: "danger" },
  ],
  PAID: [
    { status: "COMPLETED", label: "ทำรายการให้เสร็จ", tone: "primary" },
  ],
};

export function OrderStatusForm({
  orderId,
  status,
}: {
  orderId: number;
  status: OrderStatus;
}) {
  const [state, formAction, pending] = useActionState<
    AdminActionState,
    FormData
  >(updateOrderStatusAction, INITIAL_ADMIN_ACTION_STATE);
  const actions = NEXT_ACTIONS[status] ?? [];

  if (actions.length === 0) {
    return null;
  }

  return (
    <form action={formAction} className="admin-order-status-form">
      <input name="orderId" type="hidden" value={orderId} />
      <input name="expectedStatus" type="hidden" value={status} />
      {state.message ? (
        <span
          className={`admin-order-status-form__message is-${state.status}`}
          role={state.status === "error" ? "alert" : "status"}
        >
          {state.message}
        </span>
      ) : null}
      <div>
        {actions.map((action) => (
          <button
            className={`admin-order-action admin-order-action--${action.tone}`}
            disabled={pending}
            key={action.status}
            name="nextStatus"
            type="submit"
            value={action.status}
          >
            {action.label}
          </button>
        ))}
      </div>
    </form>
  );
}
