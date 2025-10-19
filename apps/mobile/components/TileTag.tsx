import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';

interface TileTagProps {
    text: string;
    backgroundColor: string;
    style?: object;
    onPress?: () => void;
}

export default function TileTag({ text, backgroundColor, style, onPress }: TileTagProps) {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={{...styles.tag, backgroundColor: backgroundColor, ...style}}>
        <Text style={{...styles.tagText}}>{text}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tag: {
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 8,
    paddingRight: 8,
    borderRadius: 12,
  },
  tagText: {
    color: '#FFFFFF', 
    fontSize: 12,
    fontWeight: '600'
  }
});

