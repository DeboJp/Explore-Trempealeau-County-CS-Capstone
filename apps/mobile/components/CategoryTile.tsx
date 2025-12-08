import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Image} from 'react-native';
import {Icons} from '../assets/ts/icons';

interface CategoryTileProps {
  title: string;
  icon: string;
  onPress: () => void;
}

export default function CategoryTile({ title, icon, onPress }: CategoryTileProps) {
    const iconSource = Icons.GetIcon(icon);
    return (
        <TouchableOpacity onPress={onPress}>
            <View style={styles.container}>
                {iconSource && <Image source={iconSource} style={{...styles.border, width: 72, height: 72}} />}
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
        aspectRatio: 1,
        marginBottom: 8,
    },
    title: {
        width: '200%',
        textAlign: 'center',
        flexShrink: 1,
        fontSize: 16,
        fontFamily: 'DM Sans',
    },
});