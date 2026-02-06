import { StyleSheet } from 'react-native';
import { COLORS, SIZES } from '@constants';

export default StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
  },
  headerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  dayCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  dayCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  gameItem: {
    backgroundColor: '#f0f9ff',
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
  },
  gameAddress: {
    fontSize: 13,
    color: '#1f2937',
    fontWeight: '600',
  },
  gameTime: {
    fontSize: 12,
    color: '#4b5563',
    marginTop: 4,
  },
  gamePlayers: {
    fontSize: 12,
    color: '#4b5563',
  },
  addGameText: {
    color: COLORS.primary,
    fontSize: 13,
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 16,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  modalCloseButton: {
    padding: 8,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1f2937',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 12,
    color: COLORS.primary,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  priceInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 16,
    color: '#1f2937',
    marginRight: 8,
    fontWeight: '600',
  },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1f2937',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  cancelButtonText: {
    textAlign: 'center',
    color: '#1f2937',
    fontWeight: '600',
  },
  createButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  createButtonText: {
    textAlign: 'center',
    color: 'white',
    fontWeight: '600',
  },
  customButtonContainer: {
      marginHorizontal: 5,
  },
  customButtonGradient: {
      borderRadius: 15,
      paddingVertical: 12,
      paddingHorizontal: 20,
      alignItems: 'center',
      justifyContent: 'center',
  },
  customButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
  },
   container: {
    width: '100%',
  },
  inputContainer: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    flexDirection: 'row',
    height: SIZES.InputHeight,
    alignItems: 'center',
  },

  input: {
    color: COLORS.black,
    flex: 1,
    fontFamily: 'regular',
    fontSize: 14,
    paddingTop: 0,
  },
  errorContainer: {
    marginVertical: 4,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
  },
  selectContainer: {
    height: SIZES.InputHeight,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#d1d5db",
    overflow: 'hidden',
    color: COLORS.black
  },
    dropdown: {
      width: '100%',
      paddingHorizontal: SIZES.padding,
      paddingVertical: SIZES.padding2,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "#d1d5db", 
      flexDirection: 'row',
      alignItems: 'center',
    },
    icon: {
      marginRight: 10,
      height: 20,
      width: 20,
      tintColor: '#BCBCBC',
    },
    placeholderStyle: {
      fontSize: 14,
    },
    selectedTextStyle: {
      fontSize: 14,
    },
    iconStyle: {
      width: 20,
      height: 20,
    },
    inputSearchStyle: {
      height: 30,
      fontSize: 16,
    },
});
