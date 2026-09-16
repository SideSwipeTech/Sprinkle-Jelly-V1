/**
 * HomeRow — state matrix for the Kitchen Sink.
 * `x-chip` is controls/Chip, referenced by class per contract §6.
 */

import type { ReactNode } from "react";
import { HomeList, HomeRow } from "./HomeRow";

export const states: { key: string; label: string; render: () => ReactNode }[] = [
  {
    key: "activity",
    label: "Recent activity (icon + linked title + chip + when) — Dashboard shape",
    render: () => (
      <HomeList label="Recent activity">
        <HomeRow icon="check" title="Two Sum" to="/solutions/two-sum" when="2h ago">
          <span className="x-chip x-chip--quiet">Easy</span>
        </HomeRow>
        <HomeRow icon="check" title="Balanced Brackets" to="/solutions/balanced-brackets" when="Yesterday">
          <span className="x-chip x-chip--quiet">Medium</span>
        </HomeRow>
        <HomeRow icon="check" title="LRU Cache" to="/solutions/lru-cache" when="Mon">
          <span className="x-chip x-chip--quiet">Hard</span>
        </HomeRow>
      </HomeList>
    )
  },
  {
    key: "announcements",
    label: "Announcements — info tone icon, plain title",
    render: () => (
      <HomeList label="Announcements">
        <HomeRow icon="info" iconTone="info" title="Mock paper M-210 published" when="Tue" />
        <HomeRow icon="info" iconTone="info" title="New course: Distributed Systems" when="Last week" />
      </HomeList>
    )
  },
  {
    key: "plain",
    label: "Plain text rows (enrolments, rule lines)",
    render: () => (
      <HomeList>
        <HomeRow title="Foundations of Python" />
        <HomeRow title="Network interruptions are recorded as events">
          <span className="x-chip">advisory</span>
        </HomeRow>
      </HomeList>
    )
  },
  {
    key: "tones",
    label: "Icon tones — success / accent / info / warning / muted",
    render: () => (
      <HomeList label="Icon tones">
        <HomeRow icon="check" iconTone="success" title="Recorded on the ledger" />
        <HomeRow icon="sparkles" iconTone="accent" title="Featured this week" />
        <HomeRow icon="info" iconTone="info" title="FYI only" />
        <HomeRow icon="alert" iconTone="warning" title="Expiring soon" />
        <HomeRow icon="history" iconTone="muted" title="Archived marker" />
      </HomeList>
    )
  },
  {
    key: "truncate",
    label: "Long title — ellipsis truncation",
    render: () => (
      <HomeList>
        <HomeRow
          icon="check"
          title="An intentionally overlong record title that has to truncate inside a narrow card rather than wrap the row"
          when="now"
        />
      </HomeList>
    )
  }
];
