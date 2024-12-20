import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, PanResponder } from 'react-native';
import CuddleAnimeForStorySelector from './CuddleAnimeForStorySelector';

interface DraggableCuddleProps {
  initialAnimation: string;
  eventType?: string;
}

const DraggableCuddle: React.FC<DraggableCuddleProps> = ({ initialAnimation, eventType: externalEventType }) => {
  const [currentAnimation, setCurrentAnimation] = useState(initialAnimation);
  const [currentMessage, setCurrentMessage] = useState("Hi, I'm Cuddle! Let's explore magical stories together!");
  const [showBubble, setShowBubble] = useState(true);
  const [internalEventType, setInternalEventType] = useState<string | null>(null);

  // Assuming `pan` is an Animated.ValueXY
  const pan = React.useRef(new Animated.ValueXY()).current;

  const duration = 10000;

  const eventAnimations: Record<string, { animations: string[]; messages: string[] }> = {
    click: { animations: ['Nod_yes', 'Excited'], messages: ['Hey There', 'How are you?'] },
    drag: { animations: ['Teeter'], messages: ['Hey! Stop dragging me!'] },
    search: { animations: ['Running'], messages: ['Let me find that for you!'] },
    hover: { animations: ['Magic'], messages: ['Checking this story!'] },
    scroll: { animations: ['Walk'], messages: ['Let me get more stuff for you!'] },
  };

  const getRandomEventDetails = (event: { animations: string[]; messages: string[] }) => {
    const animations = event.animations || [];
    const messages = event.messages || [];
    const randomIndex = Math.floor(Math.random() * animations.length);
    return {
      animation: animations[randomIndex] || '',
      message: messages[randomIndex] || '',
    };
  };

  useEffect(() => {
    if (internalEventType) {
      const event = eventAnimations[internalEventType];
      const { animation, message } = getRandomEventDetails(event);

      setCurrentAnimation(animation);
      setCurrentMessage(message);
      setShowBubble(true);

      const timeout = setTimeout(() => {
        setCurrentAnimation(initialAnimation);
        setShowBubble(false);
        setInternalEventType(null);
      }, duration);

      return () => clearTimeout(timeout);
    }
  }, [internalEventType, initialAnimation]);

  useEffect(() => {
    if (externalEventType) {
      const event = eventAnimations[externalEventType];
      const { animation, message } = getRandomEventDetails(event);

      setCurrentAnimation(animation);
      setCurrentMessage(message);
      setShowBubble(true);

      const timeout = setTimeout(() => {
        setCurrentAnimation(initialAnimation);
        setShowBubble(false);
      }, duration);

      return () => clearTimeout(timeout);
    }
  }, [externalEventType, initialAnimation]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      // Set the offset to the current value of the pan
      pan.extractOffset(); // Properly set the offset
      pan.setValue({ x: 0, y: 0 }); // Reset the pan to zero after setting the offset
      setInternalEventType('drag');
    },
    onPanResponderMove: Animated.event(
      [null, { dx: pan.x, dy: pan.y }],
      { useNativeDriver: false }
    ),
    onPanResponderRelease: () => {
      pan.flattenOffset(); // Combines the offset with the current value and resets it
    },
  });

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        pan.getLayout(),
        styles.draggable,
      ]}
    >
      <View onTouchEnd={() => setInternalEventType('click')}>
        <CuddleAnimeForStorySelector animationName={currentAnimation} />
        {showBubble && (
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>{currentMessage}</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  draggable: {
    position: 'absolute',
    bottom: 100,
    right: 100,
    zIndex: 1000,
  },
  bubble: {
    position: 'absolute',
    bottom: 220,
    left: '60%',
    transform: [{ translateX: -50 }],
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  bubbleText: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default DraggableCuddle;
