import React from 'react';

export const Heatsink: React.FC<{ position: [number, number, number], size: [number, number, number] }> = ({ position, size }) => {
  const finWidth = 0.06;
  const numFins = 6;
  const spacing = size[0] / (numFins - 1);
  return (
    <group position={position}>
      {/* Base contact plate */}
      <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[size[0] + 0.1, 0.08, size[2] + 0.1]} />
        <meshStandardMaterial color="#cbd5e1" metalness={1.0} roughness={0.12} />
      </mesh>
      {/* Parallel cooling fins */}
      {Array.from({ length: numFins }).map((_, i) => {
        const xOffset = -size[0] / 2 + i * spacing;
        return (
          <mesh key={i} position={[xOffset, size[1]/2 + 0.05, 0]} castShadow>
            <boxGeometry args={[finWidth, size[1], size[2]]} />
            <meshStandardMaterial color="#cbd5e1" metalness={1.0} roughness={0.15} />
          </mesh>
        );
      })}
    </group>
  );
};
export default Heatsink;
