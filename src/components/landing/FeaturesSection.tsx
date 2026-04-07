import { Zap, Timer, Target, MousePointerClick, Eye, Brain, Circle, Keyboard, ArrowRight } from "lucide-react";
import Link from "next/link";

const tests = [
  {
    icon: Zap,
    title: "Test de Réflexes",
    description: "Mesurez votre vitesse de réaction brute en millisecondes.",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    href: "/reflexes"
  },
  {
    icon: Keyboard,
    title: "Vitesse de Frappe",
    description: "Testez votre précision et votre rapidité au clavier (WPM).",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    href: "/typing"
  },
  {
    icon: MousePointerClick,
    title: "Aim Trainer",
    description: "Améliorez votre précision et votre vitesse de clic.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    href: "/aim-trainer"
  },
  {
    icon: Brain,
    title: "Mémoire des Couleurs",
    description: "Mémorisez des séquences de couleurs de plus en plus complexes.",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    href: "/color-memory"
  },
  {
    icon: Hourglass,
    title: "Perception du Temps",
    description: "Évaluez votre capacité à estimer des intervalles de temps.",
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
    href: "/time-perception"
  },
  {
    icon: Eye,
    title: "Vision Périphérique",
    description: "Entraînez votre champ de vision et votre attention spatiale.",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    href: "/peripheral-vision"
  },
  {
    icon: Circle,
    title: "Circle Memory",
    description: "Mémorisation spatiale et chromatique avancée.",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    href: "/circle-memory"
  },
  {
    icon: Target,
    title: "Sensibilité Couleurs",
    description: "Distinguez les nuances de couleurs les plus subtiles.",
    color: "text-pink-500",
    bg: "bg-pink-500/10",
    border: "border-pink-500/20",
    href: "/color-vision"
  }
];

import { Hourglass } from "lucide-react";

export function FeaturesSection() {
  return (
    <section className="py-24 bg-slate-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Outils de <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Performance Cognitive</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Une suite complète de tests pour analyser et améliorer vos capacités. 
            Suivez votre progression grâce à nos outils avancés.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tests.map((test, index) => (
            <Link 
              key={index}
              href={test.href}
              className={`p-6 rounded-2xl bg-slate-900/30 border ${test.border} hover:bg-slate-900/60 transition-all duration-500 group relative overflow-hidden`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className={`w-12 h-12 rounded-xl ${test.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                <test.icon className={`w-6 h-6 ${test.color}`} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                {test.title}
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                {test.description}
              </p>
              <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest pt-4 border-t border-white/5 group-hover:border-white/10 transition-colors">
                Lancer l'exercice
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}