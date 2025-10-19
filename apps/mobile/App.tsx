import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import ExploreScreen from './pages/ExploreScreen'
import SavedScreen from './pages/SavedScreen'
import ProfileScreen from './pages/ProfileScreen'

const SocialTab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <SocialTab.Navigator
        initialRouteName="Explore"
        screenOptions={({ route }) => ({
          tabBarStyle: { position: 'absolute', borderRadius: 40, margin: 10, height: 90},
          tabBarIcon: ({ focused }) => {
            let iconUrl;
            if (route.name === 'Explore') {
              iconUrl = focused
                ? 'https://cdn-icons-png.flaticon.com/512/3082/3082487.png' : 'https://cdn-icons-png.flaticon.com/512/447/447031.png';
            } else if (route.name === 'Saved') {
              iconUrl = focused ? 'https://cdn-icons-png.flaticon.com/512/833/833472.png' : 'https://cdn-icons-png.flaticon.com/512/1077/1077035.png';
            } else if (route.name === 'Profile') {
              iconUrl = focused ? 'https://cdn-icons-png.flaticon.com/512/1077/1077114.png' : 'https://cdn-icons-png.flaticon.com/512/747/747376.png';
            }
            return (
              <Image 
                source={{ uri: iconUrl }} 
                style={{ width: 22, height: 22, marginBottom: -20, tintColor: focused ? '#007AFF' : '#8E8E93' }}
              />
            );
          }
        })}
      >
        <SocialTab.Screen name="Explore" component={ExploreScreen} />
        <SocialTab.Screen name="Saved" component={SavedScreen} />
        <SocialTab.Screen name="Profile" component={ProfileScreen} />
      </SocialTab.Navigator>
    </NavigationContainer>
  );
}// export default function App() {
//   return (
//     <View style={styles.container}>
//       <Text>Open up App.tsx to start working on your app!</Text>
//       <StatusBar style="auto" />
//     </View>
//   );
// }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
