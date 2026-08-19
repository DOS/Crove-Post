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
    <main className="min-h-screen bg-[#fafafa] dark:bg-[#07070d] text-zinc-900 dark:text-white transition-colors duration-300 relative overflow-hidden selection:bg-brand-500/20 selection:text-brand-600 dark:selection:text-brand-300">
      {/* Navbar Header */}
      <Navbar />

      {/* Hero Section */}
      <Hero />

      {/* 28+ Channels Section */}
      <Channels />

      {/* Interactive Live Generator & Preview */}
      <InteractivePreview />

      {/* Features Bento Grid */}
      <Features />

      {/* How It Works (3 Steps) */}
      <HowItWorks />

      {/* Comparison with competitors */}
      <Comparison />

      {/* Pricing Plans (Monthly / Yearly) */}
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
