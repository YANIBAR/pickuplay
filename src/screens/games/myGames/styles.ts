import { StyleSheet } from 'react-native';
import { COLORS, SIZES } from '@constants';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bellIcon: {
    height: 28,
    width: 28,
    tintColor: COLORS.black,
    marginRight: 8,
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
    color: COLORS.black,
    marginVertical: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: 'black',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  loginTitle: {
    fontSize: 14,
    color: 'black',
  },
  loginSubtitle: {
    fontSize: 14,
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
    color: COLORS.black,
  },
  bottomSubtitle: {
    fontSize: 12,
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
  /* ── Game Cards ── */
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    gap: 12,
  },
  gameIconBg: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.transparentPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameIconText: {
    fontSize: 22,
  },
  gameInfo: {
    flex: 1,
    gap: 3,
  },
  gameName: {
    fontSize: 15,
    fontFamily: 'bold',
    color: COLORS.secondary,
    fontWeight: "700"
  },
  gameSub: {
    fontSize: 10,
    fontFamily: 'regular',
    color: '#888',
  },
  gameRight: {
    alignItems: 'center',
  },
  gamePlayers: {
    fontSize: 15,
    fontFamily: 'bold',
    color: COLORS.secondary,
    fontWeight: "700"
  },
  gamePlayersLabel: {
    fontSize: 11,
    fontFamily: 'regular',
    color: '#999',
  },
  gameCardDivider: {
    width: 1,
    height: 46,
    backgroundColor: COLORS.transparentPrimary, // or '#E5E5E5' for neutral
    }
});