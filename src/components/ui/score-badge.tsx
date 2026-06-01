import { Badge } from "@/components/ui/badge";
import { cn } from "@/shared/utils";

type ScoreBadgeProps = {
  score: number;
  className?: string;
};

export function ScoreBadge({ score, className }: ScoreBadgeProps) {
  const getScoreVariant = () => {
    if (score >= 8) return "bg-score-high";
    if (score >= 5) return "bg-score-medium";
    return "bg-score-low";
  };

  return (
    <Badge className={cn("text-primary-foreground font-bold border-none", getScoreVariant(), className)}>
      {score.toFixed(1)}/10
    </Badge>
  );
}
