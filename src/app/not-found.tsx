import Link from "next/link";
export default function NotFound(){return <div className="page"><div className="card placeholder"><h1>Company not found</h1><p>The requested dummy company does not exist.</p><div style={{marginTop:20}}><Link href="/companies" className="button primary">Back to companies</Link></div></div></div>}
