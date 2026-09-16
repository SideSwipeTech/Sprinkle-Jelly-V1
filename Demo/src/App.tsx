import { Component, useEffect, type ErrorInfo, type ReactNode } from "react";
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { ChargeDefs } from "@icons/Icon";
import { useAmbientTracking, useMagnetic, useScrollReveal } from "@foundation/motion";
import { Shell } from "@nav/Shell";
import { Dashboard } from "@pages/Dashboard";
import { KitchenSink } from "@pages/kitchen-sink/KitchenSink";
import { DemoLanding, DemoBanner, trackDemoEvent } from "@demo/index";
import { DEMO_ADMIN_ENABLED } from "@demo/config";
import "@demo/demo.css";
import {
  Courses,
  CourseDetail,
  LessonReader,
  Skills,
  SkillDetail,
  CodeLab,
  CourseQuiz,
  CourseProject,
  CourseChanges,
  VideoLesson,
  ProgressPage,
  GoalsPage,
  RecapPage
} from "@pages/Learn";
import {
  Challenges,
  ChallengesDashboard,
  ChallengeSolve,
  ChallengeHistory,
  RandomChallenge,
  Solutions,
  SolutionDetail,
  Daily,
  DailyArchive,
  Debug,
  DebugSolve,
  Projects,
  ProjectNew,
  ProjectTemplates,
  ProjectWorkspace,
  TrackDetail,
  AchievementsPage
} from "@pages/Practice";
import {
  AssessmentHome,
  AssessmentBrowse,
  AssessmentHistory,
  MockBriefing,
  MockSitting,
  MockResult,
  MockPractice,
  CompanyDetail,
  CompanyBriefing,
  CompanyStart,
  CompanySitting,
  CompanyResult,
  CompanyPractice
} from "@pages/Assess";
import {
  Notifications,
  NotificationPreferences,
  Settings,
  Profile,
  Certificates,
  CertificateVerify,
  Help,
  RequestsPage,
  HonestyPage,
  SearchPage,
  RestrictedPage,
  NotFound
} from "@pages/Account";
import { AdminRoutes } from "@admin/AdminRoutes";
import {
  SkillEvidence,
  DailySolve,
  MockStart,
  CompanyRedo,
  SubjectComplete,
  RecapYear,
  ErrorStates,
  StatsExplainer
} from "@pages/More";

class AppErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("A product surface failed to render.", error, info.componentStack);
  }

  render() {
    if (this.state.failed) {
      return (
        <section className="app-error" role="alert">
          <p className="micro">Unavailable</p>
          <h1>We could not load this area</h1>
          <p>Your previously shown information has not been replaced with zeros or sample data.</p>
          <button className="btn btn--primary" type="button" onClick={() => window.location.reload()}>Try again</button>
        </section>
      );
    }
    return this.props.children;
  }
}

function Layout() {
  const location = useLocation();
  useAmbientTracking();
  useMagnetic();
  useScrollReveal(location.pathname);
  return (
    <>
      <DemoBanner />
      <Shell>
        <AppErrorBoundary><Outlet /></AppErrorBoundary>
      </Shell>
    </>
  );
}

export function App() {
  useEffect(() => {
    trackDemoEvent("demo_started");
  }, []);

  return (
    <BrowserRouter>
      <ChargeDefs />
      <Routes>
        <Route
          path="/admin/*"
          element={DEMO_ADMIN_ENABLED ? <AdminRoutes /> : <Navigate to="/" replace />}
        />
        <Route path="/demo" element={<DemoLanding />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/skills" element={<Skills />} />
          <Route path="/skills/:skillId/evidence" element={<SkillEvidence />} />
          <Route path="/skills/:skillId" element={<SkillDetail />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/goals" element={<GoalsPage />} />
          <Route path="/recap/year" element={<RecapYear />} />
          <Route path="/recap" element={<RecapPage />} />
          <Route path="/stats" element={<StatsExplainer />} />
          <Route path="/error-states" element={<ErrorStates />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/notifications/preferences" element={<NotificationPreferences />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/video/:videoId" element={<VideoLesson />} />
          <Route path="/courses/:courseId" element={<CourseDetail />} />
          <Route path="/courses/:courseId/quiz" element={<CourseQuiz />} />
          <Route path="/courses/:courseId/project" element={<CourseProject />} />
          <Route path="/courses/:courseId/changes" element={<CourseChanges />} />
          <Route path="/courses/:courseId/complete" element={<SubjectComplete />} />
          <Route path="/courses/:courseId/lessons/:lessonId" element={<LessonReader />} />
          <Route path="/codelab" element={<CodeLab />} />
          <Route path="/workspace" element={<Projects />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/challenges/dashboard" element={<ChallengesDashboard />} />
          <Route path="/challenges/random" element={<RandomChallenge />} />
          <Route path="/challenges/history" element={<ChallengeHistory />} />
          <Route path="/challenges/:challengeId" element={<ChallengeSolve />} />
          <Route path="/tracks/:trackId" element={<TrackDetail />} />
          <Route path="/solutions" element={<Solutions />} />
          <Route path="/solutions/:solutionId" element={<SolutionDetail />} />
          <Route path="/daily" element={<Daily />} />
          <Route path="/daily/archive" element={<DailyArchive />} />
          <Route path="/daily/solve" element={<DailySolve />} />
          <Route path="/daily/:dayId" element={<DailySolve />} />
          <Route path="/debug" element={<Debug />} />
          <Route path="/debug/:caseId" element={<DebugSolve />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/new" element={<ProjectNew />} />
          <Route path="/projects/templates" element={<ProjectTemplates />} />
          <Route path="/projects/:projectId" element={<ProjectWorkspace />} />
          <Route path="/assessments" element={<AssessmentHome />} />
          <Route path="/assessments/browse" element={<AssessmentBrowse />} />
          <Route path="/assessments/history" element={<AssessmentHistory />} />
          <Route path="/mock" element={<Navigate to="/assessments" replace />} />
          <Route path="/mock/browse" element={<Navigate to="/assessments/browse" replace />} />
          <Route path="/mock/history" element={<Navigate to="/assessments/history" replace />} />
          <Route path="/mock/:paperId" element={<MockBriefing />} />
          <Route path="/mock/:paperId/start" element={<MockStart />} />
          <Route path="/mock/:paperId/sitting" element={<MockSitting />} />
          <Route path="/mock/:paperId/result" element={<MockResult />} />
          <Route path="/mock/:paperId/practice" element={<MockPractice />} />
          <Route path="/company" element={<Navigate to="/assessments/browse" replace />} />
          <Route path="/company/dashboard" element={<Navigate to="/assessments" replace />} />
          <Route path="/company/history" element={<Navigate to="/assessments/history" replace />} />
          <Route path="/company/:companyId" element={<CompanyDetail />} />
          <Route path="/company/:companyId/redo" element={<CompanyRedo />} />
          <Route path="/company/:companyId/briefing" element={<CompanyBriefing />} />
          <Route path="/company/:companyId/start" element={<CompanyStart />} />
          <Route path="/company/:companyId/sitting" element={<CompanySitting />} />
          <Route path="/company/:companyId/result" element={<CompanyResult />} />
          <Route path="/company/:companyId/practice" element={<CompanyPractice />} />
          <Route path="/achievements" element={<AchievementsPage />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/certificates" element={<Certificates />} />
          <Route path="/certificates/:certId/verify" element={<CertificateVerify />} />
          <Route path="/help" element={<Help />} />
          <Route path="/requests" element={<RequestsPage />} />
          <Route path="/honesty" element={<HonestyPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/restricted" element={<RestrictedPage />} />
          <Route path="/kitchen-sink" element={<KitchenSink />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
