
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SupabaseProvider } from "./providers/SupabaseProvider";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Layout from "@/components/layout/MainContent";
import NeighborsPage from "@/pages/NeighborsPage";
import SettingsPage from "@/pages/SettingsPage";
import JoinPage from "@/pages/JoinPage";
import OnboardingPage from "@/pages/OnboardingPage";

const queryClient = new QueryClient();

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <SupabaseProvider>
          <QueryClientProvider client={queryClient}>
            <div className="absolute top-0 right-0 left-0 bottom-0 flex flex-col">
              <Routes>
                <Route
                  path="/"
                  element={<Index />}
                />
                <Route
                  path="/login"
                  element={<Login />}
                />
                <Route
                  path="/join/:inviteCode"
                  element={<JoinPage />}
                />
                <Route
                  path="/onboarding"
                  element={<OnboardingPage />}
                />
                {/* Protected routes requiring auth */}
                <Route
                  path="/"
                  element={<ProtectedRoute><Layout /></ProtectedRoute>}
                >
                  <Route path="/neighbors" element={<NeighborsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>
              </Routes>
            </div>
            <Toaster />
          </QueryClientProvider>
        </SupabaseProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
