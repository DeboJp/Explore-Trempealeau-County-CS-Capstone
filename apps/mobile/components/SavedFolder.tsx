import React from "react";
import { View, Text, StyleSheet, Pressable, ImageBackground, Image, TouchableOpacity } from "react-native";
import {Icons} from '../assets/ts/icons';
import { LinearGradient } from "expo-linear-gradient";

type SavedFolderProps = {
  category: string;
  count: number;
  imageSource?: any;      // number | { uri: string }
  onPress?: () => void;
  onRemove?: () => void;
};

export default function SavedCard({ category, count, imageSource, onPress, onRemove}: SavedFolderProps) {
  // Fallback image to avoid ImageBackground errors when source is missing/invalid
  const source = imageSource || { uri: "https://picsum.photos/400/240" };

  return (
    // Whole card is tappable to open Detail
    <TouchableOpacity onPress={onPress}>
      <ImageBackground source={source} style={styles.card} imageStyle={styles.radius} resizeMode="cover">
        {/* Bottom info strip */}
        <View style={{...styles.row, alignItems: 'center', width: '100%', position: 'absolute', bottom: 8, left: 8, padding: 8, zIndex: 2}}>
          <Text style={styles.title}>{category}</Text>
          <Text style={{...styles.meta, right: 12}}>{count}</Text>
        </View>

        <LinearGradient 
                  start={{x: 0.0, y: 0.0}} end={{x: 0.0, y: 1}}
                  colors={['#FFFFFF00', '#043A71CC']} 
                  style={{width : '100%', height: '100%'}}>
          </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 10,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
    height: 180,
  },
  image: {
    justifyContent: "flex-end", // pushes textBar to bottom; no absolute positioning needed
  },
  radius: { borderRadius: 12 },

  // Small top-right star badge
  badge: {
    position: "absolute",
    top: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: { color: "#fff", fontSize: 16, fontWeight: "bold" },

  // Bottom info bar
  textBar: {
    padding: 8,
  },
  title: { fontWeight: "400", fontSize: 24, color: '#FFFFFF' },
  row: { flexDirection: "row", justifyContent: "space-between" },
  meta: {
    paddingHorizontal: 21,
    paddingVertical: 16,
    backgroundColor: "#c19b50c5",
    color: "#FFFFFF",
    fontSize: 18,
    borderRadius: 30,
  }
});
