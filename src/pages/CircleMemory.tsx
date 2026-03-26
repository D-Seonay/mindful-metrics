import { Layout } from "@/components/Layout";
import CircleMemoryTest from "@/components/CircleMemoryTest";

export default function CircleMemory() {
  return (
    <Layout>
      <div className="container max-w-5xl mx-auto px-4 py-8 md:py-12">
        <div className="mb-12">
            <h1 className="text-3xl font-bold mb-2 font-mono tracking-tight uppercase">Circle Memory</h1>
            <p className="text-sm text-muted-foreground font-mono tracking-widest uppercase">Testez votre mémoire visuelle et votre perception des couleurs</p>
        </div>
        
        <CircleMemoryTest />
      </div>
    </Layout>
  );
}
