import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
} from 'react-native';
import CuddleAnimeForStorySelector from './CuddleAnimeForStorySelector';

interface DraggableCuddleProps {
  initialAnimation: string;
  eventType?: 'click' | 'drag' | 'search' | 'hover' | 'scroll';
}

const DraggableCuddle: React.FC<DraggableCuddleProps> = ({
  initialAnimation,
  eventType: externalEventType,
}) => {
  const [currentAnimation, setCurrentAnimation] = useState<string>(initialAnimation);
  const [currentMessage, setCurrentMessage] = useState<string>(
    "Hi, I'm Cuddle! Let's explore magical stories together!"
  );
  const [showBubble, setShowBubble] = useState<boolean>(true);
  const [internalEventType, setInternalEventType] = useState<string | null>(null);

  const duration = 10000;

  const eventAnimations: Record<string, { animations: string[]; messages: string[] }> = {
    click: {
      animations: ['Nod_yes', 'Excited'],
      messages: ['Hey There', 'How are you?'],
    },
    drag: {
      animations: ['Teeter'],
      messages: ['Hey! Stop dragging me!'],
    },
    search: {
      animations: ['Running'],
      messages: ['Let me find that for you!'],
    },
    hover: {
      animations: ['Magic'],
      messages: ['Checking this story!'],
    },
    scroll: {
      animations: ['Walk'],
      messages: ['Let me get more stuff for you!'],
    },
  };

  const pan = useState(new Animated.ValueXY())[0];

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
      useNativeDriver: false,
    }),
    onPanResponderRelease: () => {
      setInternalEventType('drag');
    },
  });

  const handleTeddyClick = () => {
    setInternalEventType('click');
  };

  const getRandomEventDetails = (event: { animations: string[]; messages: string[] }) => {
    const randomIndex = Math.floor(Math.random() * event.animations.length);
    return {
      animation: event.animations[randomIndex],
      message: event.messages[randomIndex],
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

  return (
    <Animated.View
      style={[styles.container, { transform: pan.getTranslateTransform() }]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity style={styles.touchable} onPress={handleTeddyClick}>
        <CuddleAnimeForStorySelector animationName={currentAnimation} />
        {showBubble && (
          <View style={styles.bubble}>
            <Text style={styles.message}>{currentMessage}</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 200,
    right: 50,
    zIndex: 1000,
  },
  touchable: {
    alignItems: 'center',
  },
  bubble: {
    position: 'absolute',
    bottom: 160,
    left: '50%',
    transform: [{ translateX: -50 }],
    backgroundColor: '#fff',
    color: '#333',
    padding: 10,
    borderRadius: 12,
    elevation: 5,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    zIndex: 1001,
  },
  message: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
});

export default DraggableCuddle;
