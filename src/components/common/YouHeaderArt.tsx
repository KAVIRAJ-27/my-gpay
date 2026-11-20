import React from 'react';
import { View, StyleSheet } from 'react-native';

export function YouHeaderArt() {
  return (
    <View style={styles.container}>
      {/* Sky with stars & airplane */}
      <View style={styles.sky}>
        <View style={[styles.star, { top: 18, left: 60 }]} />
        <View style={[styles.star, { top: 24, left: 160 }]} />
        <View style={[styles.star, { top: 12, right: 100 }]} />
        
        {/* Distant Airplane */}
        <View style={styles.airplane}>
          <View style={styles.planeBody} />
          <View style={styles.planeWing} />
        </View>

        {/* Tree Silhouette on the right */}
        <View style={styles.treeContainer}>
          <View style={styles.treeTrunk} />
          <View style={styles.treeFoliage} />
        </View>
      </View>

      {/* Layered Night Hills */}
      <View style={styles.hillBack} />
      <View style={styles.hillMid} />
      <View style={styles.hillFront} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 110,
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#131313',
    position: 'relative',
  },
  sky: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#131313',
  },
  star: {
    position: 'absolute',
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#FFFFFF',
    opacity: 0.6,
  },
  airplane: {
    position: 'absolute',
    top: 28,
    left: '52%',
    width: 14,
    height: 6,
    opacity: 0.4,
  },
  planeBody: {
    width: 14,
    height: 2,
    backgroundColor: '#E0E0E0',
    borderRadius: 1,
  },
  planeWing: {
    position: 'absolute',
    top: -2,
    left: 4,
    width: 4,
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 1,
  },
  treeContainer: {
    position: 'absolute',
    bottom: 25,
    right: 28,
    alignItems: 'center',
    zIndex: 3,
  },
  treeTrunk: {
    position: 'absolute',
    bottom: 0,
    width: 3,
    height: 18,
    backgroundColor: '#42281D',
  },
  treeFoliage: {
    width: 20,
    height: 26,
    borderRadius: 10,
    backgroundColor: '#1B543A',
    marginBottom: 6,
  },
  hillBack: {
    position: 'absolute',
    bottom: -10,
    left: -40,
    right: -20,
    height: 70,
    borderTopLeftRadius: 300,
    borderTopRightRadius: 200,
    backgroundColor: '#1E2B25',
  },
  hillMid: {
    position: 'absolute',
    bottom: -15,
    left: -10,
    right: -60,
    height: 60,
    borderTopLeftRadius: 180,
    borderTopRightRadius: 320,
    backgroundColor: '#163E2B',
  },
  hillFront: {
    position: 'absolute',
    bottom: -25,
    left: -30,
    right: -20,
    height: 55,
    borderTopLeftRadius: 280,
    borderTopRightRadius: 140,
    backgroundColor: '#1B543A',
  },
});
