import React from 'react'
import {View,ScrollView, Text, Image, StyleSheet} from 'react-native'
import { BackgroundImage } from '../assets/ts/images';

interface DetailScreenProps {
    locationId: string;
}

const TEMPdata = [
    { 
        id: 1, 
        name: 'Perrot State Park',
        type: 'Park',
        address: "",
        city: 'Trempealeau',
        zip: '54661',
        lat: 44.0425,
        lon: -91.4075, 
        parent_location_id: null,
        description: 'A beautiful park with hiking trails and scenic views.', 
        image: 'perrot.png',
    },
    { 
        id: 2, 
        name: 'Perrot Ridge Trail',
        type: 'Hike',
        address: "",
        city: 'Trempealeau',
        zip: '54661',
        lat: 44.0425,
        lon: -91.4075, 
        parent_location_id: 1,
        description: 'A beautiful park with hiking trails and scenic views.', 
        image: 'perrotridge.png',
    },
    { 
        id: 3, 
        name: "Brady's Bluff Natural Area",
        type: 'Hike',
        address: "",
        city: 'Trempealeau',
        zip: '54661',
        lat: 44.0425,
        lon: -91.4075, 
        parent_location_id: 1,
        description: 'A beautiful park with hiking trails and scenic views.', 
        image: 'bradysbluff.png',
    },
    { 
        id: 4, 
        name: "Brady's Bluff Trail",
        type: 'Hike',
        address: "",
        city: 'Trempealeau',
        zip: '54661',
        lat: 44.0425,
        lon: -91.4075, 
        parent_location_id: 3,
        description: 'A beautiful park with hiking trails and scenic views.', 
        image: 'bradysbluff.png',
    },
    { 
        id: 5, 
        name: "Riverview Trail",
        type: 'Hike',
        address: "",
        city: 'Trempealeau',
        zip: '54661',
        lat: 44.0425,
        lon: -91.4075, 
        parent_location_id: 3,
        description: 'A beautiful park with hiking trails and scenic views.', 
        image: 'riverview.png',
    },
    { 
        id: 6, 
        name: "Wisconsin Great River Road",
        type: 'Scenic Drive',
        address: "",
        city: '',
        zip: '',
        lat: 44.43530934029524, lon: -92.06268857579386,
        parent_location_id: null,
        description: 'A beautiful park with hiking trails and scenic views.', 
        image: 'greatriver.png',
    },
    { 
        id: 7, 
        name: "Galesville Downtown Historic District",
        type: 'Historic District',
        address: "",
        city: 'Galesville',
        zip: '54630',
        lat: 44.0972,
        lon: -91.8881,
        parent_location_id: null,
        description: 'A beautiful, historic downtown area with shops and restaurants.', 
        image: 'galesville.png',
    },
    { 
        id: 8, 
        name: "Oak Park Inn",
        type: 'Lodging',
        address: "18224 Ervin St",
        city: 'Whitehall',
        zip: '54773',
        lat: 44.36434779864599, lon: -91.31186054127734,
        parent_location_id: null,
        description: '', 
        image: 'oakpark.png',
    },
];

export default function DetailScreen({ locationId }: DetailScreenProps) {
    const location = TEMPdata.find(loc => loc.id === 2);
    // TODO: Fetch location data based on locationId prop
    // TODO: Get image from assets based on location data
    // TODO: Get nearby locations based on lat/lon of location data), with parent (if applicable)
    // TODO: Integrate with map to redirect with lat/lon, estimate distance to
    console.log(location);
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
    </ScrollView>
    }

const styles = StyleSheet.create({
    main: {
        marginTop: 16,
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#FFFFFF',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start'
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
    },
    title: {
        fontSize: 24,
        fontWeight: '400',
        marginVertical: 8,
    }
});