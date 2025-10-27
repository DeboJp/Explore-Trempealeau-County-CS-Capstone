import React from 'react'
import {View,ScrollView, Text, Image, StyleSheet, Pressable} from 'react-native'
import { BackgroundImage } from '../assets/ts/images';
import LocationTile from '../components/LocationTile';
import { useNavigation } from '@react-navigation/native';
import locations from '../assets/ts/locations';

interface DetailScreenProps {
    locationId: string;
}

export default function DetailScreen({route}: {route: any}) {
    const navigation = useNavigation();
    const { locationId } = route.params;
    const location = locations.find(loc => loc.id === locationId);
    // TODO: Fetch location data based on locationId prop
    // TODO: Get image from assets based on location data
    // TODO: Get nearby locations based on lat/lon of location data), with parent (if applicable)
    // TODO: Integrate with map to redirect with lat/lon, estimate distance to
    const backgroundImage = BackgroundImage.GetImage(
            location?.image || 'perrot.png',
          );
    if (!location) {
        return <View style={styles.main}>
            <Text style={styles.title}>Location Not Found</Text>
            <View style={styles.mainContent}>
                <Text>The location you are looking for does not exist. If this issue persists, please contact Trempealeau County support.</Text>
            </View>
        </View>
    }

    var nearby = locations.filter(loc => loc.id !== location.id && (loc.parent_location_id === location.id || location.parent_location_id === loc.id));
    return <ScrollView contentContainerStyle={styles.main}>
        <Text style={styles.title}>{location?.name}</Text>
        
        {backgroundImage && (
            <Image source={backgroundImage} style={styles.mainImage} resizeMode="cover" />
        )}
        {!backgroundImage && (<View style={{...styles.mainImage, height: 200}}>
                <Text style={{opacity: 0}}>Image not found.</Text>
            </View>
        )}
        {location && (
            <View style={{...styles.mainContent}}>
                <Text>{location.description}</Text>
            </View>
        )}
        {/*Add to Itinerary button*/}
        <View style={{alignItems: 'center', width: '100%'}}>
            <Pressable style={({ pressed }) => [
              styles.button,
              {
                opacity: pressed ? 0.5 : 1, // Reduce opacity on press
              },
            ]} onPress={() => {}}>
                <Text>Add to Itinerary</Text>
            </Pressable>
        </View>

        {nearby.length > 0 && (
            <View style={{alignItems: 'flex-start'}}>
                <Text style={{textAlign: 'left', fontSize: 20, fontWeight: '500', marginTop: 24, marginBottom: 8}}>Nearby Locations</Text>
                <ScrollView contentContainerStyle={{display: 'flex', flexDirection: 'row', gap: 16}} horizontal={true}>
                    {/* Map through nearby locations and render LocationTile components */}
                    {nearby.map((loc) => (
                        <LocationTile key={loc.id} locationId={loc.id} title={loc.name} category={loc.type} subtitle={loc.city} description={loc.description} backgroundImg={loc.image ?? ""} onPress={() => {navigation.navigate('Detail', { locationId: loc.id })}} distance={loc.parent_location_id != null && loc.approxDistFromParent ? loc.approxDistFromParent : undefined} />
                    ))}
                </ScrollView>
            </View>
        )}
    </ScrollView>
    }

const styles = StyleSheet.create({
    main: {
        marginVertical: 16,
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#FFFFFF',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        height: '120%',
    },
    mainImage: {
        width: '100%',
        maxHeight: 200,
        borderRadius: 10,
        backgroundColor: '#D9D9D9',
        marginTop: 8,
    },
    mainContent: {
        marginTop: 16,
        width: '100%',
        height: 'auto'
    },
    title: {
        fontSize: 24,
        fontWeight: '400',
        marginVertical: 8,
    },
    button: {
        backgroundColor: '#E0E0E0',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginTop: 16,
    }

});