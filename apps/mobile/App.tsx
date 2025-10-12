import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import ExploreScreen from './pages/ExploreScreen'
import SavedScreen from './pages/SavedScreen'
import ProfileScreen from './pages/ProfileScreen'

const SocialTab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <SocialTab.Navigator initialRouteName="Explore">
        <SocialTab.Screen name="Explore" component={ExploreScreen} />
        <SocialTab.Screen name="Saved" component={SavedScreen} />
        <SocialTab.Screen name="Profile" component={ProfileScreen} />
      </SocialTab.Navigator>
    </NavigationContainer>
  );
}
// export default function App() {
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
