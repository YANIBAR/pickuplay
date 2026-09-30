import { Platform, StyleSheet } from 'react-native';
import { COLORS, images, SIZES } from '@constants';

const BANNER_H = 220;
const LOGO_SIZE = 88;
const LOGO_BORDER = 4;

export default StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  // Banner
  bannerWrap: {
    height: BANNER_H,
    position: 'relative',
  },
  banner: {
    width: '100%',
    height: BANNER_H,
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 52 : 36,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 52 : 36,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoRing: {
    position: 'absolute',
    bottom: -(LOGO_SIZE / 2),
    alignSelf: 'center',
    width: LOGO_SIZE + LOGO_BORDER * 2,
    height: LOGO_SIZE + LOGO_BORDER * 2,
    borderRadius: (LOGO_SIZE + LOGO_BORDER * 2) / 2,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_SIZE / 2,
  },

  // Hero
  heroSection: {
    marginTop: LOGO_SIZE / 2 + 12,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  // CTA Row
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 16,
  },
// Register CTA
  registerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    paddingHorizontal: 28,
    borderRadius: 99,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  // Requests CTA
  requestsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    paddingHorizontal: 28,
    borderRadius: 99,
    backgroundColor: COLORS.third,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  registerBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
  },
  comName: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Body
  body: {
    paddingHorizontal: 16,
    marginTop: 20,
  },

  // Description
  descBlock: {
    backgroundColor: COLORS.grayscale100,
    borderRadius: 12,
    padding: 14,
    marginBottom: 4,
  },
  descText: {
    fontSize: 14,
    color: COLORS.gray3,
    lineHeight: 21,
  },

  // Info cards (grid)
  cardGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  infoCard: {
    flex: 1,
    backgroundColor: COLORS.grayscale100,
    borderRadius: 12,
    padding: 14,
    gap: 4,
  },
  infoCardAccent: {
    backgroundColor: COLORS.primary,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoCardLabel: {
    fontSize: 11,
    color: COLORS.gray3,
    fontWeight: '500',
  },
  infoCardLabelAccent: {
    color: 'rgba(255,255,255,0.75)',
  },
  infoCardValue: {
    fontSize: 15,
    fontWeight: '300',
    color: COLORS.black,
  },
  infoCardValueAccent: {
    color: COLORS.white,
  },

  // Section header
  sectionHeader: {
    marginTop: 24,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.black,
  },

  // Generic card
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.grayscale200 ?? '#EBEBEB',
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.grayscale100,
    marginHorizontal: 16,
  },

  // Registration rows
  regRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  regLabel: {
    fontSize: 14,
    color: COLORS.gray3,
  },
  regValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
  },

  // Format
  formatGrid: {
    gap: 8,
  },
  formatOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.grayscale200 ?? '#EBEBEB',
    backgroundColor: COLORS.white,
  },
  formatOptionActive: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}08`,
  },
  formatLabel: {
    flex: 1,
    fontSize: 14,
    color: COLORS.gray3,
    fontWeight: '500',
  },
  formatLabelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  formatBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  formatBadgeText: {
    fontSize: 11,
    color: COLORS.white,
    fontWeight: '700',
  },

  // ── Teams accordion ──
  accordionItem: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.grayscale200 ?? '#EBEBEB',
    backgroundColor: COLORS.white,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
  },
    accordionBody: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayscale100,
    paddingTop: 10,
  },
  accordionPlayersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 12,
    rowGap: 10,
  },
  accordionMoreText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: 2,
  },
  accordionEmptyText: {
    fontSize: 13,
    color: COLORS.gray3,
    fontStyle: 'italic',
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '47%',
  },
  playerAvatar: {
    experimental_backgroundImage: images.avatar,
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  playerInfo: {
    flex: 1,
    gap: 1,
  },
  playerName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.black,
  },
  playerPosition: {
    fontSize: 11,
    color: COLORS.gray3,
  },

  // ── Registration Modal ──
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalBackdropTouch: {
    flex: 1,
  },
  modalSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    maxHeight: '85%',
  },
  modalHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.grayscale300,
    marginTop: 10,
    marginBottom: 6,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  modalHeaderBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.black,
  },
  modalBody: {
    paddingTop: 8,
    gap: 12,
  },
  modalSubtitle: {
    fontSize: 14,
    color: COLORS.gray3,
    marginBottom: 6,
    lineHeight: 20,
  },

  // Register option cards (choose step)
  registerOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.grayscale200 ?? '#EBEBEB',
    backgroundColor: COLORS.white,
  },
  registerOptionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${COLORS.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerOptionText: {
    flex: 1,
    gap: 3,
  },
  registerOptionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.black,
  },
  registerOptionDesc: {
    fontSize: 12,
    color: COLORS.gray3,
    lineHeight: 16,
  },

  // Team rows (shared: my teams + com teams)
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.grayscale200 ?? '#EBEBEB',
    backgroundColor: COLORS.white,
  },
  teamRowSelected: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}08`,
  },
  teamRowDisabled: {
    opacity: 0.5,
    backgroundColor: COLORS.grayscale100,
  },
  teamRowLogo: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  teamRowLogoDisabled: {
    opacity: 0.6,
  },
  teamRowInfo: {
    flex: 1,
    gap: 2,
  },
  teamRowName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.black,
  },
  teamRowNameDisabled: {
    color: COLORS.gray3,
  },
  teamRowMeta: {
    fontSize: 12,
    color: COLORS.gray3,
  },
  fullBadge: {
    backgroundColor: COLORS.grayscale300,
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  fullBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.gray3,
  },
  randomTeamRow: {
    borderStyle: 'dashed',
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}08`,
  },
  randomTeamIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${COLORS.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.grayscale300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },

  createTeamLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  createTeamLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },

  // Inputs
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.grayscale200 ?? '#EBEBEB',
    backgroundColor: COLORS.white,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: COLORS.black,
    padding: 0,
  },
  textAreaWrap: {
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.grayscale200 ?? '#EBEBEB',
    backgroundColor: COLORS.white,
    padding: 12,
  },
  textArea: {
    fontSize: 14,
    color: COLORS.black,
    minHeight: 100,
    padding: 0,
  },

  // Player request form (phone / level / comment / fee)
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 8,
  },
  levelRow: {
    flexDirection: 'row',
    gap: 8,
  },
  levelChip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 99,
    borderWidth: 1.5,
    borderColor: COLORS.grayscale200 ?? '#EBEBEB',
    backgroundColor: COLORS.white,
  },
  levelChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  levelChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray3,
  },
  levelChipTextActive: {
    color: COLORS.white,
  },
  feeCard: {
    marginTop: 14,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}08`,
    gap: 6,
  },
  feeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  feeCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.black,
  },
  feeCardText: {
    fontSize: 13,
    color: COLORS.gray3,
    lineHeight: 19,
  },

  // Primary button (shared across modal steps)
  primaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    marginTop: 6,
  },
  primaryBtnDisabled: {
    opacity: 0.4,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
  },

  // Success step
  successIconWrap: {
    alignItems: 'center',
    marginTop: 8,
  },
  successText: {
    fontSize: 15,
    color: COLORS.black,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 8,
  },
  fall: { 
    backgroundColor: '#E07B39' 
  },
  spring: { 
    backgroundColor: '#4CAF50' 
  },
  summer: { 
    backgroundColor: '#F9A825' 
  },
  winter: { 
    backgroundColor: '#42A5F5' 
  },
  // Toggle rows
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  toggleIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.grayscale100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleIconWrapActive: {
    backgroundColor: `${COLORS.primary}18`,
  },
  toggleText: {
    flex: 1,
    gap: 2,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
  },
  toggleDescription: {
    fontSize: 12,
    color: COLORS.gray3,
  },

  bottomPad: {
    height: 40,
  },

})
