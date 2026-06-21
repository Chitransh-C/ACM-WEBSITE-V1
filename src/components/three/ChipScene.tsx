import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Motherboard } from './Motherboard';
import { CameraRig } from './CameraRig';
import { useStore } from '../../store/useStore';
import { pathVectors, ranges } from '../../utils/paths3d';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import { NodeLights } from './NodeLights';
import { ActivePulse } from './ActivePulse';
import { CPUFan } from './CPUFan';

// ─── Path color per circuit ────────────────────────────────────────────────────
const PATH_COLORS: Record<string, string> = {
  about: '#fbbf24',  // amber/gold
  services: '#22d3ee',  // cyan
  events: '#a78bfa',  // violet
  team: '#34d399',  // emerald
  contact: '#f472b6',  // pink
};

// ─── Sliced path helper ────────────────────────────────────────────────────────
function getSlicedPoints(points: THREE.Vector3[], progress: number): THREE.Vector3[] {
  if (progress <= 0) return [];
  if (progress >= 1) return points;
  if (points.length < 2) return points;

  const sliced: THREE.Vector3[] = [points[0].clone()];
  const lengths: number[] = [];
  let totalLength = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const len = points[i].distanceTo(points[i + 1]);
    lengths.push(len);
    totalLength += len;
  }

  const targetLen = totalLength * progress;
  let currentLen = 0;

  for (let i = 0; i < points.length - 1; i++) {
    const len = lengths[i];
    if (currentLen + len >= targetLen) {
      const segmentProgress = (targetLen - currentLen) / len;
      const interpPoint = new THREE.Vector3().lerpVectors(points[i], points[i + 1], segmentProgress);
      sliced.push(interpPoint);
      break;
    } else {
      sliced.push(points[i + 1].clone());
      currentLen += len;
    }
  }
  return sliced;
}

// ─── Active Current Traces (glowing lines above pipes) ────────────────────────
const ActiveCurrentTraces: React.FC = () => {
  const progress = useStore((state) => state.progress);

  return (
    <group>
      {Object.entries(ranges).map(([key, range]) => {
        const activeKey = key as keyof typeof ranges;
        const vectors = pathVectors[activeKey];
        const color = PATH_COLORS[activeKey];

        let pathProgress = 0;
        if (progress >= range.end) {
          pathProgress = 1;
        } else if (progress >= range.start) {
          pathProgress = (progress - range.start) / (range.end - range.start);
          pathProgress = Math.min(Math.max(pathProgress, 0), 1);
        }

        if (pathProgress <= 0) return null;

        const sliced = getSlicedPoints(vectors, pathProgress);
        if (sliced.length < 2) return null;

        return (
          <group key={`active-trace-${activeKey}`}>
            {/* Core glowing line */}
            <Line points={sliced} color={color} lineWidth={3.5} />
            {/* Outer glow halo */}
            <Line points={sliced} color={color} lineWidth={9.0} opacity={0.35} transparent />
          </group>
        );
      })}
    </group>
  );
};

// ─── Pipe Traces — cylinders that tint to current color when energized ────────
const PipeTraces: React.FC = () => {
  const progress = useStore((state) => state.progress);

  // Per-path decide colour: grey if path has never been reached, circuit-color if reached
  const pipeSegments: React.ReactElement[] = [];

  for (const [key, points] of Object.entries(pathVectors)) {
    const activeKey = key as keyof typeof ranges;
    const range = ranges[activeKey];
    const circuitColor = PATH_COLORS[activeKey];

    // pathProgress: how far we've progressed along THIS path (0..1)
    let pathProgress = 0;
    if (progress >= range.end) {
      pathProgress = 1;
    } else if (progress >= range.start) {
      pathProgress = (progress - range.start) / (range.end - range.start);
    }

    // "energized" = we've started on this path (forward progress >= range.start)
    // We keep the color as long as progress is still >= range.start.
    // When user scrolls backward below range.start the path goes grey again.
    const isEnergized = progress >= range.start;

    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i];
      const b = points[i + 1];
      const dir = new THREE.Vector3().subVectors(b, a);
      const len = dir.length();
      if (len < 0.001) continue;

      const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
      mid.y -= 0.02; // sit just below the active glow line

      const up = new THREE.Vector3(0, 1, 0);
      const quat = new THREE.Quaternion().setFromUnitVectors(up, dir.clone().normalize());

      // Determine segment tint based on pathProgress
      // A segment is "lit" when the active-trace has already reached it
      const segStartFrac = i / (points.length - 1);
      const segLit = isEnergized && pathProgress >= segStartFrac;
      const pipeColor = segLit ? circuitColor : '#94a3b8';
      const emissiveCol = segLit ? circuitColor : '#000000';
      const emissiveInt = segLit ? 0.18 : 0;
      const roughness = segLit ? 0.20 : 0.15;

      pipeSegments.push(
        <mesh key={`pipe-${key}-${i}`} position={[mid.x, mid.y, mid.z]} quaternion={quat}>
          <cylinderGeometry args={[0.04, 0.04, len, 8]} />
          <meshStandardMaterial
            color={pipeColor}
            metalness={0.9}
            roughness={roughness}
            emissive={emissiveCol}
            emissiveIntensity={emissiveInt}
          />
        </mesh>
      );
    }
  }

  return <group>{pipeSegments}</group>;
};

// ─── Scene Lighting ───────────────────────────────────────────────────────────
const SceneLighting: React.FC = () => {
  return (
    <group>
      {/* Hemisphere sky + ground fill */}
      <hemisphereLight args={['#d0e8ff', '#083344', 1.8]} />

      {/* ── BIG OVERHEAD SPOTLIGHT centered above the CPU chip ── */}
      {/* Covers the whole board with a wide soft cone */}
      <spotLight
        position={[0, 22, 0]}
        angle={Math.PI / 2.8}   // ~64° half-angle — wide enough to cover 60x60 board
        penumbra={0.55}
        intensity={90}
        color="#ddeeff"
        distance={55}
        decay={1.2}
        castShadow={false}
      />

      {/* Secondary warm fill spotlight — slightly off-center for depth */}
      <spotLight
        position={[6, 18, 8]}
        angle={Math.PI / 3.2}
        penumbra={0.7}
        intensity={35}
        color="#fff4d0"
        distance={50}
        decay={1.4}
      />

      {/* CPU center tight key point light — extra punch on the chip lid */}
      <pointLight position={[0, 6, 0]} color="#ffffff" intensity={5.0} distance={12} decay={1.6} />

      {/* Left fill */}
      <pointLight position={[-12, 6, -4]} color="#e0f2fe" intensity={2.0} distance={20} decay={1.5} />
      {/* Right fill */}
      <pointLight position={[12, 6, -4]} color="#e0f2fe" intensity={2.0} distance={20} decay={1.5} />
      {/* Rear */}
      <pointLight position={[0, 5, -14]} color="#f0f4ff" intensity={1.8} distance={16} decay={1.5} />
      {/* Front */}
      <pointLight position={[0, 5, 14]} color="#f0f4ff" intensity={1.6} distance={16} decay={1.5} />
    </group>
  );
};

// ─── Main Scene ───────────────────────────────────────────────────────────────
export const ChipScene: React.FC = () => {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'absolute', top: 0, left: 0 }}>
      <Canvas
        camera={{ fov: 45, near: 0.1, far: 120, position: [0, 5, 4] }}
        gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#050816']} />

        {/* Ambient base */}
        <ambientLight intensity={0.35} />

        {/* Scene lighting (includes big overhead spot) */}
        <SceneLighting />

        {/* Main diagonal key light */}
        <directionalLight position={[12, 18, 12]} intensity={1.8} />

        {/* Cyan uplight from front */}
        <directionalLight position={[0, 0.5, 25]} intensity={2.0} color="#06b6d4" />
        {/* Gold uplight */}
        <directionalLight position={[10, 0.5, 25]} intensity={1.2} color="#fbbf24" />

        {/* RGB accent pair */}
        <pointLight position={[-15, 6, 0]} intensity={1.0} color="#d946ef" distance={30} />
        <pointLight position={[15, 6, 0]} intensity={1.0} color="#06b6d4" distance={30} />

        {/* CPU socket underglow — teal ring */}
        <pointLight position={[0, 0.15, 0]} intensity={1.2} color="#10b981" distance={8} />

        {/* Motherboard (pipes are now rendered via PipeTraces below) */}
        <Motherboard />

        {/* Colored pipes that tint to circuit color when energized */}
        <PipeTraces />

        {/* Dynamic node glow spheres */}
        <NodeLights />

        {/* Active growing current glow lines */}
        <ActiveCurrentTraces />

        {/* Travel pulse sphere */}
        <ActivePulse />

        {/* CPU cooling fan */}
        <CPUFan />

        {/* Camera controller */}
        <CameraRig />
      </Canvas>
    </div>
  );
};
export default ChipScene;
