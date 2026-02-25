export const calculateReadinessScore = (dsa, ats, mock) => {
  const score = (dsa * 0.4) + (ats * 0.3) + (mock * 0.3);
  return Number(score.toFixed(2));
};

export const calculateDsaScore = (easy, medium, hard) => {
  const raw = easy * 1 + medium * 3 + hard * 6;
  return Math.min(100, Math.floor((raw / 800) * 100));
};