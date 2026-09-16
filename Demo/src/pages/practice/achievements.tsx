/**
 * achievements — the fixed catalogue; unlocked state derives from the real
 * device records where the demo holds them, never a blanket `unlocked: true`.
 */

import { Card, CardHeader } from "@components/Card";
import { Page } from "@components/Page";
import { ACHIEVEMENTS } from "@data/catalog";
import { useStore } from "@state/useStore";

export function AchievementsPage() {
  const store = useStore();
  const unlocked = ACHIEVEMENTS.map((a) => {
    if (a.id === "mock-complete") return { ...a, unlocked: store.mockResults.length > 0 };
    if (a.id === "course-done") return { ...a, unlocked: store.completedLessons.length >= 2 };
    if (a.id === "first-solve") return { ...a, unlocked: store.solved.length > 0 };
    if (a.id === "week-streak") return { ...a, unlocked: store.profile.streak >= 7 };
    /* "Bug Hunter — fix 3 debug cases" reads the real resolved set. */
    if (a.id === "debug-detective") return { ...a, unlocked: store.debugResolved.length >= 3 };
    return a;
  });
  return (
    <Page kind="sink" kicker="Other" title="Achievements" lead="A fixed catalogue. Unlocked state is local. Nobody is ranked against you.">
      <div className="sink__grid">
        {unlocked.map((a) => (
          <Card key={a.id}>
            <CardHeader title={a.title} icon="achievements" />
            <p className="page__lead">{a.detail}</p>
            <p className="meta">{a.unlocked ? "Unlocked" : "Not yet"}</p>
          </Card>
        ))}
      </div>
    </Page>
  );
}
