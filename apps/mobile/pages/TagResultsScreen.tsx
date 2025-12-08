import React from 'react';
import { View, ScrollView, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import SavedCard from '../components/SavedCards';
import locations from '../assets/ts/locations';
import { BackgroundImage } from '../assets/ts/images';

export default function TagResultsScreen({ route }: { route: any }) {
  const nav = useNavigation();
  const { tag } = route.params || {};

  const results = (tag ? locations.filter(l => (l.activityTags || []).includes(tag) || l.type === tag) : []);

  if (!results || results.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No results found for "{tag}".</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ marginTop: 80, paddingTop: 8, paddingBottom: 24 }}>
      {results.map((loc) => (
        <SavedCard
          key={loc.id}
          title={loc.name}
          distance={loc.approxDistFromParent}
          date={loc.type}
          isSaved={false}
          imageSource={
            loc.image?.startsWith?.('http') ? { uri: loc.image } : BackgroundImage.GetImage(loc.image || 'perrot.png')
          }
          onPress={() => (nav as any).navigate('Details', { locationId: loc.id })}
          onRemove={async () => { /* optional: implement remove handling if desired */ }}
        />
      ))}
    </ScrollView>
  );
}
