import { Link } from "react-router-dom";
import { Card, CardHeader, Stat, StateBlock } from "@components/Card";
import { Charge, ChargeRing } from "@components/Charge";
import { ActivityHeatmap } from "@components/ActivityHeatmap";
import { Icon } from "@icons/Icon";
import { ACHIEVEMENTS, CHALLENGES, DAILY, LESSONS, NOTIFICATIONS, TRACKS } from "@data/catalog";
import { useStore } from "@state/useStore";
import { updateScratchpad } from "@state/store";
import { useState, useMemo } from "react";
import "./home.css";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function Dashboard() {
  const store = useStore();
  const lesson = LESSONS.find((l) => l.id === store.continue?.lessonId);
  const [note, setNote] = useState(store.scratchpad);
  const p = store.profile;
  const levelProgress = Math.round((1 - p.xpToNext / (p.xpToNext + 1200)) * 100);

  // Dynamic recent activity derived from store.solved
  const recentActivity = useMemo(() => {
    const defaultIds = store.solved.length > 0 ? store.solved : ["two-sum", "balanced-brackets"];
    return defaultIds.slice(-3).reverse().map((id, idx) => {
      const challenge = CHALLENGES.find((c) => c.id === id);
      const when = idx === 0 ? "Just now" : idx === 1 ? "Yesterday" : `${idx + 1}d ago`;
      return {
        id,
        title: challenge ? challenge.title : id,
        difficulty: challenge?.difficulty ?? "Medium",
        language: challenge?.tags[0] ?? "Python",
        when
      };
    });
  }, [store.solved]);

  return (
    <div className="home">
      <header className="home__hero enter" data-reveal="" style={{ ["--enter-index" as string]: 0 }}>
        <div className="home__greeting">
          <p className="micro">{greeting()}</p>
          <h1 className="display home__name" data-scramble="">
            {store.session.name}
          </h1>
          <p className="home__sub">
            {p.streak}-day streak · {store.solved.length} lifetime solved
          </p>
        </div>
        <div className="home__record">
          <ChargeRing
            value={levelProgress}
            label="Level progress"
            caption="Level"
            centre={String(p.level)}
            size={112}
          />
          <div className="home__record-stats">
            <Stat label="XP to next level" value={p.xpToNext} icon="zap" />
            <Stat label="Total XP" value={p.xp.toLocaleString()} icon="target" />
          </div>
        </div>
      </header>

      <div className="home__grid">
        {/* Region 2: Continue Resolver (PRG.CONT.01) */}
        {store.continue && lesson ? (
          <Card live index={1} className="home__continue" addr="PRG.CONT.01">
            <CardHeader
              eyebrow="Continue"
              title={lesson.title}
              icon="lessons"
              scale="hero"
              action={
                <Link className="btn btn--primary" to={`/courses/${store.continue.courseId}/lessons/${lesson.id}`}>
                  Resume
                </Link>
              }
            />
            <p className="home__meta">Foundations of Python · {store.continue.percent}% through</p>
            <Charge value={store.continue.percent} label="Course progress" asOf="this device" />
          </Card>
        ) : (
          <Card index={1} className="home__continue" addr="PRG.CONT.01">
            <CardHeader eyebrow="Continue" title="Nothing in progress" icon="lessons" />
            <StateBlock
              state="empty"
              message="No eligible item in progress. Open the catalogue to start an interactive path."
              action={<Link className="btn btn--secondary" to="/courses">Browse Courses</Link>}
            />
          </Card>
        )}

        {/* Region 3: Daily Challenge (DLY.TODAY.01) */}
        <Card live index={2} addr="DLY.TODAY.01">
          <CardHeader eyebrow="Daily challenge" title={DAILY.title} icon="daily" />
          <div className="home__chips">
            <span className="chip">{DAILY.difficulty}</span>
            {DAILY.languages.slice(0, 3).map((l) => (
              <span className="chip" key={l}>{l}</span>
            ))}
          </div>
          <p className="home__meta">{DAILY.blurb}</p>
          <Link className="btn btn--secondary home__cta" to="/daily/solve">
            <Icon name="play" size={15} /> Start today's challenge
          </Link>
        </Card>

        {/* Region 4: Curated Suggestion Slot (PRG.SUGG.01) */}
        {store.adminSuggestion ? (
          <Card index={3} addr="PRG.SUGG.01">
            <CardHeader eyebrow="Curated recommendation" title={store.adminSuggestion.item} icon="star" />
            <p className="home__meta">{store.adminSuggestion.line}</p>
            <div style={{ marginTop: "var(--space-3)" }}>
              <Link className="btn btn--quiet" to="/courses/python-foundations">Open course path →</Link>
            </div>
          </Card>
        ) : null}

        {/* Region 5: Quick Launch (PRG.LNCH.01) */}
        <Card index={4} className="home__launch" addr="PRG.LNCH.01">
          <CardHeader eyebrow="Quick launch" title="Jump in" icon="zap" />
          <div className="home__tiles">
            {[
              { to: "/challenges", icon: "challenges" as const, label: "Challenges" },
              { to: "/codelab", icon: "codelab" as const, label: "Code Lab" },
              { to: "/debug", icon: "debug" as const, label: "Debug Detective" },
              { to: "/projects", icon: "projects" as const, label: "Projects" }
            ].map((t) => (
              <Link key={t.to} to={t.to} className="tile">
                <Icon name={t.icon} size={22} treatment="plate" />
                <span>{t.label}</span>
              </Link>
            ))}
          </div>
        </Card>

        {/* Region 6: Achievements & Track Milestones (PRG-F9) */}
        <Card index={5} addr="PRG.GOAL.01">
          <CardHeader
            eyebrow="Milestones"
            title="Achievements"
            icon="target"
            action={<Link className="btn btn--quiet" to="/achievements">All ({ACHIEVEMENTS.length}) →</Link>}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {ACHIEVEMENTS.slice(0, 3).map((a) => (
                <span key={a.id} className="chip" style={{ fontSize: "11px", background: "rgba(99, 102, 241, 0.12)", color: "var(--c-accent-primary)" }}>
                  <Icon name="target" size={12} />
                  <span>{a.title}</span>
                </span>
              ))}
            </div>
            <div className="home__goals" style={{ marginTop: "4px" }}>
              {TRACKS.slice(0, 2).map((g) => (
                <Charge key={g.id} value={Math.round((g.done / g.count) * 100)} label={`${g.title} (${g.done}/${g.count})`} />
              ))}
            </div>
          </div>
        </Card>

        {/* Region 7: Quick Note (NTS.QUICK.01) */}
        <Card index={6} addr="NTS.QUICK.01">
          <CardHeader eyebrow="Quick note" title="Jot something down" icon="sticky-note" />
          <textarea
            className="home__note"
            rows={4}
            value={note}
            maxLength={50000}
            onChange={(event) => {
              setNote(event.target.value);
              updateScratchpad(event.target.value);
            }}
            placeholder="Capture an invariant, question, or next step..."
            aria-label="Quick Notes"
          />
          <div className="note-inline-meta">
            <span><Icon name="check" size={13} /> Autosaved to your private scratchpad</span>
            <span>{note.length.toLocaleString()} / 50,000</span>
          </div>
        </Card>

        {/* Region 8: Dynamic Recent Activity (SOL.RECENT.01) */}
        <Card index={7} className="home__recent" addr="SOL.RECENT.01">
          <CardHeader
            eyebrow="Recent activity"
            title="Accepted solutions"
            icon="solutions"
            action={<Link className="btn btn--quiet" to="/solutions">All ({store.solved.length}) →</Link>}
          />
          {recentActivity.length === 0 ? (
            <StateBlock state="empty" message="No accepted solutions stored on this device." />
          ) : (
            <ul className="home__list">
              {recentActivity.map((item) => (
                <li key={item.id} className="home__row">
                  <Icon name="check" size={16} />
                  <Link to={`/solutions/${item.id}`} className="home__row-title" style={{ textDecoration: "none" }}>
                    {item.title}
                  </Link>
                  <span className="chip chip--quiet">{item.difficulty}</span>
                  <span className="home__row-when">{item.when}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Region 9: Visual Activity Heatmap & Rhythm (PRG.RHYTHM.01, PRG-F7) */}
        <Card index={8} className="home__activity" addr="PRG.RHYTHM.01">
          <CardHeader eyebrow="Your rhythm" title="Activity history" icon="grid" />
          <ActivityHeatmap />
        </Card>

        {/* Region 10: Announcements (NTF.ANN.01) */}
        <Card index={9} addr="NTF.ANN.01">
          <CardHeader eyebrow="Announcements" title="From the team" icon="notifications" action={<Link className="btn btn--quiet" to="/notifications">Inbox →</Link>} />
          <ul className="home__list">
            {NOTIFICATIONS.slice(0, 3).map((a) => (
              <li key={a.id} className="home__row">
                <Icon name="info" size={16} />
                <span className="home__row-title">{a.title}</span>
                <span className="home__row-when">{a.time}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Region 11: Seasonal Recap Teaser Banner (PRG-F27) */}
        <div style={{ borderRadius: "var(--radius-md)", overflow: "hidden" }}>
          <Card index={10} addr="PRG.RECAP.01">
            <CardHeader eyebrow="Seasonal Special" title="2026 Year in Review" icon="sparkles" />
            <p className="home__meta">Your annual reflective story: coder-type categorization, language distributions, and milestone timeline.</p>
            <div style={{ marginTop: "var(--space-3)" }}>
              <Link className="btn btn--secondary" to="/recap/year">Explore Your Recap Story →</Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

