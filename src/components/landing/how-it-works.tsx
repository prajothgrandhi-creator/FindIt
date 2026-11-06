import Link from "next/link";
import { ArrowDownRight, ArrowRight, FilePlus2, Search, ShieldCheck } from "lucide-react";

const steps = [
  { number: "01", title: "Report it", text: "Share a few clear details about what you lost or found. Keep a distinctive clue private.", icon: FilePlus2 },
  { number: "02", title: "Discover matches", text: "Explore relevant campus listings and look for details that feel familiar.", icon: Search },
  { number: "03", title: "Reconnect", text: "Verify ownership thoughtfully and coordinate a safe handover.", icon: ShieldCheck },
];

export function HowItWorksSection() {
  return <section id="how-it-works" className="section-band">
    <div className="shell section-shell">
      <div className="section-intro"><p className="eyebrow">A SIMPLE WAY BACK</p><h2 className="section-heading">Three steps.<span> One less worry.</span></h2><p className="section-description">A clear path from “I can’t find it” to “there it is.”</p></div>
      <div className="steps-layout">
        {steps.map(({ number, title, text, icon: Icon }, index) => <article key={number} className={`step-card step-card-${index + 1}`}>
          <div className="step-card-top"><span className="step-number">{number}</span><span className="step-icon"><Icon size={19} /></span></div>
          <h3>{title}</h3><p>{text}</p><ArrowDownRight className="step-arrow" size={18} aria-hidden="true" />
        </article>)}
      </div>
      <Link href="/how-it-works" className="section-inline-link">See how the process is designed <ArrowRight size={15} /></Link>
    </div>
  </section>;
}
