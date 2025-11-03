import { View, ScrollView, Text } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import SavedCard from "../components/SavedCards";
import SavedFolder from "../components/SavedFolder";
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

  const categories = items.reduce((acc: {[key: string]: any[]}, item) => {
    if (!acc[item.type + 's']) {
      acc[item.type + 's'] = [];
    }
    acc[item.type + 's'].push(item);
    return acc;
  }, {})
  // Render list of saved cards
  return (
    <View style={{ flex: 1, paddingTop: 8, paddingBottom: 92 }}>
      <ScrollView>
        {Object.entries(categories).map(([category, items]) => (
          <SavedFolder key={category} category={category} count={items.length}
            imageSource={
              // Use image of first item in category as folder cover
              items[0].image?.startsWith?.("http")
                ? { uri: items[0].image }
                : BackgroundImage.GetImage(items[0].image || "perrot.png")
            }
            onPress={() => {
              // Navigate to a new screen showing items in this category
              console.log(items);
              nav.navigate("Results", { results: items, title: category });
            }}
          />
        ))}
      </ScrollView>
    </View>
  );
}
