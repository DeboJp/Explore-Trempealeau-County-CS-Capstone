import React from "react";
import { View, Text, StyleSheet, Pressable, ImageBackground, Image, TouchableOpacity } from "react-native";
import {Icons} from '../assets/ts/icons';

type SavedCardProps = {
  title: string;
  distance?: string;
  date?: string;
  isSaved?: boolean;
  imageSource?: any;      // number | { uri: string }
  onPress?: () => void;
  onRemove?: () => void;
};

export default function SavedCard({ title, distance = "", date = "", isSaved = true, imageSource, onPress, onRemove}: SavedCardProps) {
  // Fallback image to avoid ImageBackground errors when source is missing/invalid
  const source = imageSource || { uri: "https://picsum.photos/400/240" };

  return (
    // Whole card is tappable to open Detail
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <ImageBackground source={source} style={styles.image} imageStyle={styles.radius} resizeMode="cover">
        {/* Star badge (tap to remove from saved) */}
        <Pressable style={styles.badge} onPress={onRemove}>
          <TouchableOpacity style={{width: 16, aspectRatio: 1}}>
            <Image source={isSaved ? Icons.GetIcon('star-solid-white') : Icons.GetIcon('star-outline-white')} style={{width: '100%', height: '100%'}} />
          </TouchableOpacity>
        </Pressable>
        {/* Bottom info strip */}
        <View style={styles.textBar}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.row}>
            <Text style={styles.meta}>{distance}</Text>
            <Text style={styles.meta}>{date}</Text>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 10,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff"
  },
  image: {
    width: "100%",
    height: 180,
    justifyContent: "flex-end", // pushes textBar to bottom; no absolute positioning needed
  },
  radius: { borderRadius: 12 },

  // Small top-right star badge
  badge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: { color: "#fff", fontSize: 16, fontWeight: "bold" },

  // Bottom info bar
  textBar: {
    backgroundColor: "rgba(255,255,255,0.85)",
    padding: 8,
  },
  title: { fontWeight: "bold", fontSize: 16, marginBottom: 2 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  meta: { color: "#444", fontSize: 13 },
});
