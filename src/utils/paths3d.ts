import * as THREE from 'three';

// Elevate all path coordinates to y = 0.35 so they run cleanly above component socket dies (y = 0.2)
export const pathVectors = {
  about: [
    new THREE.Vector3(0, 0.35, 0),
    new THREE.Vector3(-4, 0.35, -2),
    new THREE.Vector3(-8, 0.35, -2),
    new THREE.Vector3(-10, 0.35, -5),
    new THREE.Vector3(-13, 0.35, -5),
    new THREE.Vector3(-15, 0.35, -8),
    new THREE.Vector3(-15, 0.35, -10),
  ],
  services: [
    new THREE.Vector3(0, 0.35, 0),
    new THREE.Vector3(4, 0.35, -2),
    new THREE.Vector3(8, 0.35, -2),
    new THREE.Vector3(10, 0.35, -5),
    new THREE.Vector3(13, 0.35, -5),
    new THREE.Vector3(15, 0.35, -8),
    new THREE.Vector3(15, 0.35, -10),
  ],
  events: [
    new THREE.Vector3(0, 0.35, 0),
    new THREE.Vector3(-4, 0.35, 2),
    new THREE.Vector3(-8, 0.35, 2),
    new THREE.Vector3(-10, 0.35, 5),
    new THREE.Vector3(-13, 0.35, 5),
    new THREE.Vector3(-15, 0.35, 8),
    new THREE.Vector3(-15, 0.35, 10),
  ],
  team: [
    new THREE.Vector3(0, 0.35, 0),
    new THREE.Vector3(4, 0.35, 2),
    new THREE.Vector3(8, 0.35, 2),
    new THREE.Vector3(10, 0.35, 5),
    new THREE.Vector3(13, 0.35, 5),
    new THREE.Vector3(15, 0.35, 8),
    new THREE.Vector3(15, 0.35, 10),
  ],
  contact: [
    new THREE.Vector3(0, 0.35, 0),
    new THREE.Vector3(-2, 0.35, 4),
    new THREE.Vector3(-2, 0.35, 9),
    new THREE.Vector3(0, 0.35, 13),
    new THREE.Vector3(0, 0.35, 18),
  ],
};

export const ranges = {
  about: { start: 0.15, end: 0.30 },
  services: { start: 0.30, end: 0.50 },
  events: { start: 0.50, end: 0.70 },
  team: { start: 0.70, end: 0.85 },
  contact: { start: 0.85, end: 1.0 },
};

export interface PathSample {
  point: THREE.Vector3;
  tangent: THREE.Vector3;
}

export function getPointOnSegments(segments: THREE.Vector3[], progress: number): PathSample {
  if (segments.length === 0) return { point: new THREE.Vector3(), tangent: new THREE.Vector3(0, 0, -1) };
  if (segments.length === 1) return { point: segments[0].clone(), tangent: new THREE.Vector3(0, 0, -1) };
  
  const lengths: number[] = [];
  let totalLength = 0;
  for (let i = 0; i < segments.length - 1; i++) {
    const len = segments[i].distanceTo(segments[i + 1]);
    lengths.push(len);
    totalLength += len;
  }
  
  const targetLen = totalLength * progress;
  let currentLen = 0;
  
  for (let i = 0; i < segments.length - 1; i++) {
    const len = lengths[i];
    if (currentLen + len >= targetLen) {
      const segmentProgress = (targetLen - currentLen) / len;
      const point = new THREE.Vector3().lerpVectors(segments[i], segments[i + 1], segmentProgress);
      const tangent = new THREE.Vector3().subVectors(segments[i + 1], segments[i]).normalize();
      return { point, tangent };
    }
    currentLen += len;
  }
  
  const lastIndex = segments.length - 1;
  const tangent = new THREE.Vector3().subVectors(segments[lastIndex], segments[lastIndex - 1]).normalize();
  return { point: segments[lastIndex].clone(), tangent };
}
