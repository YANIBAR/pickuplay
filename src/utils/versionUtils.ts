export const compareVersions = (
  currentVersion: string,
  targetVersion: string,
): number => {
  const current = currentVersion.split('.').map(Number);
  const target = targetVersion.split('.').map(Number);

  const length = Math.max(current.length, target.length);

  for (let i = 0; i < length; i++) {
    const currentPart = current[i] || 0;
    const targetPart = target[i] || 0;

    if (currentPart < targetPart) return -1;
    if (currentPart > targetPart) return 1;
  }

  return 0;
};