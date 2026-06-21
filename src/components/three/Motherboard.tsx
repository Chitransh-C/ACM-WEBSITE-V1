import React from 'react';
import { CpuChip } from './CpuChip';
import { RAMCard } from './RAMCard';
import { Heatsink } from './Heatsink';



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

      {/* 2. Modular CPU Die socket core */}
      <CpuChip />

      {/* 3. Modular RAM Slots */}
      <RAMCard position={[-3.2, 0.55, 0]} />
      <RAMCard position={[-4.0, 0.55, 0]} />
      <RAMCard position={[3.2, 0.55, 0]} />
      <RAMCard position={[4.0, 0.55, 0]} />

      {/* 4. Modular Heatsink assemblies */}
      <Heatsink position={[-10, 0.2, -15]} size={[2.6, 0.8, 2.0]} />
      <Heatsink position={[10, 0.2, -15]} size={[2.6, 0.8, 2.0]} />
      <Heatsink position={[-14, 0.2, -4]} size={[2.0, 0.6, 2.4]} />
      <Heatsink position={[14, 0.2, -4]} size={[2.0, 0.6, 2.4]} />

      {/* 5. Static chips / gate arrays */}

      {decorativeChips.map((chip, idx) => (
        <group key={`chip-${idx}`} position={chip.pos}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={chip.size} />
            <meshStandardMaterial color={chip.color} roughness={0.4} metalness={0.6} />
          </mesh>
          <mesh position={[0, -chip.size[1]/2, 0]}>
            <boxGeometry args={[chip.size[0] + 0.2, 0.05, chip.size[2] + 0.2]} />
            <meshStandardMaterial color="#f59e0b" metalness={1.0} roughness={0.02} />
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
          <meshStandardMaterial color="#f59e0b" metalness={1.0} roughness={0.02} />
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
export default Motherboard;
