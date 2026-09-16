import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Icon } from "@icons/Icon";
import { resetDemo } from "@state/store";
import { DEMO_SIGNUP_URL, DEMO_UPGRADE_URL, DEMO_STORAGE_KEY } from "./config";
import { trackDemoEvent } from "./analytics";

function acknowledge() {
  try {
    window.localStorage.setItem(DEMO_STORAGE_KEY, "1");
  } catch {
    /* ignore */
  }
}

function hasAcknowledged(): boolean {
  try {
    return window.localStorage.getItem(DEMO_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function DemoBanner() {
  const [dismissed, setDismissed] = useState(hasAcknowledged);
  const location = useLocation();

  useEffect(() => {
    trackDemoEvent("demo_feature_viewed", { path: location.pathname });
  }, [location.pathname]);

  if (dismissed) {
    return (
      <div className="demo-banner demo-banner--minimal">
        <span className="demo-banner__tag">Demo</span>
        <button
          type="button"
          className="demo-banner__reset"
          onClick={() => {
            trackDemoEvent("demo_reset_clicked");
            resetDemo();
            window.location.reload();
          }}
          title="Reset demo data"
        >
          <Icon name="reset" size={12} /> Reset
        </button>
      </div>
    );
  }

  return (
    <div className="demo-banner">
      <div className="demo-banner__content">
        <span className="demo-banner__tag">Demo</span>
        <p className="demo-banner__text">
          You are exploring a read-mostly demo. Data is local and fictional — no signup, no billing, no real customer data.
        </p>
        <div className="demo-banner__actions">
          <a
            className="btn btn--primary btn--sm"
            href={DEMO_SIGNUP_URL}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackDemoEvent("demo_signup_clicked", { label: "Get Started" })}
          >
            <Icon name="user" size={13} /> Get Started
          </a>
          <a
            className="btn btn--secondary btn--sm"
            href={DEMO_UPGRADE_URL}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackDemoEvent("demo_cta_clicked", { label: "Upgrade" })}
          >
            <Icon name="credits" size={13} /> Upgrade
          </a>
          <Link
            className="btn btn--quiet btn--sm"
            to="/demo"
            onClick={() => trackDemoEvent("demo_cta_clicked", { label: "Learn more" })}
          >
            Learn more
          </Link>
        </div>
      </div>
      <button
        type="button"
        className="demo-banner__close"
        aria-label="Dismiss demo banner"
        onClick={() => {
          acknowledge();
          setDismissed(true);
        }}
      >
        <Icon name="x" size={14} />
      </button>
    </div>
  );
}
