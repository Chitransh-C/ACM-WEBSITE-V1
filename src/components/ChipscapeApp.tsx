import React, { useEffect, useCallback } from 'react';
import { useStore } from '../store/useStore';
import { ChipScene } from './three/ChipScene';
import { ContentModal } from './ContentModal';

const NODES = [
  { id: 'about',    progress: 0.29 },
  { id: 'services', progress: 0.49 },
  { id: 'events',   progress: 0.69 },
  { id: 'team',     progress: 0.84 },
  { id: 'contact',  progress: 0.99 },
];

export const ChipscapeApp: React.FC = () => {
  const {
    progress, targetProgress,
    setProgress, setTargetProgress,
    activeSection, setActiveSection,
    bootCompleted, completeBoot,
  } = useStore();

  // ─── Modal close callback ─────────────────────────────────────────────────
  // Called by ContentModal once its closing animation finishes.
  const handleScrolledThrough = useCallback((direction: 'forward' | 'backward') => {
    const state = useStore.getState();
    const currentTarget = state.targetProgress;
    const sectionId = state.activeSection;

    // Mark as closed in the store
    state.setActiveSection(null);

    // Nudge the camera past the snap-point so it doesn't immediately re-snap
    if (direction === 'forward') {
      state.setTargetProgress(Math.min(1, currentTarget + 0.025));
    } else {
      state.setTargetProgress(Math.max(0, currentTarget - 0.025));
    }

    // Allow this section to be re-visited when the camera comes back
    // (handled by the closedSections Set below via a custom event)
    if (sectionId) {
      window.dispatchEvent(new CustomEvent('acm:section-closed', { detail: { id: sectionId } }));
    }
  }, []);

  // ─── Virtual scroll engine ────────────────────────────────────────────────
  useEffect(() => {
    // Tracks which sections were explicitly closed by the user so we
    // don't re-open them until the camera has moved far enough away.
    const closedSections = new Set<string>();

    const onSectionClosed = (e: Event) => {
      const id = (e as CustomEvent<{ id: string }>).detail.id;
      closedSections.add(id);
    };
    window.addEventListener('acm:section-closed', onSectionClosed);

    const handleScrollEvent = (deltaY: number) => {
      const state = useStore.getState();
      const currentActive = state.activeSection;

      // ── If a card is open, block ALL scene scrolling ──────────────────
      // The ContentModal handles its own internal scrolling via Lenis and
      // calls handleScrolledThrough when the user scrolls past the end.
      if (currentActive) return;

      // ── Advance / retreat path ────────────────────────────────────────
      const currentTarget = state.targetProgress;
      let next = currentTarget + deltaY * 0.00015;
      next = Math.max(0, Math.min(1, next));

      let snapped = false;
      for (const node of NODES) {
        const crossForward  = currentTarget < node.progress && next >= node.progress;
        const crossBackward = currentTarget > node.progress && next <= node.progress;

        if ((crossForward || crossBackward) && !closedSections.has(node.id)) {
          state.setTargetProgress(node.progress);
          state.setActiveSection(node.id);
          snapped = true;
          break;
        }
      }

      if (!snapped) {
        state.setTargetProgress(next);
        // Clear "closed" status once camera is well away from a snap-point
        NODES.forEach(node => {
          if (Math.abs(next - node.progress) > 0.06) {
            closedSections.delete(node.id);
          }
        });
      }
    };

    // Wheel ──────────────────────────────────────────────────────────────────
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      handleScrollEvent(e.deltaY);
    };

    // Touch ──────────────────────────────────────────────────────────────────
    let startY = 0;
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) startY = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        e.preventDefault();
        const dy = startY - e.touches[0].clientY;
        startY = e.touches[0].clientY;
        handleScrollEvent(dy * 2.5);
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });

    // Boot timer
    const timer = setTimeout(() => completeBoot(), 2800);

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('acm:section-closed', onSectionClosed);
      clearTimeout(timer);
    };
  }, []);

  // ─── Frame-tick smooth interpolation ─────────────────────────────────────
  useEffect(() => {
    let rAFId: number;
    const tick = () => {
      const diff = targetProgress - progress;
      if (Math.abs(diff) > 0.0001) {
        setProgress(progress + diff * 0.03);
      } else if (progress !== targetProgress) {
        setProgress(targetProgress);
      }
      rAFId = requestAnimationFrame(tick);
    };
    rAFId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rAFId);
  }, [progress, targetProgress]);

  return (
    <div className="app-wrapper">
      {/* HUD — top-left */}
      <div className="hud-overlay-left">
        <div className="hud-subtitle">Student Chapter</div>
        <div className="hud-title">ACM MITS // CHAPTER</div>
      </div>

      {/* HUD — top-right */}
      <div className="hud-overlay-right">
        <div className="hud-subtitle">ACM Member ID</div>
        <div className="hud-voltage">
          {Math.floor(100482 + progress * 827)}
        </div>
      </div>

      {/* 3D scene */}
      <div className="scene-viewport">
        <div className="ambient-particles" />
        {!bootCompleted && (
          <div className="boot-loader">
            <div className="boot-ring" />
            <div className="boot-label">Initializing ACM MITS Network…</div>
          </div>
        )}
        {bootCompleted && <ChipScene />}
      </div>

      {/* Full-screen animated content modal (Lenis + GSAP) */}
      <ContentModal
        activeSection={activeSection}
        onScrolledThrough={handleScrolledThrough}
      />

      {/* Bottom progress bar */}
      <div className="bottom-indicator">
        <span>CHAPTER: ACTIVE</span>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress * 100}%` }} />
        </div>
        <span>
          {activeSection
            ? '↕ SCROLL CARD · SCROLL PAST END TO CONTINUE'
            : progress < 0.05
              ? '↓ SCROLL TO EXPLORE'
              : `EXPLORED: ${(progress * 100).toFixed(0)}%`}
        </span>
      </div>
    </div>
  );
};
