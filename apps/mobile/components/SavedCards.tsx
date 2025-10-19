import React from "react";
import { View, Text, StyleSheet, Pressable, ImageBackground} from "react-native";

interface SavedCardProps {
  title: string;
  distance: string;
  date: string;
  imageUri: string;
  isTrue: boolean;
}

export default function SavedCard(props: SavedCardProps) {
  return (
    <Pressable style={styles.card}>
      <ImageBackground source={{ uri: props.imageUri }} style={styles.image} imageStyle={styles.imageRadius} resizeMode="cover">
        
        <Pressable style={styles.badge}>
            <Text style={styles.badgeText}>{props.isTrue ? "★" : "☆"}</Text>
        </Pressable>


        <View style={styles.textContainer}>
          <Text style={styles.title}>{props.title}</Text>
          <View style={styles.row}>
            <Text style={styles.desc}>{props.distance}</Text>
            <Text style={styles.date}>{props.date}</Text>
          </View>
        </View>

      </ImageBackground>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 10,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
    elevation: 5,
  },
  image: {
    width: "100%",
    height: 180,
    justifyContent: "space-between",
    // remove padding from the image itself
  },
  imageRadius: { borderRadius: 12 },
  badge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: { color: "#fff", fontSize: 14, fontWeight: "bold" },
  textContainer: {
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 8,
    padding: 8,
  },
  title: { fontWeight: "bold", fontSize: 16 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  desc: { color: "#444", fontSize: 13 },
  date: { color: "#666", fontSize: 12 },
});
