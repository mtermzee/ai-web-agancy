import { ReviewQueue } from "@/components/leads/ReviewQueue";

export default function LeadsPage() {
  return <div className="page"><div className="page-header"><div><div className="eyebrow">Human review</div><h1>Lead review queue</h1><p className="page-subtitle">Prioritize promising companies before future outreach automation.</p></div></div><ReviewQueue/></div>;
}
