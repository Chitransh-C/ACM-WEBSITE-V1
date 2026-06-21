import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../store/useStore';
import { pathVectors, ranges, getPointOnSegments } from '../../utils/paths3d';

// Active path key from progress
function getActiveKey(progress: number): keyof typeof ranges {
  if (progress < 0.30) return 'about';
  if (progress < 0.50) return 'services';
  if (progress < 0.70) return 'events';
  if (progress < 0.85) return 'team';
  return 'contact';
}

export const CameraRig: React.FC = () => {
  const { progress } = useStore();

  // Smooth interpolated targets
  const currentPos    = useRef(new THREE.Vector3(0, 5, 4));
  const currentLookAt = useRef(new THREE.Vector3(0, 0.3, 0));

  // Track last active key to detect circuit switches
  const prevActiveKey = useRef<keyof typeof ranges | null>(null);

  // Zoom-out transition state
  // 0 = idle, >0 = animating (counts down)
  const zoomPhase   = useRef<'idle' | 'zoomout' | 'zoomin'>('idle');
  const zoomTimer   = useRef(0);
  const ZOOMOUT_DUR = 0.55;  // seconds for zoom-out phase
  const ZOOMIN_DUR  = 0.45;  // seconds for zoom-in phase

  // The neutral "overview of the chip" position used during the zoom-out phase
  const CHIP_OVERVIEW_POS    = new THREE.Vector3(0, 8.5, 5.0);
  const CHIP_OVERVIEW_LOOKAT = new THREE.Vector3(0, 0.3, 0);

  useFrame((state, delta) => {
    const activeKey = getActiveKey(progress);

    // ── Detect circuit switch and trigger zoom-out → zoom-in ──────────────
    if (prevActiveKey.current !== null && prevActiveKey.current !== activeKey) {
      zoomPhase.current = 'zoomout';
      zoomTimer.current = 0;
    }
    prevActiveKey.current = activeKey;

    // ── Advance zoom timer ─────────────────────────────────────────────────
    if (zoomPhase.current !== 'idle') {
      zoomTimer.current += delta;
      if (zoomPhase.current === 'zoomout' && zoomTimer.current >= ZOOMOUT_DUR) {
        zoomPhase.current = 'zoomin';
        zoomTimer.current = 0;
      } else if (zoomPhase.current === 'zoomin' && zoomTimer.current >= ZOOMIN_DUR) {
        zoomPhase.current = 'idle';
        zoomTimer.current = 0;
      }
    }

    // ── Compute the "normal" chase target ─────────────────────────────────
    const range = ranges[activeKey];
    let pathProgress = 0;
    if (progress > range.start) {
      pathProgress = (progress - range.start) / (range.end - range.start);
      pathProgress = Math.min(Math.max(pathProgress, 0), 1);
    }

    const vectors = pathVectors[activeKey];
    const { point, tangent } = getPointOnSegments(vectors, pathProgress);

    const chaseDistance  = 3.5;
    const heightOffset   = 1.4;
    const lookAheadDist  = 1.2;

    const chasePos = new THREE.Vector3(
      point.x - tangent.x * chaseDistance,
      point.y + heightOffset,
      point.z - tangent.z * chaseDistance
    );
    const chaseLookAt = new THREE.Vector3(
      point.x + tangent.x * lookAheadDist,
      point.y + 0.1,
      point.z + tangent.z * lookAheadDist
    );

    // ── Locked node view near path end ────────────────────────────────────
    const lastPt = vectors[vectors.length - 1];
    const lockedLookAt = new THREE.Vector3(lastPt.x, lastPt.y + 0.2, lastPt.z);
    const lockedPos = new THREE.Vector3();
    if      (activeKey === 'about')    lockedPos.set(lastPt.x + 3.2, lastPt.y + 1.2, lastPt.z + 1.2);
    else if (activeKey === 'services') lockedPos.set(lastPt.x - 3.2, lastPt.y + 1.2, lastPt.z + 1.2);
    else if (activeKey === 'events')   lockedPos.set(lastPt.x + 3.2, lastPt.y + 1.2, lastPt.z - 1.2);
    else if (activeKey === 'team')     lockedPos.set(lastPt.x - 3.2, lastPt.y + 1.2, lastPt.z - 1.2);
    else                               lockedPos.set(lastPt.x, lastPt.y + 1.6, lastPt.z + 3.2);

    // Blend chase → locked when near path end
    let finalTargetPos    = chasePos.clone();
    let finalTargetLookAt = chaseLookAt.clone();
    if (pathProgress >= 0.75) {
      const blendT = (pathProgress - 0.75) / 0.25;
      finalTargetPos.lerp(lockedPos, blendT);
      finalTargetLookAt.lerp(lockedLookAt, blendT);
    }

    // ── Landing overview blend at progress near 0 ─────────────────────────
    const landingPos    = new THREE.Vector3(0, 3.8, 3.2);
    const landingLookAt = new THREE.Vector3(0, 0.35, 0);
    if (progress < 0.15) {
      const t = progress / 0.15;
      finalTargetPos    = landingPos.clone().lerp(finalTargetPos, t);
      finalTargetLookAt = landingLookAt.clone().lerp(finalTargetLookAt, t);
    }

    // ── Apply zoom-out/in override ────────────────────────────────────────
    if (zoomPhase.current === 'zoomout') {
      // Ease from wherever camera is → chip overview (zoom out)
      const t = Math.min(zoomTimer.current / ZOOMOUT_DUR, 1);
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // ease-in-out quad
      finalTargetPos    = finalTargetPos.clone().lerp(CHIP_OVERVIEW_POS, ease);
      finalTargetLookAt = finalTargetLookAt.clone().lerp(CHIP_OVERVIEW_LOOKAT, ease);
    } else if (zoomPhase.current === 'zoomin') {
      // Ease from overview → new chase position (zoom in)
      const t = Math.min(zoomTimer.current / ZOOMIN_DUR, 1);
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      finalTargetPos    = CHIP_OVERVIEW_POS.clone().lerp(finalTargetPos, ease);
      finalTargetLookAt = CHIP_OVERVIEW_LOOKAT.clone().lerp(finalTargetLookAt, ease);
    }

    // ── Smooth lerp camera to targets ─────────────────────────────────────
    // Faster lerp during zoom phases for snappier feel
    const lerpSpeed = zoomPhase.current !== 'idle' ? 0.08 : 0.04;
    currentPos.current.lerp(finalTargetPos, lerpSpeed);
    currentLookAt.current.lerp(finalTargetLookAt, lerpSpeed);

    state.camera.position.copy(currentPos.current);
    state.camera.lookAt(currentLookAt.current);
    state.camera.updateProjectionMatrix();
  });

  return null;
};
