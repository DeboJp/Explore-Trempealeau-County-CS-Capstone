import React from 'react'
import {View,ScrollView, Text} from 'react-native'
import CategoryTile from '../components/CategoryTile';
import LocationTile from '../components/LocationTile';
import SearchBar from '../components/SearchBar';
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

      <Text style={{textAlign: "left", fontSize: 24, marginBottom: 16}}>Featured Trails</Text>
      <ScrollView contentContainerStyle={{alignItems: 'center'}} horizontal={true}>
        <LocationTile title="Perrot State Park" category="Parks" subtitle="Trempealeau, WI" description="Description. Lorem ipsum dolor sit amet consectetur adipiscing elit, sed do" backgroundImg={"perrot.png"} onPress={() => {navigation.navigate('Detail', { locationId: 1 });}} />
        <LocationTile title="Perrot Ridge Trail" category="Hike" subtitle="Perrot State Park" description="Description. Lorem ipsum dolor sit amet consectetur adipiscing elit, sed do" backgroundImg={"perrotridge.png"} difficulty="Moderate" distance={3.5} onPress={() => {navigation.navigate('Detail', { locationId: 2 })}} />
      </ScrollView>
      
  </ScrollView>
}