import { MockupGallery } from "@/components/mockups/MockupGallery";

export default function MockupsPage() {
  return <div className="page"><div className="page-header"><div><div className="eyebrow">Generated concepts</div><h1>Mockups</h1><p className="page-subtitle">All website concepts marked as generated in the local MVP state.</p></div></div><MockupGallery/></div>;
}
