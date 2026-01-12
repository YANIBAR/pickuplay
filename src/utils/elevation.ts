export const elevation = (n: number) => {
  return {
    elevation: n,
    shadowColor: '#CCCCCC',
    shadowOffset: { width: 0, height: n / 2 },
    shadowOpacity: 0.3,
    shadowRadius: n / 2,
  };
};
