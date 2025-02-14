
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import HomePage from "@/pages/HomePage";
import SafetyPage from "@/pages/SafetyPage";
import CalendarPage from "@/pages/CalendarPage";
import CarePage from "@/pages/CarePage";
import GoodsPage from "@/pages/GoodsPage";
import NotificationsPage from "@/pages/NotificationsPage";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./App.css";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/safety" element={<SafetyPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/care" element={<CarePage />} />
          <Route path="/goods" element={<GoodsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Routes>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
