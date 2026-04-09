import { StyleSheet } from 'react-native';
import { COLORS } from '@constants';

export default StyleSheet.create({
   container: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 8,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  slideContainer: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  slideNumber: {
    fontSize: 14,
    color: COLORS.grayscale600 || '#666666',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  slideTitleContainer: {
    marginBottom: 30,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  slideTitleFr: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.grayscale900 || '#333333',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 28,
  },
  slideTitleAr: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.grayscale700 || '#555555',
    textAlign: 'center',
    lineHeight: 26,
    fontFamily: 'System',
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.grayscale200 || '#e9ecef',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    minHeight: 56,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  selectedOptionButton: {
    backgroundColor: COLORS.primary || '#2196f3',
    borderColor: COLORS.primary || '#2196f3',
    elevation: 3, // More elevation when selected
    shadowOpacity: 0.2,
  },
  pressedOptionButton: {
    backgroundColor: COLORS.primary100 || '#bbdefb',
    borderColor: COLORS.primary300 || '#64b5f6',
    transform: [{ scale: 0.98 }], // Slight scale down on press
  },
  inputContainer: {
    marginTop: 20,
  },
  numberInput: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.grayscale200 || '#e9ecef',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    fontSize: 18,
    textAlign: 'center',
    minHeight: 56,
    color: COLORS.grayscale900 || '#333333',
  },
  textInput: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.grayscale200 || '#e9ecef',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    color: COLORS.grayscale900 || '#333333',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginTop: 20,
    marginBottom: 16,
  },
  navigationButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  previousButton: {
    backgroundColor: COLORS.white,
  },
  nextButton: {
    backgroundColor: COLORS.white,
  },
  hiddenButton: {
    opacity: 0.5,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.grayscale900 || '#333333',
    textAlign: 'center',
  },
  selectedOptionText: {
    color: COLORS.white || '#ffffff',
    fontWeight: '600',
  },
  skipContainer: {
    position: 'absolute',
    top: 60, // Adjust based on your status bar height
    right: 20,
    zIndex: 1000,
  },
  skipButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.secondary || '#ccc',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  }
});