import React from 'react'
import { View, ScrollView, Text, Button } from 'react-native'
import CategoryTile from '../components/CategoryTile';
import LocationTile from '../components/LocationTile';
import SearchBar from '../components/SearchBar';
import locations from '../assets/ts/locations';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';

export default function ExploreScreen() {
  const navigation = useNavigation();

  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  const getPaginatedLocations = () => {
    const filtered = locations.filter(loc =>
      loc.parent_location_id === null &&
      loc.type !== "Lodging" &&
      loc.type !== "Business" &&
      loc.name.toLowerCase().includes(searchText.toLowerCase())
    );
    return filtered.slice(0, page * itemsPerPage);
  };

  const paginatedLocations = getPaginatedLocations();

  const handleLoadMore = () => {
    if (paginatedLocations.length < locations.length) {
      setPage(prev => prev + 1);
    }
  }

  return <ScrollView contentContainerStyle={{ padding: 16 }}>
    <View style={{display: 'flex', alignItems: 'center'}}>
      <SearchBar
        placeholder="Search for trails, parks, and more"
        value={searchText}
        onChangeText={(text) => {
          setSearchText(text);
          setPage(1);
        }}
      />
      </View>
      <Text style={{ textAlign: "left", fontSize: 24, marginBottom: 8, paddingTop: 16, paddingBottom: 8, fontWeight: 500 }}>Categories</Text>
      <View style={{display: 'flex', alignItems: 'center'}}>
      <ScrollView contentContainerStyle={{ alignItems: 'center' }} horizontal={true}>
        <CategoryTile title="Hiking" icon="hiking" onPress={() => { navigation.navigate('Results', { results: locations.filter(loc => loc.type === 'Hike'), title: 'Hiking' }) }} />
        <CategoryTile title="Biking" icon="biking" onPress={() => { navigation.navigate('Results', { results: locations.filter(loc => loc.type === 'Bike'), title: 'Biking' })}} />
        <CategoryTile title="Water" icon="water" onPress={() => { navigation.navigate('Results', { results: locations.filter(loc => loc.type === 'Water'), title: 'Water Access' })}} />
        <CategoryTile title="Shop" icon="business" onPress={() => { }} />
      </ScrollView>
    </View>

    <Text style={{ textAlign: "left", fontSize: 24, marginBottom: 16 }}>Featured</Text>
    <ScrollView contentContainerStyle={{ alignItems: 'center' }} horizontal={true}>
      {paginatedLocations.map((loc) => (
        <LocationTile
          key={loc.id}
          locationId={loc.id}
          title={loc.name}
          category={loc.type}
          subtitle={loc.city}
          description={loc.description}
          backgroundImg={loc.image}
          onPress={() => { navigation.navigate('Details', { locationId: loc.id }) }}
        />
      ))}
    </ScrollView>

    {paginatedLocations.length < locations.length && (
      <Button title="Load More" onPress={handleLoadMore} />
    )}

  </ScrollView>
}