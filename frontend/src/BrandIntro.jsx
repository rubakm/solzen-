import React, { useState, useEffect } from 'react';

/**
 * SOLZEN Brand Intro Loading Screen
 *
 * Requirements:
 * - Full-screen dark forest-green background.
 * - Centered SOLZEN logo inside a rounded square.
 * - Soft golden glow behind the logo.
 * - Slowly animated concentric orbit rings.
 * - SOLZEN text and “DEEPER LEARNING. BETTER UNDERSTANDING.” tagline.
 * - No player controls or Skip button: the experience stays clean and brand-led.
 * - Visible for approximately 3.6 seconds with a smooth exit.
 * - Fades smoothly into the cream-colored homepage.
 * - Responsive, never gets stuck, and respects reduced-motion preferences.
 */
export default function BrandIntro({ onComplete }) {
  const [isLeaving, setIsLeaving] = useState(false);

  // A brief branded moment before the homepage appears.
  const totalDuration = 3600;

  // Automatically fade to the site after the brand moment; no controls needed.
  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = prefersReducedMotion ? 1200 : totalDuration;
    const beginExit = window.setTimeout(() => setIsLeaving(true), duration);
    const finish = window.setTimeout(() => onComplete?.(), duration + 550);

    return () => {
      window.clearTimeout(beginExit);
      window.clearTimeout(finish);
    };
  }, [onComplete, totalDuration]);

  // Lock body scroll while loader is showing
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <aside
      className={`brand-intro ${isLeaving ? 'intro-leave' : ''}`}
      role="region"
      aria-label="SOLZEN Intro Loading Screen"
      aria-live="polite"
    >
      {/* Subtle ambient film grain / noise */}
      <div className="intro-noise" aria-hidden="true" />

      {/* Slowly animated concentric orbit rings */}
      <div className="intro-orbit-system" aria-hidden="true">
        <div className="intro-ring intro-ring-1" />
        <div className="intro-ring intro-ring-2">
          <span className="intro-satellite intro-satellite-gold" />
        </div>
        <div className="intro-ring intro-ring-3">
          <span className="intro-satellite intro-satellite-sage" />
        </div>
        <div className="intro-ring intro-ring-4" />
        <div className="intro-ring intro-ring-5" />
      </div>

      {/* Soft golden glow behind the logo */}
      <div className="intro-glow" aria-hidden="true" />

      {/* Centered SOLZEN logo inside a rounded square & typography */}
      <div className="intro-center-content">
        <div className="intro-logo-card" aria-hidden="true">
          <img
            src="/solzen-mark.png"
            alt="SOLZEN Logo"
            className="intro-logo-img"
          />
        </div>

        <div className="intro-wordmark" aria-label="SOLZEN">
          SOLZEN
        </div>

        <p className="intro-tagline">
          DEEPER LEARNING. BETTER UNDERSTANDING.
        </p>
      </div>

    </aside>
  );
}
