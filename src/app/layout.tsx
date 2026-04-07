import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Providers } from "@/components/Providers";
import { Layout } from "@/components/Layout";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://mindful-metrics.vercel.app"),
  title: {
    default: "Mindful Metrics - Cognitive Performance Training",
    template: "%s | Mindful Metrics",
  },
  description: "Sharpen your mind with professional tools to test and improve reaction time, typing speed, and focus.",
  keywords: ["reflex test", "reaction time", "typing test", "aim trainer", "cognitive training"],
  authors: [{ name: "Mindful Metrics" }],
  creator: "Mindful Metrics",
  verification: {
    google: "W21oSCqITEuKtPO3qZtHDww6DZE5TtoHG40ac4A_aJo",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://mindful-metrics.vercel.app",
    siteName: "Mindful Metrics",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mindful Metrics",
    description: "Sharpen your mind with professional tools to test reaction time and focus.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <Providers>
          <Layout>
            {children}
          </Layout>
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
