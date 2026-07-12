import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function LogScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log Intake</Text>
      <Text style={styles.subtitle}>Track your hydration</Text>
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
