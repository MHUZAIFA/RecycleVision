import { useEffect, useRef, useState } from 'react';
import { Alert, Modal, Text, TouchableOpacity, View, Image, StyleSheet, Vibration } from "react-native";
import level_up_illustration from "../../assets/illustrations/level_up.png";
import { FontAwesome } from '@expo/vector-icons';
import { PRIMARY } from "@/lib/constants";
import LottieView from 'lottie-react-native';
import confetti_animation_json from "../../assets/animations/confetti.json";
import confetti_animation_sound from "../../assets/sounds/clapping.mp3";
import { Audio } from 'expo-av';

const LevelUp = ({ visible, setVisible, from, to }) => {

  const confettiRef = useRef(null);
  const [confettiZIndex, setConfettiZIndex] = useState(10);
  const [soundObject, setSoundObject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const triggerConfetti = async () => {
    setIsLoading(false);
    setTimeout(() => {
      setConfettiZIndex(10);
      confettiRef.current.play();
      Vibration.vibrate();
    }, 10);

    setTimeout(() => {
      setConfettiZIndex(-1);
    }, 3200);
  }

  const celebrationEffects = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(confetti_animation_sound);
      setSoundObject(sound);
      await playSound();
      triggerConfetti();
    } catch (error) {
      console.log('Error loading sound: ', error);
    }
  };

  const playSound = async () => {
    try {
      await soundObject.replayAsync();
    } catch (error) {
      console.log('Error playing sound: ', error);
    }
  };

  useEffect(() => {
    if (visible) {
      celebrationEffects();
    }
  }, []);
  

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible && !isLoading}
      onRequestClose={() => {
        Alert.alert("Modal has been closed.");
        setVisible(!visible);
      }}
    >
      <View style={styles.container}>
        <LottieView
          ref={confettiRef}
          source={confetti_animation_json}
          autoPlay={false}
          loop={false}
          style={[styles.lottie, { zIndex: confettiZIndex }]}
          resizeMode='cover'
        />
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Level Up</Text>
          </View>
          <View style={styles.content}>
            <Text className="text-lg">Congratulations</Text>
            <Text className="text-md mb-3">🎉🎉🎉🎉</Text>
            <Image source={level_up_illustration} style={styles.image} />
            <View style={styles.levelChange}>
              <Text style={[styles.levelText, { color: '#676767', textAlign: 'right' }]}>{from}</Text>
              <FontAwesome name="long-arrow-right" size={24} color={PRIMARY} style={{ marginLeft: 7, marginRight: 7, marginTop: 2 }} />
              <Text style={[styles.levelText, { color: PRIMARY }]}>{to}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.dismissButton} onPress={() => {setVisible(false); setIsLoading(true);}}>
            <Text style={styles.dismissText}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottie: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    width: '80%',
    padding: 16,
    zIndex: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 0,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  closeButton: {
    position: 'absolute',
    right: -5,
    fontSize: 20,
  },
  content: {
    alignItems: 'center',
  },
  congrats: {
    fontSize: 24,
    marginBottom: 8,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 8,
  },
  levelChange: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0
  },
  levelText: {
    fontSize: 15,
    fontWeight: '600',
    width: 130
  },
  dismissButton: {
    backgroundColor: PRIMARY,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  dismissText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LevelUp;
