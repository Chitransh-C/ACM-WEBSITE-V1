import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Motherboard } from './Motherboard';
import { CameraRig } from './CameraRig';
import { useStore } from '../../store/useStore';
import { pathVectors, ranges, getPointOnSegments } from '../../utils/paths3d';
import * as THREE from 'three';
import { Line } from '@react-three/drei';

// Helper to slice 3D path up to progress percentage
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

// Sub-component to render growing active neon yellow current paths
const ActiveCurrentTraces: React.FC = () => {
  const progress = useStore((state) => state.progress);
  
  return (
    <group>
      {Object.entries(ranges).map(([key, range]) => {
        const activeKey = key as keyof typeof ranges;
        const vectors = pathVectors[activeKey];
        
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
            <Line
              points={sliced}
              color="#fbbf24"
              lineWidth={3.5}
            />
            {/* Ambient outer glow */}
            <Line
              points={sliced}
              color="#fbbf24"
              lineWidth={9.0}
              opacity={0.4}
              transparent
            />
          </group>
        );
      })}
    </group>
  );
};

// Sub-component to render the moving glowing electron sphere with localized light tracing
const ActivePulse: React.FC = () => {
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

        if (lightRef.current) {
          lightRef.current.position.copy(point);
          lightRef.current.position.y += 0.3; // Raise light slightly above elevated wire
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
        castShadow
      />
    </group>
  );
};

// Sub-component to render glowing status lights on activated transistor nodes
const NodeLights: React.FC = () => {
  const { progress } = useStore();

  const nodes = [
    { id: 'about', pos: [-15, 0.2, -10], activeThreshold: ranges.about.end },
    { id: 'services', pos: [15, 0.2, -10], activeThreshold: ranges.services.end },
    { id: 'events', pos: [-15, 0.2, 10], activeThreshold: ranges.events.end },
    { id: 'team', pos: [15, 0.2, 10], activeThreshold: ranges.team.end },
    { id: 'contact', pos: [0, 0.2, 18], activeThreshold: ranges.contact.end },
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

// Sub-component to render a spinning CPU Cooling Fan on top of the processor core
const CPUFan: React.FC = () => {
  const { progress } = useStore();
  const fanRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!fanRef.current) return;
    
    const speed = 0.8 + progress * 7.5;
    fanRef.current.rotation.y += speed * delta;
  });

  return (
    <group position={[0, 0.38, 0]}>
      {/* Outer fan frame ring casing */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <ringGeometry args={[1.3, 1.5, 32]} />
        <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
      </mesh>
      
      {/* 4 corner bracket supports attaching case to CPU die */}
      {[-1, 1].map((x) =>
        [-1, 1].map((z) => (
          <mesh key={`${x}-${z}`} position={[x * 1.05, -0.05, z * 1.05]} rotation={[0, Math.atan2(z, x), 0]}>
            <boxGeometry args={[0.3, 0.08, 0.35]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
          </mesh>
        ))
      )}

      {/* Rotating Fan Assemblies */}
      <group ref={fanRef}>
        <mesh castShadow>
          <cylinderGeometry args={[0.38, 0.38, 0.15, 16]} />
          <meshStandardMaterial color="#475569" metalness={0.95} roughness={0.05} />
        </mesh>
        
        {/* 7 Angled Fan Blades */}
        {Array.from({ length: 7 }).map((_, i) => {
          const angle = (i * Math.PI * 2) / 7;
          return (
            <group key={i} rotation={[0, angle, 0.25]}>
              <mesh position={[0.7, 0, 0]} castShadow>
                <boxGeometry args={[0.75, 0.02, 0.28]} />
                <meshStandardMaterial color="#0b1329" roughness={0.5} metalness={0.4} />
              </mesh>
            </group>
          );
        })}
      </group>
    </group>
  );
};

export const ChipScene: React.FC = () => {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'absolute', top: 0, left: 0 }}>
      <Canvas 
        shadows 
        camera={{ fov: 45, near: 0.1, far: 100, position: [0, 5, 4] }}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={['#050816']} />
        
        {/* Ambient base lighting - Increased visibility */}
        <ambientLight intensity={0.55} />
        
        {/* Directional Sun light with shadow casting - Enhanced intensity */}
        <directionalLight 
          position={[12, 18, 12]} 
          intensity={2.2} 
          castShadow 
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-far={50}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
        />
        
        {/* RGB Backlighting - Magenta on the Left, Cyan on the Right */}
        <pointLight position={[-15, 6, 0]} intensity={1.5} color="#d946ef" distance={30} />
        <pointLight position={[15, 6, 0]} intensity={1.5} color="#06b6d4" distance={30} />

        {/* Ambient Board Underglow - Green soft light */}
        <pointLight position={[0, 0.2, 0]} intensity={1.0} color="#10b981" distance={12} />
        <pointLight position={[-3.6, 0.2, 0]} intensity={0.6} color="#00e5ff" distance={6} />
        <pointLight position={[3.6, 0.2, 0]} intensity={0.6} color="#00e5ff" distance={6} />

        {/* 3D Motherboard Geometry */}
        <Motherboard />

        {/* Dynamic Nodes Glowing status */}
        <NodeLights />

        {/* Active growing current wire glow */}
        <ActiveCurrentTraces />

        {/* Travel Pulse Glowing Sphere */}
        <ActivePulse />

        {/* Interactive CPU Cooling Fan */}
        <CPUFan />

        {/* Third Person Camera Chase controller */}
        <CameraRig />
      </Canvas>
    </div>
  );
};
export default ChipScene;
