import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

interface CategoryTileProps {
  title: string;
  onPress: () => void;
}

export default function CategoryTile({ title, onPress }: CategoryTileProps) {
    return (
        <TouchableOpacity onPress={onPress}>
            <View style={styles.container}>
                <View style={styles.border} />
                <Text style={styles.title}>{title}</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '66.7%',
        height: 'auto',
        marginHorizontal: 8,
        alignItems: 'center',
        paddingBottom: 16,
    },
    border: {
        width: '100%',
        aspectRatio: 1,
        borderColor: '#AFB1B6',
        borderWidth: 1,
        borderRadius: 100,
        marginBottom: 8,
    },
    title: {
        width: '100%',
        textAlign: 'center',
    },
});