import {View, TextInput, StyleSheet} from 'react-native';
import React from 'react';

interface SearchBarProps {
    placeholder?: string;
    value: string;
    onChangeText: (text: string) => void;
    }
export default function SearchBar({ placeholder, value, onChangeText }: SearchBarProps) {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={placeholder || 'Search'}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '66.7%',
    height: 40,
    borderWidth: 1,
    backgroundColor: '#F5F5F5',
    borderColor: '#9E9E9E',
    borderRadius: 16,
    overflow: 'hidden',
  },
  input: {
    padding: 12,
    fontSize: 16,
  },
});
