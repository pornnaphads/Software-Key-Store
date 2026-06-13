export interface AdminActionState {
  status: "idle" | "success" | "error";
  message: string;
  fields?: Record<string, string[] | undefined>;
}

export const INITIAL_ADMIN_ACTION_STATE: AdminActionState = {
  status: "idle",
  message: "",
};
