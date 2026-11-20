import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export function MoneyHeaderArt() {
  return (
    <View style={styles.container}>
      {/* Sky & Moon */}
      <View style={styles.sky}>
        {/* Crescent Moon */}
        <View style={styles.moonContainer}>
          <View style={styles.moon} />
          <View style={styles.moonMask} />
        </View>

        {/* Lit City Skyscrapers */}
        <View style={[styles.building, { right: 130, height: 60, width: 22, backgroundColor: '#212E27' }]}>
          <View style={styles.window} />
          <View style={styles.window} />
        </View>
        <View style={[styles.building, { right: 104, height: 80, width: 24, backgroundColor: '#2E3F35' }]}>
          <View style={styles.window} />
          <View style={styles.window} />
          <View style={styles.window} />
        </View>
        <View style={[styles.building, { right: 76, height: 95, width: 26, backgroundColor: '#3B5044' }]}>
          <View style={styles.window} />
          <View style={styles.window} />
          <View style={styles.window} />
        </View>
        <View style={[styles.building, { right: 48, height: 70, width: 24, backgroundColor: '#27382F' }]}>
          <View style={styles.window} />
          <View style={styles.window} />
        </View>
      </View>

      {/* Blue River Water Stream */}
      <View style={styles.river} />

      {/* Foreground Green Hills */}
      <View style={styles.hillBack} />
      <View style={styles.hillFront}>
        {/* Person Sitting on Hill contemplating finances */}
        <View style={styles.personContainer}>
          <View style={styles.personHead} />
          <View style={styles.personBody} />
          <View style={styles.personLegs} />
          {/* Glowing yellow smartphone in hand */}
          <View style={styles.phoneGlow} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 125,
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
  moonContainer: {
    position: 'absolute',
    top: 16,
    left: 80,
    width: 22,
    height: 22,
  },
  moon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FDD663',
  },
  moonMask: {
    position: 'absolute',
    top: -2,
    left: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#131313',
  },
  building: {
    position: 'absolute',
    bottom: 35,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    paddingTop: 6,
    alignItems: 'center',
    gap: 5,
  },
  window: {
    width: 4,
    height: 4,
    backgroundColor: '#81C995',
    opacity: 0.8,
  },
  river: {
    position: 'absolute',
    bottom: 15,
    left: 0,
    right: 0,
    height: 35,
    backgroundColor: '#1A435A',
  },
  hillBack: {
    position: 'absolute',
    bottom: -10,
    left: -50,
    right: -20,
    height: 60,
    borderTopLeftRadius: 180,
    borderTopRightRadius: 260,
    backgroundColor: '#133E2B',
  },
  hillFront: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    right: -50,
    height: 65,
    borderTopLeftRadius: 280,
    borderTopRightRadius: 160,
    backgroundColor: '#1B543A',
  },
  personContainer: {
    position: 'absolute',
    top: 6,
    right: 90,
    alignItems: 'center',
  },
  personHead: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D7CCC8',
  },
  personBody: {
    width: 8,
    height: 12,
    backgroundColor: '#FBBC04',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  personLegs: {
    width: 10,
    height: 6,
    backgroundColor: '#1E88E5',
    borderRadius: 2,
  },
  phoneGlow: {
    position: 'absolute',
    top: 5,
    left: -3,
    width: 3,
    height: 5,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
    shadowColor: '#FFF',
    shadowOpacity: 0.9,
    shadowRadius: 3,
  },
});
