import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image} from 'react-native';
import { NavigationContainer, getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import ExploreScreen from './pages/ExploreScreen'
import SavedScreen from './pages/SavedScreen'
import ProfileScreen from './pages/ProfileScreen'
import DetailScreen from './pages/DetailScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();
const SocialTab = createBottomTabNavigator();

function getHeaderTitle(route: any) {
  // If the focused route is not found, we need to assume it's the initial screen
  // This can happen during if there hasn't been any navigation inside the screen
  // In our case, it's "Feed" as that's the first screen inside the navigator
  const routeName = getFocusedRouteNameFromRoute(route) ?? 'Feed';

  return routeName;
}

function AppTabs() {
  return (
    <SocialTab.Navigator
        initialRouteName="Explore"
        screenOptions={({ route }) => ({
          headerTitleStyle: { fontSize: 28, fontWeight: '500', paddingBottom: 10 },
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
      </SocialTab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Tabs" component={AppTabs} options={({ route }) => ({
          headerTitle: getHeaderTitle(route), headerShown: false,
        })}/>
        {/*Pages not included in tabs go here (Detail, Filter, etc.) */}
        <Stack.Screen name="Detail" component={DetailScreen} options={{headerTitleStyle: { fontSize: 28, fontWeight: '500'}}}/>
      </Stack.Navigator>
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
