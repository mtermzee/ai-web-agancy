import { OutreachWorkspace } from "@/components/outreach/OutreachWorkspace";

export default async function OutreachPage({ searchParams }: { searchParams: Promise<{ company?: string }> }) {
  const { company } = await searchParams;
  return <div className="page">
    <div className="page-header"><div><div className="eyebrow">Human-in-the-loop</div><h1>Outreach drafts</h1><p className="page-subtitle">Prepare, edit and approve personalized drafts. No message is sent in this MVP.</p></div></div>
    <OutreachWorkspace initialCompanyId={company}/>
  </div>;
}
