import { StyleSheet } from 'react-native';
import { COLORS, SIZES } from '@constants';

export default StyleSheet.create({
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 24 },

  // Step header
  stepHeader: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  stepMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  stepCounter: { fontSize: 12, color: '#999', fontWeight: '500' },
  stepBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#f0f4ff', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  stepBadgeText: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
  progressTrack: { height: 4, backgroundColor: '#eee', borderRadius: 10, overflow: 'hidden', marginBottom: 10 },
  progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 10 },
  stepDots: { flexDirection: 'row', gap: 5, justifyContent: 'center' },
  stepDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#ddd' },
  stepDotActive: { backgroundColor: COLORS.primary, width: 18 },
  stepDotDone: { backgroundColor: COLORS.primary, opacity: 0.4 },

  // Section
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111' },

  // Form
  formGroup: { marginBottom: 16 },
  formLabel: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 6 },
  textInput: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 15,
    color: '#111',
  },
  inputError: { borderColor: '#ef4444' },
  errorText: { color: '#ef4444', fontSize: 12, marginTop: 4 },

  // Dropdown
  dropdown: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    height: SIZES.InputHeight || 48,
    justifyContent: 'center',
  },
  placeholderStyle: { color: '#9ca3af', fontSize: 14 },
  selectedTextStyle: { fontSize: 14, color: '#111' },
  iconStyle: { width: 20, height: 20 },
  inputSearchStyle: { height: 30, fontSize: 14 },

  // Date button
  dateButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: SIZES.InputHeight || 48,
  },

  // Image
  imageUploadArea: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#ccc',
    borderRadius: 12,
    paddingVertical: 24,
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fafafa',
  },
  imageUploadText: { fontSize: 14, color: '#666', fontWeight: '500' },
  imageUploadHint: { fontSize: 11, color: '#aaa' },
  imagePreviewContainer: { borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#e0e0e0' },
  logoPreview: { width: '100%', height: 120, resizeMode: 'contain', backgroundColor: '#f5f5f5' },
  bannerPreview: { width: '100%', height: 160, resizeMode: 'cover' },
  imageActions: { flexDirection: 'row' },
  imageActionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 10, backgroundColor: '#fafafa', borderTopWidth: 1, borderTopColor: '#eee' },
  removeBtn: { borderLeftWidth: 1, borderLeftColor: '#eee' },
  imageActionText: { fontSize: 13, fontWeight: '600' },

  // Visibility options
  optionGrid: { gap: 12 },
  optionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    padding: 16,
    position: 'relative',
  },
  optionCardActive: { borderColor: COLORS.primary, backgroundColor: '#f0f4ff' },
  optionIconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  optionIconWrapActive: { backgroundColor: COLORS.primary },
  optionLabel: { fontSize: 15, fontWeight: '700', color: '#222', marginBottom: 2 },
  optionLabelActive: { color: COLORS.primary },
  optionDesc: { fontSize: 12, color: '#888' },
  optionCheck: { position: 'absolute', top: 12, right: 12 },

  // Format cards
  formatCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  formatCardActive: { borderColor: COLORS.primary, backgroundColor: '#f0f4ff' },
  formatLabel: { fontSize: 14, fontWeight: '700', color: '#222', marginBottom: 2 },
  formatLabelActive: { color: COLORS.primary },
  formatDesc: { fontSize: 12, color: '#888' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#ccc', justifyContent: 'center', alignItems: 'center' },
  radioActive: { borderColor: COLORS.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },

  // Settings
  subsectionCard: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e8e8e8', padding: 16, marginBottom: 16 },
  subsectionTitle: { fontSize: 14, fontWeight: '700', color: '#333', marginBottom: 14 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  toggleLabel: { fontSize: 14, fontWeight: '600', color: '#222' },
  toggleSublabel: { fontSize: 12, color: '#888', marginTop: 1 },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 8 },

  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
    gap: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  backButtonText: { color: COLORS.primary, fontWeight: '600', fontSize: 14 },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderRadius: 10,
    minWidth: 120,
    justifyContent: 'center',
  },
  primaryButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
})
