import { Github, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="py-8 bg-slate-950 border-t border-slate-900">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xl text-white">Mindful<span className="text-blue-500">Metrics</span></span>
            <span className="text-slate-600">|</span>
            <span className="text-sm text-slate-500">© 2026 All rights reserved.</span>
          </div>
          
          <div className="flex items-center gap-6">
            <a 
              href="https://github.com/D-Seonay/mindful-metrics" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white transition-colors flex items-center gap-2"
            >
              <Github className="w-5 h-5" />
              <span>GitHub</span>
            </a>
            <div className="flex items-center gap-1 text-slate-400 text-sm">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-current animate-pulse" />
              <span>for self-improvement</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}