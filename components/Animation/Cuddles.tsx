import React, { useEffect, useRef } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei/native';
import { GroupProps } from '@react-three/fiber';

interface ModelProps extends GroupProps {
  animationName: string;
  audioUnlocked: boolean; // Pass this value as a prop
  onAnimationsLoaded?: (animationNames: string[]) => void;
}

export const Model: React.FC<ModelProps> = ({
  animationName,
  audioUnlocked,
  onAnimationsLoaded,
  ...props
}) => {
  const group = useRef<any>();
  const { nodes, materials, animations } = useGLTF('/Cuddles.glb') as any;
  const { actions } = useAnimations(animations, group);

  const audioElements = useRef<Record<string, HTMLAudioElement[]>>({});

  const soundMap: Record<string, string[]> = {
    Bow: ['/sounds/0_Bow.mp3', '/sounds/1_Bow.mp3', '/sounds/2_Bow.mp3', '/sounds/3_Bow.mp3'],
    Dance: ['/sounds/0_Dance.mp3', '/sounds/1_Dance.mp3', '/sounds/2_Dance.mp3', '/sounds/3_Dance.mp3'],
    Excited: ['/sounds/0_Excited.mp3', '/sounds/1_Excited.mp3', '/sounds/2_Excited.mp3', '/sounds/3_Excited.mp3'],
    Happy: ['/sounds/0_Happy.mp3', '/sounds/1_Happy.mp3', '/sounds/2_Happy.mp3', '/sounds/3_Happy.mp3'],
    Jump: ['/sounds/0_Jump.mp3', '/sounds/1_Jump.mp3', '/sounds/2_Jump.mp3', '/sounds/3_Jump.mp3'],
    Look_away: ['/sounds/0_Look_Away.mp3', '/sounds/1_Look_Away.mp3', '/sounds/2_Look_Away.mp3', '/sounds/3_Look_Away.mp3'],
    Nod_yes: ['/sounds/0_Bear_Nod_yes.mp3', '/sounds/1_Bear_Nod_yes.mp3', '/sounds/2_Bear_Nod_yes.mp3', '/sounds/3_Bear_Nod_yes.mp3'],
    Run: ['/sounds/0_Run.mp3', '/sounds/1_Run.mp3', '/sounds/2_Run.mp3', '/sounds/3_Run.mp3'],
    Running: ['/sounds/0_Running.mp3', '/sounds/1_Running.mp3', '/sounds/2_Running.mp3', '/sounds/3_Running.mp3'],
    Teeter: ['/sounds/0_Teeter.mp3', '/sounds/1_Teeter.mp3', '/sounds/2_Teeter.mp3', '/sounds/3_Teeter.mp3'],
    Waving: ['/sounds/0_Waving.mp3', '/sounds/1_Waving.mp3', '/sounds/2_Waving.mp3', '/sounds/3_Waving.mp3'],
  };

  useEffect(() => {
    for (const [animName, soundPaths] of Object.entries(soundMap)) {
      audioElements.current[animName] = soundPaths.map((soundPath) => {
        try {
          const audio = new Audio(soundPath);
          audio.preload = 'auto';

          audio.addEventListener('error', (e) => {
            console.error(`Error loading audio file: ${soundPath}`, e);
          });

          return audio;
        } catch (error) {
          console.error(`Failed to load audio for '${animName}':`, error);
          return null;
        }
      }).filter(Boolean) as HTMLAudioElement[];
    }
  }, []);

  useEffect(() => {
    if (actions && onAnimationsLoaded) {
      const animationNames = Object.keys(actions);
      onAnimationsLoaded(animationNames);
    }
  }, [actions, onAnimationsLoaded]);

  useEffect(() => {
    if (!actions || !animationName) return;

    // Stop all other animations
    Object.values(actions).forEach((action) => {
      if (action._clip.name !== animationName) {
        action.stop();
      }
    });

    const action = actions[animationName];

    if (action) {
      action.reset().fadeIn(0.5).play();

      // Play audio when the animation starts
      if (audioUnlocked) {
        const audioList = audioElements.current[animationName];
        if (audioList && audioList.length > 0) {
          const randomIndex = Math.floor(Math.random() * audioList.length);
          const audio = audioList[randomIndex];

          audio.play().catch((error) => {
            console.error('Audio playback failed:', error);
          });
        }
      } else {
        console.warn('Audio playback is blocked until user interaction');
      }

      return () => {
        action.fadeOut(0.5);
      };
    } else {
      console.warn(`Animation '${animationName}' not found.`);
    }
  }, [actions, animationName, audioUnlocked]);

  return (
    <group ref={group} {...props} dispose={null}>
      <group
        name="Teddy_girl"
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.01}
      >
        <skinnedMesh
          name="model"
          geometry={nodes.model.geometry}
          material={materials['d69f64e0-e505-481a-bce7-f87835e1756e (1)']}
          skeleton={nodes.model.skeleton}
        />
        <primitive object={nodes.mixamorigHips} />
      </group>
    </group>
  );
};

useGLTF.preload(require('../../assets/images/Cuddles.glb'));l
