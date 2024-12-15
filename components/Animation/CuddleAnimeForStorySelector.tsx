import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Canvas } from '@react-three/fiber/native';
import { OrbitControls, Environment } from '@react-three/drei/native';
import { Model as Cuddles } from './Cuddles'; // Assuming Cuddles is your 3D model component

interface CuddleAnimeForStorySelectorProps {
  animationName?: string;
}

const CuddleAnimeForStorySelector: React.FC<CuddleAnimeForStorySelectorProps> = ({
  animationName = 'Idle',
}) => {
  return (
    <View style={styles.container}>
      <Canvas
        camera={{ position: [0, 2, 5], fov: 50 }}
        shadows
      >
        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 10, 5]} intensity={1} castShadow />

        {/* Teddy Model */}
        <Cuddles animationName={animationName} />

        {/* Controls and Environment */}
        <OrbitControls
          enableZoom={false}
          enableRotate={true}
          enablePan={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
          autoRotate={false}
        />
        <Environment preset="sunset" />
      </Canvas>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 500,
    width: Dimensions.get('window').width,
  },
});

export default CuddleAnimeForStorySelector;
