import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function HistoryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>History & Analytics</Text>
      <Text style={styles.subtitle}>View your streaks and progress</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#091522',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00BDFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8A9CAE',
  },
});
