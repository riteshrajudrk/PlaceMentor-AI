export const calculateReadiness = ({
  dsaScore = 0,
  atsScore = 0,
  mockScore = 0,
}) => {
  const finalScore =
    dsaScore * 0.4 +
    atsScore * 0.3 +
    mockScore * 0.3;

  return Math.round(finalScore);
};