import { View, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function QRCodeScreen({ route }) {
  const { activityId } = route.params;
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.qrContainer}>
        <Text style={styles.title}>Scan to Verify</Text>
        <View style={styles.qrWrapper}>
          <QRCode
            value={activityId}
            size={200}
          />
        </View>
        <Text style={styles.instruction}>
          Show this QR code to the activity provider to validate your pass
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  qrContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  qrWrapper: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 30,
  },
  instruction: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});