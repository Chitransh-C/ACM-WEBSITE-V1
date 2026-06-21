import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../store/useStore';

export const CPUFan: React.FC = () => {
  const { progress } = useStore();
  const fanRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!fanRef.current) return;
    
    // Fan speed accelerates as we scroll
    const speed = 0.8 + progress * 7.5;
    fanRef.current.rotation.y += speed * delta;
  });

  const isActivated = progress >= 0.98;

  return (
    <group position={[0, 0.4, -14]}>
      {/* 1. Four chrome vertical suspension corner pillars/brackets to the socket base */}
      {[-1, 1].map((x) =>
        [-1, 1].map((z) => (
          <mesh key={`${x}-${z}`} position={[x * 1.4, -0.2, z * 1.4]} castShadow>
            <cylinderGeometry args={[0.06, 0.06, 0.4, 8]} />
            <meshStandardMaterial color="#e2e8f0" metalness={1.0} roughness={0.05} />
          </mesh>
        ))
      )}

      {/* 2. Outer fan housing ring casing — glows cyan when activated as the Get Involved node */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <ringGeometry args={[1.3, 1.5, 32]} />
        <meshStandardMaterial 
          color={isActivated ? '#00e5ff' : '#334155'} 
          emissive={isActivated ? '#00e5ff' : '#000000'}
          emissiveIntensity={isActivated ? 1.8 : 0}
          metalness={0.7} 
          roughness={0.3} 
        />
      </mesh>

      {/* Dynamic cyan node glow light pointing up onto the fan blades */}
      {isActivated && (
        <pointLight position={[0, 0.1, 0]} color="#00e5ff" intensity={3.5} distance={6} decay={1.5} />
      )}
      
      {/* 3. Outer casing support tabs */}
      {[-1, 1].map((x) =>
        [-1, 1].map((z) => (
          <mesh key={`tab-${x}-${z}`} position={[x * 1.4, 0.0, z * 1.4]} rotation={[0, Math.atan2(z, x), 0]}>
            <boxGeometry args={[0.3, 0.08, 0.35]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
          </mesh>
        ))
      )}

      {/* 4. Rotating Fan Blade Assembly */}
      <group ref={fanRef}>
        {/* Fan Hub Center */}
        <mesh castShadow>
          <cylinderGeometry args={[0.38, 0.38, 0.15, 16]} />
          <meshStandardMaterial color="#cbd5e1" metalness={1.0} roughness={0.1} />
        </mesh>
        
        {/* 7 Angled Fan Blades - Polished Metallic Silver */}
        {Array.from({ length: 7 }).map((_, i) => {
          const angle = (i * Math.PI * 2) / 7;
          return (
            <group key={i} rotation={[0, angle, 0.25]}>
              {/* Blade Body */}
              <mesh position={[0.7, 0, 0]} castShadow>
                <boxGeometry args={[0.75, 0.02, 0.28]} />
                <meshStandardMaterial color="#cbd5e1" roughness={0.1} metalness={1.0} />
              </mesh>
            </group>
          );
        })}
      </group>
    </group>
  );
};
export default CPUFan;
