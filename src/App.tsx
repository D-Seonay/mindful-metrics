import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import ReflexTest from "./pages/ReflexTest";
import TypingTest from "./pages/TypingTest";
import TimePerceptionTest from "./pages/TimePerception";
import AimTrainer from "./pages/AimTrainer";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import ColorSensitivityTest from "./pages/ColorSensitivityTest";
import { Layout } from "./components/Layout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/reflexes" element={<Layout><ReflexTest /></Layout>} />
          <Route path="/typing" element={<Layout><TypingTest /></Layout>} />
          <Route path="/time-perception" element={<Layout><TimePerceptionTest /></Layout>} />
          <Route path="/aim-trainer" element={<Layout><AimTrainer /></Layout>} />
          <Route path="/profile" element={<Layout><Profile /></Layout>} />
          <Route path="/color-vision" element={<Layout><ColorSensitivityTest /></Layout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
