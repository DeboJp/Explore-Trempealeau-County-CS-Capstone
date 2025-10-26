import React from 'react'
import {View,ScrollView, Text} from 'react-native'
import CategoryTile from '../components/CategoryTile';
import LocationTile from '../components/LocationTile';
import SearchBar from '../components/SearchBar';
import locations from '../assets/ts/locations';
import { useNavigation } from '@react-navigation/native';

export default function ExploreScreen() {
  const navigation = useNavigation();
  return <ScrollView contentContainerStyle={{padding: 16}}> 
      <SearchBar 
        placeholder="Search for trails, parks, and more"
        value={""}
        onChangeText={(text) => {}}
      />
      <Text style={{textAlign: "left", fontSize: 24, marginBottom: 16, paddingTop: 16, paddingBottom: 16}}>Categories</Text>
      <ScrollView contentContainerStyle={{alignItems: 'center'}} horizontal={true}>
        <CategoryTile title="Hiking" onPress={() => {}} />
        <CategoryTile title="Water" onPress={() => {}} />
        <CategoryTile title="Biking" onPress={() => {}} />
      </ScrollView>

      <Text style={{textAlign: "left", fontSize: 24, marginBottom: 16}}>Featured</Text>
      <ScrollView contentContainerStyle={{alignItems: 'center'}} horizontal={true}>
        {locations.filter(loc => loc.parent_location_id === null && (loc.type != "Lodging" && loc.type !== "Business")).slice(0, 5).map((loc) => (
          <LocationTile key={loc.id} locationId={loc.id} title={loc.name} category={loc.type} subtitle={loc.city} description={loc.description} backgroundImg={loc.image} onPress={() => {navigation.navigate('Detail', { locationId: loc.id })}} />
        ))}
      </ScrollView>
      
  </ScrollView>
}