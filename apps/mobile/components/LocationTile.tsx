import { useState } from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Image, ImageBackground, Button} from 'react-native';
import { Double, Int32 } from 'react-native/Libraries/Types/CodegenTypes';
import TileTag from './TileTag';
import {BackgroundImage} from '../assets/ts/images'
import BottomUpModal from './BottomUpModal';

interface LocationTileProps {
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

export default function LocationTile({ title, category, subtitle, description, difficulty, distance, backgroundImg, onPress }: LocationTileProps) {
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
            </ImageBackground>
            
            
            <View style={{...styles.textContainer}}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4}}>
                    <Text style={{color: '#1F2024', fontSize: 14, fontWeight: 'bold', width: '66.7%'}}>{title}</Text>
                    {distance && <Text style={{color: '#0D83FD', fontSize: 12, fontWeight: 400, alignSelf: 'flex-start'}}>{distance} mi</Text>}
                </View>
                <Text style={{color: '#71727A', fontSize: 12, marginBottom: 4}}>{subtitle}</Text>
                <Text style={{color: '#494A50', fontSize: 12}}>{description}</Text>
                <View style={{...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', alignItems: 'center', marginBottom: 8}}>
                    <TouchableOpacity>
                        <View style={styles.detailsButton}>
                            <Text>Details</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
      </TouchableOpacity>
      {openModal && (
        <BottomUpModal visible={openModal} onDismiss={onDismiss}>
              <View style={{paddingVertical: 16, paddingHorizontal: 8}}>
                    <Text style={{fontSize: 20, fontWeight: '600', marginBottom: 4}}>{title}</Text>
                    <Text style={{fontSize: 16, fontWeight: '300', marginBottom: 4}}>{subtitle}</Text>
                    <Text style={{fontSize: 14, fontWeight: '400', marginBottom: 4}}>{description}</Text>
                    <View style={{flexDirection: 'row', paddingHorizontal: 16, justifyContent: 'space-between', width: '100%', marginTop: 8}}>
                      <Button title="View Details" onPress={() => {}} />
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
    backgroundColor: '#EFEFF0', padding: 8, height: '50%'
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