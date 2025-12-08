import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image} from 'react-native';
import { NavigationContainer, getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import ExploreScreen from './pages/ExploreScreen'
import SavedScreen from './pages/SavedScreen'
import MapScreen from './pages/MapScreen'
import DetailScreen from './pages/DetailScreen';
import ResultsScreen from './pages/ResultsScreen';
import {Icons} from './assets/ts/icons';
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
          headerTitleStyle: { fontSize: 28, fontWeight: '500', paddingBottom: 20, backgroundColor: 'transparent' },
          tabBarStyle: { position: 'absolute', borderRadius: 40, margin: 10, height: 90, backgroundColor: '#266AB1', color: '#E1EDFF', paddingTop: 16},
          tabBarLabel: ({ focused }) => (
            focused ? <Text style={{ fontSize: 16, color: '#E1EDFF', fontWeight: '500', paddingTop: 20, borderBottomWidth: 3, borderBottomColor: '#E1EDFF', paddingBottom: 8 }}>{route.name}</Text> : <Text style={{ fontSize: 16, color: '#E1EDFF', fontWeight: '500', paddingTop: 24, paddingBottom: 4 }}>{route.name}</Text>
          ),
          tabBarIcon: ({ focused }) => {
            let iconUrl;
            if (route.name === 'Explore') {
              iconUrl = Icons.GetIcon('map-white');
            } else if (route.name === 'Saved') {
              iconUrl = Icons.GetIcon('bookmark-solid-white');
            } else if (route.name === 'Map') {
              iconUrl = Icons.GetIcon('location-pin-white');
            }
            return (
              <Image 
                source={iconUrl} 
                style={{ width: 30, height: 30, marginTop: 50, marginBottom: 40, tintColor: '#FFF', opacity: focused ? 1 : 0.8 }}
              />
            );
          }
        })}
      >
        <SocialTab.Screen name="Explore" component={ExploreScreen} />
        <SocialTab.Screen name="Map" component={MapScreen} />
        <SocialTab.Screen name="Saved" component={SavedScreen} />

      </SocialTab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Tabs" component={AppTabs} options={({ route }) => ({
          headerTransparent: true,
          headerTitle: getHeaderTitle(route), headerShown: false,
        })}/>
        {/*Pages not included in tabs go here (Detail, Filter, etc.) */}
        <Stack.Screen
          name="Details"
          component={DetailScreen}
          options={() => ({
            headerTransparent: true,
            headerTitleStyle: { fontSize: 28, fontWeight: '500' },
            headerBackground: () => (
              <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.6)' }} />
            ),
          })}
        />
        <Stack.Screen name="Results" component={ResultsScreen} options={({route}) => ({title: route.params.title ?? 'Results', headerTransparent: true, headerTitleStyle: { fontSize: 28, fontWeight: '500'}})}/>
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
