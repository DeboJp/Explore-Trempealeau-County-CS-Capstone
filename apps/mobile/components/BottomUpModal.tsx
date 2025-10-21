// original source: https://medium.com/@ndyhrdy/making-the-bottom-sheet-modal-using-react-native-e226a30bed13 🙇
import React, {useEffect, useRef} from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

interface BottomUpModalProps {
    onDismiss: () => void;
    children: React.ReactNode;
    visible?: boolean;
}
export default ({onDismiss, children, visible}: BottomUpModalProps) => {
  const screenHeight = Dimensions.get('screen').height;
  const panY = useRef(new Animated.Value(screenHeight)).current;

  const resetPositionAnim = Animated.timing(panY, {
    toValue: 0,
    duration: 200,
    useNativeDriver: true,
  });

  const closeAnim = Animated.timing(panY, {
    toValue: screenHeight,
    duration: 200,
    useNativeDriver: true,
  });

  const translateY = panY.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [-0.07, 0, 1],
  });

  const handleDismiss = () => closeAnim.start(onDismiss);

  useEffect(() => {
    resetPositionAnim.start();
  }, [resetPositionAnim]);

  const panResponders = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, {dy: panY}], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gs) => {
        console.log(gs.dy, gs.vy);
        if (gs.dy > 0 && gs.vy > 0.05) {
          return handleDismiss();
        }
        else if (gs.dy < 0 && gs.vy < -0.4) {
            console.log("UP");
            return resetPositionAnim.start();
        }
        return resetPositionAnim.start();
      },
    }),
  ).current;

  return (
    <Modal
      animationType="fade"
      visible={true}
      onRequestClose={handleDismiss}
      transparent>
      <TouchableWithoutFeedback onPress={handleDismiss}>
        
      <View style={styles.overlay}>
          <Animated.View
            style={{...styles.container, transform: [{translateY: translateY}]}}
            {...panResponders.panHandlers}>
            <View style={styles.sliderIndicatorRow}>
              <View style={styles.sliderIndicator} />
            </View>
            {children}
          </Animated.View>
        </View>

      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: 'white',
    paddingTop: 12,
    paddingHorizontal: 12,
    borderTopRightRadius: 12,
    borderTopLeftRadius: 12,
    minHeight: '25%',
  },
  sliderIndicatorRow: {
    flexDirection: 'row',
    marginBottom: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderIndicator: {
    backgroundColor: '#CECECE',
    height: 4,
    width: 45,
  },
});