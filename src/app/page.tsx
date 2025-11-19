"use client";

import { useRouter } from "next/navigation";
import { Footer } from "@/components/footer";
import {
  PortfolioPage,
  PortfolioPageProps,
} from "@/components/ui/starfall-portfolio-landing";
import { Brain, Shield, BarChart3 } from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  const neuroTrackData: PortfolioPageProps = {
    logo: {
      initials: "NT",
      name: "NeuroTrack",
    },
    navLinks: [
      { label: "Home", href: "/" },
      { label: "Analyze", href: "/analyze" },
      { label: "Docs", href: "/docs" },
      { label: "About", href: "/about" },
    ],
    resume: {
      label: "Get Started",
      onClick: () => router.push("/analyze"),
    },
    hero: {
      titleLine1: "Unlock Human Emotions",
      titleLine2Gradient: "Through AI-Powered Analysis",
      subtitle:
        "Transform video into actionable insights. AI-powered emotion detection and stress analysis—all while keeping your data completely private.",
    },
    ctaButtons: {
      primary: {
        label: "Try Analysis",
        onClick: () => router.push("/analyze"),
      },
      secondary: {
        label: "Read Docs",
        onClick: () => router.push("/docs"),
      },
    },
    projects: [
      {
        title: "Real-Time Emotion Detection",
        description:
          "Advanced AI-powered emotion recognition with 2-second window analysis for precise insights.",
        tags: ["AI/ML", "Real-time", "Computer Vision"],
        imageContent: (
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 via-purple-500/30 to-pink-500/30 rounded-xl blur-xl"></div>
            <Brain className="size-16 text-blue-400 relative z-10" />
          </div>
        ),
      },
      {
        title: "Privacy-First Architecture",
        description:
          "Zero data storage. Videos stream directly to your device and our analyzer—your data never touches our servers.",
        tags: ["Privacy", "Security", "On-Device"],
        imageContent: (
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 via-pink-500/30 to-blue-500/30 rounded-xl blur-xl"></div>
            <Shield className="size-16 text-purple-400 relative z-10" />
          </div>
        ),
      },
      {
        title: "Comprehensive Stress Metrics",
        description:
          "Get actionable insights with stress scores, valence/arousal metrics, and top emotion detection.",
        tags: ["Analytics", "Metrics", "Insights"],
        imageContent: (
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/30 via-orange-500/30 to-purple-500/30 rounded-xl blur-xl"></div>
            <BarChart3 className="size-16 text-pink-400 relative z-10" />
          </div>
        ),
      },
    ],
    stats: [
      { value: "2s", label: "Analysis Windows" },
      { value: "100%", label: "Privacy Guaranteed" },
      { value: "24/7", label: "API Availability" },
    ],
    showAnimatedBackground: true,
  };

  return (
    <div className="min-h-dvh flex flex-col">
      <PortfolioPage {...neuroTrackData} />
      <Footer />
    </div>
  );
}
