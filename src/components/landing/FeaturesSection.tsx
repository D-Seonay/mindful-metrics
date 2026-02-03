import { Timer, Target, BarChart2, Settings, Zap, Crosshair } from "lucide-react";

const features = [
  {
    icon: Timer,
    title: "Time Attack",
    description: "Race against the clock to hit as many targets as possible. Test your speed and efficiency.",
    color: "text-fuchsia-500",
    bg: "bg-fuchsia-500/10",
    border: "border-fuchsia-500/20"
  },
  {
    icon: Crosshair,
    title: "Precision Training",
    description: "Focus on accuracy with shrinking targets and penalty zones. Perfect your micro-adjustments.",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20"
  },
  {
    icon: Target,
    title: "Moving Targets",
    description: "Track unpredictable targets moving across the screen. Improve your tracking and reaction time.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20"
  },
  {
    icon: BarChart2,
    title: "Advanced Analytics",
    description: "Visualise your progress with detailed charts. Track reaction time, accuracy, and score trends.",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20"
  },
  {
    icon: Zap,
    title: "Reflex Testing",
    description: "Pure reaction time testing. Measure the raw speed of your visual-motor response.",
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20"
  },
  {
    icon: Settings,
    title: "Full Customization",
    description: "Customize your experience with adjustable crosshairs, themes, and difficulty settings.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20"
  }
];

export function FeaturesSection() {
  return (
    <section className="py-24 bg-slate-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Elite <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-cyan-500">Training Features</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Everything you need to take your aim to the next level. Designed for gamers, by gamers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index}
              className={`p-6 rounded-2xl bg-slate-900/50 border ${feature.border} hover:bg-slate-900 transition-all duration-300 group`}
            >
              <div className={`w-12 h-12 rounded-lg ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
