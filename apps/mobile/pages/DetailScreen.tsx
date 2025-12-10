import React, { useEffect, useState } from 'react';
import {View,ScrollView, Text, Image, ImageBackground, StyleSheet, Pressable, Linking} from 'react-native'
import { BackgroundImage } from '../assets/ts/images';
import LocationTile from '../components/LocationTile';
import { useNavigation } from '@react-navigation/native';
import {LinearGradient} from 'expo-linear-gradient';
import locations from '../assets/ts/locations';
import { isSaved as storeIsSaved, toggleSaved as storeToggle } from '../lib/savedStore';
import { Icons } from '../assets/ts/icons';
import Constants from 'expo-constants';
import { fetchNearbyPagesForGisId } from "../lib/fetchNearbyPages";

interface DetailScreenProps {
    title: string;
}

export default function DetailScreen({route}: {route: any}) {
    const navigation = useNavigation();
    const { locationId, title } = route.params;
    const [location, setLocation] = useState<any>(null);
    const [focusedContent, setFocusedContent] = useState<any>(null);
    // Local state to track whether this location is currently saved
    const [saved, setSaved] = useState(false);
    const [nearbyPages, setNearbyPages] = useState<any[]>([]);
    // When the screen loads or location changes, check if it's already saved
    useEffect(() => {
        async function fetchLocation() {
            console.log(`${Constants.expoConfig.extra?.api.base_url}/pages/published/${locationId}/${encodeURIComponent(title)}`)
            const response = await fetch(`${Constants.expoConfig.extra?.api.base_url}/pages/published/${locationId}/${encodeURIComponent(title)}`);
            const data = await response.json();
            setLocation(JSON.parse(data.pageContent));
        }
        fetchLocation();

        async function logEvent() {
            await fetch(`${Constants?.expoConfig?.extra?.api.base_url}/analytics/log?event=${encodeURIComponent(title+"#view")}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }
        logEvent();

        let mounted = true; // safety flag to prevent state updates after unmount

        (async () => {
            if (location) {
            const v = await storeIsSaved(locationId);// check saved status in storage
            if (mounted) setSaved(v);// update UI only if still mounted
            }
        })();
        // Cleanup to avoid memory leaks when component unmounts
        return () => { mounted = false; };
    }, [location?.id]); // re-run if a new location is opened

    // Fetch location data based on locationId prop
    
    // TODO: Get image from assets based on location data
    useEffect(() => {
        const fetchNearby = async () => {
            if (location) {
                const result = await fetchNearbyPagesForGisId(location.gisId, 5, 3);
                const nearbyList = Object.values(result).filter((loc) => loc.id !== location.id && loc.published)
                    .map((location) => location.pageContent ? JSON.parse(location.pageContent) : null);
                console.log("Nearby locations fetched:", nearbyList);
                setNearbyPages(nearbyList);
            }
        };
        fetchNearby();
    }, [location]);
    // TODO: Integrate with map to redirect with lat/lon, estimate distance to
    const backgroundImage = { uri: location?.image || ''};
    if (!location) {
        return <View style={styles.main}>
            <Text style={styles.title}>Location Not Found</Text>
            <View style={styles.mainContent}>
                <Text>The location you are looking for does not exist. If this issue persists, please contact Trempealeau County support.</Text>
            </View>
        </View>
    }

    // var nearby = locations.filter(loc => loc.id !== location.id && (loc.parent_location_id === location.id || location.parent_location_id === loc.id));
    var nearby = null;
    return <View style={styles.main}>
        <ScrollView>
        {backgroundImage && (
            <ImageBackground source={backgroundImage} style={{ width: '100%', height: 400 }} resizeMode="cover">
                <LinearGradient 
                  start={{x: 0.0, y: 0.78}} end={{x: 0.0, y: 0.99}}
                  colors={['transparent', '#fffffff7']} 
                  style={{height : '120%', width : '100%', bottom: 0, position: 'absolute'}}>
                </LinearGradient>
                {/* <Image source={Icons.GetIcon('gallery')} style={{ width: 40, height: 40, position: 'absolute', bottom: 20, right: 10, opacity: 0.8}} /> */}
            </ImageBackground>
        )}
        {!backgroundImage && (<View style={{...styles.mainImage, height: 200}}>
                <Text style={{opacity: 0}}>Image not found.</Text>
            </View>
        )}
        {location && (
            <View style={{...styles.mainContent}}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'start', width: '100%', paddingTop: 8}}>
                    <View style={{flexDirection: 'column', maxWidth: '80%'}}>
                        <Text style={{ color: 'black', fontSize: 32, fontWeight: '600', fontFamily: 'ITC Avant Garde Gothic' }}>{location?.title}</Text>
                    </View>
                    <Pressable
                        onPress={async () => {
                            const now = await storeToggle(location.id);
                            setSaved(now);
                        }}
                        >
                        <Image source={saved ? Icons.GetIcon('bookmark-solid') : Icons.GetIcon('bookmark-outline')} style={{ width: 30, height: 30, tintColor: '#000000', opacity: 0.8, padding: 0.5 }} />
                    </Pressable>
                </View>
                {/* Activity type tags */}
                {location?.categories && (
                    <View style={{justifyContent: 'center', alignItems: 'center', width: '100%'}}>
                        <ScrollView horizontal={true} contentContainerStyle={{flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8, justifyContent: 'center'}}>
                            {location.categories.map(category => (
                                <Pressable
                                    key={category.name}
                                    onPress={() => {
                                        const content = location?.categories.find((cat: any) => cat.name === category.name)
                                        if(content && (content.content !== focusedContent?.content || content.name !== focusedContent?.name)){setFocusedContent(content)}
                                        else {setFocusedContent(null);}
                                    }}
                                    style={({pressed}) => [{
                                        backgroundColor: pressed || focusedContent?.name == category.name ? '#155d13' : '#1F741B',
                                        paddingVertical: 6,
                                        paddingHorizontal: 14,
                                        borderRadius: 30,
                                        marginRight: 8,
                                    }]}
                                >
                                    <Text style={{color: '#FFFFFF', fontSize: 16}}>{category.name}</Text>
                                </Pressable>
                            ))}
                        </ScrollView>
                    </View>
                )}
                {!focusedContent && (<View>
                    {location && location.type === 'trail' && location.trailDetails && 
                    <View style={{justifyContent: 'center', alignItems: 'center', width: '100%'}}>
                        <View style={{flexDirection: 'column', justifyContent: 'space-between', marginTop: 12, paddingHorizontal: 4}}>
                        <View style={{flexDirection: 'row', alignItems: 'center',}}>
                            <View style={{width: 16, height: 16, backgroundColor: location.trailDetails.difficulty === 'easy' ? '#4CAF50' : location.trailDetails.difficulty === 'moderate' ? '#FFC107' : '#F44336', marginRight: 8}}></View>
                            {location.trailDetails.difficulty && 
                                <Text style={{fontSize: 16}}>{location.trailDetails.difficulty.slice(0,1).toUpperCase() + location.trailDetails.difficulty.slice(1)}</Text>}
                        </View>
                        <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, gap: 12, width: '90%'}}>
                            <View style={{flexDirection: 'column', alignItems: 'flex-start'}}>
                                <Text style={{fontWeight: '700', fontSize: 16}}>{location.trailDetails.elevation || 'N/A'} ft</Text>
                                <Text>Elevation</Text>
                            </View>
                            <View style={{flexDirection: 'column', alignItems: 'flex-start'}}>
                                <Text style={{fontWeight: '700', fontSize: 16}}>{location.trailDetails.length || 'N/A'} mi</Text>
                                <Text>Length</Text>
                            </View>
                            <View style={{flexDirection: 'column', alignItems: 'flex-start'}}>
                                <Text style={{fontWeight: '700', fontSize: 16}}>{location.trailDetails.hours || 'N/A'} hrs</Text>
                                <Text>Time</Text>
                            </View>
                        </View>
                    </View>
                </View>
                }
                <View style={{backgroundColor: '#F6F6F6', marginTop: 16, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 }}>
                    <Text style={{ fontSize: 18, fontWeight: '700'}}>About</Text>
                    <Text style={{ color: 'black', fontSize: 16, padding: 8 }}>{location.description}</Text>
                </View>
                </View>)}
                {focusedContent && (
                    <View style={{backgroundColor: '#F6F6F6', marginTop: 16, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 }}>
                        <Text style={{ color: 'black', fontSize: 16, padding: 8 }}>{focusedContent.content}</Text>
                    </View>
                )}
            </View>
        )}
        {/*Add button*/}
        {/* <View style={{alignItems: 'center', width: '100%'}}>
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12 }}>
                {/* Itinerary Button */}
                {/* <Pressable style={({ pressed }) => [styles.button,{ opacity: pressed ? 0.5 : 1},]} onPress={() => {}}>
                    <Text>Add to Itinerary</Text>
                </Pressable> */}

                {/* Save button */}
                {/* <Pressable style={({ pressed }) => [styles.button, { opacity: pressed ? 0.5 : 1 }]}
                onPress={async () => {
                    const now = await storeToggle(location.id);
                    setSaved(now);
                }}
                >
                <Text style={{ fontSize: 18}}>{saved ? "Saved" : "Save"}</Text>
                </Pressable>
            </View> */}
        {/* </View> */}
        {location && location?.links && location.links.length > 0 && (
            <View style={{marginTop: 24, paddingHorizontal: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 8}}>
                {location.links.map((link: any, index: number) => (
                    <Pressable key={index} onPress={() => {
                        // Open link in browser
                        Linking.openURL(link.url);
                    }}>
                        <Text style={{...styles.link, color: '#646464', fontSize: 16}}>{link.name}</Text>
                    </Pressable>
                ))}
            </View>
        )}
        {nearbyPages && nearbyPages.length > 0 && (
            <View style={{alignItems: 'flex-start', paddingHorizontal: 12}}>
                <Text style={{textAlign: 'left', fontSize: 20, fontWeight: '500', marginTop: 24, marginBottom: 8}}>Nearby Locations</Text>
                <ScrollView contentContainerStyle={{display: 'flex', flexDirection: 'row', gap: 16}} horizontal={true}>
                    {/* Map through nearby locations and render LocationTile components */}
                    {nearbyPages.map((loc) => (
                        <LocationTile key={loc.id} locationId={loc.id} title={loc.title} category={loc.type} subtitle={loc.city.slice(0,1).toUpperCase() + loc.city.slice(1)} description={loc.description.split(".")[0]+"."} backgroundImg={loc.image ?? ""} onPress={() => {(navigation as any).navigate('Details', { locationId: loc.id })}} />
                    ))}
                </ScrollView>
            </View>
        )}
    </ScrollView>
    </View>
    }

const styles = StyleSheet.create({
    main: {
        display: 'flex',
        margin: 0,
        backgroundColor: '#FFFFFF',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        fontFamily: 'DM Sans',
        height: 'auto'
    },
    mainImage: {
        width: '100%',
        maxHeight: 200,
        borderRadius: 10,
        backgroundColor: '#D9D9D9',
        marginTop: 0,
    },
    mainContent: {
        paddingHorizontal: 12,
        marginTop: 0,
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
    },
    link: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: '#f4f6fa',
        borderRadius: 16,
        textDecorationLine: 'none',
        color: '#646464',
    }

});