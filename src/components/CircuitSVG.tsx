import React, { useRef, useState, useEffect } from 'react';
import { useStore } from '../store/useStore';

// Helper to interpolate angles correctly without wrapping spins
const lerpAngle = (current: number, target: number, speed: number) => {
  let diff = (target - current) % 360;
  if (diff < -180) diff += 360;
  if (diff > 180) diff -= 360;
  return current + diff * speed;
};

export const CircuitSVG: React.FC = () => {
  const { progress } = useStore();
  const [pulsePositions, setPulsePositions] = useState<{ [key: string]: { x: number; y: number; active: boolean } }>({});
  const [transformStr, setTransformStr] = useState("rotateX(72deg) rotateZ(0deg) scale(2.4) translate3d(0px, 0px, 0)");
  
  const pathsRef = useRef<{ [key: string]: SVGPathElement | null }>({});
  const pulsePositionsRef = useRef<{ [key: string]: { x: number; y: number; active: boolean } }>({});
  const cameraRef = useRef({
    tx: 0,
    ty: 0,
    rotZ: 0,
    scale: 2.4,
  });

  // REDESIGNED: Much longer paths with multiple isometric bends stretching to the board corners
  const pathDefinitions = {
    about: "M 960 540 L 800 460 H 600 L 500 360 H 360 L 300 240 H 260",
    services: "M 960 540 L 1120 460 H 1320 L 1420 360 H 1560 L 1620 240 H 1660",
    events: "M 960 540 L 800 620 H 600 L 500 720 H 360 L 300 840 H 260",
    team: "M 960 540 L 1120 620 H 1320 L 1420 720 H 1560 L 1620 840 H 1660",
    contact: "M 960 540 L 900 600 V 760 L 960 820 V 980",
  };

  const ranges = {
    about: { start: 0.15, end: 0.30 },
    services: { start: 0.30, end: 0.50 },
    events: { start: 0.50, end: 0.70 },
    team: { start: 0.70, end: 0.85 },
    contact: { start: 0.85, end: 1.0 },
  };

  // Sync state and refs on progress change
  useEffect(() => {
    const newPositions: typeof pulsePositions = {};

    Object.keys(pathDefinitions).forEach((key) => {
      const path = pathsRef.current[key];
      if (path) {
        try {
          const length = path.getTotalLength();
          path.style.strokeDasharray = `${length}`;
          
          const range = ranges[key as keyof typeof ranges];
          let pathProgress = 0;
          
          if (progress > range.start) {
            pathProgress = (progress - range.start) / (range.end - range.start);
            pathProgress = Math.min(Math.max(pathProgress, 0), 1);
          }
          
          path.style.strokeDashoffset = `${length * (1 - pathProgress)}`;

          const point = path.getPointAtLength(length * pathProgress);
          newPositions[key] = {
            x: point.x,
            y: point.y,
            active: pathProgress > 0 && pathProgress < 1,
          };
        } catch (e) {
          newPositions[key] = { x: 960, y: 540, active: false };
        }
      }
    });

    pulsePositionsRef.current = newPositions;
    setPulsePositions(newPositions);
  }, [progress]);

  // Camera 3D CSS transform interpolation loop
  useEffect(() => {
    let rAFId: number;

    const tickCamera = () => {
      let targetCenterX = 960;
      let targetCenterY = 540;
      let targetRotZ = 0;
      let targetScale = 2.4; // Zoomed-in on CPU Core initially

      if (progress >= 0.12) {
        let activeKey: keyof typeof ranges = 'about';
        if (progress < 0.30) activeKey = 'about';
        else if (progress < 0.50) activeKey = 'services';
        else if (progress < 0.70) activeKey = 'events';
        else if (progress < 0.85) activeKey = 'team';
        else activeKey = 'contact';

        const pulse = pulsePositionsRef.current[activeKey];
        if (pulse && pulse.active) {
          targetCenterX = pulse.x;
          targetCenterY = pulse.y;
          targetScale = 1.7; // Cruise zoom level while traveling

          const path = pathsRef.current[activeKey];
          if (path) {
            try {
              const length = path.getTotalLength();
              const range = ranges[activeKey];
              let pathProgress = (progress - range.start) / (range.end - range.start);
              pathProgress = Math.min(Math.max(pathProgress, 0), 1);
              
              const d = length * pathProgress;
              const p1 = path.getPointAtLength(Math.max(0, d - 2));
              const p2 = path.getPointAtLength(Math.min(length, d + 2));
              const angleRad = Math.atan2(p2.y - p1.y, p2.x - p1.x);
              const angleDeg = angleRad * (180 / Math.PI);
              
              // Align camera straight behind the direction of travel
              targetRotZ = -angleDeg - 90;
            } catch (e) {
              // fallback
            }
          }
        } else {
          // Pulse reached node: zoom slightly out and face destination node
          targetScale = 1.45;
          if (activeKey === 'about') { targetCenterX = 260; targetCenterY = 240; targetRotZ = 90; } 
          else if (activeKey === 'services') { targetCenterX = 1660; targetCenterY = 240; targetRotZ = -90; } 
          else if (activeKey === 'events') { targetCenterX = 260; targetCenterY = 840; targetRotZ = 90; }
          else if (activeKey === 'team') { targetCenterX = 1660; targetCenterY = 840; targetRotZ = -90; }
          else { targetCenterX = 960; targetCenterY = 980; targetRotZ = -180; }
        }
      }

      const cam = cameraRef.current;

      const targetTx = 960 - targetCenterX;
      const targetTy = 540 - targetCenterY;

      // Smooth camera transition (lerp)
      cam.tx += (targetTx - cam.tx) * 0.045;
      cam.ty += (targetTy - cam.ty) * 0.045;
      cam.scale += (targetScale - cam.scale) * 0.045;
      cam.rotZ = lerpAngle(cam.rotZ, targetRotZ, 0.045);

      setTransformStr(
        `rotateX(72deg) rotateZ(${cam.rotZ.toFixed(2)}deg) scale(${cam.scale.toFixed(3)}) translate3d(${cam.tx.toFixed(2)}px, ${cam.ty.toFixed(2)}px, 0)`
      );
      
      rAFId = requestAnimationFrame(tickCamera);
    };

    rAFId = requestAnimationFrame(tickCamera);
    return () => {
      cancelAnimationFrame(rAFId);
    };
  }, [progress]);

  // MICRO-DETAILING: Grid of tiny vias
  const vias = [
    // Core surroundings
    { x: 800, y: 500 }, { x: 800, y: 520 }, { x: 800, y: 540 },
    { x: 1120, y: 500 }, { x: 1120, y: 520 }, { x: 1120, y: 540 },
    // Near About registers
    { x: 380, y: 150 }, { x: 400, y: 150 }, { x: 420, y: 150 },
    // Near Services registers
    { x: 1500, y: 150 }, { x: 1520, y: 150 }, { x: 1540, y: 150 },
    // Corner logic matrices
    { x: 140, y: 140 }, { x: 160, y: 140 }, { x: 140, y: 160 }, { x: 160, y: 160 },
    { x: 1760, y: 140 }, { x: 1780, y: 140 }, { x: 1760, y: 160 }, { x: 1780, y: 160 },
  ];

  // MICRO-DETAILING: Parallel decorative circuit tracks
  const decorativePaths = [
    // CPU Brackets
    "M 880 460 H 860 V 480", "M 1040 460 H 1060 V 480",
    "M 880 620 H 860 V 600", "M 1040 620 H 1060 V 600",
    
    // Top-Left Parallel Bus (Dual Wire)
    "M 830 500 L 670 420 H 470 L 370 320 H 230",
    "M 830 490 L 680 410 H 480 L 380 310 H 230",
    
    // Top-Right Parallel Bus (Dual Wire)
    "M 1090 500 L 1250 420 H 1450 L 1550 320 H 1690",
    "M 1090 490 L 1240 410 H 1440 L 1540 310 H 1690",

    // Diagonal accents
    "M 150 100 L 250 200 H 450",
    "M 1770 100 L 1670 200 H 1470",
    "M 150 980 L 250 880 H 450",
    "M 1770 980 L 1670 880 H 1470",

    // Boundary frame accents
    "M 60 60 H 1860 V 1020 H 60 Z",
    "M 70 70 H 1850 V 1010 H 70 Z",
  ];

  // MICRO-DETAILING: Solder pads (tiny copper circles)
  const solderPads = [
    { x: 230, y: 320 }, { x: 230, y: 310 },
    { x: 1690, y: 320 }, { x: 1690, y: 310 },
    { x: 450, y: 200 }, { x: 1470, y: 200 },
  ];

  return (
    <svg
      className="circuit-canvas"
      viewBox="0 0 1920 1080"
      preserveAspectRatio="xMidYMid meet"
      style={{
        transform: transformStr,
        transformOrigin: '50% 50%',
        transition: 'transform 0.05s linear',
      }}
    >
      <defs>
        <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="neon-glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Decorative Grid Substrate */}
      <g stroke="#162e45" strokeWidth="0.5" opacity="0.15">
        <path d="M 0 90 H 1920 M 0 180 H 1920 M 0 270 H 1920 M 0 360 H 1920 M 0 450 H 1920 M 0 540 H 1920 M 0 630 H 1920 M 0 720 H 1920 M 0 810 H 1920 M 0 900 H 1920 M 0 990 H 1920" />
        <path d="M 160 0 V 1080 M 320 0 V 1080 M 480 0 V 1080 M 640 0 V 1080 M 800 0 V 1080 M 960 0 V 1080 M 1120 0 V 1080 M 1280 0 V 1080 M 1440 0 V 1080 M 1600 0 V 1080 M 1760 0 V 1080" />
      </g>

      {/* Complex Circuit Layout (Background / Inactive) */}
      <g stroke="var(--circuit-inactive)" strokeWidth="1.5" fill="none" opacity="0.3" strokeLinecap="round" strokeLinejoin="round">
        {/* Core radiating CPU pin connectors */}
        <path d="M 880 500 h -30 M 880 520 h -30 M 880 540 h -30 M 880 560 h -30 M 880 580 h -30" />
        <path d="M 1040 500 h 30 M 1040 520 h 30 M 1040 540 h 30 M 1040 560 h 30 M 1040 580 h 30" />
        <path d="M 920 460 v -30 M 940 460 v -30 M 960 460 v -30 M 980 460 v -30 M 1000 460 v -30" />
        <path d="M 920 620 v 30 M 940 620 v 30 M 960 620 v 30 M 980 620 v 30 M 1000 620 v 30" />

        {/* Decorative paths */}
        {decorativePaths.map((d, idx) => (
          <path key={`dec-${idx}`} d={d} />
        ))}
      </g>

      {/* MICRO-DETAILING: Decorative Silicon Block Frames (Registers, ALU) */}
      <g stroke="var(--circuit-inactive)" strokeWidth="1.5" fill="none" opacity="0.4" fontFamily="monospace" fontSize="10">
        {/* Top Left Register File */}
        <rect x="250" y="100" width="120" height="80" rx="4" />
        <text x="310" y="130" fill="var(--text-secondary)" textAnchor="middle" opacity="0.6">REG_FILE</text>
        <text x="310" y="150" fill="var(--text-muted)" fontSize="8" textAnchor="middle" opacity="0.5">&gt; ALU_OUT_B</text>
        
        {/* Top Right Instruction Cache */}
        <rect x="1550" y="100" width="120" height="80" rx="4" />
        <text x="1610" y="130" fill="var(--text-secondary)" textAnchor="middle" opacity="0.6">I_CACHE</text>
        <text x="1610" y="150" fill="var(--text-muted)" fontSize="8" textAnchor="middle" opacity="0.5">&gt; TAG_ADDR</text>

        {/* Bottom Left Bus Interface */}
        <rect x="250" y="880" width="120" height="80" rx="4" />
        <text x="310" y="910" fill="var(--text-secondary)" textAnchor="middle" opacity="0.6">BUS_I/F</text>
        <text x="310" y="930" fill="var(--text-muted)" fontSize="8" textAnchor="middle" opacity="0.5">&gt; DMA_LOCK</text>

        {/* Bottom Right Floating Point Unit */}
        <rect x="1550" y="880" width="120" height="80" rx="4" />
        <text x="1610" y="910" fill="var(--text-secondary)" textAnchor="middle" opacity="0.6">FPU_CORE</text>
        <text x="1610" y="930" fill="var(--text-muted)" fontSize="8" textAnchor="middle" opacity="0.5">&gt; EXP_VAL</text>
      </g>

      {/* Interactive Primary Circuits (Base Lines) */}
      <g stroke="var(--circuit-inactive)" strokeWidth="4" fill="none" opacity="0.6" strokeLinecap="round" strokeLinejoin="round">
        {Object.entries(pathDefinitions).map(([key, d]) => (
          <path key={`base-${key}`} d={d} />
        ))}
      </g>

      {/* Active Glowing Primary Circuits */}
      <g stroke="var(--current-color)" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" filter="url(#neon-glow-cyan)">
        {Object.entries(pathDefinitions).map(([key, d]) => (
          <path
            key={`active-${key}`}
            d={d}
            ref={(el) => {
              pathsRef.current[key] = el;
            }}
            style={{ transition: 'stroke-dashoffset 0.1s ease-out' }}
          />
        ))}
      </g>

      {/* Moving Electron Pulses */}
      <g fill="var(--current-color)" filter="url(#neon-glow)">
        {Object.entries(pulsePositions).map(([key, pos]) => {
          if (!pos.active) return null;
          return (
            <circle
              key={`pulse-${key}`}
              cx={pos.x}
              cy={pos.y}
              r="8"
            />
          );
        })}
      </g>

      {/* MICRO-DETAILING: Small copper contact vias */}
      <g fill="var(--circuit-inactive)" opacity="0.5">
        {vias.map((via, idx) => (
          <circle key={`via-${idx}`} cx={via.x} cy={via.y} r="3" />
        ))}
      </g>

      {/* MICRO-DETAILING: Copper Solder pads */}
      <g fill="#b45309" stroke="#163048" strokeWidth="0.5" opacity="0.8">
        {solderPads.map((pad, idx) => (
          <circle key={`pad-${idx}`} cx={pad.x} cy={pad.y} r="2.5" />
        ))}
      </g>

      {/* Core Node Central Processor Unit */}
      <g transform="translate(960, 540)">
        <rect
          x="-60"
          y="-60"
          width="120"
          height="120"
          rx="10"
          fill="#0f172a"
          stroke="var(--glow-color)"
          strokeWidth="4"
          filter="url(#neon-glow)"
        />
        <rect
          x="-45"
          y="-45"
          width="90"
          height="90"
          rx="6"
          fill="#1e293b"
          stroke="var(--current-color)"
          strokeWidth="2"
        />
        <text
          x="0"
          y="8"
          fill="var(--current-color)"
          fontSize="16"
          fontWeight="bold"
          textAnchor="middle"
          style={{ letterSpacing: '2px', fontFamily: 'monospace' }}
        >
          CORE
        </text>
        <circle
          r="40"
          fill="none"
          stroke="var(--current-color)"
          strokeWidth="1"
          opacity={0.3 + Math.sin(progress * Math.PI * 4) * 0.2}
        />
      </g>

      {/* Transistor Nodes */}
      {[
        { id: 'about', x: 260, y: 240, activeThreshold: ranges.about.end },
        { id: 'services', x: 1660, y: 240, activeThreshold: ranges.services.end },
        { id: 'events', x: 260, y: 840, activeThreshold: ranges.events.end },
        { id: 'team', x: 1660, y: 840, activeThreshold: ranges.team.end },
        { id: 'contact', x: 960, y: 980, activeThreshold: ranges.contact.end },
      ].map((node) => {
        const isActivated = progress >= node.activeThreshold - 0.02;
        return (
          <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
            <circle
              r="24"
              fill="none"
              stroke={isActivated ? "var(--current-color)" : "var(--circuit-inactive)"}
              strokeWidth="2"
              opacity={isActivated ? 0.8 : 0.3}
              filter={isActivated ? "url(#neon-glow)" : undefined}
            />
            <circle
              r="12"
              fill={isActivated ? "var(--current-color)" : "#0f172a"}
              stroke={isActivated ? "var(--current-color)" : "var(--circuit-inactive)"}
              strokeWidth="2"
              style={{ transition: 'all 0.3s ease' }}
            />
            <text
              y="-32"
              fill={isActivated ? "#FFFFFF" : "var(--text-secondary)"}
              fontSize="12"
              fontWeight="bold"
              textAnchor="middle"
              style={{ letterSpacing: '1px', textTransform: 'uppercase', pointerEvents: 'none' }}
            >
              {node.id}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
