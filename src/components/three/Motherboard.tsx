import React from 'react';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import { pathVectors } from '../../utils/paths3d';

// Detailed RAM Card Component - Shiny gold contacts and dark indigo board
const RAMCard: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  return (
    <group position={position}>
      {/* Substrate DIMM Card board - Deep Indigo Purple/Blue */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.08, 1.1, 3.6]} />
        <meshStandardMaterial color="#120e2e" roughness={0.15} metalness={0.8} />
      </mesh>
      {/* Neon glowing stripes along the RAM card sides */}
      <mesh position={[0.05, 0.25, 0]}>
        <boxGeometry args={[0.01, 0.04, 3.2]} />
        <meshStandardMaterial color="#d946ef" emissive="#d946ef" emissiveIntensity={1.5} />
      </mesh>
      <mesh position={[-0.05, 0.25, 0]}>
        <boxGeometry args={[0.01, 0.04, 3.2]} />
        <meshStandardMaterial color="#d946ef" emissive="#d946ef" emissiveIntensity={1.5} />
      </mesh>
      {/* Gold contacts line at bottom connector */}
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[0.1, 0.08, 3.4]} />
        <meshStandardMaterial color="#f59e0b" metalness={1.0} roughness={0.02} />
      </mesh>
      {/* 4 DRAM Memory Nodes on both A/B sides */}
      {[-1.1, -0.4, 0.4, 1.1].map((zOffset, i) => (
        <React.Fragment key={i}>
          {/* Side A DRAM */}
          <mesh position={[0.06, 0.1, zOffset]} castShadow>
            <boxGeometry args={[0.05, 0.35, 0.55]} />
            <meshStandardMaterial color="#090d16" roughness={0.3} metalness={0.7} />
          </mesh>
          {/* Side B DRAM */}
          <mesh position={[-0.06, 0.1, zOffset]} castShadow>
            <boxGeometry args={[0.05, 0.35, 0.55]} />
            <meshStandardMaterial color="#090d16" roughness={0.3} metalness={0.7} />
          </mesh>
        </React.Fragment>
      ))}
      {/* Top silver clips */}
      <mesh position={[0, 0.58, -1.6]}>
        <boxGeometry args={[0.12, 0.1, 0.2]} />
        <meshStandardMaterial color="#e2e8f0" metalness={1.0} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.58, 1.6]}>
        <boxGeometry args={[0.12, 0.1, 0.2]} />
        <meshStandardMaterial color="#e2e8f0" metalness={1.0} roughness={0.1} />
      </mesh>
    </group>
  );
};

// Procedural Aluminium Heatsink Component
const Heatsink: React.FC<{ position: [number, number, number], size: [number, number, number] }> = ({ position, size }) => {
  const finWidth = 0.06;
  const numFins = 6;
  const spacing = size[0] / (numFins - 1);
  return (
    <group position={position}>
      {/* Base contact plate */}
      <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[size[0] + 0.1, 0.08, size[2] + 0.1]} />
        <meshStandardMaterial color="#e2e8f0" metalness={1.0} roughness={0.12} />
      </mesh>
      {/* Parallel cooling fins */}
      {Array.from({ length: numFins }).map((_, i) => {
        const xOffset = -size[0] / 2 + i * spacing;
        return (
          <mesh key={i} position={[xOffset, size[1]/2 + 0.05, 0]} castShadow>
            <boxGeometry args={[finWidth, size[1], size[2]]} />
            <meshStandardMaterial color="#f1f5f9" metalness={1.0} roughness={0.1} />
          </mesh>
        );
      })}
    </group>
  );
};

export const Motherboard: React.FC = () => {
  // Static motherboard chips (Background details)
  const decorativeChips = [
    { pos: [-12, 0.2, 14] as [number, number, number], size: [2, 0.4, 3] as [number, number, number], color: '#312e81' }, 
    { pos: [12, 0.2, 14] as [number, number, number], size: [2, 0.4, 3] as [number, number, number], color: '#1e3a8a' }, 
    { pos: [-6, 0.1, -12] as [number, number, number], size: [1.2, 0.2, 1.2] as [number, number, number], color: '#111827' }, 
    { pos: [6, 0.1, -12] as [number, number, number], size: [1.2, 0.2, 1.2] as [number, number, number], color: '#111827' }, 
  ];

  const vias = [
    [-3, -1], [-3, -3], [-5, -5], [-7, -5],
    [3, -1], [3, -3], [5, -5], [7, -5],
    [-2, 2], [-2, 5], [-6, 7], [-10, 7],
    [2, 2], [2, 5], [6, 7], [10, 7],
  ];

  return (
    <group>
      {/* 1. Motherboard substrate Base floor - Glossy Cyber Teal */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial 
          color="#041f26" 
          roughness={0.2} 
          metalness={0.85} 
        />
      </mesh>

      {/* Grid line overlay */}
      <gridHelper args={[60, 60, '#10394a', '#061b24']} position={[0, -0.09, 0]} />

      {/* 2. CPU Die socket core (Base plates) */}
      <group position={[0, 0, 0]}>
        {/* Core Socket board - Gold Edge styling */}
        <mesh position={[0, 0.1, 0]} receiveShadow>
          <boxGeometry args={[4.6, 0.2, 4.6]} />
          <meshStandardMaterial color="#f59e0b" metalness={1.0} roughness={0.02} />
        </mesh>
        {/* Core Inner Socket casing */}
        <mesh position={[0, 0.18, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.4, 0.1, 4.4]} />
          <meshStandardMaterial color="#090d16" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Core Outer Metal casing (IHS Spreader - Brushed silver) */}
        <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.8, 0.12, 3.8]} />
          <meshStandardMaterial color="#cbd5e1" metalness={1.0} roughness={0.18} />
        </mesh>
        {/* Silicon chip cap - Deep Purple Glass-like Iridescence */}
        <mesh position={[0, 0.3, 0]} castShadow>
          <boxGeometry args={[2.8, 0.08, 2.8]} />
          <meshStandardMaterial 
            color="#150921" 
            metalness={0.9} 
            roughness={0.1} 
          />
        </mesh>
      </group>

      {/* 3. RAM Slots (Deep blue DIMM slots next to CPU core) */}
      <RAMCard position={[-3.2, 0.55, 0]} />
      <RAMCard position={[-4.0, 0.55, 0]} />
      <RAMCard position={[3.2, 0.55, 0]} />
      <RAMCard position={[4.0, 0.55, 0]} />

      {/* 4. Aluminum Heatsink assemblies (Placed on cache chip dies) */}
      <Heatsink position={[-10, 0.2, -15]} size={[2.6, 0.8, 2.0]} />
      <Heatsink position={[10, 0.2, -15]} size={[2.6, 0.8, 2.0]} />
      <Heatsink position={[-14, 0.2, -4]} size={[2.0, 0.6, 2.4]} />
      <Heatsink position={[14, 0.2, -4]} size={[2.0, 0.6, 2.4]} />

      {/* 5. Copper Background Circuits (Copper Traces) - Highly reflective copper brown */}
      {Object.entries(pathVectors).map(([key, points]) => (
        <Line
          key={`trace-${key}`}
          points={points.map(p => [p.x, p.y - 0.02, p.z])}
          color="#9a3412"
          lineWidth={2.5}
          opacity={0.9}
          transparent
        />
      ))}

      {/* 6. Static chips / gate arrays */}
      {decorativeChips.map((chip, idx) => (
        <group key={`chip-${idx}`} position={chip.pos}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={chip.size} />
            <meshStandardMaterial color={chip.color} roughness={0.4} metalness={0.6} />
          </mesh>
          <mesh position={[0, -chip.size[1]/2, 0]}>
            <boxGeometry args={[chip.size[0] + 0.2, 0.05, chip.size[2] + 0.2]} />
            <meshStandardMaterial color="#fbbf24" metalness={1.0} roughness={0.02} />
          </mesh>
        </group>
      ))}

      {/* 7. Cylindrical Capacitors - Neon teal details */}
      {[
        [-6, -8], [-7.5, -8], [6, -8], [7.5, -8],
        [-10, 12], [-11.5, 12], [10, 12], [11.5, 12],
        [-1, -16], [1, -16]
      ].map((pos, idx) => (
        <mesh key={`cap-${idx}`} position={[pos[0], 0.6, pos[1]]} castShadow>
          <cylinderGeometry args={[0.35, 0.35, 1.2, 12]} />
          <meshStandardMaterial color="#0d9488" metalness={0.7} roughness={0.3} />
          {/* Neon Stripe */}
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.36, 0.36, 0.2, 12]} />
            <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={0.8} />
          </mesh>
        </mesh>
      ))}

      {/* 8. Solder Vias - Gold contact points */}
      {vias.map((v, idx) => (
        <mesh key={`via-${idx}`} position={[v[0], 0.01, v[1]]}>
          <cylinderGeometry args={[0.08, 0.08, 0.04, 8]} />
          <meshStandardMaterial color="#fbbf24" metalness={1.0} roughness={0.02} />
        </mesh>
      ))}

      {/* 9. Gold contact socket pins */}
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh key={`pin-${i}`} position={[-18, 0.2, -6 + i * 1.2]} castShadow>
          <boxGeometry args={[0.2, 0.4, 0.4]} />
          <meshStandardMaterial color="#f59e0b" metalness={1.0} roughness={0.02} />
        </mesh>
      ))}
    </group>
  );
};
