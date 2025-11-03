import { useState } from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Image, ImageBackground, Button, Pressable} from 'react-native';
import { Double, Int32 } from 'react-native/Libraries/Types/CodegenTypes';
import TileTag from './TileTag';
import {BackgroundImage} from '../assets/ts/images'
import BottomUpModal from './BottomUpModal';
import { useNavigation } from '@react-navigation/native';
import {LinearGradient} from 'expo-linear-gradient';

interface LocationTileProps {
  locationId?: Int32;
  title: string;
  category: string;
  subtitle?: string;
  description?: string;
  distance?: Double;
  difficulty?: null | 'Easy' | 'Moderate' | 'Hard';
  backgroundImg: string;
  onPress: () => void;
}

const tagColor = (difficulty: null | 'Easy' | 'Moderate' | 'Hard') => {
  switch (difficulty) {
    case 'Easy':
      return '#5AD824';
    case 'Moderate':
      return '#FFC107';
    case 'Hard':
      return '#F44336';
    default:
      return '#000000';
  }
}

export default function LocationTile({ locationId,title, category, subtitle, description, difficulty, distance, backgroundImg, onPress }: LocationTileProps) {
  const [openModal, setOpenModal] = useState<boolean>(false);

  const onOpen = () => {
      setOpenModal(true);
  };

  const onDismiss = () => {
    setOpenModal(false);
  };

  const toggleModal = () => {
      setOpenModal(!openModal);
  };
  const navigation = useNavigation();
  const backgroundImage = BackgroundImage.GetImage(
        backgroundImg,
      );
    return (
      <View>
      <TouchableOpacity onPress={onOpen}>
        <View style={{...styles.container}}>
            <ImageBackground source={backgroundImage} style={{...StyleSheet.absoluteFillObject, width: '100%'}} resizeMode="cover">
                <TileTag text={category} backgroundColor={'#266AB1'} style={{...styles.categoryTag}} />
                {difficulty && (
                    <TileTag text={difficulty} backgroundColor={tagColor(difficulty)} style={{...styles.difficultyTag}} />
                )}
                <LinearGradient 
                  start={{x: 0.0, y: 0.5}} end={{x: 0.0, y: 0.68}}
                  colors={['transparent', '#EFEFF0']} 
                  style={{height : '120%', width : '100%', bottom: 0, position: 'absolute'}}>
                </LinearGradient>
                <View style={{position: 'absolute', top: '57.5%', width: '100%', left: 11}}>
                <Text style={{color: '#1F2024', fontSize: 18, fontWeight: 500, width: '70%'}}>{title}</Text>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4}}>
                    <Text style={{color: '#71727A', fontSize: 16, marginBottom: 4}}>{subtitle?.includes("County") || subtitle?.length === 0 ? "Trempealeau County" : `${subtitle}, WI`}</Text>
                    {distance && <Text style={{position: 'absolute', right: 24, color: '#0D83FD', fontSize: 16, fontWeight: 400, alignSelf: 'flex-start'}}>{distance} mi</Text>}
                </View>
                <Text style={{color: '#494A50', fontSize: 12, flexWrap: 'wrap', paddingRight: 8}}>{description}</Text>
            </View>
            </ImageBackground>
        </View>
      </TouchableOpacity>
      {openModal && (
        <BottomUpModal visible={openModal} onDismiss={onDismiss} onSwipeUp={() => {
          navigation.navigate('Detail', { locationId: locationId });
          toggleModal();
          }}>
              <View style={{paddingVertical: 16, paddingHorizontal: 8}}>
                    <Text style={{fontSize: 20, fontWeight: '600', marginBottom: 4}}>{title}</Text>
                    <Text style={{fontSize: 16, fontWeight: '300', marginBottom: 4}}>{subtitle}</Text>
                    <Text style={{fontSize: 14, fontWeight: '400', marginBottom: 4}}>{description}</Text>
                    <View style={{flexDirection: 'row', paddingHorizontal: 16, justifyContent: 'space-between', width: '100%', marginTop: 8}}>
                      <Button title="View Details" onPress={() => {
                        toggleModal();
                        onPress();
                      }} />
                      <Button title="Open Map" onPress={() => {}} />
                    </View>
              </View>
        </BottomUpModal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 219, 
    height: 305, 
    marginHorizontal: 8, 
    borderRadius: 12, 
    overflow: 'hidden', 
    marginBottom: 16, 
    backgroundColor: '#F8F9FE', 
    justifyContent: 'flex-end',    
    borderColor: 'rgba(230, 231, 238, 1)',
    borderWidth: 2,
  },
  textContainer: {
    backgroundColor: '#EFEFF0', padding: 8, height: '40%',
  },
  categoryTag: {
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 8,
    paddingRight: 8,
    position: 'absolute', 
    top: 8, 
    right: 12
  },
  tagText: {
    color: '#FFFFFF', 
    fontSize: 12,
    fontWeight: '600'
  },
  difficultyTag: {
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 8,
    paddingRight: 8,
    position: 'absolute', 
    top: 8, right: 60, borderRadius: 12
  },
  detailsButton: {
    borderColor: '#266AB1',
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600'
  }
});