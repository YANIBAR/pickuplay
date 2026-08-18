import React, { FC, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
  Platform,
  ScrollView,
  Modal,
  FlatList,
} from 'react-native';

export interface Product {
  id: string;
  name: string;
  price: number;
}

interface CheckoutScreenProps {
  hostVenmoUsername: string; // e.g. "john-doe" (no @, no spaces)
  hostName?: string;
  eventName?: string;
  products: Product[];
  preSelectAll?: boolean; // check every line item by default (e.g. mandatory player fees)
  hideQuantity?: boolean; // hide the quantity picker (e.g. one fee per player, quantity doesn't apply)
}

const VENMO_APP_STORE_URL = 'https://apps.apple.com/us/app/venmo/id351727428';
const VENMO_PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.venmo';
const QUANTITY_OPTIONS = Array.from({ length: 10 }, (_, i) => i + 1);

const CheckoutScreen: FC<CheckoutScreenProps> = ({
  hostVenmoUsername = "yanibar",
  hostName = 'Host',
  eventName = 'Tournament',
  preSelectAll = false,
  hideQuantity = false,
}) => {

const players = ['Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5', 'Player 6'];
const products = players.map((name, i) => ({ id: String(i + 1), name, price: 30 }));
  const [selected, setSelected] = useState<Record<string, boolean>>(
    preSelectAll ? Object.fromEntries(products.map((p) => [p.id, true])) : {}
  );
  const [quantities, setQuantities] = useState<Record<string, number>>(
    Object.fromEntries(products.map((p) => [p.id, 1]))
  );
  const [question, setQuestion] = useState('');
  const [pickerFor, setPickerFor] = useState<string | null>(null);

  const toggleSelect = (id: string) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const total = useMemo(() => {
    return products.reduce((sum, p) => {
      if (!selected[p.id]) return sum;
      return sum + p.price * (quantities[p.id] || 1);
    }, 0);
  }, [selected, quantities, products]);

  const handleContinue = async () => {
    if (total <= 0) {
      Alert.alert('Select at least one item to continue.');
      return;
    }

    const itemsNote = products
      .filter((p) => selected[p.id])
      .map((p) => `${p.name} x${quantities[p.id]}`)
      .join(', ');

    const venmoUrl = `venmo://paycharge?txn=pay&recipients=${encodeURIComponent(
      hostVenmoUsername
    )}&amount=${encodeURIComponent(total.toFixed(2))}&note=${encodeURIComponent(
      `${eventName}`
    )}`;

    try {
      const supported = await Linking.canOpenURL(venmoUrl);
      if (supported) {
        await Linking.openURL(venmoUrl);
      } else {
        Alert.alert(
          'Venmo not installed',
          'You need the Venmo app installed to complete this payment.',
          [
            {
              text: 'Get Venmo',
              onPress: () =>
                Linking.openURL(
                  Platform.OS === 'ios' ? VENMO_APP_STORE_URL : VENMO_PLAY_STORE_URL
                ),
            },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
      }
    } catch (err) {
      console.error('Venmo deep link error:', err);
      Alert.alert('Something went wrong opening Venmo.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionLabel}>Any questions about the {eventName.toLowerCase()}?</Text>
      <TextInput
        style={styles.textArea}
        value={question}
        onChangeText={setQuestion}
        multiline
        numberOfLines={4}
        placeholder=""
      />

      <Text style={[styles.sectionLabel, styles.spacedLabel]}>My Products</Text>

      {products.map((p, index) => (
        <View key={p.id}>
          <View style={styles.productRow}>
            <TouchableOpacity
              style={[styles.checkbox, selected[p.id] && styles.checkboxChecked]}
              onPress={() => toggleSelect(p.id)}
            >
              {selected[p.id] && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
            <Text style={styles.productName}>{p.name}</Text>
            <Text style={styles.productPrice}>${p.price.toFixed(2)}</Text>
          </View>

          {!hideQuantity && (
            <View style={styles.quantityRow}>
              <Text style={styles.quantityLabel}>Quantity</Text>
              <TouchableOpacity style={styles.quantityPicker} onPress={() => setPickerFor(p.id)}>
                <Text style={styles.quantityValue}>{quantities[p.id] || 1}</Text>
                <Text style={styles.quantityArrow}>▾</Text>
              </TouchableOpacity>
            </View>
          )}

          {index < products.length - 1 && <View style={styles.divider} />}
        </View>
      ))}

      <View style={styles.totalDivider} />
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
      </View>

      <Text style={[styles.sectionLabel, styles.spacedLabel]}>Payment Methods</Text>
      <View style={styles.paymentBox}>
        <Text style={styles.paymentHint}>
          Tap Continue to pay {hostName} directly via Venmo.
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.continueButton, total <= 0 && styles.continueButtonDisabled]}
        onPress={handleContinue}
        disabled={total <= 0}
      >
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>

      <Modal
        visible={!!pickerFor}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerFor(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setPickerFor(null)}
        >
          <View style={styles.modalContent}>
            <FlatList
              data={QUANTITY_OPTIONS}
              keyExtractor={(item) => item.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    if (pickerFor) {
                      setQuantities((prev) => ({ ...prev, [pickerFor]: item }));
                    }
                    setPickerFor(null);
                  }}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 48 },
  sectionLabel: { fontSize: 14, color: '#333', marginBottom: 8 },
  spacedLabel: { marginTop: 28 },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    minHeight: 90,
    textAlignVertical: 'top',
    fontSize: 14,
  },
  productRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: '#2e7d32', borderColor: '#2e7d32' },
  checkmark: { color: '#fff', fontSize: 13, fontWeight: '700' },
  productName: { flex: 1, fontSize: 15, color: '#222', fontWeight: '500' },
  productPrice: { fontSize: 15, fontWeight: '600', color: '#222' },
  quantityRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, marginLeft: 32 },
  quantityLabel: { fontSize: 13, color: '#666', marginRight: 10 },
  quantityPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 56,
    justifyContent: 'space-between',
  },
  quantityValue: { fontSize: 14, color: '#222' },
  quantityArrow: { fontSize: 12, color: '#666', marginLeft: 6 },
  divider: { height: 1, backgroundColor: '#eee', marginTop: 16 },
  totalDivider: { height: 1, backgroundColor: '#eee', marginTop: 20 },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  totalLabel: { fontSize: 15, color: '#333' },
  totalValue: { fontSize: 15, fontWeight: '700', color: '#222' },
  paymentBox: {
    backgroundColor: '#f7f7f7',
    borderRadius: 8,
    padding: 16,
  },
  paymentHint: { fontSize: 13, color: '#555', textAlign: 'center' },
  continueButton: {
    backgroundColor: '#2fa84f',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  continueButtonDisabled: { backgroundColor: '#a8d8b5' },
  continueButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    maxHeight: 260,
    width: 120,
    paddingVertical: 8,
  },
  modalItem: { paddingVertical: 10, alignItems: 'center' },
  modalItemText: { fontSize: 16, color: '#222' },
});

export default CheckoutScreen;