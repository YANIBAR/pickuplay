import { StyleSheet } from 'react-native';
import { COLORS, SIZES } from '@constants';

export default StyleSheet.create({
  headerContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  viewRight: {
    flexDirection: "row",
    alignItems: "center"
  },
  bellIcon: {
    height: 28,
    width: 28,
    tintColor: COLORS.black,
    marginRight: 8
  },
  dividerContainer: {
    borderBottomColor: COLORS.grayscale400,
    borderBottomWidth: 1,
    marginVertical: 12,
    flexDirection: 'row',
    paddingBottom: 4,
  },
  title: {
    fontSize: 28,
    //fontFamily: 'bold',
    color: COLORS.black,
    marginVertical: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    //fontFamily: 'regular',
    color: 'black',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  loginTitle: {
    fontSize: 14,
    //fontFamily: 'regular',
    color: 'black',
  },
  loginSubtitle: {
    fontSize: 14,
    //fontFamily: 'semiBold',
    color: COLORS.primary,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 32,
    right: 0,
    left: 0,
    alignItems: 'center',
  },
  bottomTitle: {
    fontSize: 12,
    //fontFamily: 'regular',
    color: COLORS.black,
  },
  bottomSubtitle: {
    fontSize: 12,
    //fontFamily: 'regular',
    color: COLORS.black,
    textDecorationLine: 'underline',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    height: 250,
    padding: 20,
    marginLeft: 25,
    marginRight: 25,
  },
  image: {
    width: 50,
    height: 30,
    borderRadius: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  price: {
    fontSize: 16,
    color: '#888',
    marginTop: 5,
  },
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  // Header row
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerFilterIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 160,
    height: 30,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.black,
  },
  headerRight: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    height: 22,
    width: 22,
    tintColor: COLORS.black,
  },

  // Location row
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
    gap: 8,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  locationText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.black,
    marginHorizontal: 2,
  },

  // Sport icon cards row
  sportsIconBar: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    height: 120,
  },
  sportsIconBarContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
    flexDirection: 'row',
  },
  sportIconCard: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    paddingVertical: 8,
    borderRadius: 12,
  },
  sportIconCardActive: {
    // no bg change on card, only circle changes
  },
sportsIconBarCompact: {
  backgroundColor: COLORS.white,
  borderBottomWidth: 1,
  borderBottomColor: '#eee',
  maxHeight: 100,  // reduced from 120
},
  sportIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  sportIconCircleActive: {
    backgroundColor: COLORS.primary,
  },
  sportIconLabel: {
    fontSize: 12,
    color: COLORS.grayscale500,
    textAlign: 'center',
    fontWeight: '500',
  },
  sportIconLabelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },

  // Day filter pills
  daysFiltersBar: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginHorizontal: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.grayscale400,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: 13,
    color: COLORS.grayscale500,
  },
  filterButtonTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  filterBadge: {
    backgroundColor: COLORS.white,
    borderRadius: 99,
    minWidth: 15,
    height: 15,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    marginRight: 8,
  },
  filterBadgeText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 12,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#ff6b6b',
  },
  clearButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  daysFiltersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 50,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    maxHeight: 60,
  },
  filtersBar: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  content: {
    flex: 1,
    minHeight:"100%"
  },
  emptyState: {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: 32,
},
emptyStateText: {
  fontSize: 16,
  color: COLORS.gray,
  textAlign: 'center',
  lineHeight: 24,
},
  // Styles additions/changes
modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.45)',
  justifyContent: 'flex-end', // bottom sheet feel
},
modalContent: {
  backgroundColor: '#fff',
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  paddingBottom: 32, // safe area buffer
},
dragHandle: {
  width: 36,
  height: 4,
  borderRadius: 2,
  backgroundColor: '#DDD',
  alignSelf: 'center',
  marginBottom: 12,
},
modalHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: 20,
  paddingTop: 16,
  paddingBottom: 8,
},
modalTitle: {
  fontSize: 17,
  fontWeight: '600',
  color: '#111',
},
divider: {
  height: StyleSheet.hairlineWidth,
  backgroundColor: '#E5E5E5',
  marginBottom: 4,
},
filterSection: {
  paddingHorizontal: 20,
  paddingVertical: 12,
},
filterSectionLabel: {
  fontSize: 12,
  fontWeight: '600',
  color: '#888',
  textTransform: 'uppercase',
  letterSpacing: 0.6,
  marginBottom: 10,
},
pillsContainer: {
  gap: 8,
  paddingRight: 20,
},
pill: {
  paddingHorizontal: 14,
  paddingVertical: 7,
  borderRadius: 100,
  borderWidth: 1.5,
  borderColor: '#E0E0E0',
  backgroundColor: '#FAFAFA',
},
pillActive: {
  borderColor: '#1A73E8',
  backgroundColor: '#EBF2FF',
},
pillText: {
  fontSize: 13.5,
  fontWeight: '500',
  color: '#555',
},
pillTextActive: {
  color: '#1A73E8',
  fontWeight: '600',
},
applyButton: {
  marginHorizontal: 20,
  marginTop: 8,
  backgroundColor: '#1A1A1A',
  borderRadius: 12,
  paddingVertical: 14,
  alignItems: 'center',
},
applyButtonText: {
  color: '#fff',
  fontSize: 15,
  fontWeight: '600',
},
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterOptionActive: {
    backgroundColor: '#f9f9f9',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.gray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  filterOptionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    paddingHorizontal: 10
  },
  badge: {
  position: 'absolute',
  top: -4,
  right: -4,
  backgroundColor: 'red',
  borderRadius: 10,
  minWidth: 18,
  height: 18,
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: 4,
},
badgeText: {
  color: 'white',
  fontSize: 10,
  fontFamily: 'bold',
},
toast: {
  position: 'absolute',
  top: 60,
  left: 16,
  right: 16,
  backgroundColor: COLORS.primary,
  borderRadius: 12,
  padding: 14,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  elevation: 10,
  zIndex: 999,
},
toastTitle: {
  color: COLORS.white,
  fontWeight: '700',
  fontSize: 14,
  marginBottom: 3,
},
toastBody: {
  color: COLORS.white,
  fontSize: 13,
},
});