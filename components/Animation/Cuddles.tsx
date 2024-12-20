import React, { useRef, useEffect } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { SkinnedMesh } from 'three';
import * as THREE from 'three';

interface CuddlesProps {
  animationName: string;
  onAnimationsLoaded?: (animationNames: string[]) => void;
}

const Cuddles: React.FC<CuddlesProps> = ({ animationName, onAnimationsLoaded }) => {
  const group = useRef<any>();
  const { nodes, materials, animations } = useGLTF(require('../../assets/glb/Cuddles.glb')) as unknown as {
    nodes: {
      model: SkinnedMesh;
      mixamorigHips: THREE.Object3D;
    };
    materials: {
      [key: string]: THREE.Material;
      
    };
    animations: THREE.AnimationClip[];
  };
  
  const { actions } = useAnimations(animations || [], group);

  useEffect(() => {
    if (actions && onAnimationsLoaded) {
      onAnimationsLoaded(Object.keys(actions));
    }
  }, [actions, onAnimationsLoaded]);

  useEffect(() => {
    
    if (!actions || !animationName) return;

    Object.values(actions).forEach((action) => {
      if (action) {
        action.stop();
      }
    });

    const action = actions[animationName];
    if (action) {
      action.reset().fadeIn(0.1).play();
    }
  }, [actions, animationName]);

  return (
    <group ref={group} dispose={null}>
      <group name="Teddy_girl" rotation={[Math.PI / 2, 0, 0]} scale={0.01}>
        <skinnedMesh
          name="model"
          geometry={nodes.model.geometry} // Explicitly accessing SkinnedMesh properties
          material={materials['d69f64e0-e505-481a-bce7-f87835e1756e (1)']}
          skeleton={nodes.model.skeleton}
        />
        <primitive object={nodes.mixamorigHips} />
      </group>
    </group>
  );
};

// Preload the GLTF model
useGLTF.preload(require('../../assets/glb/Cuddles.glb'));

export default Cuddles;
