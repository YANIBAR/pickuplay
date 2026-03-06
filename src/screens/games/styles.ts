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
  logo: {
    width: 128,
    height: 128,
    marginBottom: 22,
    marginTop: -22,
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
  filtersBar: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.grayscale600,
    minHeight: SIZES.InputHeight-6,
  },
  filterButtonActive: {
    backgroundColor: COLORS.transparentPrimary,
    borderColor: COLORS.primary,
    color: COLORS.black
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.grayscale600,
  },
  filterButtonTextActive: {
    color: COLORS.grayscale600,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#ff6b6b',
  },
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    maxHeight: 60,
  },
  headerRight: {
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    height: 20,
    width: 20,
    tintColor: COLORS.secondary,
  },
  clearButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  content: {
    flex: 1,
    minHeight:"100%"
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
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
});