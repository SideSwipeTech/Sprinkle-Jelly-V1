/**
 * The companion corner — one companion, one stream, two presentations.
 *
 * Hosted by the application frame (SHR-R55); a route renders none of this.
 * What it draws: the character (Sparky) as the page-guide trigger, the one
 * passing message on the stream, the page guide, and the door for guidance and
 * knowledge-base answers. What it never does: decide behaviour — presence comes
 * from the surface, presentation and volume from the learner's preferences,
 * moments from the surfaces that raise them.
 *
 * Suppressed renders nothing at all (AST-R9 — plain messages are not a bypass).
 * Quiet may render an idle character and starts nothing proactive.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Icon } from "@icons/Icon";
import type { IconName } from "@icons/keyline";
import { useStore } from "@state/useStore";
import { COURSES, LESSONS } from "@data/catalog";
import { createSparky } from "./sparky/sparky.js";
import { SparkyEngine } from "./sparky/engine.js";
import { subscribe, dismiss, canDismiss, pause, resume, setSuppressed, setQuiet, type Moment } from "./stream";
import { presenceFor, sequenceFor, chipsFor, guidanceFor, type GuideItem } from "./guide";
import { ask, parseGate, type KnowledgeResult } from "./knowledge";
import type { Tone } from "./moments";
import "./sparky/sparky.css";
import "./companion.css";

const TONE_ICON: Record<Tone, IconName> = {
  neutral: "message",
  informational: "info",
  encouraging: "sparkles",
  warning: "alert",
  serious: "shield"
};

const COMPACT = "(max-width: 599px)";

export function Companion() {
  const location = useLocation();
  const store = useStore();
  const settings = store.userSettings;
  const name = (settings.companionName || "WizBit").trim() || "WizBit";
  const presentation = settings.companion === "plain" ? "plain" : "companion";
  const surfacePresence = presenceFor(location.pathname);
  // Most-restrictive-wins: a quiet preference tightens a present surface; suppressed is unreachable from a preference.
  const presence = surfacePresence === "suppressed" ? "suppressed" : surfacePresence === "quiet" || settings.companionVolume === "quiet" ? "quiet" : "present";

  const [open, setOpen] = useState(false);
  const [moment, setMoment] = useState<Moment | null>(null);
  const [waiting, setWaiting] = useState(0);
  const [dismissable, setDismissable] = useState(false);
  const [compact, setCompact] = useState(() => window.matchMedia(COMPACT).matches);

  // ── Stream ──────────────────────────────────────────────────────────────
  useEffect(() => { setSuppressed(presence === "suppressed"); setQuiet(presence === "quiet"); }, [presence]);
  useEffect(() => subscribe((s) => { setMoment(s.current); setWaiting(s.queue.length); }), []);
  useEffect(() => {
    if (!moment) { setDismissable(false); return; }
    setDismissable(canDismiss());
    const id = window.setInterval(() => setDismissable(canDismiss()), 250);
    return () => window.clearInterval(id);
  }, [moment]);

  useEffect(() => {
    const mq = window.matchMedia(COMPACT);
    const on = () => setCompact(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  // ── Page guide (AST-R15): next item per activation, wraps, resets on surface change ──
  const sequence = useMemo(() => sequenceFor(location.pathname), [location.pathname]);
  const [cursor, setCursor] = useState(0);
  const [item, setItem] = useState<GuideItem | null>(null);
  useEffect(() => { setCursor(0); setItem(null); setOpen(false); setQuestion(""); setResult(null); }, [location.pathname]);

  const activate = useCallback(() => {
    if (sequence.length === 0) return;            // explicitly empty: activation does nothing
    const next = sequence[cursor % sequence.length] ?? null;
    setItem(next);
    setCursor((c) => c + 1);
    setOpen(true);
  }, [sequence, cursor]);

  // ── The door (AST-R18): guidance intents first, then the knowledge base ──
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<{ q: string; guidance: ReturnType<typeof guidanceFor>; kb: KnowledgeResult | null } | null>(null);
  const askDoor = useCallback((q: string) => {
    const text = q.trim();
    if (!text) return;
    const cont = store.continue;
    const lesson = cont ? LESSONS.find((l) => l.id === cont.lessonId) : null;
    const course = cont ? COURSES.find((c) => c.id === cont.courseId) : null;
    const guidance = guidanceFor(text, {
      continueLabel: lesson && course ? `${lesson.title} · ${course.title}` : null,
      continueTo: cont && lesson ? `/courses/${cont.courseId}/lessons/${cont.lessonId}` : null,
      streak: store.profile.streak,
      solved: store.profile.solvedCount,
      asOf: "this device, just now"
    });
    const kb = guidance ? null : ask(text, store.adminKnowledge, parseGate(store.assistant?.gate));
    setResult({ q: text, guidance, kb });
    setQuestion("");
  }, [store]);

  // ── Character ───────────────────────────────────────────────────────────
  const host = useRef<HTMLSpanElement>(null);
  const engine = useRef<SparkyEngine | null>(null);
  const showCharacter = presentation === "companion" && presence !== "suppressed";

  useEffect(() => {
    if (!showCharacter || !host.current) return;
    const rig = createSparky({ size: compact ? 72 : 96 });
    host.current.appendChild(rig.el);
    const eng = new SparkyEngine(rig, { reducedMotion: settings.reducedMotion ? true : null }).start();
    eng.enter();
    engine.current = eng;
    return () => { eng.destroy(); rig.el.remove(); engine.current = null; };
    // The rig is rebuilt only when the presentation or suppression changes; size and motion are updated below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCharacter]);

  useEffect(() => { engine.current?.rig.setSize(compact ? 72 : 96); }, [compact]);
  useEffect(() => { engine.current?.setReducedMotion(settings.reducedMotion ? true : null); }, [settings.reducedMotion]);

  // Expression follows the stream; the guide makes it attentive; quiet idles.
  useEffect(() => {
    const eng = engine.current;
    if (!eng) return;
    if (moment) {
      if (moment.def.celebrates) eng.react("celebrate");
      else if (moment.def.cls === "warning") eng.react("warning");
      else if (moment.def.tone === "serious") eng.setExpression("serious");
      else if (moment.def.cls === "success") { eng.setExpression("success"); eng.play("nod"); }
      else eng.setExpression(moment.def.expression);
      return;
    }
    eng.setExpression(open ? "attentive" : "neutral");
  }, [moment, open, showCharacter]);

  if (presence === "suppressed") return null;

  const onDismiss = () => { if (dismiss()) engine.current?.play("blink"); };
  const toneIcon = moment ? TONE_ICON[moment.def.tone] : "message";

  return (
    <div className={`companion companion--${presentation}`} data-presence={presence} data-companion-name={name}>
      {moment ? (
        <section
          className={`companion__moment companion__moment--${moment.def.tone} companion__moment--${moment.def.cls}`}
          role={moment.def.sticks ? "alert" : "status"}
          aria-live={moment.def.sticks ? "assertive" : "polite"}
          aria-atomic="true"
          onFocusCapture={pause}
          onBlurCapture={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) resume(); }}
        >
          <span className="companion__tone" aria-hidden="true"><Icon name={toneIcon} size={16} /></span>
          <div className="companion__words">
            <p className="companion__fact">{moment.fact}</p>
            {presentation === "companion" && moment.flourish ? <p className="companion__flourish">{moment.flourish}</p> : null}
            {waiting > 0 ? <p className="micro companion__waiting">{waiting} more waiting</p> : null}
          </div>
          <button className="icon-btn companion__dismiss" type="button" aria-label="Dismiss message" disabled={!dismissable} onClick={onDismiss}>
            <Icon name="x" size={14} />
          </button>
        </section>
      ) : null}

      {open ? (
        <section className="companion__panel" aria-label={`${name} guide`}>
          <header className="companion__head">
            <p className="micro">{name} · page guide</p>
            <button className="icon-btn" type="button" aria-label="Close guide" onClick={() => setOpen(false)}><Icon name="x" size={14} /></button>
          </header>
          {item ? (
            <p className={`companion__guide companion__guide--${item.kind}`}>
              {item.kind === "hint" ? <Icon name="sparkles" size={14} /> : null}
              {item.text}
            </p>
          ) : null}
          <div className="row companion__actions">
            <button className="btn btn--quiet" type="button" onClick={activate}>Next tip</button>
            <span className="micro companion__count">{Math.min(cursor, sequence.length)}/{sequence.length}</span>
          </div>

          <div className="companion__door">
            <p className="micro">Ask — guidance first, then how the product works</p>
            <div className="companion__chips">
              {chipsFor(location.pathname).map((c) => (
                <button key={c} className="chip" type="button" onClick={() => askDoor(c)}>{c}</button>
              ))}
            </div>
            <form className="companion__ask" onSubmit={(e) => { e.preventDefault(); askDoor(question); }}>
              <input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Type a question" aria-label={`Ask ${name}`} />
              <button className="btn btn--secondary" type="submit" disabled={!question.trim()}>Ask</button>
            </form>
            {result ? <DoorResult result={result} onRetry={() => askDoor(result.q)} /> : null}
          </div>
        </section>
      ) : null}

      {showCharacter ? (
        <button className="companion__trigger" type="button" aria-label={`${name}: open the page guide`} aria-expanded={open} onClick={() => (open ? setOpen(false) : activate())}>
          <span ref={host} className="companion__character" />
        </button>
      ) : (
        <button className="companion__button" type="button" aria-label={`${name}: open the page guide`} aria-expanded={open} onClick={() => (open ? setOpen(false) : activate())}>
          <Icon name="message" size={16} />
          <span>{name}</span>
        </button>
      )}
    </div>
  );
}

function DoorResult({ result, onRetry }: { result: { q: string; guidance: ReturnType<typeof guidanceFor>; kb: KnowledgeResult | null }; onRetry: () => void }) {
  const { guidance, kb } = result;
  if (guidance) {
    return (
      <div className="companion__answer" role="status">
        <p>{guidance.text}</p>
        {guidance.to ? <Link className="btn btn--quiet" to={guidance.to}>{guidance.toLabel ?? "Open"}</Link> : null}
      </div>
    );
  }
  if (!kb) return null;
  if (kb.kind === "answer") {
    return (
      <div className="companion__answer" role="status">
        <p className="micro">{kb.entry.title}</p>
        <p>{kb.entry.body}</p>
      </div>
    );
  }
  if (kb.kind === "no-match") {
    return (
      <div className="companion__answer companion__answer--nomatch" role="status">
        <p>I searched and found nothing good enough for that.</p>
        {kb.topics.length ? (
          <p className="micro">Did you mean: {kb.topics.join(" · ")}</p>
        ) : null}
        <Link className="btn btn--quiet" to="/requests">Request this topic</Link>
      </div>
    );
  }
  return (
    <div className="companion__answer companion__answer--unavailable" role="status">
      <p>The platform could not look just now. Guidance still answers what it can.</p>
      <button className="btn btn--quiet" type="button" onClick={onRetry}>Retry</button>
    </div>
  );
}
