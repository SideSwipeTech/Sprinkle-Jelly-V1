/**
 * routes — the challenge and track studios' list pages, mounted by the
 * administration registry as `{ChallengesRoutes()}` beside PracticeRoutes
 * (which already mounts `challenges/:id`, the shared editing space).
 *
 *   challenges         → the studio index — the honest list, lifecycle, delete
 *   challenges/review  → content review (a literal, outranking :id)
 *   tracks             → the track studio index
 *   tracks/:trackId    → a track's contents, reorder and audit trail
 */

import { Route } from "react-router-dom";
import { ChallengesIndex } from "./ChallengesIndex";
import { ChallengeReview } from "./ChallengeReview";
import { TracksIndex, TrackDetail } from "./TrackStudio";

export function ChallengesRoutes() {
  return (
    <>
      <Route path="challenges" element={<ChallengesIndex />} />
      <Route path="challenges/review" element={<ChallengeReview />} />
      <Route path="tracks" element={<TracksIndex />} />
      <Route path="tracks/:trackId" element={<TrackDetail />} />
    </>
  );
}
