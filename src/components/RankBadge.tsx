interface Props {
  rank: number;
  size?: "sm" | "md" | "lg";
}

const SIZE_CLASS = {
  sm: "w-5 h-5 text-2xs",
  md: "w-6 h-6 text-xs",
  lg: "w-8 h-8 text-sm",
};

export function RankBadge({ rank, size = "md" }: Props) {
  if (rank >= 1 && rank <= 3) {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-md font-semibold text-white shadow-sm ${SIZE_CLASS[size]} rank-${rank}`}
      >
        {rank}
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center justify-center rounded-md font-medium text-ink-500 ${SIZE_CLASS[size]} bg-ink-50`}
    >
      {rank}
    </span>
  );
}
