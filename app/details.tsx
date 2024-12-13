import React, { useEffect, useRef, useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import axios from 'axios';
import { useRoute, RouteProp } from '@react-navigation/native';
import { config } from '../constants/constant';
import StoryPage from '../components/Kahani/StoryPage';
import Navigation from '../components/Kahani/Navigation';
import NarrationText from '../components/Kahani/NarrationText';
import ConfigurationPage from '../components/Kahani/ConfigurationPage';

// Define types for route params
type RouteParams = {
  storyId: string;
};

// Define types for story data
interface StoryPage {
  image_path?: string;
  parent_narration_text: string;
  parent_narration_audio?: string;
  page_no: number;
}

interface Story {
  title: string;
  description: string;
  author: string;
  languages: string;
}

const StoryViewer: React.FC = () => {
  const URL = config.url;
  const route = useRoute<RouteProp<Record<string, RouteParams>, string>>();
  const { storyId } = route.params;
  const [story, setStory] = useState<Story>({
    title: 'Default Story Title',
    description: 'Default Story Description',
    author: 'Default Author',
    languages: 'English',
  });
  const [storyData, setStoryData] = useState<StoryPage[] | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const narrationRef = useRef<any>(null);

  const backgroundMusicUrl = require('../assets/BackGrondMusic.mp3');

  useEffect(() => {
    if (storyId) {
      const fetchData = async () => {
        try {
          const response = await axios.get(`${URL}/StoryJson/${storyId}`, { timeout: 10000 });
          if (response.data && response.data.storybook) {
            const storybook = JSON.parse(response.data.storybook);
            setStory({
              title: storybook.title || 'Default Story Title',
              description: storybook.description || 'Default Story Description',
              author: storybook.author || 'Author',
              languages: storybook.languages || 'English',
            });
            setStoryData(storybook.pages);
            setCurrentPage(0);
          } else {
            console.error('Invalid story data structure:', response.data);
          }
        } catch (error) {
          console.error('Error fetching story data:', error);
        }
      };
      fetchData();
    }
  }, [storyId, URL]);

  const resetNarration = async () => {
    if (narrationRef.current) {
      await narrationRef.current.pauseNarration();
    }
  };

  const nextPageHandler = async () => {
    await resetNarration();
    setCurrentPage((prev) => (prev + 1) % (storyData?.length || 1));
  };

  const prevPageHandler = async () => {
    await resetNarration();
    setCurrentPage((prev) => (prev - 1 + (storyData?.length || 1)) % (storyData?.length || 1));
  };

  if (!storyData) {
    return <Text style={styles.loading}>Loading story...</Text>;
  }

  const page = storyData[currentPage];

  const onContinue = () => {
    setCurrentPage(1); // Change the currentPage to 1
  };

  const onNarrationEnd = () => {
    if (currentPage < storyData.length - 1) {
      nextPageHandler();
    }
  };

  if (currentPage === 0) {
    return (
      <ConfigurationPage
        image={page.image_path}
        onContinue={onContinue}
        story={story}
      />
    );
  }

  return (
    <View style={styles.container}>
      <StoryPage
        page={page}
        currentPage={currentPage}
        backgroundMusicUrl={backgroundMusicUrl}
      >
        {(pRef: React.RefObject<any>) => (
          <Navigation
            page={page}
            currentPage={currentPage}
            totalPages={storyData.length}
            nextPage={nextPageHandler}
            prevPage={prevPageHandler}
            pRef={pRef}
          />
        )}
      </StoryPage>
      <NarrationText
        text={page.parent_narration_text}
        backgroundMusicUrl={backgroundMusicUrl}
        storyId={storyId}
        currentPage={currentPage}
        onNarrationEnd={onNarrationEnd}
      />
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
