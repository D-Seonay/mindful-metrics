import { Button } from "@/components/ui/button";
import { ArrowRight, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-slate-950 px-4 pt-16">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <div className="container relative z-10 mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-slate-900/50 border border-slate-800 backdrop-blur-sm animate-fade-in">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          <span className="text-sm font-medium text-slate-300">Cognitive Performance Tracker</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 animate-fade-in [animation-delay:200ms]">
          Sharpen Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Mental Agility</span>
        </h1>

        <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 mb-10 animate-fade-in [animation-delay:400ms]">
          Measure and improve your reaction time, typing speed, and precision with our suite of professional cognitive tools.
          Track your progress and enhance your focus.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in [animation-delay:600ms]">
          <Button 
            size="lg" 
            className="w-full sm:w-auto text-lg px-8 py-6 bg-blue-600 hover:bg-blue-700 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] border-0"
            onClick={() => navigate('/reflexes')}
          >
            Start Measuring
            <Activity className="ml-2 h-5 w-5" />
          </Button>
          
          <Button 
            variant="outline" 
            size="lg"
            className="w-full sm:w-auto text-lg px-8 py-6 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
            onClick={() => navigate('/profile')}
          >
            View Dashboard
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}
