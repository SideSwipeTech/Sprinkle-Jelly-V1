/**
 * AchievementTile — one catalogue achievement.
 *
 * Extracted from Practice.tsx:1153-1159, where unlocked state was text alone
 * ("Unlocked" / "Not yet"). Now `data-locked` drives a real visual difference —
 * seal plate, dashed ground and lock glyph for locked; accent seal, check and
 * word for unlocked — so the state never rests on colour or phrasing alone.
 */

import { Card } from "@components/Card";
import { Icon } from "@icons/Icon";
import type { IconName } from "@icons/keyline";
import "./AchievementTile.css";

export interface AchievementTileProps {
  title: string;
  detail: string;
  unlocked: boolean;
  icon?: IconName;
  /** Words on the status line, e.g. "Unlocked on 16 Aug". */
  statusText?: string;
}

export function AchievementTile({ title, detail, unlocked, icon = "trophy", statusText }: AchievementTileProps) {
  return (
    <Card className="x-achievement-tile" data-locked={unlocked ? undefined : true}>
      <div className="x-achievement-tile__head">
        <span className="x-achievement-tile__seal" aria-hidden="true">
          <Icon name={unlocked ? icon : "lock"} size={22} treatment="plate" />
        </span>
        <div className="x-achievement-tile__heading">
          <h3 className="x-achievement-tile__title display">{title}</h3>
        </div>
      </div>
      <p className="x-achievement-tile__detail">{detail}</p>
      <p className="x-achievement-tile__status">
        <Icon name={unlocked ? "check" : "lock"} size={13} />
        {statusText ?? (unlocked ? "Unlocked" : "Not yet unlocked")}
      </p>
    </Card>
  );
}
