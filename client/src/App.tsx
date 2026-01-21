import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import DashboardLayout from "@/layouts/dashboard-layout";
import { Toaster } from "@/components/ui/sonner";
import ProtectedRoute from "@/components/protected-route";
import { useAuth } from "./hooks/use-auth";
import { LoginForm } from "@/components/content/login-form";
import ForgotPasswordPage from "@/components/content/forgot-password";
import { DashboardContent } from "@/components/content/dashboard-content";
import ProfilePage from "@/components/content/profile-page";
import ViewTeamPage from "@/components/content/view-team";
import { ViewUsers } from "@/components/content/view-users";
import TeamsPage from "@/components/content/team-content";
import VenuesPage from "@/components/content/admin/venues-page";
import { ProjectsContent } from "./components/content/admin/projects-content";
import AdminProjectDetails from "./components/content/admin/project-details-page";
import OrganizerProjects from "./components/content/organizer/organizer-projects";
import ProjectDashboard from "./components/content/organizer/event-dashboard";
import TaskManagerPage from "./components/content/organizer/task-manager-page";
import ApprovalsPage from "./components/content/organizer/approvals-page";
import MemberTasks from "./components/content/member/member-tasks";

export function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <p className="text-muted-foreground animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <Routes>
          {/*public routes*/}
          {/*Login & Forget Password*/}
          <Route
            path="/login"
            element={
              user ? (
                <Navigate to="/" replace />
              ) : (
                <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
                  <div className="w-full max-w-sm">
                    <LoginForm />
                  </div>
                </div>
              )
            }
          />
          <Route
            path="/forgot-password"
            element={
              user ? <Navigate to="/" replace /> : <ForgotPasswordPage />
            }
          />
          {/* Protected routes (Wrapped in Dashboard Layout) */}
          <Route element={<DashboardLayout />}>
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={["admin", "organizer", "member"]}
                />
              }
            >
              <Route path="/dashboard" element={<DashboardContent />} />

              <Route path="/profile" element={<ProfilePage />} />
            </Route>
            {/* Member & Organizer Routes */}
            <Route
              element={
                <ProtectedRoute allowedRoles={["organizer", "member"]} />
              }
            >
              <Route path="/view-team" element={<ViewTeamPage />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
              <Route path="/projects" element={<ProjectsContent />} />
              <Route path="/viewUsers" element={<ViewUsers />} />
              <Route path="/team" element={<TeamsPage />} />
              <Route path="/venues" element={<VenuesPage />} />
              <Route path="/admin/projects/:id" element={<AdminProjectDetails />} />
              {/* Admin Default Redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Route>

            {/* Organizer Routes */}
            <Route
              element={<ProtectedRoute allowedRoles={["organizer"]} />}>
            <Route path="/organizer/projects" element={<OrganizerProjects />} />
            <Route
                path="/organizer/projects/:id"
                element={<ProjectDashboard />}
              />
              <Route
                path="/organizer/events/:eventId/tasks"
                element={<TaskManagerPage />}
              />
              <Route path="/organizer/approvals" element={<ApprovalsPage />} />
              {/* Organizer Default Redirect */}
              <Route
                path="/"
                element={<Navigate to="/organizer/projects" replace />}
              />
            </Route>
            {/* Member Routes */}
            <Route
              element={<ProtectedRoute allowedRoles={["member"]} />}>

                <Route path="/member/tasks" element={<MemberTasks />} />

            </Route>
          </Route>
          {/* Catch all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" richColors />
    </ThemeProvider>
  );
}

export default App;
