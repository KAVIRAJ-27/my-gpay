import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export function HomeHeaderArt() {
  return (
    <View style={styles.container}>
      {/* Sky Background with stars */}
      <View style={styles.sky}>
        {/* Tiny stars */}
        <View style={[styles.star, { top: 12, left: 40 }]} />
        <View style={[styles.star, { top: 28, left: 180 }]} />
        <View style={[styles.star, { top: 8, right: 70 }]} />
        <View style={[styles.star, { top: 32, right: 140 }]} />

        {/* City Skyline Silhouettes */}
        <View style={[styles.building, { left: 24, height: 42, width: 28 }]} />
        <View style={[styles.building, { left: 46, height: 60, width: 34 }]}>
          <View style={styles.windowRow}>
            <View style={styles.window} /><View style={styles.window} />
          </View>
        </View>
        <View style={[styles.building, { right: 80, height: 48, width: 30 }]} />
        <View style={[styles.building, { right: 40, height: 64, width: 38 }]}>
          <View style={styles.windowRow}>
            <View style={styles.window} /><View style={styles.window} />
          </View>
        </View>

        {/* Bank Temple / Classical Building on the left hill */}
        <View style={styles.templeContainer}>
          <Ionicons name="business" size={26} color="#4E8D7C" />
        </View>

        {/* Street Vendor Stall on the right hill */}
        <View style={styles.vendorStall}>
          {/* Awning */}
          <View style={styles.awning}>
            <View style={[styles.awningStripe, { backgroundColor: '#F9AB00' }]} />
            <View style={[styles.awningStripe, { backgroundColor: '#EA4335' }]} />
            <View style={[styles.awningStripe, { backgroundColor: '#F9AB00' }]} />
            <View style={[styles.awningStripe, { backgroundColor: '#EA4335' }]} />
          </View>
          {/* Cart body */}
          <View style={styles.cartBody}>
            <View style={styles.vendorPerson}>
              <View style={styles.vendorHead} />
              <View style={styles.vendorBody} />
            </View>
          </View>
        </View>
      </View>

      {/* Layered Rolling Green Hills */}
      <View style={styles.hillBack} />
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
    marginTop: 4,
    marginBottom: 8,
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
    opacity: 0.7,
  },
  building: {
    position: 'absolute',
    bottom: 30,
    backgroundColor: '#18241D',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    paddingTop: 4,
    alignItems: 'center',
  },
  windowRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  window: {
    width: 3,
    height: 4,
    backgroundColor: '#FDD663',
    opacity: 0.8,
  },
  templeContainer: {
    position: 'absolute',
    left: 45,
    bottom: 38,
    opacity: 0.85,
  },
  vendorStall: {
    position: 'absolute',
    right: 48,
    bottom: 34,
    width: 44,
    alignItems: 'center',
  },
  awning: {
    flexDirection: 'row',
    width: 38,
    height: 10,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    overflow: 'hidden',
  },
  awningStripe: {
    flex: 1,
    height: '100%',
  },
  cartBody: {
    width: 36,
    height: 18,
    backgroundColor: '#F9AB00',
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    position: 'relative',
    alignItems: 'center',
  },
  vendorPerson: {
    position: 'absolute',
    right: -10,
    bottom: 0,
    alignItems: 'center',
  },
  vendorHead: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D7CCC8',
  },
  vendorBody: {
    width: 8,
    height: 12,
    backgroundColor: '#4285F4',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  hillBack: {
    position: 'absolute',
    bottom: 0,
    left: -40,
    right: -40,
    height: 65,
    borderTopLeftRadius: 300,
    borderTopRightRadius: 200,
    backgroundColor: '#123D26',
  },
  hillFront: {
    position: 'absolute',
    bottom: -15,
    left: -20,
    right: -20,
    height: 55,
    borderTopLeftRadius: 220,
    borderTopRightRadius: 320,
    backgroundColor: '#1E5838',
  },
});
