'use client';
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import SplineViewer from "./spline-viewer";

const HeroSection = () => {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Spline */}
      <SplineViewer
        url="https://prod.spline.design/ggrzYhCMz8JNfx33/scene.splinecode"
        className="absolute inset-0 w-full h-full"
      />
      <div className="absolute inset-0 bg-background/80" />
      
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-8">
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
              <span className="text-gradient">Legal Clarity AI</span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed">
              Making legal documents clear, actionable, and accessible for everyone.
            </p>
          
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="group gradient-primary hover:opacity-90 transition-all duration-300 animate-glow"
                asChild
              >
                <Link href="/app">
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="glass-card border-primary/30 hover:border-primary/50 transition-all duration-300"
                asChild
              >
                <Link href="/about">
                  Learn About Us
                </Link>
              </Button>
            </div>
        </div>
      </div>
      
      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
