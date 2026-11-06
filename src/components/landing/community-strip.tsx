import { Fingerprint, MapPin, ShieldCheck } from "lucide-react";

const principles = [
  { icon: MapPin, title: "Made for campus", text: "A shared place to start looking." },
  { icon: Fingerprint, title: "Privacy by design", text: "Personal details deserve care." },
  { icon: ShieldCheck, title: "Trust comes first", text: "Verify before a handover." },
];

export function CommunityStrip() {
  return <section aria-label="FindIt principles" className="shell community-strip">
    {principles.map(({ icon: Icon, title, text }) => <div className="community-principle" key={title}><span className="community-icon"><Icon size={17} /></span><span><b>{title}</b><small>{text}</small></span></div>)}
  </section>;
}
