/**
 * Practice — the learner's practice surfaces, split by domain.
 *
 * The implementations live under ./practice (challenges, tracks, the one solve
 * workbench, solutions, projects, achievements), ./daily (the product-date
 * Daily) and ./debug (the case board and the case file). This file stays the
 * historical import address so existing route imports keep resolving.
 */

export {
  Challenges,
  ChallengeHistory,
  RandomChallenge
} from "./practice/challenges";
export { ChallengesDashboard, TrackDetail } from "./practice/tracks";
export { ChallengeSolve } from "./practice/solve";
export { Solutions, SolutionDetail } from "./practice/solutions";
export {
  Projects,
  ProjectNew,
  ProjectTemplates,
  ProjectWorkspace
} from "./practice/projects";
export { AchievementsPage } from "./practice/achievements";
export { Daily, DailyArchive } from "./daily/DailyPages";
export { Debug } from "./debug/DebugBoard";
export { DebugSolve } from "./debug/DebugSolve";
