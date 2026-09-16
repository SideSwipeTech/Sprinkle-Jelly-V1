import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Card, CardHeader, StateBlock, Stat } from "@components/Card";
import { Page, Back } from "@components/Page";
import { AppearanceSwitcher } from "@components/AppearanceSwitcher";
import { Icon } from "@icons/Icon";
import {
  CHALLENGES,
  COMPANIES,
  COURSES,
  HELP_TOPICS,
  MOCKS,
  NOTIFICATIONS,
  type TopicRequest
} from "@data/catalog";
import {
  fileTopicRequest,
  markNotificationsRead,
  toggleCertVisibility,
  updateUserSettings,
  withdrawTopicRequest
} from "@state/store";
import { useStore } from "@state/useStore";

export function Notifications() {
  const store = useStore();
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filtered = NOTIFICATIONS.filter((n) => {
    if (activeCategory === "all") return true;
    return n.category === activeCategory;
  });

  return (
    <Page kind="sink" kicker="Personal" title="Notifications" lead="In-app notification ledger. No SMS, marketing push, or spam channels.">
      <div className="row" style={{ justifyContent: "space-between", marginBottom: "var(--space-3)" }}>
        <div className="filters">
          {[
            { id: "all", label: "All" },
            { id: "Achievements", label: "Achievements" },
            { id: "Level Ups", label: "Level Ups" },
            { id: "Daily Challenges", label: "Daily" },
            { id: "Streaks", label: "Streaks" },
            { id: "Mock Tests", label: "Mock" },
            { id: "Company Tests", label: "Company" },
            { id: "System", label: "System" }
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              className="chip"
              data-on={activeCategory === cat.id || undefined}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="row">
          <button className="btn btn--secondary" type="button" onClick={() => markNotificationsRead()}>
            Mark All Read
          </button>
          <Link className="btn btn--quiet" to="/notifications/preferences">Channel Preferences</Link>
        </div>
      </div>

      <div className="list">
        {filtered.map((n) => {
          const isUnread = n.unread && !store.notificationsRead.includes(n.id);
          return (
            <article key={n.id} className="list-row">
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong style={{ fontSize: "var(--text-base)" }}>{n.title}</strong>
                  <span className="meta">
                    {n.time}{" "}
                    {isUnread ? (
                      <span className="chip" style={{ background: "var(--c-accent-primary)", color: "white", padding: "2px 8px", fontSize: "11px", marginLeft: 6 }}>
                        NEW
                      </span>
                    ) : null}
                  </span>
                </div>
                <p className="page__lead" style={{ margin: "4px 0 0", fontSize: "var(--text-sm)" }}>{n.body}</p>
              </div>
            </article>
          );
        })}
      </div>
    </Page>
  );
}

export function NotificationPreferences() {
  const categories = [
    ["Achievements", "Milestones and non-streak achievements."],
    ["Level Ups", "A new level recorded on your experience ledger."],
    ["Daily Challenges", "The evening Daily reminder and availability changes."],
    ["Streaks", "Streak milestones and related achievement events."],
    ["Mock Tests", "Mock paper availability, repair, and result changes."],
    ["Company Tests", "Company paper availability, repair, and result changes."],
    ["System", "Staff broadcasts, course changes, certificate events, and request updates."]
  ] as const;
  const [preferences, setPreferences] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(categories.map(([name]) => [name, true]))
  );

  return (
    <Page
      kind="sink"
      kicker="Notifications"
      title="Notification preferences"
      lead="One in-app switch per category. Mock and Company remain independently controlled."
      actions={<Back to="/notifications">Inbox</Back>}
    >
      <Card>
        <CardHeader title="In-app categories" icon="settings" />
        <div className="preference-list">
          {categories.map(([name, description]) => (
            <label key={name} className="choice preference-row">
              <input
                type="checkbox"
                checked={preferences[name] ?? true}
                onChange={(event) => setPreferences((current) => ({ ...current, [name]: event.target.checked }))}
              />
              <span>
                <strong>{name}</strong>
                <small>{description}</small>
              </span>
            </label>
          ))}
        </div>
        <p className="meta settings-note">Changes apply to new items only. Existing unread notifications remain in your inbox.</p>
      </Card>
    </Page>
  );
}

export function Settings() {
  const store = useStore();
  const [activeTab, setActiveTab] = useState<"notifications" | "appearance" | "certificates" | "account" | "privacy">("appearance");
  const [erasure, setErasure] = useState<"idle" | "review" | "requested">("idle");
  const tabs = [
    { id: "notifications", label: "Notifications", icon: "notifications" },
    { id: "appearance", label: "Appearance", icon: "theme" },
    { id: "certificates", label: "Certificates", icon: "shield" },
    { id: "account", label: "Account", icon: "user" },
    { id: "privacy", label: "Data & privacy", icon: "lock" }
  ] as const;

  return (
    <Page kind="sink" kicker="Preferences" title="Settings" lead="Five clear sections. Each preference saves independently and states where it lives.">
      <nav className="settings-tabs" aria-label="Settings sections">
        {tabs.map((tab) => (
          <button key={tab.id} type="button" className="settings-tab" data-on={activeTab === tab.id || undefined} onClick={() => setActiveTab(tab.id)}>
            <Icon name={tab.icon} size={16} /><span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {activeTab === "notifications" ? (
        <Card>
          <CardHeader title="Notification categories" icon="notifications" />
          <p className="page__lead">Seven in-app categories, including separate Mock and Company controls. There are no channel, digest, or marketing settings.</p>
          <div className="settings-category-grid">
            {["Achievements", "Level Ups", "Daily Challenges", "Streaks", "Mock Tests", "Company Tests", "System"].map((category) => (
              <span key={category} className="settings-category"><Icon name="check" size={14} />{category}</span>
            ))}
          </div>
          <Link className="btn btn--primary" to="/notifications/preferences">Manage category switches</Link>
        </Card>
      ) : null}

      {activeTab === "appearance" ? (
        <div className="settings-stack">
          <Card>
            <CardHeader title="Appearance" icon="theme" />
            <p className="page__lead">
              Four axes, chosen here and nowhere else: the theme (identity and scheme, or follow this
              device), the navigation model, the accent and the typeface. Each is remembered on this
              device and applied before the page is first drawn.
            </p>
            <AppearanceSwitcher />
          </Card>
          <Card>
            <CardHeader title="Motion" icon="sparkles" />
            <label className="choice preference-row">
              <input type="checkbox" checked={store.userSettings.reducedMotion} onChange={(event) => updateUserSettings({ reducedMotion: event.target.checked })} />
              <span><strong>Reduce motion</strong><small>Removes ambient pointer light, page entrance transitions, and ticker movement.</small></span>
            </label>
          </Card>
        </div>
      ) : null}

      {activeTab === "certificates" ? (
        <Card>
          <CardHeader title="Certificate visibility" icon="shield" />
          <p className="page__lead">Hiding a valid certificate removes its public check without changing the issuer record shown to you. You can reverse this at any time.</p>
          <div className="list settings-certificate-list">
            {store.certificates.map((certificate) => (
              <div className="list-row" key={certificate.id}>
                <div><strong>{certificate.title}</strong><p className="meta">Awarded {certificate.awarded} - {certificate.valid ? "Issuer record valid" : "Issuer record unavailable"}</p></div>
                <button className="chip" type="button" onClick={() => toggleCertVisibility(certificate.id)}>
                  {certificate.visibility === "public" ? "Public check on" : "Public check hidden"}
                </button>
              </div>
            ))}
          </div>
          <Link className="btn btn--quiet" to="/certificates">Open certificate collection</Link>
        </Card>
      ) : null}

      {activeTab === "account" ? (
        <div className="settings-stack">
          <Card>
            <CardHeader title="Account" icon="user" />
            <p className="page__lead">Your identity, sign-in, and membership are managed by the main Wizly site. Labs only reads the current membership projection.</p>
            <dl className="account-facts">
              <div><dt>Name</dt><dd>{store.session.name}</dd></div>
              <div><dt>Membership</dt><dd><span className="status-good">Active</span></dd></div>
              <div><dt>Labs access</dt><dd>All learning and practice areas</dd></div>
            </dl>
            <Link className="btn btn--secondary" to="/profile">View Labs profile</Link>
          </Card>
          <Card>
            <CardHeader title="WizBit companion" icon="sparkles" />
            <p className="page__lead">One stream, two presentations: the same facts and tone either way. Generated assistance remains off.</p>
            <div className="preference-row">
              <div>
                <strong>Presentation</strong>
                <p className="micro">The companion shows the fact and a flourish through the character; plain messages show the fact alone.</p>
              </div>
              <div className="segmented-control" role="group" aria-label="Companion presentation">
                {[
                  { id: "companion", label: "The companion" },
                  { id: "plain", label: "Plain messages" }
                ].map((option) => (
                  <button key={option.id} type="button" aria-pressed={store.userSettings.companion === option.id} data-on={store.userSettings.companion === option.id || undefined} onClick={() => updateUserSettings({ companion: option.id as "companion" | "plain" })}>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="preference-row">
              <div>
                <strong>Volume</strong>
                <p className="micro">Quiet delivers verdicts, errors and help when asked — never celebrations or anything volunteered. It only tightens a surface.</p>
              </div>
              <div className="segmented-control" role="group" aria-label="Companion volume">
                {[
                  { id: "present", label: "Present" },
                  { id: "quiet", label: "Quiet" }
                ].map((option) => (
                  <button key={option.id} type="button" aria-pressed={store.userSettings.companionVolume === option.id} data-on={store.userSettings.companionVolume === option.id || undefined} onClick={() => updateUserSettings({ companionVolume: option.id as "present" | "quiet" })}>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <CompanionNameField value={store.userSettings.companionName} />
          </Card>
        </div>
      ) : null}

      {activeTab === "privacy" ? (
        <div className="settings-stack">
          <Card>
            <CardHeader title="Device storage" icon="shield" />
            <p className="page__lead">Labs keeps interface preferences and unsent work on this device. Learner-written content is never exposed to staff support views.</p>
            <dl className="account-facts">
              <div><dt>Preferences</dt><dd>Device scoped</dd></div>
              <div><dt>Quick Notes buffer</dt><dd>Private, account scoped</dd></div>
              <div><dt>External trackers</dt><dd>None</dd></div>
            </dl>
          </Card>
          <Card live={erasure !== "idle"}>
            <CardHeader title="Account erasure" icon="alert" />
            {erasure === "idle" ? (
              <><p className="page__lead">Start a staged erasure request. Nothing is deleted until the request is submitted and the cancellation window closes.</p><button className="btn btn--secondary" type="button" onClick={() => setErasure("review")}>Review erasure request</button></>
            ) : erasure === "review" ? (
              <div className="erasure-review">
                <StateBlock state="pending" message="Review the consequences before submitting. This step does not delete anything." />
                <ul className="home__list">
                  <li className="home__row"><Icon name="history" size={15} /><span>Learning history, notes, projects, and settings enter the staged queue.</span></li>
                  <li className="home__row"><Icon name="shield" size={15} /><span>Certificates keep only the public awarding record required for verification.</span></li>
                  <li className="home__row"><Icon name="clock" size={15} /><span>A cancellation window appears before ordered erasure begins.</span></li>
                </ul>
                <div className="row"><button className="btn btn--primary" type="button" onClick={() => setErasure("requested")}>Submit erasure request</button><button className="btn btn--quiet" type="button" onClick={() => setErasure("idle")}>Cancel</button></div>
              </div>
            ) : (
              <div className="erasure-review">
                <StateBlock state="pending" message="Erasure requested. Cancellation is available until 24 August 2026, 18:00 IST." />
                <div className="timeline-row"><span className="timeline-row__mark" /><div><strong>Request received</strong><p className="meta">Queued for the ordered 16-step erasure pass after the cancellation window.</p></div></div>
                <button className="btn btn--secondary" type="button" onClick={() => setErasure("idle")}>Cancel request</button>
              </div>
            )}
          </Card>
        </div>
      ) : null}
    </Page>
  );
}

export function Profile() {
  const store = useStore();
  const [editingName, setEditingName] = useState(false);
  const [dispName, setDispName] = useState(store.userSettings.displayName || store.session.name);

  return (
    <Page kind="sink" kicker="Personal" title="Learner Profile" lead={`${store.session.name} · Membership active through ${store.profile.membershipEnd}.`}>
      {/* Overview & Level Ring */}
      <div className="grid-3" style={{ marginBottom: "var(--space-4)" }}>
        <Card live>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg, var(--c-accent-primary), #2dd4bf)", display: "grid", placeItems: "center", color: "white", fontSize: "22px", fontWeight: 700 }}>
              {store.session.name[0] ?? "Y"}
            </div>
            <div>
              <span className="micro" style={{ color: "var(--c-accent-primary)" }}>LEVEL PROGRESSION</span>
              <h3 style={{ fontSize: "var(--text-xl)", margin: "2px 0" }}>Level {store.profile.level}</h3>
              <p className="meta">{store.profile.xp.toLocaleString()} Total XP · {store.profile.xpToNext} to Level {store.profile.level + 1}</p>
            </div>
          </div>
        </Card>

        <Card>
          <Stat label="Active Streak" value={`${store.profile.streak} Days`} icon="target" />
          <p className="meta" style={{ marginTop: "6px" }}>Continuous learning rhythm on this device</p>
        </Card>

        <Card>
          <Stat label="Total Solved" value={`${store.profile.solvedCount} Items`} icon="challenges" />
          <p className="meta" style={{ marginTop: "6px" }}>Across algorithms, daily rituals, and labs</p>
        </Card>
      </div>

      {/* Certificate Display Name Proposal (PRF-F7) */}
      <div style={{ marginBottom: "var(--space-4)" }}>
        <Card>
          <CardHeader title="Certificate Display Name (PRF-F7)" icon="user" />
          <p className="page__lead">The official name rendered on your verifiable cryptographic certificates and accreditation seals:</p>
          {editingName ? (
            <div className="row" style={{ marginTop: "var(--space-3)" }}>
              <input
                style={{ height: 38, padding: "0 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--c-border)", background: "var(--c-surface-inset)", color: "var(--c-text-primary)" }}
                value={dispName}
                onChange={(e) => setDispName(e.target.value)}
              />
              <button
                className="btn btn--primary"
                type="button"
                onClick={() => {
                  updateUserSettings({ displayName: dispName.trim() });
                  setEditingName(false);
                }}
              >
                Save Proposed Name
              </button>
              <button className="btn btn--secondary" type="button" onClick={() => setEditingName(false)}>Cancel</button>
            </div>
          ) : (
            <div className="row" style={{ marginTop: "var(--space-2)", alignItems: "center" }}>
              <strong style={{ fontSize: "var(--text-lg)", color: "var(--c-text-primary)" }}>{store.userSettings.displayName || store.session.name}</strong>
              <button className="btn btn--quiet" style={{ fontSize: "12px" }} type="button" onClick={() => setEditingName(true)}>Change Name</button>
            </div>
          )}
        </Card>
      </div>

      {/* Issued Certificates Collection with Visibility Toggle */}
      <Card>
        <CardHeader
          title="Issued Certificates Collection (PRF-F6 / PRF-F20)"
          icon="shield"
          action={<Link className="btn btn--secondary" to="/certificates">View All ({store.certificates.length})</Link>}
        />
        <div className="list" style={{ marginTop: "var(--space-3)" }}>
          {store.certificates.map((cert) => (
            <div key={cert.id} className="list-row" style={{ padding: "14px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                <div>
                  <strong style={{ fontSize: "var(--text-base)" }}>{cert.title}</strong>
                  <p className="meta">Awarded {cert.awarded} · ID: <code>WZL-{cert.id.toUpperCase()}-VALID</code></p>
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <button
                    className="chip"
                    type="button"
                    style={{
                      background: cert.visibility === "public" ? "rgba(45, 212, 191, 0.15)" : "rgba(255, 255, 255, 0.08)",
                      color: cert.visibility === "public" ? "#2dd4bf" : "var(--c-text-muted)"
                    }}
                    onClick={() => toggleCertVisibility(cert.id)}
                  >
                    {cert.visibility === "public" ? "✓ Publicly Verifiable" : "Hidden from Public"}
                  </button>
                  <Link className="btn btn--quiet" to={`/certificates/${cert.id}/verify`}>Verify Seal →</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </Page>
  );
}

export function Certificates() {
  const store = useStore();
  return (
    <Page kind="sink" kicker="Personal" title="Issued Certificates" lead="Certificates record an accredited course completion fact. They carry no score, no rank, and no campus standing.">
      <div className="courses__grid">
        {store.certificates.map((c) => (
          <div key={c.id} style={{ borderRadius: "var(--radius-md)", overflow: "hidden" }}>
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <span className="micro" style={{ color: "var(--c-accent-primary)" }}>ACCREDITED COMPLETION</span>
                  <h3 style={{ margin: "4px 0", fontSize: "var(--text-lg)" }}>{c.title}</h3>
                  <p className="meta">Awarded {c.awarded} · {c.valid ? "Cryptographically Valid" : "Revoked"}</p>
                </div>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(99, 102, 241, 0.15)", display: "grid", placeItems: "center", color: "var(--c-accent-primary)" }}>
                  <Icon name="shield" size={22} />
                </div>
              </div>

              <div style={{ margin: "var(--space-3) 0", padding: "10px 12px", borderRadius: "var(--radius-sm)", background: "var(--c-surface-inset)", fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--c-text-muted)" }}>
                ID: WZL-{c.id.toUpperCase()}-VALID
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
                <span className="meta">Public Check:</span>
                <button
                  className="chip"
                  type="button"
                  style={{
                    background: c.visibility === "public" ? "rgba(45, 212, 191, 0.15)" : "rgba(255, 255, 255, 0.08)",
                    color: c.visibility === "public" ? "#2dd4bf" : "var(--c-text-muted)",
                    fontSize: "11px"
                  }}
                  onClick={() => toggleCertVisibility(c.id)}
                >
                  {c.visibility === "public" ? "✓ Publicly Visible" : "Hidden from Public"}
                </button>
              </div>

              <div className="row">
                <Link className="btn btn--primary" to={`/certificates/${c.id}/verify`}>Verify Public Seal</Link>
                <button
                  className="btn btn--secondary"
                  type="button"
                  onClick={() => {
                    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(c, null, 2));
                    const downloadAnchor = document.createElement("a");
                    downloadAnchor.setAttribute("href", dataStr);
                    downloadAnchor.setAttribute("download", `${c.id}-proof.json`);
                    document.body.appendChild(downloadAnchor);
                    downloadAnchor.click();
                    downloadAnchor.remove();
                  }}
                >
                  Download Proof
                </button>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </Page>
  );
}

export function CertificateVerify() {
  const { certId } = useParams();
  const store = useStore();
  const cert = store.certificates.find((c) => c.id === certId);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Page kind="sink" kicker="Public Verification Authority" title="Certificate Credential Seal" lead="Cryptographically confirms the accredited course completion event. Public on-device validation record.">
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "var(--space-6)", border: "2px solid var(--c-accent-primary)", borderRadius: "var(--radius-lg)", background: "var(--c-surface)", boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}>
        <Card>
          {!cert ? (
            <StateBlock state="unavailable" message="This award record cannot be verified." />
          ) : cert.visibility === "public" && cert.valid ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(45, 212, 191, 0.15)", border: "2px solid #2dd4bf", color: "#2dd4bf", display: "grid", placeItems: "center", margin: "0 auto var(--space-4)" }}>
                <Icon name="shield" size={36} />
              </div>

              <span className="micro" style={{ color: "#2dd4bf", fontWeight: 700, letterSpacing: "0.08em" }}>ACCREDITED CREDENTIAL SEAL</span>
              <h2 style={{ fontSize: "var(--text-2xl)", margin: "8px 0" }}>{cert.title}</h2>
              <p className="meta" style={{ fontSize: "var(--text-sm)" }}>Awarded to <strong style={{ color: "var(--c-text-primary)" }}>{store.userSettings.displayName || store.session.name}</strong> on {cert.awarded}</p>

              <div style={{ margin: "var(--space-6) 0", padding: "16px", borderRadius: "var(--radius-md)", background: "var(--c-surface-inset)", textAlign: "left", fontSize: "12px", fontFamily: "var(--font-mono)", border: "1px solid var(--c-border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <strong style={{ color: "var(--c-accent-primary)" }}>VERIFICATION CODE:</strong>
                  <span>WZL-{cert.id.toUpperCase()}-VALID</span>
                </div>
                <div style={{ marginTop: 6, display: "flex", justifyContent: "space-between" }}>
                  <strong style={{ color: "var(--c-accent-primary)" }}>STATUS:</strong>
                  <span style={{ color: "#2dd4bf", fontWeight: 700 }}>✓ ACTIVE & ACCREDITED</span>
                </div>
                <div style={{ marginTop: 6 }}>
                  <strong style={{ color: "var(--c-accent-primary)" }}>SHA-256 DIGEST:</strong>
                  <div style={{ wordBreak: "break-all", color: "var(--c-text-muted)", marginTop: 2 }}>{cert.hash}</div>
                </div>
                <div style={{ marginTop: 6, display: "flex", justifyContent: "space-between" }}>
                  <strong style={{ color: "var(--c-accent-primary)" }}>AUTHORITY:</strong>
                  <span>{cert.issuer}</span>
                </div>
              </div>

              <div className="row" style={{ justifyContent: "center" }}>
                <button className="btn btn--primary" type="button" onClick={handleCopyLink}>
                  <Icon name="link" size={14} />
                  <span>{copied ? "Link Copied!" : "Copy Verification URL"}</span>
                </button>
                <Link className="btn btn--secondary" to="/certificates">All Certificates</Link>
              </div>
            </div>
          ) : (
            <StateBlock state="unavailable" message="This certificate could not be verified." />
          )}
        </Card>
      </div>
    </Page>
  );
}

export function RequestsPage() {
  const store = useStore();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [sourceArea, setSourceArea] = useState<"Courses" | "Challenges" | "Assessments" | "CodeLab" | "Projects">("Courses");
  const [message, setMessage] = useState("");
  const [requests, setRequests] = useState<TopicRequest[]>([
    {
      id: "req-yash-1",
      title: "Distributed systems practice track",
      description: "Consensus, failure recovery, and consistency models.",
      author: store.session.name,
      upvotes: 0,
      status: "Under Review",
      sourceArea: "Courses",
      tags: [],
      createdAt: "20 Aug 2026"
    }
  ]);

  function submit() {
    const normalized = title.trim().toLowerCase();
    if (requests.some((request) => request.title.trim().toLowerCase() === normalized && request.status !== "Withdrawn")) {
      setMessage("You already have an open request with that title.");
      return;
    }
    const request: TopicRequest = {
      id: `req-${Date.now()}`,
      title: title.trim(),
      description: desc.trim(),
      author: store.session.name,
      upvotes: 0,
      status: "Under Review",
      sourceArea,
      tags: [],
      createdAt: "Just now"
    };
    fileTopicRequest(request.title);
    setRequests((current) => [request, ...current]);
    setTitle("");
    setDesc("");
    setMessage("Request received. Status changes will appear here and in Notifications.");
  }

  function withdraw(id: string) {
    setRequests((current) => current.map((request) => request.id === id ? { ...request, status: "Withdrawn" } : request));
    withdrawTopicRequest(id);
  }

  return (
    <Page kind="sink" kicker="Curriculum" title="Topic requests" lead="Ask for material you need. This private view shows only your own requests and their current status.">
      <Card>
        <CardHeader title="Request a topic" icon="inbox" />
        <div className="request-form">
          <label className="field"><span className="meta">Topic</span><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Raft consensus in Go" /></label>
          <label className="field"><span className="meta">What should the material help you learn?</span><textarea value={desc} onChange={(event) => setDesc(event.target.value)} placeholder="Describe the concepts or practice outcome..." /></label>
          <label className="field request-form__area">
            <span className="meta">Area</span>
            <select value={sourceArea} onChange={(event) => setSourceArea(event.target.value as typeof sourceArea)}>
              <option value="Courses">Courses</option><option value="Challenges">Challenges</option><option value="Assessments">Assessments</option><option value="CodeLab">Code Lab</option><option value="Projects">Projects</option>
            </select>
          </label>
          <button className="btn btn--primary" type="button" disabled={title.trim().length < 3} onClick={submit}>Submit request</button>
        </div>
        {message ? <p className="form-message" role="status">{message}</p> : null}
      </Card>

      <section className="request-history" aria-labelledby="your-requests-title">
        <div><p className="micro">Private history</p><h2 id="your-requests-title">Your requests</h2></div>
        <div className="list">
          {requests.map((request) => (
            <article className="list-row" key={request.id}>
              <div><strong>{request.title}</strong><p className="meta">{request.createdAt}</p></div>
              <div className="request-status">
                <span className="chip chip--quiet">{request.status}</span>
                {request.status === "Under Review" ? <button className="btn btn--quiet" type="button" onClick={() => withdraw(request.id)}>Withdraw</button> : null}
              </div>
            </article>
          ))}
        </div>
      </section>
    </Page>
  );
}

export function Help() {
  return (
    <Page kind="sink" kicker="Support" title="Help & Knowledge Base" lead="This prototype has no live support queue. Honest empty states, not a simulated bot.">
      <div className="sink__grid">
        {HELP_TOPICS.map((t) => (
          <Card key={t.id}>
            <CardHeader title={t.title} icon="info" />
            <p className="page__lead">{t.body}</p>
          </Card>
        ))}
      </div>
      <Card>
        <StateBlock state="unavailable" message="There is no Labs contact queue. When a person needs a human, the product points at the main site's contact route and nothing else." />
        <div className="row" style={{ marginTop: "var(--space-4)" }}>
          <Link className="btn btn--secondary" to="/requests">Community Topic Requests</Link>
          <Link className="btn btn--quiet" to="/honesty">Honesty States (PRODUCT.md §10)</Link>
          <Link className="btn btn--quiet" to="/">Return Home</Link>
        </div>
      </Card>
    </Page>
  );
}

export function HonestyPage() {
  const absences = [
    ["Not enough evidence", "The platform withholds a judgement and names what is still needed."],
    ["Nothing yet", "The learner genuinely has not done this; the invitation stays local to the surface."],
    ["Unavailable", "The platform cannot tell right now. A safe retry appears only where it is useful."],
    ["Genuinely empty library", "The material has not been authored; no placeholder or coming-soon card appears."]
  ] as const;
  const edges = [
    ["Not found", "The same answer covers missing, hidden, and someone else's object."],
    ["Unavailable", "A temporary dependency failed."],
    ["Archived or changed", "History stays readable while new starts point to the current destination."],
    ["Conflict", "Durable and unsaved local state are both preserved."],
    ["Duplicate or replay", "The existing durable result is returned without a second effect."],
    ["Partial success", "The surface says exactly what committed and what did not."]
  ] as const;
  return (
    <Page kind="sink" kicker="Platform reference" title="Honest states" lead="Four honest absences and six workflow edge states. Similar-looking situations never borrow one another's copy.">
      <section><p className="micro">Honest absences</p><div className="sink__grid">{absences.map(([title, copy]) => <Card key={title}><CardHeader title={title} icon="inbox" /><p className="page__lead">{copy}</p></Card>)}</div></section>
      <section><p className="micro">Workflow edge states</p><div className="sink__grid">{edges.map(([title, copy]) => <Card key={title}><CardHeader title={title} icon="alert" /><p className="page__lead">{copy}</p></Card>)}</div></section>
    </Page>
  );
}

export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";

  const courses = COURSES.filter((c) => c.title.toLowerCase().includes(q.toLowerCase()));
  const challenges = CHALLENGES.filter((c) => c.title.toLowerCase().includes(q.toLowerCase()));
  const papers = MOCKS.filter((m) => m.title.toLowerCase().includes(q.toLowerCase()));
  const companies = COMPANIES.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()));
  const empty = q.length > 0 && courses.length + challenges.length + papers.length + companies.length === 0;

  return (
    <Page kind="sink" kicker="Find" title="Search" lead="Search is local to named destinations and catalogue titles in this prototype.">
      <label className="field">
        <span className="meta">Query</span>
        <input
          value={q}
          onChange={(e) => setParams(e.target.value ? { q: e.target.value } : {})}
          placeholder="Courses, challenges, papers…"
        />
      </label>
      {q.length === 0 ? (
        <StateBlock state="empty" message="Type a query. Destinations also live in the header palette." />
      ) : empty ? (
        <StateBlock state="empty" message="Nothing named that in this prototype." />
      ) : (
        <div className="list">
          {courses.map((c) => (
            <Link key={c.id} className="list-row" to={`/courses/${c.id}`}><div><strong>{c.title}</strong><p className="meta">Course</p></div></Link>
          ))}
          {challenges.map((c) => (
            <Link key={c.id} className="list-row" to={`/challenges/${c.id}`}><div><strong>{c.title}</strong><p className="meta">Challenge</p></div></Link>
          ))}
          {papers.map((m) => (
            <Link key={m.id} className="list-row" to={`/mock/${m.id}`}><div><strong>{m.title}</strong><p className="meta">Mock paper</p></div></Link>
          ))}
          {companies.map((c) => (
            <Link key={c.id} className="list-row" to={`/company/${c.id}`}><div><strong>{c.name}</strong><p className="meta">Company</p></div></Link>
          ))}
        </div>
      )}
    </Page>
  );
}

export function RestrictedPage() {
  return (
    <Page kind="sink" kicker="Safety & Access" title="Account Access Restricted" lead="Access to interactive learning sandboxes has been restricted per platform safety covenant.">
      <Card>
        <StateBlock state="refused" message="Account standing: Suspended. Automated test execution and metered assistance actions are refused." />
        <div style={{ margin: "var(--space-4) 0", padding: "12px 16px", borderRadius: "var(--radius-sm)", background: "var(--c-surface-inset)", fontSize: "12px", color: "var(--c-text-muted)" }}>
          <strong style={{ color: "var(--c-text-primary)" }}>Moderation Appeal Policy: </strong>
          To appeal a standing decision, please refer to the primary site support channel.
        </div>
        <div className="row">
          <Link className="btn btn--primary" to="/">Return to Overview</Link>
          <Link className="btn btn--secondary" to="/help">Help & Knowledge Base</Link>
        </div>
      </Card>
    </Page>
  );
}

export function NotFound() {
  return (
    <Page kind="sink" kicker="Not found" title="This address does not exist" lead="The same response is used for missing, hidden, and inaccessible records.">
      <Card>
        <div className="route-not-found">
          <span><Icon name="search" size={24} /></span>
          <div><h2>We could not find that page</h2><p>No information about another record or account is revealed.</p></div>
          <Link className="btn btn--primary" to="/">Dashboard</Link>
        </div>
      </Card>
    </Page>
  );
}


/** The learner's own name for their companion (AST-R34): 2–32 displayed characters, plain text; Reset restores WizBit. */
function CompanionNameField({ value }: { value: string }) {
  const [draft, setDraft] = useState(value);
  const [note, setNote] = useState<string | null>(null);
  useEffect(() => { setDraft(value); }, [value]);
  const shown = value.trim() || "WizBit";
  const save = () => {
    const trimmed = Array.from(draft).filter((ch) => { const c = ch.charCodeAt(0); return c >= 32 && c !== 127 && ch !== "<" && ch !== ">"; }).join("").trim();
    const length = Array.from(trimmed).length;
    if (length === 0) { setNote("An empty name is not saved — " + shown + " stays."); setDraft(value); return; }
    if (length < 2 || length > 32) { setNote("A name is 2 to 32 characters. " + shown + " stays."); return; }
    if (/^(staff|admin|administrator|wizly|wizly labs|instructor|support)$/i.test(trimmed)) { setNote("That label is reserved. " + shown + " stays."); return; }
    updateUserSettings({ companionName: trimmed });
    setNote(null);
  };
  return (
    <div className="preference-row">
      <div>
        <strong>Name</strong>
        <p className="micro">Shown wherever the companion is drawn. Changes the name only — never the artwork, the expressions or what it does. Currently <b>{shown}</b>.</p>
        {note ? <p className="micro" role="status">{note}</p> : null}
      </div>
      <div className="row">
        <label className="field" style={{ margin: 0 }}>
          <span className="meta">Companion name</span>
          <input value={draft} maxLength={40} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); save(); } }} placeholder="WizBit" />
        </label>
        <button className="btn btn--secondary" type="button" onClick={save} disabled={draft.trim() === value.trim()}>Save</button>
        <button className="btn btn--quiet" type="button" onClick={() => { updateUserSettings({ companionName: "" }); setDraft(""); setNote(null); }} disabled={!value}>Reset to WizBit</button>
      </div>
    </div>
  );
}
