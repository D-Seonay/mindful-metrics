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
import ColorMemory from "./pages/ColorMemory";
import CircleMemory from "./pages/CircleMemory";
import PeripheralVision from "./pages/PeripheralVision";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/reflexes" element={<ReflexTest />} />
          <Route path="/typing" element={<TypingTest />} />
          <Route path="/time-perception" element={<TimePerceptionTest />} />
          <Route path="/aim-trainer" element={<AimTrainer />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/color-vision" element={<ColorSensitivityTest />} />
          <Route path="/color-memory" element={<ColorMemory />} />
          <Route path="/circle-memory" element={<CircleMemory />} />
          <Route path="/peripheral-vision" element={<PeripheralVision />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
