import { Fingerprint, Handshake, ShieldCheck } from "lucide-react";

const principles = [
  { icon: Fingerprint, title: "Keep private clues private", text: "Ownership evidence belongs in a private workflow, not a public listing." },
  { icon: ShieldCheck, title: "Verify before handover", text: "A possible match is a starting point. Owners should confirm details before returning an item." },
  { icon: Handshake, title: "Respect the campus community", text: "University association and safe coordination are product principles for future phases." },
];

export function TrustSection() {
  return <section className="trust-section"><div className="shell trust-layout"><div className="trust-heading"><p className="eyebrow">BUILT ON GOOD INTENTIONS</p><h2 className="section-heading">A little care goes<span> a long way.</span></h2><p className="section-description">Safety and privacy guide the product design. These are principles, not claims about features already implemented.</p></div><div className="trust-principles">{principles.map(({ icon: Icon, title, text }) => <article className="trust-principle" key={title}><span className="trust-icon"><Icon size={18} /></span><div><h3>{title}</h3><p>{text}</p></div></article>)}</div></div></section>;
}
