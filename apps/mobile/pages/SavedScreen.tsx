import { View, ScrollView, Text } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import SavedCard from "../components/SavedCards";
import { getSavedItems, toggleSaved } from "../lib/savedStore";
import { BackgroundImage } from "../assets/ts/images";

export default function SavedScreen() {
  const nav = useNavigation();
  // Local state holding all saved location objects currently loaded from storage
  const [items, setItems] = useState<any[]>([]);

  // Fetch saved items once or on focus
  const load = useCallback(async () => {
    setItems(await getSavedItems());
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

    // If empty, simple placeholder
  if (!items.length)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>No saved places yet.</Text>
      </View>
    );

  // Render list of saved cards
  return (
    <ScrollView contentContainerStyle={{ paddingVertical: 8 }}>
      {items.map((loc) => (
        <SavedCard key={loc.id} title={loc.name} distance={loc.city} date={loc.type} isSaved={true}
          // if source remote pull from web, else from local assets.
          imageSource={ 
            loc.image?.startsWith?.("http")
              ? { uri: loc.image }
              : BackgroundImage.GetImage(loc.image || "perrot.png")
          }
          // When card is tapped, navigate to Detail page for that location
          onPress={() => nav.navigate("Detail", { locationId: loc.id })}
          onRemove={async () => { // When star badge is tapped → remove from saved list and update state
            await toggleSaved(loc.id);
            setItems((prev) => prev.filter((x) => x.id !== loc.id));
          }}
        />
      ))}
    </ScrollView>
  );
}
