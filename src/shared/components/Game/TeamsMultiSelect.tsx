import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { COLORS, SIZES } from '@constants';
import { Icon } from '@components';
import publicApi from '@services/api';

export interface TeamOption {
  id: number;
  name: string;
  color?: string; // use this if the backend ever sends it
}

// name (lowercase) -> hex
const TEAM_COLORS: Record<string, string> = {
  black: COLORS.black,
  blue: COLORS.blue,
  gray: COLORS.gray,
  green: COLORS.green,
  orange: COLORS.orange,
  pink: COLORS.pink,
  purple: COLORS.purple,
  red: COLORS.red,
  skin: COLORS.skin,
  white: COLORS.white,
  yellow: COLORS.yellow,
};
 
const getTeamColor = (team: TeamOption) =>
  team.color || TEAM_COLORS[team.name.toLowerCase()] || '#BDBDBD';

const ColorDot = ({ color, size = 18 }: { color: string; size?: number }) => (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: color,
      borderWidth: 1,
      borderColor: '#cfcfcf', // keeps white visible
    }}
  />
);

interface Props {
  value: number[]; // selected team ids
  onChange: (value: number[]) => void;
  placeholder?: string;
  hasError?: boolean;
  maxSelected?: number;
}

const TeamsMultiSelect = ({
  value = [],
  onChange,
  placeholder = 'Select teams',
  hasError,
  maxSelected,
}: Props) => {
  const [open, setOpen] = useState(false);

  const toggle = (id: number) => {
    if (value.includes(id)) {
      onChange(value.filter(v => v !== id));
    } else {
      if (maxSelected && value.length >= maxSelected) return;
      onChange([...value, id]);
    }
  };

const [teams, setTeams] = useState<{ label: string; value: string }[]>([]);
  const selected = teams.filter(t => value.includes(t.id));
    const getTeams = async (): Promise<void> => {
        try {
        const response = await publicApi.get('games/teams');
        const teamList = response.result.data;
        console.log('Fetched teams:', teamList);
        setTeams(teamList);
        } catch (error) {
        Alert.alert('Error', (error as any).response?.data?.message);
        setTeams([]);
        }
    };

    useEffect(() => {
        getTeams();
    }, []);
  return (
    <View>
      {/* Trigger */}
      <TouchableOpacity
        style={[styles.trigger, hasError && { borderColor: 'red' }]}
        onPress={() => setOpen(o => !o)}
        activeOpacity={0.7}
      >
        <View style={styles.triggerContent}>
          {selected.length === 0 ? (
            <Text style={{ color: COLORS.gray }}>{placeholder}</Text>
          ) : (
            <View style={styles.dotsRow}>
              {selected.map(t => (
                <ColorDot key={t.id} color={getTeamColor(t)} size={16} />
              ))}
              <Text style={styles.countText}>({selected.length})</Text>
            </View>
          )}
          <Icon
            size={20}
            name={open ? 'expand-less' : 'expand-more'}
            type="materialIcons"
          />
        </View>
      </TouchableOpacity>

      {/* Options */}
      {open && (
        <View style={styles.menu}>
          {/* nestedScrollEnabled is needed because this sits inside the screen's ScrollView */}
          <ScrollView nestedScrollEnabled style={{ maxHeight: 280 }}>
            {teams.map(team => {
              const isSelected = value.includes(team.id);
              return (
                <TouchableOpacity
                  key={team.id}
                  style={[styles.item, isSelected && styles.itemSelected]}
                  onPress={() => toggle(team.id)}
                >
                  <View style={styles.itemLeft}>
                    <ColorDot color={getTeamColor(team)} />
                    <Text
                      style={{
                        marginLeft: 10,
                        color: isSelected ? COLORS.primary : COLORS.black,
                        fontWeight: isSelected ? '600' : '400',
                      }}
                    >
                      {team.name}
                    </Text>
                  </View>
                  {isSelected && (
                    <Icon size={18} name="check" type="materialIcons" color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  trigger: {
    width: '100%',
    paddingHorizontal: SIZES.padding,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.grayscale300,
    marginVertical: 5,
    minHeight: SIZES.InputHeight,
    justifyContent: 'center',
  },
  triggerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dotsRow: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
  },
  countText: { fontSize: 12, color: COLORS.gray, marginLeft: 4 },
  menu: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginTop: 4,
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemSelected: { backgroundColor: '#f7f7f7' },
  itemLeft: { flexDirection: 'row', alignItems: 'center' },
});

export default TeamsMultiSelect;