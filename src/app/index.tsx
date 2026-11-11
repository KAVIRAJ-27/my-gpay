import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoBadgeText}>G</Text>
          </View>
          <Text style={styles.title}>G Pay.nu</Text>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Phase 1 Setup</Text>
          </View>
          <Text style={styles.subtitle}>Project initialized successfully.</Text>
          <View style={styles.divider} />
          <Text style={styles.infoLabel}>Platform</Text>
          <Text style={styles.infoValue}>React Native • Expo • TypeScript</Text>
          <Text style={styles.infoLabel}>Architecture</Text>
          <Text style={styles.infoValue}>Expo Router • Local Simulator</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 36,
    paddingHorizontal: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E8EAED',
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1A73E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoBadgeText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#202124',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F4EA',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1E8E3E',
    marginRight: 6,
  },
  statusText: {
    color: '#137333',
    fontSize: 13,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 16,
    color: '#5F6368',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#F1F3F4',
    marginBottom: 20,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#80868B',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: '#3C4043',
    fontWeight: '500',
    marginBottom: 12,
  },
});
