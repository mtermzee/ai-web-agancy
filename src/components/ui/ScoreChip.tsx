import { scoreTone } from "@/lib/companies";
export function ScoreChip({ score }: { score: number }) { return <span className={`score-chip ${scoreTone(score)}`}>{score}</span>; }
