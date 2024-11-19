import React from 'react';
import { SafeAreaView } from 'react-native';
import LazyImageList from  '../components/Kahani/LazyImageList'

const App: React.FC = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LazyImageList />
    </SafeAreaView>
  );
};

export default App;