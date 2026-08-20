import React from 'react';
import { Navbar } from '../components/navbar';
import { Hero } from '../components/hero';
import { Channels } from '../components/channels';
import { Features } from '../components/features';
import { InteractivePreview } from '../components/interactive-preview';
import { HowItWorks } from '../components/how-it-works';
import { Comparison } from '../components/comparison';
import { Pricing } from '../components/pricing';
import { Testimonials } from '../components/testimonials';
import { FAQ } from '../components/faq';
import { CTA } from '../components/cta';
import { Footer } from '../components/footer';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#faf9fe] dark:bg-[#08080f] text-zinc-900 dark:text-white transition-colors duration-300 relative overflow-hidden selection:bg-brand-500/20 selection:text-brand-600 dark:selection:text-brand-300">
      {/* Floating Glass Navbar Header */}
      <Navbar />

      {/* Hero Section & Interactive App Mockup Showcase */}
      <Hero />

      {/* 28+ Channels Grid */}
      <Channels />

      {/* Interactive Studio Preview */}
      <InteractivePreview />

      {/* Features Bento Grid */}
      <Features />

      {/* 3-Step Effortless Workflow */}
      <HowItWorks />

      {/* Objective Comparison */}
      <Comparison />

      {/* Transparent Pricing (Monthly / Yearly) */}
      <Pricing />

      {/* Testimonials & Social Proof */}
      <Testimonials />

      {/* Frequently Asked Questions */}
      <FAQ />

      {/* Bottom Conversion CTA Banner */}
      <CTA />

      {/* Footer */}
      <Footer />
    </main>
  );
}
