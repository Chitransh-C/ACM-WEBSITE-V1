import React from 'react';
import { Text } from '@react-three/drei';
import { useStore } from '../../store/useStore';

const PATH_COLORS: Record<string, string> = {
  about:    '#fbbf24',  // amber/gold
  services: '#22d3ee',  // cyan
  events:   '#a78bfa',  // violet
  team:     '#34d399',  // emerald
  contact:  '#f472b6',  // pink
};

export const CpuChip: React.FC = () => {
  const activeSection = useStore((state) => state.activeSection);
  const activeColor = (activeSection && PATH_COLORS[activeSection]) || '#00e5ff';

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Socket board - brushed gold edge ring */}
      <mesh position={[0, 0.10, 0]} receiveShadow>
        <boxGeometry args={[4.8, 0.20, 4.8]} />
        <meshStandardMaterial color="#c08020" metalness={1.0} roughness={0.04} />
      </mesh>

      {/* 2. Inner socket substrate — matte black PCB */}
      <mesh position={[0, 0.19, 0]}>
        <boxGeometry args={[4.5, 0.10, 4.5]} />
        <meshStandardMaterial color="#060a14" metalness={0.5} roughness={0.55} />
      </mesh>

      {/* 3. IHS base plate — bright brushed silver, wider chamfer feel */}
      <mesh position={[0, 0.24, 0]}>
        <boxGeometry args={[4.0, 0.08, 4.0]} />
        <meshStandardMaterial
          color="#cbd5e1"
          metalness={0.95}
          roughness={0.2}
          emissive="#2a303a"
          emissiveIntensity={0.6}
        />
      </mesh>

      {/* 4. IHS Metal Lid — ultra-polished mirror silver top */}
      <mesh position={[0, 0.31, 0]}>
        <boxGeometry args={[3.35, 0.14, 3.35]} />
        <meshStandardMaterial
          color="#f1f5f9"
          metalness={0.95}
          roughness={0.12}
          emissive="#3a4252"
          emissiveIntensity={0.7}
          envMapIntensity={2.5}
        />
      </mesh>

      {/* 5. Chamfer bevel strips (4 edges) — accent the octagonal-ish silhouette */}
      {[
        { pos: [ 1.68, 0.31,  0] as [number,number,number], rot: [0, 0,  Math.PI/4] as [number,number,number], l: 3.35 },
        { pos: [-1.68, 0.31,  0] as [number,number,number], rot: [0, 0, -Math.PI/4] as [number,number,number], l: 3.35 },
        { pos: [0,  0.31,  1.68] as [number,number,number], rot: [Math.PI/4, 0, 0] as [number,number,number], l: 3.35 },
        { pos: [0,  0.31, -1.68] as [number,number,number], rot: [-Math.PI/4, 0, 0] as [number,number,number], l: 3.35 },
      ].map(({ pos, rot, l }, i) => (
        <mesh key={`bevel-${i}`} position={pos} rotation={rot}>
          <boxGeometry args={[0.06, 0.06, l]} />
          <meshStandardMaterial
            color="#cbd5e1"
            metalness={0.95}
            roughness={0.15}
            emissive="#2a303a"
            emissiveIntensity={0.6}
          />
        </mesh>
      ))}

      {/* 6. Laser-etched die window inset — recessed metallic silver/grey square */}
      <mesh position={[0, 0.372, 0]}>
        <boxGeometry args={[2.6, 0.008, 2.6]} />
        <meshStandardMaterial
          color="#cbd5e1"
          metalness={0.9}
          roughness={0.35}
          emissive="#555c68"
          emissiveIntensity={0.9}
        />
      </mesh>

      {/* 7. Inner die highlight — glowing border/rim */}
      <mesh position={[0, 0.374, 0]}>
        <boxGeometry args={[2.61, 0.003, 2.61]} />
        <meshStandardMaterial
          color={activeColor}
          emissive={activeColor}
          emissiveIntensity={3.0}
          toneMapped={false}
          metalness={0.0}
          roughness={1.0}
        />
      </mesh>

      {/* Glowing container border around the text area - widened to 3.2 to prevent cutting text */}
      {[
        { pos: [0, 0.386, -1.25] as [number,number,number], args: [3.2, 0.008, 0.015] }, // top
        { pos: [0, 0.386, 0.95] as [number,number,number], args: [3.2, 0.008, 0.015] },  // bottom
        { pos: [-1.6, 0.386, -0.15] as [number,number,number], args: [0.015, 0.008, 2.2] }, // left
        { pos: [1.6, 0.386, -0.15] as [number,number,number], args: [0.015, 0.008, 2.2] },  // right
      ].map((border, i) => (
        <mesh key={`text-border-${i}`} position={border.pos}>
          <boxGeometry args={border.args} />
          <meshStandardMaterial
            color={activeColor}
            emissive={activeColor}
            emissiveIntensity={2.5}
            toneMapped={false}
            metalness={0.5}
            roughness={0.2}
          />
        </mesh>
      ))}

      {/* ─── CHIP LABEL LAYOUT (on top face, y = 0.385) ─── */}

      {/* ACM logo mark */}
      <Text
        position={[0, 0.385, -1.0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.10}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.18}
      >
        ◆ ASSOCIATION FOR COMPUTING MACHINERY ◆
        <meshStandardMaterial
          color={activeColor}
          emissive={activeColor}
          emissiveIntensity={1.5}
          toneMapped={false}
        />
      </Text>

      {/* Main brand */}
      <Text
        position={[0, 0.385, -0.48]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.50}
        fontWeight="bold"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.05}
      >
        ACM MITS
        <meshStandardMaterial
          color={activeColor}
          emissive={activeColor}
          emissiveIntensity={2.5}
          toneMapped={false}
        />
      </Text>

      {/* Chapter designation */}
      <Text
        position={[0, 0.385, 0.14]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.13}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.12}
      >
        STUDENT CHAPTER
        <meshStandardMaterial
          color={activeColor}
          emissive={activeColor}
          emissiveIntensity={1.5}
          toneMapped={false}
        />
      </Text>

      {/* Divider line */}
      <mesh position={[0, 0.386, 0.38]}>
        <boxGeometry args={[2.0, 0.006, 0.012]} />
        <meshStandardMaterial
          color={activeColor}
          emissive={activeColor}
          emissiveIntensity={2.0}
          toneMapped={false}
          metalness={0.8}
          roughness={0.3}
        />
      </mesh>

      {/* Spec line */}
      <Text
        position={[0, 0.385, 0.64]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.10}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.06}
      >
        CORE PROC-X1  //  REV 2026  //  MITS-GWL
        <meshStandardMaterial
          color={activeColor}
          emissive={activeColor}
          emissiveIntensity={1.2}
          toneMapped={false}
        />
      </Text>

      {/* Gold pin-1 corner marker */}
      <mesh position={[-1.52, 0.386, 1.52]} rotation={[-Math.PI / 2, 0, -Math.PI / 4]}>
        <coneGeometry args={[0.08, 0.018, 3]} />
        <meshStandardMaterial color="#f59e0b" metalness={1.0} roughness={0.01} />
      </mesh>

      {/* Perimeter micro capacitors */}
      {Array.from({ length: 12 }).map((_, idx) => {
        const angle = (idx * Math.PI * 2) / 12;
        const radius = 2.2;
        return (
          <mesh
            key={`socket-cap-${idx}`}
            position={[Math.cos(angle) * radius, 0.21, Math.sin(angle) * radius]}
          >
            <boxGeometry args={[0.14, 0.09, 0.14]} />
            <meshStandardMaterial color="#c0ccd8" metalness={1.0} roughness={0.08} />
          </mesh>
        );
      })}
    </group>
  );
};
export default CpuChip;
