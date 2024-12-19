import React from 'react';
import { SafeAreaView } from 'react-native';
import LazyImageList from  '../components/Kahani/LazyImageList'
import DraggableCuddle from '../components/Animation/DraggableCuddle';

const originalConsoleLog = console.log;

console.log = (...args) => {
  // Filter specific messages
  if (
    args[0]?.includes('EXGL: gl.pixelStorei() doesn\'t support this parameter yet!') ||
    args[0]?.includes('(NOBRIDGE) LOG')
  ) {
    return; // Ignore this log
  }
  originalConsoleLog(...args); // Keep other logs
};

const App: React.FC = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LazyImageList />
      <DraggableCuddle
                initialAnimation="Happy"
                eventType={'search'}
              />
    </SafeAreaView>
  );
};

export default App;