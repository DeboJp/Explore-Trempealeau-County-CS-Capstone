import { View, ScrollView, Text } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import SavedCard from "../components/SavedCards";
import { isSaved as storeIsSaved, toggleSaved as storeToggle } from '../lib/savedStore';
import { BackgroundImage } from "../assets/ts/images";
import Constants from "expo-constants";


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
    
    useEffect(() => {
      async function logEvent() {
            console.log(`${Constants?.expoConfig?.extra?.api.base_url}/analytics/log?event=${encodeURIComponent("Results - "+category+"#view")}`)
            await fetch(`${Constants?.expoConfig?.extra?.api.base_url}/analytics/log?event=${encodeURIComponent("Results - "+category+"#view")}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }
        logEvent();
    }, []);
    return (
        <ScrollView contentContainerStyle={{ marginTop: 80, paddingTop: 8, paddingBottom: 24 }}>
            {results.map((loc) => (
                    <SavedCard key={loc.id} title={loc.title} date={loc.type} isSaved={storeIsSaved(loc.id)}
                      // if source remote pull from web, else from local assets.
                      imageSource={ 
                        loc.image?.startsWith?.("http")
                          ? { uri: loc.image }
                          : BackgroundImage.GetImage(loc.image || "perrot.png")
                      }
                      // When card is tapped, navigate to Detail page for that location
                      onPress={() => nav.navigate("Details", { locationId: loc.id, title: loc.title })}
                      onRemove={async () => { // When star badge is tapped → remove from saved list and update state
                        await toggleSaved(loc.id);
                        setItems((prev) => prev.filter((x) => x.id !== loc.id));
                      }}
                    />
                  ))}
        </ScrollView>
    )
}