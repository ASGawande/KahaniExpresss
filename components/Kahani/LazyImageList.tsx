// LazyImageList.tsx

import React, { useState, useEffect } from 'react';
import { FlatList, Text, View, StyleSheet, Image, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import axios from 'axios';


interface Story {
    create_date: string;
  }

interface ImageItem {
    _id: string;
    title: string;
    poster_page: string;
}
// Define the navigation parameters
type RootStackParamList = {
    details: { storyId: string };
    // Add other screens as needed
  };

type NavigationProps = NavigationProp<RootStackParamList>;

const LazyImageList: React.FC = () => {

    const [stories, setStories] = useState<ImageItem[]>([]);
    const navigation = useNavigation<NavigationProps>();
  
    const handleSelectStory = (storyId: string) => {
      navigation.navigate('details', { storyId });
    };
  
    useEffect(() => {
      const fetchData = async () => {
        try {
        const response = await axios.get('https://kahanijsondata.azurewebsites.net/kahanijson');
        const parsedStories = response.data[0].stories.map((storyStr: string) => JSON.parse(storyStr));
        const sortedStories = parsedStories.sort((a: Story, b: Story) =>
            new Date(b.create_date).getTime() - new Date(a.create_date).getTime());
        setStories(sortedStories);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
  
      fetchData();
    }, []);

  const renderItem = ({ item }: { item: ImageItem }) => (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.cardContainer}>
          <TouchableOpacity
            key={item._id}
            style={styles.storyCard}
            onPress={() => handleSelectStory(item._id)}
          >
            <Image
        style={styles.storyImageCard}
        source={{ uri: item.poster_page }}
        resizeMode="cover"/>
            <Text style={styles.storyTitle}>{item.title}</Text>
          </TouchableOpacity>
        
      </View>
    </ScrollView>
  );

  const keyExtractor = (item: ImageItem) => item._id;

  return (
    <FlatList
      data={stories}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      initialNumToRender={5} // Number of items to render initially
      maxToRenderPerBatch={5} // Number of items to render in each batch
      windowSize={10} // Number of items to keep in memory
      ListFooterComponent={
        <View style={styles.footer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
    container: {
      maxWidth: 1200,
      margin: 20,
      padding: 20,
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 153,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 16,
    },
    cardContainer: {
      flex: 1,
      backgroundColor: 'white',
      padding: 16,
    },
    storyCard: {
      borderRadius: 8,
      overflow: 'hidden',
      marginBottom: 16,
    },
    storyImageCard: {
      width: 300,
      height: 350,
    },
    storyTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      padding: 8,
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
    },
    footer: {
        padding: 20,
        alignItems: 'center',
      },
  });

export default LazyImageList;
