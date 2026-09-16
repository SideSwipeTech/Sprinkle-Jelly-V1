/**
 * fixtures — the certificates studio's prepared data: the staff work list,
 * the per-certificate record with its append-only status history and audit
 * trail, the name-correction proposals and the parked generations.
 * Fixture state only; session writes land in an in-memory overlay.
 *
 * Vocabulary is the domain's own: awarding item, lineage, pending reading,
 * shown publicly (the inverse of the owner's hidden marker), parked
 * generation, failure class, the closed five revocation codes, "no total
 * counted here".
 */

/* ── The four declared acts + the named read (verbatim from the documents) ── */

export const ACTION = {
  openStudio: "certificates.studio",                 /* chosen, not stated */
  revoke: "certificates.revoke",
  decideNameCorrection: "certificates.decide_name_correction",
  reissue: "certificates.reissue",
  retryGeneration: "certificates.retry_generation",
  readProposedName: "certificates.read_proposed_name"
} as const;

export const PLATFORM_LIST_PAGE_ITEMS = 20;

/* ── Statuses — three durable, no fourth; pending has three readings ─────── */

export type CertStatus = "pending" | "issued" | "revoked";
export type PendingReading = "awaiting_name" | "generating" | "generation_failed";

export const STATUS_LABEL: Record<CertStatus, string> = {
  pending: "Pending",
  issued: "Issued",
  revoked: "Revoked"
};

export const PENDING_READING_LABEL: Record<PendingReading, string> = {
  awaiting_name: "awaiting name",
  generating: "generating",
  generation_failed: "generation failed"
};

/* ── The closed five revocation codes ─────────────────────────────────────── */

export interface RevocationCode {
  id: string;
  covers: string;
  /** The machine-performed code — never offered to staff. */
  machine?: boolean;
}

export const REVOCATION_CODES: readonly RevocationCode[] = [
  { id: "awarding_record_invalidated", covers: "The awarding record behind the certificate is invalid — the code a confirmed payment reversal travels under." },
  { id: "duplicate_issuance", covers: "A certificate that duplicates one already issued." },
  { id: "content_or_grading_defect", covers: "A content correction removed the awarding fact." },
  { id: "administrative_issuance_error", covers: "An issuance that should not have happened — the wrong learner included." },
  { id: "account_erased", covers: "The one revocation the machine performs, on the completed account-erasure workflow.", machine: true }
];

/* ── The failure classes (jobs health's closed four, in precedence order) ── */

export type FailureClass = "security" | "lost_work" | "unavailable_dependency" | "bounded_backlog";

export const FAILURE_CLASS_LABEL: Record<FailureClass, string> = {
  security: "Security, privacy or integrity failure",
  lost_work: "Lost or wrong learner work",
  unavailable_dependency: "Unavailable dependency",
  bounded_backlog: "Bounded backlog"
};

/* ── Records ──────────────────────────────────────────────────────────────── */

export interface StatusTransition {
  at: string;
  from: string;
  to: string;
  actor: string;
  code: string | null;
  note: string | null;
}

export interface CertAuditRow {
  at: string;
  actor: string;
  action: string;
}

export interface CertFixture {
  /** Row identifier — the second ordering term. */
  id: string;
  seq: number;
  /** The long unguessable public identifier — 22 base64url characters. */
  identifier: string;
  learnerId: string;
  learner: string;
  awardingItem: string;
  awardingKind: "course" | "subject";
  status: CertStatus;
  pendingReading: PendingReading | null;
  /** The inverse of the owner's hidden marker — never the marker itself. */
  shownPublicly: boolean;
  /** Creation instant — the first ordering term. */
  createdOn: string;
  createdLabel: string;
  completedAt: string;
  /** Pending rows show no issue date rather than a dash. */
  issuedAt: string | null;
  /** The copy rendered onto this certificate. */
  displayName: string;
  /** The frozen presentation: item name at issuance + branding. */
  presentation: string;
  /** The durable projection of the generation's Jobs facts. */
  generation: { tries: number; failureClass: FailureClass | null; parkedAge: string | null; lastError: string | null } | null;
  history: StatusTransition[];
  audit: CertAuditRow[];
}

export interface NameProposal {
  id: string;
  learnerId: string;
  learner: string;
  currentName: string;
  proposed: string;
  learnerReason: string;
  state: "pending" | "approved" | "rejected" | "cancelled" | "replaced";
  decisionReason?: string;
}

export interface ParkedGeneration {
  id: string;
  certificateId: string;
  learner: string;
  awardingItem: string;
  failureClass: FailureClass;
  tries: number;
  parkedAge: string;
  lastError: string;
}

function issuedHistory(created: string, issued: string): StatusTransition[] {
  return [
    { at: created, from: "—", to: "pending · generating", actor: "The platform", code: null, note: "The awarding fact is durable; the document follows." },
    { at: issued, from: "pending · generating", to: "issued", actor: "The platform", code: null, note: null }
  ];
}

const BASE: CertFixture[] = [
  { id: "c-024", seq: 24, identifier: "mK9fP2qR7tV4wY8xZ1aB3c", learnerId: "u-yash", learner: "Yash", awardingItem: "Foundations of Python", awardingKind: "course", status: "issued", pendingReading: null, shownPublicly: true, createdOn: "2026-08-19", createdLabel: "19 Aug 2026", completedAt: "2 Jun 2026", issuedAt: "2 Jun 2026", displayName: "Yash", presentation: "Foundations of Python · platform style", generation: { tries: 1, failureClass: null, parkedAge: null, lastError: null }, history: issuedHistory("19 Aug 2026", "19 Aug 2026"), audit: [{ at: "19 Aug 2026", actor: "The platform", action: "certificates.issue — document durably held" }] },
  { id: "c-023", seq: 23, identifier: "nR4sT8uW2xY6zA1bC3dE5f", learnerId: "u-meera", learner: "Meera", awardingItem: "Data Structures", awardingKind: "subject", status: "issued", pendingReading: null, shownPublicly: true, createdOn: "2026-08-18", createdLabel: "18 Aug 2026", completedAt: "18 Jul 2026", issuedAt: "18 Jul 2026", displayName: "Meera", presentation: "Data Structures · platform style", generation: { tries: 1, failureClass: null, parkedAge: null, lastError: null }, history: issuedHistory("18 Aug 2026", "18 Aug 2026"), audit: [] },
  { id: "c-022", seq: 22, identifier: "pQ7rS9tU3vX5yB2dF4gH6j", learnerId: "u-devan", learner: "Devan", awardingItem: "React Interfaces", awardingKind: "course", status: "pending", pendingReading: "generation_failed", shownPublicly: true, createdOn: "2026-08-18", createdLabel: "18 Aug 2026", completedAt: "17 Aug 2026", issuedAt: null, displayName: "Devan", presentation: "React Interfaces · platform style", generation: { tries: 5, failureClass: "unavailable_dependency", parkedAge: "19h", lastError: "object-store put: timeout after 30s" }, history: [{ at: "18 Aug 2026", from: "—", to: "pending · generating", actor: "The platform", code: null, note: null }, { at: "18 Aug 2026", from: "pending · generating", to: "pending · generation_failed", actor: "The platform", code: null, note: "Retries spent; parked." }], audit: [{ at: "18 Aug 2026", actor: "The platform", action: "certificates.generation — parked after 5 tries" }] },
  { id: "c-021", seq: 21, identifier: "qW3eR5tY7uI9oP1aS3dF5g", learnerId: "u-rhea", learner: "Rhea", awardingItem: "Foundations of Python", awardingKind: "course", status: "pending", pendingReading: "awaiting_name", shownPublicly: true, createdOn: "2026-08-17", createdLabel: "17 Aug 2026", completedAt: "16 Aug 2026", issuedAt: null, displayName: "Rhea", presentation: "Foundations of Python · platform style", generation: { tries: 0, failureClass: null, parkedAge: null, lastError: null }, history: [{ at: "17 Aug 2026", from: "—", to: "pending · awaiting_name", actor: "The platform", code: null, note: "Waits on the learner — no validated display name." }], audit: [] },
  { id: "c-020", seq: 20, identifier: "tY6uI8oP0aS2dF4gH6jK8l", learnerId: "u-sana", learner: "Sana", awardingItem: "SQL for Readiness", awardingKind: "course", status: "issued", pendingReading: null, shownPublicly: false, createdOn: "2026-08-16", createdLabel: "16 Aug 2026", completedAt: "9 Aug 2026", issuedAt: "9 Aug 2026", displayName: "Sana", presentation: "SQL for Readiness · platform style", generation: { tries: 1, failureClass: null, parkedAge: null, lastError: null }, history: issuedHistory("16 Aug 2026", "16 Aug 2026"), audit: [] },
  { id: "c-019", seq: 19, identifier: "zX2cV4bN6mM8nB1vC3xZ5a", learnerId: "u-kira", learner: "Kira", awardingItem: "Relational Databases", awardingKind: "subject", status: "revoked", pendingReading: null, shownPublicly: true, createdOn: "2026-08-15", createdLabel: "15 Aug 2026", completedAt: "30 Jul 2026", issuedAt: "30 Jul 2026", displayName: "Kira", presentation: "Relational Databases · platform style", generation: { tries: 1, failureClass: null, parkedAge: null, lastError: null }, history: [...issuedHistory("15 Aug 2026", "15 Aug 2026"), { at: "16 Aug 2026", from: "issued", to: "revoked", actor: "Yash", code: "administrative_issuance_error", note: "Issued to the wrong learner record." }], audit: [{ at: "16 Aug 2026", actor: "Yash", action: "certificates.revoke — administrative_issuance_error" }] },
  { id: "c-018", seq: 18, identifier: "aS4dF6gH8jK1lL3kJ5hG7f", learnerId: "u-tom", learner: "Tom", awardingItem: "Foundations of Python", awardingKind: "course", status: "issued", pendingReading: null, shownPublicly: true, createdOn: "2026-08-14", createdLabel: "14 Aug 2026", completedAt: "13 Aug 2026", issuedAt: "13 Aug 2026", displayName: "Tom", presentation: "Foundations of Python · platform style", generation: { tries: 1, failureClass: null, parkedAge: null, lastError: null }, history: issuedHistory("14 Aug 2026", "14 Aug 2026"), audit: [] },
  { id: "c-017", seq: 17, identifier: "gH7jK9lL2kJ4hG6fD8sA0q", learnerId: "u-meera", learner: "Meera", awardingItem: "Foundations of Python", awardingKind: "course", status: "issued", pendingReading: null, shownPublicly: true, createdOn: "2026-08-13", createdLabel: "13 Aug 2026", completedAt: "12 Aug 2026", issuedAt: "12 Aug 2026", displayName: "Meera", presentation: "Foundations of Python · platform style", generation: { tries: 1, failureClass: null, parkedAge: null, lastError: null }, history: issuedHistory("13 Aug 2026", "13 Aug 2026"), audit: [] },
  { id: "c-016", seq: 16, identifier: "wE1rT3yU5iO7pA9sD2fG4h", learnerId: "u-arun", learner: "Arun", awardingItem: "Python", awardingKind: "subject", status: "pending", pendingReading: "generating", shownPublicly: true, createdOn: "2026-08-13", createdLabel: "13 Aug 2026", completedAt: "12 Aug 2026", issuedAt: null, displayName: "Arun", presentation: "Python · platform style", generation: { tries: 1, failureClass: null, parkedAge: null, lastError: null }, history: [{ at: "13 Aug 2026", from: "—", to: "pending · generating", actor: "The platform", code: null, note: null }], audit: [] },
  { id: "c-015", seq: 15, identifier: "jK6lM8nB0vC2xZ4aS6dF8g", learnerId: "u-yash", learner: "Yash", awardingItem: "Patterns in Data Structures", awardingKind: "course", status: "issued", pendingReading: null, shownPublicly: true, createdOn: "2026-08-12", createdLabel: "12 Aug 2026", completedAt: "18 Jul 2026", issuedAt: "18 Jul 2026", displayName: "Yash", presentation: "Patterns in Data Structures · platform style", generation: { tries: 1, failureClass: null, parkedAge: null, lastError: null }, history: issuedHistory("12 Aug 2026", "12 Aug 2026"), audit: [] },
  { id: "c-014", seq: 14, identifier: "hG9fD2sA4qW6eR8tY1uI3o", learnerId: "u-priya", learner: "Priya", awardingItem: "Foundations of Python", awardingKind: "course", status: "issued", pendingReading: null, shownPublicly: true, createdOn: "2026-08-11", createdLabel: "11 Aug 2026", completedAt: "10 Aug 2026", issuedAt: "10 Aug 2026", displayName: "Priya", presentation: "Foundations of Python · platform style", generation: { tries: 1, failureClass: null, parkedAge: null, lastError: null }, history: issuedHistory("11 Aug 2026", "11 Aug 2026"), audit: [] },
  { id: "c-013", seq: 13, identifier: "lP5oI7uY9tR1eW3qA5sD7f", learnerId: "u-kabir", learner: "Kabir", awardingItem: "React Interfaces", awardingKind: "course", status: "issued", pendingReading: null, shownPublicly: true, createdOn: "2026-08-10", createdLabel: "10 Aug 2026", completedAt: "9 Aug 2026", issuedAt: "9 Aug 2026", displayName: "Kabir", presentation: "React Interfaces · course branding — Aurora set", generation: { tries: 2, failureClass: null, parkedAge: null, lastError: null }, history: issuedHistory("10 Aug 2026", "10 Aug 2026"), audit: [] },
  { id: "c-012", seq: 12, identifier: "bN2vC4xZ6aS8dF0gH2jK4l", learnerId: "u-devan", learner: "Devan", awardingItem: "Python", awardingKind: "subject", status: "issued", pendingReading: null, shownPublicly: true, createdOn: "2026-08-09", createdLabel: "9 Aug 2026", completedAt: "8 Aug 2026", issuedAt: "8 Aug 2026", displayName: "Devan", presentation: "Python · platform style", generation: { tries: 1, failureClass: null, parkedAge: null, lastError: null }, history: issuedHistory("9 Aug 2026", "9 Aug 2026"), audit: [] },
  { id: "c-011", seq: 11, identifier: "mM7nB9vC1xZ3aS5dF7gH9j", learnerId: "u-tom", learner: "Tom", awardingItem: "Data Structures", awardingKind: "subject", status: "pending", pendingReading: "generating", shownPublicly: true, createdOn: "2026-08-08", createdLabel: "8 Aug 2026", completedAt: "7 Aug 2026", issuedAt: null, displayName: "Tom", presentation: "Data Structures · platform style", generation: { tries: 1, failureClass: null, parkedAge: null, lastError: null }, history: [{ at: "8 Aug 2026", from: "—", to: "pending · generating", actor: "The platform", code: null, note: null }], audit: [] },
  { id: "c-010", seq: 10, identifier: "vC3xZ5aS7dF9gH1jK3lL5k", learnerId: "u-rhea", learner: "Rhea", awardingItem: "SQL for Readiness", awardingKind: "course", status: "revoked", pendingReading: null, shownPublicly: true, createdOn: "2026-08-07", createdLabel: "7 Aug 2026", completedAt: "5 Aug 2026", issuedAt: "5 Aug 2026", displayName: "Rhea", presentation: "SQL for Readiness · platform style", generation: { tries: 1, failureClass: null, parkedAge: null, lastError: null }, history: [...issuedHistory("7 Aug 2026", "7 Aug 2026"), { at: "9 Aug 2026", from: "issued", to: "revoked", actor: "Yash", code: "content_or_grading_defect", note: "The awarding fact was removed by a content correction." }], audit: [{ at: "9 Aug 2026", actor: "Yash", action: "certificates.revoke — content_or_grading_defect" }] },
  { id: "c-009", seq: 9, identifier: "xZ1aS3dF5gH7jK9lL2kJ4h", learnerId: "u-sana", learner: "Sana", awardingItem: "Patterns in Data Structures", awardingKind: "course", status: "issued", pendingReading: null, shownPublicly: true, createdOn: "2026-08-06", createdLabel: "6 Aug 2026", completedAt: "5 Aug 2026", issuedAt: "5 Aug 2026", displayName: "Sana", presentation: "Patterns in Data Structures · platform style", generation: { tries: 1, failureClass: null, parkedAge: null, lastError: null }, history: issuedHistory("6 Aug 2026", "6 Aug 2026"), audit: [] },
  { id: "c-008", seq: 8, identifier: "fD4sA6qW8eR0tY2uI4oP6a", learnerId: "u-meera", learner: "Meera", awardingItem: "SQL for Readiness", awardingKind: "course", status: "issued", pendingReading: null, shownPublicly: true, createdOn: "2026-08-05", createdLabel: "5 Aug 2026", completedAt: "4 Aug 2026", issuedAt: "4 Aug 2026", displayName: "Meera", presentation: "SQL for Readiness · platform style", generation: { tries: 1, failureClass: null, parkedAge: null, lastError: null }, history: issuedHistory("5 Aug 2026", "5 Aug 2026"), audit: [] },
  { id: "c-007", seq: 7, identifier: "sD6fG8hJ0kL2kJ4hG6fD8s", learnerId: "u-arun", learner: "Arun", awardingItem: "Foundations of Python", awardingKind: "course", status: "issued", pendingReading: null, shownPublicly: true, createdOn: "2026-08-04", createdLabel: "4 Aug 2026", completedAt: "3 Aug 2026", issuedAt: "3 Aug 2026", displayName: "Arun", presentation: "Foundations of Python · platform style", generation: { tries: 1, failureClass: null, parkedAge: null, lastError: null }, history: issuedHistory("4 Aug 2026", "4 Aug 2026"), audit: [] },
  { id: "c-006", seq: 6, identifier: "aQ9wS1eD3rF5tG7yH9uJ2k", learnerId: "u-kabir", learner: "Kabir", awardingItem: "Python", awardingKind: "subject", status: "pending", pendingReading: "generation_failed", shownPublicly: true, createdOn: "2026-08-03", createdLabel: "3 Aug 2026", completedAt: "2 Aug 2026", issuedAt: null, displayName: "Kabir", presentation: "Python · platform style", generation: { tries: 5, failureClass: "bounded_backlog", parkedAge: "2d", lastError: "generation queue: worker saturated past bound" }, history: [{ at: "3 Aug 2026", from: "—", to: "pending · generating", actor: "The platform", code: null, note: null }, { at: "3 Aug 2026", from: "pending · generating", to: "pending · generation_failed", actor: "The platform", code: null, note: "Retries spent; parked." }], audit: [{ at: "3 Aug 2026", actor: "The platform", action: "certificates.generation — parked after 5 tries" }] },
  { id: "c-005", seq: 5, identifier: "eW4rT6yU8iO0pA2sD4fG6h", learnerId: "u-priya", learner: "Priya", awardingItem: "Data Structures", awardingKind: "subject", status: "issued", pendingReading: null, shownPublicly: false, createdOn: "2026-08-02", createdLabel: "2 Aug 2026", completedAt: "1 Aug 2026", issuedAt: "1 Aug 2026", displayName: "Priya", presentation: "Data Structures · platform style", generation: { tries: 1, failureClass: null, parkedAge: null, lastError: null }, history: issuedHistory("2 Aug 2026", "2 Aug 2026"), audit: [] },
  { id: "c-004", seq: 4, identifier: "rT7yU9iO1pA3sD5fG7hJ9k", learnerId: "u-yash", learner: "Yash", awardingItem: "Relational Databases", awardingKind: "subject", status: "issued", pendingReading: null, shownPublicly: true, createdOn: "2026-08-01", createdLabel: "1 Aug 2026", completedAt: "31 Jul 2026", issuedAt: "31 Jul 2026", displayName: "Yash", presentation: "Relational Databases · platform style", generation: { tries: 1, failureClass: null, parkedAge: null, lastError: null }, history: issuedHistory("1 Aug 2026", "1 Aug 2026"), audit: [] },
  { id: "c-003", seq: 3, identifier: "uI2oP4aS6dF8gH0jK2lL4z", learnerId: "u-tom", learner: "Tom", awardingItem: "Foundations of Python", awardingKind: "course", status: "pending", pendingReading: "awaiting_name", shownPublicly: true, createdOn: "2026-07-31", createdLabel: "31 Jul 2026", completedAt: "30 Jul 2026", issuedAt: null, displayName: "Tom", presentation: "Foundations of Python · platform style", generation: { tries: 0, failureClass: null, parkedAge: null, lastError: null }, history: [{ at: "31 Jul 2026", from: "—", to: "pending · awaiting_name", actor: "The platform", code: null, note: "Waits on the learner — no validated display name." }], audit: [] },
  { id: "c-002", seq: 2, identifier: "oP5aS7dF9gH1jK3lL5kJ7h", learnerId: "u-kira", learner: "Kira", awardingItem: "Foundations of Python", awardingKind: "course", status: "issued", pendingReading: null, shownPublicly: true, createdOn: "2026-07-30", createdLabel: "30 Jul 2026", completedAt: "29 Jul 2026", issuedAt: "29 Jul 2026", displayName: "Kira", presentation: "Foundations of Python · platform style", generation: { tries: 1, failureClass: null, parkedAge: null, lastError: null }, history: issuedHistory("30 Jul 2026", "30 Jul 2026"), audit: [] },
  { id: "c-001", seq: 1, identifier: "gH8jK0lL2kJ4hG6fD8sA0q", learnerId: "u-devan", learner: "Devan", awardingItem: "SQL for Readiness", awardingKind: "course", status: "issued", pendingReading: null, shownPublicly: true, createdOn: "2026-07-28", createdLabel: "28 Jul 2026", completedAt: "27 Jul 2026", issuedAt: "27 Jul 2026", displayName: "Devan", presentation: "SQL for Readiness · platform style", generation: { tries: 1, failureClass: null, parkedAge: null, lastError: null }, history: issuedHistory("28 Jul 2026", "28 Jul 2026"), audit: [] }
];

/* ── Name-correction proposals — one current proposal per learner ────────── */

const PROPOSALS: NameProposal[] = [
  {
    id: "np-7", learnerId: "u-rhea", learner: "Rhea",
    currentName: "Rhea", proposed: "Rhea Sharma",
    learnerReason: "My surname was missing from the name I typed.",
    state: "pending"
  },
  {
    id: "np-4", learnerId: "u-kabir", learner: "Kabir",
    currentName: "Kabir", proposed: "K. Sharma",
    learnerReason: "Preferred short form.",
    state: "rejected", decisionReason: "An initial is not the learner's name as proposed."
  }
];

/* ── Parked generations — retries spent, staff-retryable ─────────────────── */

const PARKED: ParkedGeneration[] = [
  {
    id: "pg-1", certificateId: "c-022", learner: "Devan", awardingItem: "React Interfaces",
    failureClass: "unavailable_dependency", tries: 5, parkedAge: "19h",
    lastError: "object-store put: timeout after 30s"
  },
  {
    id: "pg-2", certificateId: "c-006", learner: "Kabir", awardingItem: "Python",
    failureClass: "bounded_backlog", tries: 5, parkedAge: "2d",
    lastError: "generation queue: worker saturated past bound"
  }
];

/** The shared waiting-versus-running split the parked page sits under —
 *  point-in-time readings, never summed. */
export const GENERATION_SPLIT = { waiting: 3, running: 1 };

/* ── The session overlay ─────────────────────────────────────────────────── */

const revokedIds = new Set<string>();
const reissuedIds = new Set<string>();
const retriedCerts = new Set<string>();
const releasedParked = new Set<string>();
const proposalDecisions = new Map<string, { state: "approved" | "rejected"; reason: string }>();
const extraHistory = new Map<string, StatusTransition[]>();
const extraAudit = new Map<string, CertAuditRow[]>();
const nameOverrides = new Map<string, string>();

export function allCertificates(): CertFixture[] {
  return BASE.map((c) => findCertificate(c.id) ?? c);
}

export function findCertificate(id: string | undefined): CertFixture | undefined {
  const base = BASE.find((c) => c.id === id);
  if (!base) return undefined;
  const revoked = revokedIds.has(base.id);
  const retried = retriedCerts.has(base.id);
  const status: CertStatus = revoked ? "revoked" : base.status;
  const pendingReading: PendingReading | null = revoked
    ? null
    : retried && base.pendingReading === "generation_failed"
      ? "generating"
      : base.pendingReading;
  return {
    ...base,
    status,
    pendingReading,
    displayName: nameOverrides.get(base.id) ?? base.displayName,
    history: [...base.history, ...(extraHistory.get(base.id) ?? [])],
    audit: [...base.audit, ...(extraAudit.get(base.id) ?? [])]
  };
}

export function allParked(): ParkedGeneration[] {
  return PARKED.filter((p) => !releasedParked.has(p.id));
}

/** The current proposal for a learner — pending only; a decided, cancelled or
 *  replaced one is never presented as current. */
export function currentProposal(learnerId: string): NameProposal | undefined {
  return PROPOSALS.find(
    (p) => p.learnerId === learnerId && p.state === "pending" && !proposalDecisions.has(p.id)
  );
}

export function proposalHistory(learnerId: string): NameProposal[] {
  return PROPOSALS.filter((p) => p.learnerId === learnerId).map(
    (p) => {
      const d = proposalDecisions.get(p.id);
      return d ? { ...p, state: d.state, decisionReason: d.reason } : p;
    }
  );
}

function pushAudit(certId: string, action: string) {
  const list = extraAudit.get(certId) ?? [];
  list.push({ at: "Today", actor: "This session", action });
  extraAudit.set(certId, list);
}

function pushHistory(certId: string, row: StatusTransition) {
  const list = extraHistory.get(certId) ?? [];
  list.push(row);
  extraHistory.set(certId, list);
}

/** Revocation: append-only, takes effect immediately, undone by no act. */
export function revokeCertificate(certId: string, code: string, note: string) {
  revokedIds.add(certId);
  pushHistory(certId, {
    at: "Today", from: "issued", to: "revoked", actor: "This session", code, note
  });
  pushAudit(certId, `${ACTION.revoke} — ${code}`);
}

/** The approval and the display-name update commit together; documents
 *  already made are unchanged unless a reissue is separately confirmed. */
export function decideProposal(proposal: NameProposal, decision: "approved" | "rejected", reason: string) {
  proposalDecisions.set(proposal.id, { state: decision, reason });
  if (decision === "approved") {
    BASE.forEach((c) => {
      if (c.learnerId === proposal.learnerId) {
        nameOverrides.set(c.id, proposal.proposed);
        pushAudit(c.id, `${ACTION.decideNameCorrection} — ${decision} — reason recorded`);
      }
    });
  } else {
    BASE.forEach((c) => {
      if (c.learnerId === proposal.learnerId) {
        pushAudit(c.id, `${ACTION.decideNameCorrection} — rejected — reason recorded`);
      }
    });
  }
}

/** A display-name reissue — the document swap; never a new lineage member. */
export function reissueCertificate(certId: string) {
  reissuedIds.add(certId);
  pushAudit(certId, `${ACTION.reissue} — document reissued, previous marked replaced`);
  pushHistory(certId, {
    at: "Today", from: "issued", to: "issued", actor: "This session", code: null,
    note: "Document reissued — the current reference moved to the new document."
  });
}

export function wasReissued(certId: string): boolean {
  return reissuedIds.has(certId);
}

/** Retrying a parked generation moves the certificate back to generating and
 *  releases the parked row through the caller's own transaction. */
export function retryParked(parkedId: string) {
  const row = PARKED.find((p) => p.id === parkedId);
  if (!row) return;
  releasedParked.add(parkedId);
  retriedCerts.add(row.certificateId);
  pushHistory(row.certificateId, {
    at: "Today", from: "pending · generation_failed", to: "pending · generating",
    actor: "This session", code: null, note: "Parked generation retried — released and re-armed."
  });
  pushAudit(row.certificateId, `${ACTION.retryGeneration} — released the parked row`);
}
