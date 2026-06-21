import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../store/useStore';
import { pathVectors, ranges, getPointOnSegments } from '../../utils/paths3d';

export const CameraRig: React.FC = () => {
  const { progress } = useStore();
  
  // Track lerped targets
  const currentLookAt = useRef(new THREE.Vector3(0, 0.3, 0));
  const targetPos = useRef(new THREE.Vector3(0, 5, 4));
  const targetLookAt = useRef(new THREE.Vector3(0, 0.3, 0));

  useFrame((state) => {
    // 1. Calculate camera and look-at targets based on scroll progress
    if (progress < 0.12) {
      // Landing: focused closely on central CPU die
      targetPos.current.set(0, 3.8, 3.2);
      targetLookAt.current.set(0, 0.35, 0);
    } else {
      // Active path calculation
      let activeKey: keyof typeof ranges = 'about';
      if (progress < 0.30) activeKey = 'about';
      else if (progress < 0.50) activeKey = 'services';
      else if (progress < 0.70) activeKey = 'events';
      else if (progress < 0.85) activeKey = 'team';
      else activeKey = 'contact';

      const range = ranges[activeKey];
      let pathProgress = 0;
      if (progress > range.start) {
        pathProgress = (progress - range.start) / (range.end - range.start);
        pathProgress = Math.min(Math.max(pathProgress, 0), 1);
      }

      const vectors = pathVectors[activeKey];
      
      if (pathProgress > 0 && pathProgress < 0.98) {
        // Current traveling: Chase camera mode (look behind the pulse)
        const { point, tangent } = getPointOnSegments(vectors, pathProgress);
        
        // Chase offset (behind and above the traveling pulse)
        const chaseDistance = 3.5;
        const heightOffset = 1.4;
        
        targetPos.current.set(
          point.x - tangent.x * chaseDistance,
          point.y + heightOffset,
          point.z - tangent.z * chaseDistance
        );
        
        // Look slightly ahead of the pulse
        const lookAheadDistance = 1.2;
        targetLookAt.current.set(
          point.x + tangent.x * lookAheadDistance,
          point.y + 0.1,
          point.z + tangent.z * lookAheadDistance
        );
      } else {
        // Node reached: Lock camera on node, pan to fit UI panel
        const lastPt = vectors[vectors.length - 1];
        
        // Custom angles for each node to frame the active panel nicely
        if (activeKey === 'about') {
          targetPos.current.set(lastPt.x + 3.2, lastPt.y + 1.2, lastPt.z + 1.2);
          targetLookAt.current.set(lastPt.x, lastPt.y + 0.2, lastPt.z);
        } else if (activeKey === 'services') {
          targetPos.current.set(lastPt.x - 3.2, lastPt.y + 1.2, lastPt.z + 1.2);
          targetLookAt.current.set(lastPt.x, lastPt.y + 0.2, lastPt.z);
        } else if (activeKey === 'events') {
          targetPos.current.set(lastPt.x + 3.2, lastPt.y + 1.2, lastPt.z - 1.2);
          targetLookAt.current.set(lastPt.x, lastPt.y + 0.2, lastPt.z);
        } else if (activeKey === 'team') {
          targetPos.current.set(lastPt.x - 3.2, lastPt.y + 1.2, lastPt.z - 1.2);
          targetLookAt.current.set(lastPt.x, lastPt.y + 0.2, lastPt.z);
        } else {
          // Contact node (bottom)
          targetPos.current.set(lastPt.x, lastPt.y + 1.6, lastPt.z - 3.2);
          targetLookAt.current.set(lastPt.x, lastPt.y + 0.2, lastPt.z);
        }
      }
    }

    // 2. Smoothly Lerp Camera Coordinates
    state.camera.position.lerp(targetPos.current, 0.05);
    
    // 3. Smoothly Lerp LookAt Coordinates
    currentLookAt.current.lerp(targetLookAt.current, 0.05);
    state.camera.lookAt(currentLookAt.current);
    
    // Update camera matrix
    state.camera.updateProjectionMatrix();
  });

  return null;
};
