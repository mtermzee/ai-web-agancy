import type { WebsiteScores } from "@/types/company";
export function AuditScores({ scores }: { scores: WebsiteScores }) {
  const items = [["Overall",scores.overall],["Design",scores.design],["Mobile",scores.mobile],["SEO",scores.seo],["Performance",scores.performance],["Conversion",scores.conversion]] as const;
  return <div className="audit-grid">{items.map(([label,score])=><div className="audit-card" key={label}><div className="audit-score"><span>{label}</span><strong>{score}</strong></div><div className="audit-track"><div className="audit-fill" style={{width:`${score}%`}}/></div></div>)}</div>;
}
