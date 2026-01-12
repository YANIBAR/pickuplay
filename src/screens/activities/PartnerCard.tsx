import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

export type Partner = {
  id: string;
  name: string;
  description: string;
  logo: string;
  activityCount: number;
};

type PartnerCardProps = {
  partner: Partner;
  onPress: (partner: Partner) => void;
};

export default function PartnerCard({ partner, onPress }: PartnerCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(partner)}>
      <Image source={{ uri: partner.logo }} style={styles.logo} />
      <View style={styles.content}>
        <Text style={styles.name}>{partner.name}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {partner.description}
        </Text>
        <Text style={styles.activities}>
          {partner.activityCount} Activities Available
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  activities: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '500',
  },
});