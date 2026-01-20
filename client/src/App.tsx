import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import DashboardLayout from "./layouts/dashboard-layout";
import { Toaster } from "@/components/ui/sonner";
import ProtectedRoute from "./components/protected-route";

export function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <Routes>
          {/*public routes*/}
          {/*Login & Forget Password*/}
          {/* Protected routes (Wrapped in Dashboard Layout) */}
          <Route element={<DashboardLayout />}>
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={["admin", "organizer", "member"]}
                />
              }
            >
            </Route>
            {/* Member & Organizer Routes */}
            <Route
              element={
                <ProtectedRoute allowedRoles={["organizer", "member"]} />
              }
            >
            </Route>

            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
              
            </Route>
            {/* Organizer Routes */}
            <Route element={<ProtectedRoute allowedRoles={["organizer"]} />}>
              
            </Route>
            {/* Member Routes */}
            <Route element={<ProtectedRoute allowedRoles={["member"]} />}>
              
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
