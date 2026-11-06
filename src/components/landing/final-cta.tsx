import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function FinalCta() {
  return <section className="shell final-cta"><div className="final-cta-inner"><p className="eyebrow">SOMETHING GOOD STARTS HERE</p><h2>Your next discovery could be someone’s <span>missing essential.</span></h2><p>Join the campus community to publish and browse live lost-and-found reports.</p><div className="final-cta-actions"><Link href="/signup" className="landing-action landing-action-primary">Get started <ArrowRight size={16} /></Link><Link href="/#how-it-works" className="landing-action landing-action-secondary">Explore how it works</Link></div></div></section>;
}
