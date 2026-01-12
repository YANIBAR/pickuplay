// lib/theme.ts

import { COLORS } from "@constants";

// Theme roles and spacing used consistently across the app.
const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const RADII = {
  sm: 6,
  md: 12,
  lg: 16,
};

const COLOR = {
  // Primary brand
  primary: COLORS.primary, // blue-500
  onPrimary: '#FFFFFF',

  // Surfaces
  background: '#F7F9FC',
  surface: '#FFFFFF',
  surfaceVariant: '#F1F5F9',
  outline: '#E6E9EE',

  // Feedback
  success: '#10B981',
  error: '#EF4444',

  // Text
  text: '#0F172A',
  textSecondary: '#475569',
};

const TYPOGRAPHY = {
  titleLarge: 20,
  titleMedium: 18,
  body: 16,
  label: 14,
};

export default {
  spacing: SPACING,
  radii: RADII,
  colors: COLOR,
  typography: TYPOGRAPHY,
};