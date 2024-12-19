import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import Cuddles from './Cuddles';

interface CuddleAnimeForStorySelectorProps {
  animationName: string;
}

const CuddleAnimeForStorySelector: React.FC<CuddleAnimeForStorySelectorProps> = ({
  animationName = 'Idle',
}) => {
  return (
    <View style={styles.container}>
      {/* Canvas for 3D rendering */}
      <Canvas
        camera={{ position: [0, 2, 5], fov: 50 }}
        style={{ flex: 1 }} // Ensure the canvas fills the container
      >
        {/* 3D Scene */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
        <Cuddles animationName={animationName} />
        {/* Placeholder mesh to verify the canvas */}
        
        <hemisphereLight intensity={0.3} groundColor={0x444444} />
        <OrbitControls
          enableZoom={false}
          enableRotate={true}
          enablePan={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
        />
        <Environment preset="sunset" />
      </Canvas>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    
    height: 500,
    width: 500,
  },
});

export default CuddleAnimeForStorySelector;
