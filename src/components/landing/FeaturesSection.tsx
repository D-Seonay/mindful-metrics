import { Timer, Target, BarChart2, Settings, Zap, Activity } from "lucide-react";

const features = [
  {
    icon: Timer,
    title: "Speed Challenge",
    description: "Measure your processing speed under pressure. Complete tasks against the clock to test mental efficiency.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20"
  },
  {
    icon: Activity,
    title: "Precision Control",
    description: "Enhance your fine motor skills and hand-eye coordination with high-precision pointing tasks.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20"
  },
  {
    icon: Target,
    title: "Dynamic Focus",
    description: "Track moving objectives to improve sustained attention and visual tracking capabilities.",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20"
  },
  {
    icon: BarChart2,
    title: "Performance Analytics",
    description: "Visualize your progress with detailed charts. Track reaction time trends and accuracy improvements over time.",
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20"
  },
  {
    icon: Zap,
    title: "Reflex Analysis",
    description: "Pure reaction time testing. Measure the raw speed of your visual-motor response in milliseconds.",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20"
  },
  {
    icon: Settings,
    title: "Customizable Experience",
    description: "Tailor the difficulty and parameters to match your current skill level and training goals.",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20"
  }
];

export function FeaturesSection() {
  return (
    <section className="py-24 bg-slate-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Comprehensive <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Performance Metrics</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            A complete toolkit to analyze and improve your cognitive capabilities. 
            Data-driven insights for self-improvement.
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