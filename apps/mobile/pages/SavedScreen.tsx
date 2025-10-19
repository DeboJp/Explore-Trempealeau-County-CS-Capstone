import {View, ScrollView, Text} from 'react-native'

import ProfileCard from '../components/SavedCards';

export default function SavedScreen() {
  // Temporary data for saved cards before we start calling API/Storing on device.
  const TEMPdata = [ 
    { id: 1, title: "Name", distance: "DISTANCE", date: "12.13.4", isTrue: true, imageUri: "https://picsum.photos/300/200",},
    { id: 2, title: "Name", distance: "DISTANCE", date: "12.13.4", isTrue: true, imageUri: "https://picsum.photos/300/201",},
    { id: 3, title: "Name", distance: "DISTANCE", date: "12.13.4", isTrue: false, imageUri: "https://picsum.photos/301/200",},
    { id: 4, title: "Name", distance: "DISTANCE", date: "12.13.4", isTrue: true, imageUri: "https://picsum.photos/302/201",},
    { id: 5, title: "Name", distance: "DISTANCE", date: "12.13.4", isTrue: false, imageUri: "https://picsum.photos/303/200",},
  ];

  
  return <View style={{flex: 1}}>
    <Text style={{textAlign: "center", fontSize: 24, margin: -10}}></Text>
    <ScrollView>
      {TEMPdata.map((item) => (
        <ProfileCard key={item.id} title={item.title} distance={item.distance} date={item.date} imageUri={item.imageUri}  isTrue={item.isTrue} />
      ))}
    </ScrollView>
  </View>
}

