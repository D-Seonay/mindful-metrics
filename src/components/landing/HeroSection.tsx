import { Button } from "@/components/ui/button";
import { ArrowRight, Crosshair } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-slate-950 px-4 pt-16">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-fuchsia-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <div className="container relative z-10 mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-slate-900/50 border border-slate-800 backdrop-blur-sm animate-fade-in">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <span className="text-sm font-medium text-slate-300">Next-Gen Aim Training</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 animate-fade-in [animation-delay:200ms]">
          Master Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-cyan-500">Aim</span>
        </h1>

        <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 mb-10 animate-fade-in [animation-delay:400ms]">
          Elevate your gaming performance with our advanced reflex and precision training tools. 
          Fast, precise, and data-driven.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in [animation-delay:600ms]">
          <Button 
            size="lg" 
            className="w-full sm:w-auto text-lg px-8 py-6 bg-fuchsia-600 hover:bg-fuchsia-700 text-white shadow-[0_0_20px_rgba(192,38,211,0.5)] border-0"
            onClick={() => navigate('/aim-trainer')}
          >
            Start Training
            <Crosshair className="ml-2 h-5 w-5" />
          </Button>
          
          <Button 
            variant="outline" 
            size="lg"
            className="w-full sm:w-auto text-lg px-8 py-6 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
            onClick={() => navigate('/profile')}
          >
            View Profile
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}
