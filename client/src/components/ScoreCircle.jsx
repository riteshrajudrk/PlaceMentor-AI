import { useEffect, useState } from "react";

export default function ScoreCircle({ score = 0, label = "Score" }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const progressOffset = circumference - (score / 100) * circumference;
    setOffset(progressOffset);
  }, [score]);

  const getColor = () => {
    if (score >= 75) return "#10B981";
    if (score >= 50) return "#F59E0B";
    return "#EF4444";
  };

  return (
    <div className="score-circle">
      <svg width="180" height="180">
        <circle
          className="bg-circle"
          cx="90"
          cy="90"
          r={radius}
        />
        <circle
          className="progress-circle"
          cx="90"
          cy="90"
          r={radius}
          stroke={getColor()}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold" style={{ color: getColor() }}>
          {score?.toFixed(1)}
        </span>
        <span className="text-sm text-gray-400 mt-1">{label}</span>
      </div>
    </div>
  );
}