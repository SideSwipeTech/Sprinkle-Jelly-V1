export const STAFF_ROLES = ["instructor", "admin", "superadmin"] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];
export type AppRole = "learner" | StaffRole;

export const ROLE_LABEL: Record<AppRole, string> = {
  learner: "Learner",
  instructor: "Instructor",
  admin: "Administrator",
  superadmin: "Super administrator"
};

export function isStaff(role: AppRole | undefined): role is StaffRole {
  return role === "instructor" || role === "admin" || role === "superadmin";
}

export function canPublishDirect(role: AppRole): boolean {
  return role === "superadmin";
}

export function canMutatePeople(role: AppRole): boolean {
  return role === "admin" || role === "superadmin";
}

export function persistRole(role: AppRole) {
  try {
    window.localStorage.setItem("wp.role", role);
  } catch {
    /* visit-only */
  }
}

export function readPersistedRole(): AppRole {
  try {
    const v = window.localStorage.getItem("wp.role");
    if (v === "instructor" || v === "admin" || v === "superadmin" || v === "learner") return v;
  } catch {
    /* ignore */
  }
  return "learner";
}
