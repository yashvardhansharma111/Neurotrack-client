"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import * as THREE from "three";
import { Brain, Shield, Zap, BarChart3 } from "lucide-react";

// --- TYPE DEFINITIONS FOR PROPS ---

interface NavLink {
  label: string;
  href: string;
}

interface Project {
  title: string;
  description: string;
  tags: string[];
  imageContent?: React.ReactNode;
}

interface Stat {
  value: string;
  label: string;
}

export interface PortfolioPageProps {
  logo?: { initials: React.ReactNode; name: React.ReactNode };
  navLinks?: NavLink[];
  resume?: { label: string; onClick?: () => void };
  hero?: {
    titleLine1: React.ReactNode;
    titleLine2Gradient: React.ReactNode;
    subtitle: React.ReactNode;
  };
  ctaButtons?: {
    primary: { label: string; onClick?: () => void };
    secondary: { label: string; onClick?: () => void };
  };
  projects?: Project[];
  stats?: Stat[];
  showAnimatedBackground?: boolean;
}

// --- INTERNAL ANIMATED BACKGROUND COMPONENT ---

const AuroraBackground: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const currentMount = mountRef.current;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ alpha: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = "fixed";
    renderer.domElement.style.top = "0";
    renderer.domElement.style.left = "0";
    renderer.domElement.style.zIndex = "0";
    renderer.domElement.style.display = "block";
    renderer.domElement.style.pointerEvents = "none";

    currentMount.appendChild(renderer.domElement);

    const material = new THREE.ShaderMaterial({
      uniforms: {
        iTime: { value: 0 },
        iResolution: {
          value: new THREE.Vector2(window.innerWidth, window.innerHeight),
        },
      },
      vertexShader: `void main() { gl_Position = vec4(position, 1.0); }`,
      fragmentShader: `
                uniform float iTime; 
                uniform vec2 iResolution;
                #define NUM_OCTAVES 3
                float rand(vec2 n) { 
                    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453); 
                }
                float noise(vec2 p){ 
                    vec2 ip=floor(p);
                    vec2 u=fract(p);
                    u=u*u*(3.0-2.0*u);
                    float res=mix(
                        mix(rand(ip),rand(ip+vec2(1.0,0.0)),u.x),
                        mix(rand(ip+vec2(0.0,1.0)),rand(ip+vec2(1.0,1.0)),u.x),
                        u.y
                    );
                    return res*res; 
                }
                float fbm(vec2 x) { 
                    float v=0.0;
                    float a=0.3;
                    vec2 shift=vec2(100);
                    mat2 rot=mat2(cos(0.5),sin(0.5),-sin(0.5),cos(0.50));
                    for(int i=0;i<NUM_OCTAVES;++i){
                        v+=a*noise(x);
                        x=rot*x*2.0+shift;
                        a*=0.4;
                    }
                    return v;
                }
                void main() {
                    vec2 p=((gl_FragCoord.xy)-iResolution.xy*0.5)/iResolution.y*mat2(6.,-4.,4.,6.);
                    vec4 o=vec4(0.);
                    float f=2.+fbm(p+vec2(iTime*5.,0.))*.5;
                    for(float i=0.;i++<35.;){
                        vec2 v=p+cos(i*i+(iTime+p.x*.08)*.025+i*vec2(13.,11.))*3.5;
                        float tailNoise=fbm(v+vec2(iTime*.5,i))*.3*(1.-(i/35.));
                        vec4 auroraColors=vec4(
                            .1+.3*sin(i*.2+iTime*.4),
                            .3+.5*cos(i*.3+iTime*.5),
                            .7+.3*sin(i*.4+iTime*.3),
                            1.
                        );
                        vec4 currentContribution=auroraColors*exp(sin(i*i+iTime*.8))/length(max(v,vec2(v.x*f*.015,v.y*1.5)));
                        float thinnessFactor=smoothstep(0.,1.,i/35.)*.6;
                        o+=currentContribution*(1.+tailNoise*.8)*thinnessFactor;
                    }
                    o=tanh(pow(o/100.,vec4(1.6)));
                    gl_FragColor=o*1.5;
                }`,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      material.uniforms.iTime.value += 0.016;
      renderer.render(scene, camera);
    };

    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      material.uniforms.iResolution.value.set(
        window.innerWidth,
        window.innerHeight
      );
    };

    window.addEventListener("resize", handleResize);
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      if (currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
      material.dispose();
      geometry.dispose();
    };
  }, []);

  return <div ref={mountRef} />;
};

// --- DEFAULT DATA FOR NEUROTRACK ---

const defaultData = {
  logo: { initials: "NT", name: "NeuroTrack" },
  navLinks: [
    { label: "Home", href: "/" },
    { label: "Analyze", href: "/analyze" },
    { label: "Docs", href: "/docs" },
    { label: "About", href: "/about" },
  ],
  resume: { label: "Get Started" },
  hero: {
    titleLine1: "AI Emotion & Stress Analysis",
    titleLine2Gradient: "Fast, Private, On-Device",
    subtitle:
      "Detect faces, compute emotions every 2 seconds, and score stress—all via our simple API. No storage, just analysis. Your privacy is our priority.",
  },
  ctaButtons: {
    primary: { label: "Try Analysis" },
    secondary: { label: "Read Docs" },
  },
  projects: [
    {
      title: "Real-Time Emotion Detection",
      description:
        "Advanced AI-powered emotion recognition with 2-second window analysis for precise insights.",
      tags: ["AI/ML", "Real-time", "Computer Vision"],
      imageContent: <Brain className="size-12 text-blue-400" />,
    },
    {
      title: "Privacy-First Architecture",
      description:
        "Zero data storage. Videos stream directly to your device and our analyzer—your data never touches our servers.",
      tags: ["Privacy", "Security", "On-Device"],
      imageContent: <Shield className="size-12 text-purple-400" />,
    },
    {
      title: "Comprehensive Stress Metrics",
      description:
        "Get actionable insights with stress scores, valence/arousal metrics, and top emotion detection.",
      tags: ["Analytics", "Metrics", "Insights"],
      imageContent: <BarChart3 className="size-12 text-pink-400" />,
    },
  ],
  stats: [
    { value: "2s", label: "Analysis Windows" },
    { value: "100%", label: "Privacy Guaranteed" },
    { value: "24/7", label: "API Availability" },
  ],
};

// --- MAIN CUSTOMIZABLE PORTFOLIO COMPONENT ---

const PortfolioPage: React.FC<PortfolioPageProps> = ({
  logo = defaultData.logo,
  navLinks = defaultData.navLinks,
  resume = defaultData.resume,
  hero = defaultData.hero,
  ctaButtons = defaultData.ctaButtons,
  projects = defaultData.projects,
  stats = defaultData.stats,
  showAnimatedBackground = true,
}) => {
  return (
    <div className="bg-black text-foreground min-h-screen">
      {showAnimatedBackground && <AuroraBackground />}
      <div className="relative z-10">
        <nav className="w-full px-6 py-4 sticky top-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/10">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                <span className="text-sm font-bold text-white">
                  {logo.initials}
                </span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                {logo.name}
              </span>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-slate-300 hover:text-white transition-all text-sm font-medium relative group"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300"></span>
                </Link>
              ))}
            </div>
            <button
              onClick={resume.onClick}
              className="glass-button px-6 py-2.5 rounded-lg text-white text-sm font-medium hover:bg-white/10 hover:border-white/30 transition-all border border-white/20 shadow-lg"
            >
              {resume.label}
            </button>
          </div>
        </nav>

        <main
          id="about"
          className="w-full min-h-screen flex flex-col items-center justify-center px-6 py-20"
        >
          <div className="max-w-6xl mx-auto text-center">
            <div className="mb-8 float-animation">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 border border-white/10 backdrop-blur-sm mb-6">
                <span className="text-xs font-medium text-blue-300">✨</span>
                <span className="text-xs font-medium text-white">Private by Design</span>
                <span className="text-xs font-medium text-purple-300">•</span>
                <span className="text-xs font-medium text-white">No Data Storage</span>
              </div>
              <h1 className="md:text-6xl lg:text-8xl leading-[1.1] text-5xl font-bold text-white tracking-tight mb-6">
                <span className="block">{hero.titleLine1}</span>
                <span className="gradient-text block tracking-tight mt-2">
                  {hero.titleLine2Gradient}
                </span>
              </h1>
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-400 mb-6">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                  <span>Real-time Processing</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                  <span>100% Private</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
                  <span>Enterprise Ready</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <button
                onClick={ctaButtons.primary.onClick}
                className="primary-button px-6 py-3 text-white rounded-lg font-medium text-sm min-w-[160px]"
              >
                {ctaButtons.primary.label}
              </button>
              <button
                onClick={ctaButtons.secondary.onClick}
                className="glass-button min-w-[160px] text-sm font-medium text-white rounded-lg px-6 py-3"
              >
                {ctaButtons.secondary.label}
              </button>
            </div>

            <div className="divider mb-16" />

            <div
              id="projects"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16"
            >
              {projects.map((project, index) => (
                <div
                  key={index}
                  className="glass-card rounded-2xl p-6 text-left"
                >
                  <div className="project-image rounded-xl h-32 mb-4 flex items-center justify-center">
                    {project.imageContent}
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">
                    {project.title}
                  </h3>
                  <p className="text-white/80 text-sm mb-4">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="skill-badge px-2 py-1 rounded text-xs text-white/70"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="divider mb-16" />

            <div
              id="skills"
              className="flex flex-col sm:flex-row justify-center items-center gap-8 text-center"
            >
              {stats.map((stat, index) => (
                <React.Fragment key={stat.label}>
                  <div>
                    <div className="text-3xl md:text-4xl font-light text-foreground mb-1 tracking-tight">
                      {stat.value}
                    </div>
                    <div className="text-muted-foreground text-sm font-normal">
                      {stat.label}
                    </div>
                  </div>
                  {index < stats.length - 1 && (
                    <div className="hidden sm:block w-px h-12 bg-gradient-to-b from-transparent via-border to-transparent" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export { PortfolioPage };
export type { PortfolioPageProps };

