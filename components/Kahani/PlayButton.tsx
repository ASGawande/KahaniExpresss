import React, { useEffect, useRef } from 'react';
import { Animated, TouchableOpacity, Text, StyleSheet, View } from 'react-native';

interface PlayButtonProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
}

const PlayButton: React.FC<PlayButtonProps> = ({ isPlaying, onTogglePlay }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isPlaying) {
      // Start running animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Stop animation
      animatedValue.setValue(0);
    }
  }, [isPlaying]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-10, 10], // Small horizontal oscillation
  });

  return (
    <TouchableOpacity style={styles.playButton} onPress={onTogglePlay}>
      <View style={styles.buttonContent}>
        {isPlaying ? (
          <>
            {/* Running Lion Animation */}
            <Animated.Text style={[styles.lionEmoji, { transform: [{ translateX }] }]}>
              🦁💨
            </Animated.Text>
            <Text style={styles.playPauseText}>Pause</Text>
          </>
        ) : (
          <>
            {/* Static Lion with Play Icon */}
            <Text style={styles.lionEmoji}>🦁</Text>
            <Text style={styles.playPauseText}>Play</Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  playButton: {
    backgroundColor: '#ffffff', // White background
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ff9900', // Orange border
    elevation: 3, // Android shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonContent: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  lionEmoji: {
    fontSize: 30,
    textAlign: 'center',
  },
  playPauseText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '600',
    marginTop: 5,
    textAlign: 'center',
  },
});

export default PlayButton;
