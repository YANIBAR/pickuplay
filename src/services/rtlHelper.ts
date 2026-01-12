// rtlHelper.ts
const rtlLanguages = ['ar', 'he', 'fa', 'ur'];

export const isRTL = (lang: string) => rtlLanguages.includes(lang);
