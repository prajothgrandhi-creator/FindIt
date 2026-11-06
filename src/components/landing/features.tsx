import { Bell, CheckCheck, Compass, Layers3, Search, Sparkles } from "lucide-react";

const features = [
  { icon: Layers3, title: "Lost & found reports", text: "A structured way to share what went missing or turned up." },
  { icon: Search, title: "Useful search", text: "Browse by category and the details you remember." },
  { icon: Sparkles, title: "Intelligent matching", text: "Surface possible matches using relevant item details." },
  { icon: CheckCheck, title: "Private ownership claims", text: "Keep distinguishing evidence out of public listings." },
  { icon: Compass, title: "Campus-focused listings", text: "Give reports helpful context without oversharing location." },
  { icon: Bell, title: "Helpful updates", text: "Know when a report or claim needs your attention." },
];

export function FeaturesSection() {
  return <section id="features" className="shell features-section">
    <div className="section-intro section-intro-row"><div><p className="eyebrow">DESIGNED FOR THE WAY CAMPUS WORKS</p><h2 className="section-heading">Useful by design.<span> Human at heart.</span></h2></div><p className="section-description">These are product capabilities planned for later phases. This landing-page phase does not yet accept reports or provide matching.</p></div>
    <div className="feature-grid">{features.map(({ icon: Icon, title, text }) => <article className="feature-card" key={title}><span className="feature-icon"><Icon size={19} /></span><span className="planned-pill">Planned</span><h3>{title}</h3><p>{text}</p></article>)}</div>
  </section>;
}
