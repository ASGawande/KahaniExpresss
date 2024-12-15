// LazyImageList.tsx
import React, { useState, useEffect } from 'react';
import { 
  FlatList, 
  Text, 
  View, 
  StyleSheet, 
  Image, 
  ActivityIndicator, 
  ScrollView, 
  TouchableOpacity, 
  TextInput 
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import axios from 'axios';

interface Story {
  create_date: string;
}

interface ImageItem {
  _id: string;
  title: string;
  poster_page: string;
  description: string;
}

// Define the navigation parameters
type RootStackParamList = {
  details: { storyId: string };
  // Add other screens as needed
};

type NavigationProps = NavigationProp<RootStackParamList>;

const LazyImageList: React.FC = () => {
  const [stories, setStories] = useState<ImageItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

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
          new Date(b.create_date).getTime() - new Date(a.create_date).getTime()
        );
        setStories(sortedStories);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const filteredStories = stories.filter((item) => {
    const title = (item.title || '').toLowerCase();
    const description = (item.description || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    
    return title.includes(search) || description.includes(search);
  });

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
            resizeMode="cover"
          />
          <Text style={styles.storyTitle}>{item.title}</Text>
        </TouchableOpacity>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </ScrollView>
  );

  const keyExtractor = (item: ImageItem) => item._id;

  return (
    <View style={{ flex: 1 }}>
      {/* Search Textbox at the Top */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search stories..."
          placeholderTextColor="#999"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      <FlatList
        data={filteredStories}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={10}
        ListFooterComponent={
          <View style={styles.footer}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    padding: 10,
    backgroundColor: '#fff',
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 10,
    fontSize: 16,
  },
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
  description: {
    fontSize: 13,
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
