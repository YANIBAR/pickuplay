import { StyleSheet } from 'react-native';
import { COLORS, SIZES } from '@constants';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
  },
  iconBtn: {
    marginHorizontal: 8
  },
  logoContainer: {
    marginBottom: 12,
  },
  whistleIcon: {
    width: 180,
    height: 180
  },
  logo: {
    width: 400,
    height: 270,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1FAC9B',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  illustrationContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  emptyStateIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e8f5f2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 60,
  },
  description: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#1FAC9B',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#1FAC9B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1FAC9B',
  },
  secondaryButtonText: {
    color: '#1FAC9B',
    fontSize: 16,
    fontWeight: '600',
  },
  joinSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  joinTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  joinDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  joinButtonContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  joinButton: {
    flex: 1,
    backgroundColor: '#1FAC9B',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#1FAC9B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  featuresContainer: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    alignItems: 'flex-start',
    gap: 12,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureEmoji: {
    fontSize: 24,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 13,
    color: '#888',
    lineHeight: 18,
  },
  competitionList: {
    gap: 16,
  },

  competitionCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 4,
  },

  competitionImage: {
    width: 110,
    height: 110,
    borderRadius: 16,
    backgroundColor: '#ddd',
  },

  competitionInfo: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'space-between',
  },

  competitionName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
  },

  competitionSport: {
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 2,
  },

  competitionLocation: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },

  competitionPlayers: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
    marginBottom: 12,
  },

  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },



  matchupButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
  },

  matchupButtonText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  mvpBadge: {
    alignSelf: 'flex-start',
    marginTop: 12,
    backgroundColor: '#E8FFFA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  mvpBadgeText: {
    color: '#19C2A0',
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.5,
  }
})
