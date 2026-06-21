import React, { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { CircuitSVG } from './CircuitSVG';

export const ChipscapeApp: React.FC = () => {
  const { progress, targetProgress, setProgress, setTargetProgress, activeSection, setActiveSection, bootCompleted, completeBoot } = useStore();
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize native scroll tracking
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const totalScrollableHeight = containerRef.current.scrollHeight - window.innerHeight;
      if (totalScrollableHeight <= 0) return;
      
      const scrollPos = window.scrollY;
      const computedProgress = scrollPos / totalScrollableHeight;
      setTargetProgress(Math.min(Math.max(computedProgress, 0), 1));
    };

    // Attach native scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial call to set progress in case page was refreshed while scrolled
    handleScroll();

    // Boot sequence animation on load
    const timer = setTimeout(() => {
      completeBoot();
    }, 1500);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, []);

  // Frame tick to interpolate progress (provides visual smoothing)
  useEffect(() => {
    let rAFId: number;

    const tick = () => {
      const diff = targetProgress - progress;
      if (Math.abs(diff) > 0.0001) {
        const nextProgress = progress + diff * 0.08;
        setProgress(nextProgress);
      } else if (progress !== targetProgress) {
        setProgress(targetProgress);
      }

      // Update active section only when progress reaches the node (end of path)
      let currentSec: string | null = null;
      if (progress >= 0.27 && progress < 0.31) currentSec = 'about';
      else if (progress >= 0.47 && progress < 0.51) currentSec = 'services';
      else if (progress >= 0.67 && progress < 0.71) currentSec = 'events';
      else if (progress >= 0.82 && progress < 0.86) currentSec = 'team';
      else if (progress >= 0.97) currentSec = 'contact';
      
      if (currentSec !== activeSection) {
        setActiveSection(currentSec);
      }

      rAFId = requestAnimationFrame(tick);
    };

    rAFId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rAFId);
    };
  }, [progress, targetProgress, activeSection]);

  // Section content configuration
  const sections = [
    {
      id: 'about',
      title: '01 / About the Core',
      desc: 'Chipscape is a scroll-driven silicon interactive simulation that models how data propagates through registers and ALU pathways.',
      stats: ['Architecture: RISC-V Custom', 'Logic Nodes: 800+ Elements', 'Clock Gate: Interactive']
    },
    {
      id: 'services',
      title: '02 / Execution Services',
      desc: 'We engineer compiler backends, hardware simulation blocks, and high-performance WebAssembly kernels.',
      stats: ['WASM Compilation', 'LLVM Integration', 'GPU Pipeline Optimization']
    },
    {
      id: 'events',
      title: '03 / System Events',
      desc: 'Join our hardware hackathons and systems engineering meetups to work directly on FPGA logic boards.',
      stats: ['Compiler Hackathon 2026', 'FPGA Prototyping Workshop', 'Semiconductor Forum']
    },
    {
      id: 'team',
      title: '04 / Architects & Engineers',
      desc: 'Our group consists of compiler developers, electrical engineering resources, and hardware security experts.',
      stats: ['System Architects', 'Firmware Engineers', 'CAD Layout Designers']
    },
    {
      id: 'contact',
      title: '05 / I/O Terminal',
      desc: 'Initialize a direct link to our core processor. Drop your data package inside the entry buffers below.',
      stats: ['Status: Ready', 'Bandwidth: Uncapped', 'Location: Silicon Valley']
    }
  ];

  return (
    <div ref={containerRef} className="app-wrapper">
      {/* HUD Fixed Overlay */}
      <div className="hud-overlay-left">
        <div className="hud-subtitle">System Module</div>
        <div className="hud-title">CHIPSCAPE // PROC-X1</div>
      </div>

      <div className="hud-overlay-right">
        <div className="hud-subtitle">Core Voltage</div>
        <div className="hud-voltage">
          {(1.12 + progress * 0.28).toFixed(3)}V
        </div>
      </div>

      {/* Center Background Scene with Grid, SVG and Interactive Layers */}
      <div className="scene-viewport">
        {/* Animated ambient particle glow */}
        <div className="ambient-particles" />
        
        {/* SVG Circuit Path Renderer */}
        {bootCompleted && <CircuitSVG />}

        {/* Content Section Panels (Overlay) */}
        <div className="overlay-container">
          {sections.map((sec) => {
            const isVisible = activeSection === sec.id;
            return (
              <div
                key={sec.id}
                className={`section-card ${isVisible ? 'visible' : ''}`}
                style={{
                  boxShadow: isVisible ? '0 0 40px rgba(0, 229, 255, 0.15)' : 'none',
                }}
              >
                <div className="card-status">
                  System Active
                </div>
                <h2 className="card-title">
                  {sec.title}
                </h2>
                <p className="card-description">
                  {sec.desc}
                </p>
                
                <div className="stat-box">
                  {sec.stats.map((stat, idx) => (
                    <div key={idx} className="stat-row">
                      <span className="stat-key">&gt; {stat.split(':')[0]}</span>
                      <span className="stat-val">{stat.split(':')[1]}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Core Introduction (Landing Screen) */}
          <div className={`landing-screen ${progress < 0.12 ? 'visible' : ''}`}>
            <h1 className="landing-title">
              CHIPSCAPE
            </h1>
            <p className="landing-subtitle">
              Scroll to charge the processor core
            </p>
            <div className="scroll-arrow">
              &darr;
            </div>
          </div>
        </div>
      </div>

      {/* Progress Scroll bar indicators */}
      <div className="bottom-indicator">
        <span>BUS: 0x0000</span>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <span>SYSTEM LEVEL: {(progress * 100).toFixed(0)}%</span>
      </div>
    </div>
  );
};
