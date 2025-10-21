import React from 'react'
import {View,ScrollView, Text} from 'react-native'
import CategoryTile from '../components/CategoryTile';
import LocationTile from '../components/LocationTile';
import SearchBar from '../components/SearchBar';

function ExploreScreen() {
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
        <LocationTile title="Perrot State Park" category="Parks" subtitle="Trempealeau, WI" description="Description. Lorem ipsum dolor sit amet consectetur adipiscing elit, sed do" backgroundImg={"perrot.png"} onPress={() => {}} />
        <LocationTile title="Perrot Ridge Trail" category="Hike" subtitle="Perrot State Park" description="Description. Lorem ipsum dolor sit amet consectetur adipiscing elit, sed do" backgroundImg={"perrotridge.png"} difficulty="Moderate" distance={3.5} onPress={() => {}} />
        <LocationTile title="Tamarack Creek Wildlife Area" category="Parks" subtitle="Galesville, WI" backgroundImg={"tamarackcreek.png"} onPress={() => {}} />
        <LocationTile title="Long Lake Boat Launch" category="Water" subtitle="Cascade, WI" backgroundImg={"longlake.png"} onPress={() => {}} />
      </ScrollView>
      
  </ScrollView>
}

export default ExploreScreen;