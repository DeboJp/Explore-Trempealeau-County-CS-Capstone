import { View, ScrollView, Text } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import SavedCard from "../components/SavedCards";
import { getSavedItems, toggleSaved } from "../lib/savedStore";
import { BackgroundImage } from "../assets/ts/images";

  // Local state holding all saved location objects currently loaded from storage


    // If empty, simple placeholder
interface ResultsScreenProps {
    results: any[];
}

export default function ResultsScreen({route}: {route: any}) {
    const nav = useNavigation();
    const { results, category } = route.params;
    if (!results.length)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>No results found.</Text>
      </View>
    );
    return (
        <ScrollView contentContainerStyle={{ marginTop: 80, paddingTop: 8, paddingBottom: 24 }}>
            {results.map((loc) => (
                    <SavedCard key={loc.id} title={loc.name} distance={loc.approxDistFromParent} date={loc.type} isSaved={true}
                      // if source remote pull from web, else from local assets.
                      imageSource={ 
                        loc.image?.startsWith?.("http")
                          ? { uri: loc.image }
                          : BackgroundImage.GetImage(loc.image || "perrot.png")
                      }
                      // When card is tapped, navigate to Detail page for that location
                      onPress={() => nav.navigate("Details", { locationId: loc.id })}
                      onRemove={async () => { // When star badge is tapped → remove from saved list and update state
                        await toggleSaved(loc.id);
                        setItems((prev) => prev.filter((x) => x.id !== loc.id));
                      }}
                    />
                  ))}
        </ScrollView>
    )
}