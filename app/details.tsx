import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import axios from 'axios';
import { useRoute, RouteProp } from '@react-navigation/native';
import { config } from '../constants/constant';
import StoryPage from '../components/Kahani/StoryPage'
import Navigation from '../components/Kahani/Navigation';

// Define types for route params
type RouteParams = {
  storyId: string;
};

// Define types for story data
interface StoryPage {
  // Add properties based on your actual page structure
  // For example:
  image_path?: string;
  parent_narration_text: string;
  parent_narration_audio?: string;
  // ... other properties
}

const StoryViewer: React.FC = () => {
  const URL = config.url;
  const route = useRoute<RouteProp<Record<string, RouteParams>, string>>();
  const { storyId } = route.params;
  const [storyData, setStoryData] = useState<StoryPage[] | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  // const [sound, setSound] = useState<Audio.Sound | null>(null);

  // Set the background music URL here
  const backgroundMusicUrl = require('../assets/BackGrondMusic.mp3');

  useEffect(() => {
    // Fetch story data based on storyId
    if (storyId) {
      const fetchData = async () => {
        try {
          const New_URL = `${URL}/StoryJson/${storyId}`;
          const response = await axios.get(New_URL, { timeout: 10000 });

          if (response.data && response.data.storybook) {
            const storybook = JSON.parse(response.data.storybook);
            setStoryData(storybook.pages);
            setCurrentPage(0);
          } else {
            console.error('Invalid story data structure:', response.data);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
      fetchData();
    }
  }, [storyId, URL]);

  useEffect(() => {
    // Load background music
    // const loadMusic = async () => {
    //   try {
    //     const { sound } = await Audio.Sound.createAsync(backgroundMusicUrl);
    //     setSound(sound);
    //     await sound.playAsync();
    //   } catch (error) {
    //     console.error('Error loading background music:', error);
    //   }
    // };

    //loadMusic();

    // return () => {
    //   if (sound) {
    //     sound.unloadAsync();
    //   }
    // };
  }, []);

  const nextPage = () => {
    setCurrentPage((current) => (current + 1) % (storyData?.length || 1));
  };

  const prevPage = () => {
    setCurrentPage((current) => (current - 1 + (storyData?.length || 1)) % (storyData?.length || 1));
  };

  if (!storyData) return <Text style={styles.loading}>Loading story...</Text>;

  const page = storyData[currentPage];

  return (
    <View style={styles.container}>
      <StoryPage
        page = {page}
        currentPage={currentPage}
        backgroundMusicUrl={backgroundMusicUrl}
      >
        {(pRef: React.RefObject<any>) => (
          <Navigation 
            page={page}
            currentPage={currentPage}
            totalPages={storyData.length}
            nextPage={nextPage}
            prevPage={prevPage}
            pRef={pRef}
          />
        )}
      </StoryPage>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loading: {
    fontSize: 18,
    color: '#333',
  },
});

export default StoryViewer;