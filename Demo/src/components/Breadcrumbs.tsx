import { Link, useLocation } from "react-router-dom";
import { COURSES, CHALLENGES, MOCKS, COMPANIES } from "@data/catalog";
import { Icon } from "@icons/Icon";

export function Breadcrumbs() {
  const location = useLocation();
  const path = location.pathname;

  if (path === "/") {
    return null;
  }

  const segments = path.split("/").filter(Boolean);
  const crumbs: { label: string; to?: string }[] = [{ label: "Home", to: "/" }];

  let accumulated = "";
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]!;
    accumulated += `/${seg}`;
    const isLast = i === segments.length - 1;

    // Smart label resolution
    let label = seg.charAt(0).toUpperCase() + seg.slice(1);

    if (seg === "courses" && !isLast) {
      label = "Courses";
      crumbs.push({ label, to: "/courses" });
      continue;
    } else if (segments[i - 1] === "courses") {
      const c = COURSES.find((x) => x.id === seg);
      label = c ? c.title : seg;
      crumbs.push({ label, to: isLast ? undefined : accumulated });
      continue;
    }

    if (seg === "challenges" && !isLast) {
      label = "Challenges";
      crumbs.push({ label, to: "/challenges" });
      continue;
    } else if (segments[i - 1] === "challenges") {
      const ch = CHALLENGES.find((x) => x.id === seg);
      label = ch ? ch.title : seg;
      crumbs.push({ label, to: isLast ? undefined : accumulated });
      continue;
    }

    if (seg === "mock" && !isLast) {
      label = "Mock paper";
      crumbs.push({ label, to: "/assessments" });
      continue;
    } else if (segments[i - 1] === "mock") {
      const m = MOCKS.find((x) => x.id === seg);
      label = m ? m.title : seg;
      crumbs.push({ label, to: isLast ? undefined : accumulated });
      continue;
    }

    if (seg === "company" && !isLast) {
      label = "Company paper";
      crumbs.push({ label, to: "/assessments" });
      continue;
    } else if (segments[i - 1] === "company") {
      const comp = COMPANIES.find((x) => x.id === seg);
      label = comp ? comp.name : seg;
      crumbs.push({ label, to: isLast ? undefined : accumulated });
      continue;
    }

    if (seg === "lessons") label = "Lessons";
    if (seg === "quiz") label = "Knowledge Check";
    if (seg === "sitting") label = "Live Sitting";
    if (seg === "result") label = "Scorecard";
    if (seg === "briefing") label = "Briefing";
    if (seg === "templates") label = "Starter Templates";
    if (seg === "requests") label = "Topic Requests";
    if (seg === "assessments") label = "Assessments";

    crumbs.push({ label, to: isLast ? undefined : accumulated });
  }

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb navigation" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--c-text-muted)", marginBottom: "var(--space-4)" }}>
      {crumbs.map((crumb, idx) => {
        const isLast = idx === crumbs.length - 1;
        return (
          <span key={idx} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            {idx > 0 ? <Icon name="chevron-right" size={10} /> : null}
            {isLast || !crumb.to ? (
              <span style={{ color: "var(--c-text-primary)", fontWeight: 600 }}>{crumb.label}</span>
            ) : (
              <Link to={crumb.to} style={{ color: "var(--c-text-muted)", textDecoration: "none" }} className="hover-underline">
                {crumb.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
