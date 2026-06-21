import React from 'react';
import { useStore } from '../../store/useStore';
import { ranges } from '../../utils/paths3d';

export const NodeLights: React.FC = () => {
  const { progress } = useStore();

  const nodes = [
    { id: 'about', pos: [-15, 0.2, -10], activeThreshold: ranges.about.end },
    { id: 'services', pos: [15, 0.2, -10], activeThreshold: ranges.services.end },
    { id: 'events', pos: [-15, 0.2, 10], activeThreshold: ranges.events.end },
    { id: 'team', pos: [15, 0.2, 10], activeThreshold: ranges.team.end },
  ];

  return (
    <group>
      {nodes.map((node) => {
        const isActivated = progress >= node.activeThreshold - 0.02;
        return (
          <group key={node.id} position={node.pos as [number, number, number]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.6, 0.6, 0.4, 16]} />
              <meshStandardMaterial 
                color={isActivated ? '#00e5ff' : '#0f172a'} 
                emissive={isActivated ? '#00e5ff' : '#000000'}
                emissiveIntensity={isActivated ? 1.5 : 0}
                roughness={0.2}
                metalness={0.8}
              />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
              <ringGeometry args={[0.8, 1.0, 16]} />
              <meshBasicMaterial color={isActivated ? '#00e5ff' : '#1e293b'} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};
export default NodeLights;
