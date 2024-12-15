import React, { useState } from 'react';
import { SafeAreaView } from 'react-native';
import LazyImageList from  '../components/Kahani/LazyImageList'
import DraggableCuddle from '../components/Animation/DraggableCuddle'

const App: React.FC = () => {

  const [eventType, setEventType] = useState<string>('click');

  return (
    // <SafeAreaView style={{ flex: 1 }}>
    //   <LazyImageList />
    // </SafeAreaView>
    <DraggableCuddle
    initialAnimation="Happy"
    eventType={eventType}
  />
  );
};

export default App;