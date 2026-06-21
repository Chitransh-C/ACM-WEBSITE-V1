import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../store/useStore';
import { pathVectors, ranges, getPointOnSegments } from '../../utils/paths3d';

const PATH_COLORS: Record<string, string> = {
  about:    '#fbbf24',  // amber/gold
  services: '#22d3ee',  // cyan
  events:   '#a78bfa',  // violet
  team:     '#34d399',  // emerald
  contact:  '#f472b6',  // pink
};

export const ActivePulse: React.FC = () => {
  const { progress } = useStore();
  const sphereRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame(() => {
    if (!sphereRef.current) return;

    let activeKey: keyof typeof ranges | null = null;
    if (progress >= 0.15 && progress < 0.30) activeKey = 'about';
    else if (progress >= 0.30 && progress < 0.50) activeKey = 'services';
    else if (progress >= 0.50 && progress < 0.70) activeKey = 'events';
    else if (progress >= 0.70 && progress < 0.85) activeKey = 'team';
    else if (progress >= 0.85) activeKey = 'contact';

    if (activeKey) {
      const range = ranges[activeKey];
      let pathProgress = (progress - range.start) / (range.end - range.start);
      pathProgress = Math.min(Math.max(pathProgress, 0), 1);

      if (pathProgress > 0 && pathProgress < 1) {
        const { point } = getPointOnSegments(pathVectors[activeKey], pathProgress);
        sphereRef.current.position.copy(point);
        sphereRef.current.visible = true;

        const colorHex = PATH_COLORS[activeKey];
        if (sphereRef.current.material) {
          (sphereRef.current.material as THREE.MeshBasicMaterial).color.set(colorHex);
        }

        if (lightRef.current) {
          lightRef.current.position.copy(point);
          lightRef.current.position.y += 0.3; // Raise light slightly above elevated wire
          lightRef.current.color.set(colorHex);
          lightRef.current.intensity = 2.4;
        }
        return;
      }
    }

    sphereRef.current.visible = false;
    if (lightRef.current) {
      lightRef.current.intensity = 0;
    }
  });

  return (
    <group>
      <mesh ref={sphereRef} visible={false}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color="#fbbf24" />
      </mesh>
      <pointLight 
        ref={lightRef} 
        color="#fbbf24" 
        distance={8} 
        decay={2} 
        intensity={0}
      />
    </group>
  );
};
export default ActivePulse;
