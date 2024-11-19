import { Audio } from 'expo-av';
console.log(Audio)
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Button } from 'react-native';


const AudioPlayer = ({ url }: { url: string }) => {
  const [sound, setSound] = useState<Audio.Sound>();
  
  useEffect(() => {
    return sound
      ? () => {
          console.log('Unloading Sound');
          sound.unloadAsync(); 
        }
      : undefined;
  }, [sound]);

  const playSound = async () => {
    
    try {
      console.log('Loading Sound');
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true }
      );
      setSound(newSound);
      console.log('Playing Sound');
      await newSound.playAsync();
    } catch (e) {
      console.error('Failed to load the sound', e);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Play Sound" onPress={playSound} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AudioPlayer;
