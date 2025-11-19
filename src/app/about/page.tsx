"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Shield, Zap, Users } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-dvh flex flex-col bg-black">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            About NeuroTrack
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Transforming emotion intelligence through cutting-edge AI technology
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="glass-card rounded-2xl border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <Brain className="size-6 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-white">Our Mission</h2>
              </div>
              <p className="text-white/80">
                NeuroTrack analyzes short face videos to estimate emotions every 2 seconds and compute an overall stress
                score. The app is privacy-focused, with on-device capture, and a simple API to integrate into your
                workflows.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card rounded-2xl border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                  <Shield className="size-6 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-white">Privacy First</h2>
              </div>
              <p className="text-white/80">
                Your data never touches our servers. Videos stream directly to your device and our analyzer—zero storage,
                complete privacy.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card rounded-2xl border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center">
                  <Zap className="size-6 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-white">Real-Time Analysis</h2>
              </div>
              <p className="text-white/80">
                Get instant insights with 2-second window analysis. Our AI processes emotions and stress levels in
                real-time for immediate feedback.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card rounded-2xl border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                  <Users className="size-6 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-white">Built for Developers</h2>
              </div>
              <p className="text-white/80">
                Simple REST API integration. POST a video file and get JSON results. Easy to integrate into any
                application or workflow.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
