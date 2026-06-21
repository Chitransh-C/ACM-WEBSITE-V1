import React from 'react';

export const RAMCard: React.FC<{ position: [number, number, number] }> = ({ position }) => {
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
export default RAMCard;
