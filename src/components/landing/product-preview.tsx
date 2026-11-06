import { ArrowUpRight, BookOpen, Headphones, MapPin, Search } from "lucide-react";

const sampleItems = [
  { name: "Over-ear headphones", category: "Electronics", location: "Library commons", date: "This morning", status: "Found", icon: Headphones, art: "preview-thumb-headphones" },
  { name: "Red canvas notebook", category: "Books & notes", location: "Lecture hall", date: "Yesterday", status: "Lost", icon: BookOpen, art: "preview-thumb-notebook" },
];

export function ProductPreviewSection() {
  return <section className="section-band preview-section">
    <div className="shell preview-layout">
      <div className="preview-copy"><p className="eyebrow">A FIRST LOOK</p><h2 className="section-heading">Find the detail<br /><span>that feels familiar.</span></h2><p className="section-description">A glimpse of how campus listings could help you narrow down what you’re looking for.</p><div className="preview-label"><span className="preview-label-dot" /> Sample listings · not live reports</div></div>
      <div className="sample-browser" aria-label="Illustrative item discovery preview. Sample content only.">
        <div className="sample-browser-head"><div><span className="preview-sample-label">FINDIT PREVIEW</span><h3>Recently shared</h3></div><div className="sample-search"><Search size={15} /><span>Search by item</span></div></div>
        <div className="sample-listings">{sampleItems.map(({ name, category, location, date, status, icon: Icon, art }) => <article className="sample-item" key={name}>
          <div className={`sample-item-art ${art}`} aria-hidden="true"><Icon size={26} strokeWidth={1.5} /></div>
          <div className="sample-item-main"><div className="sample-item-title"><h4>{name}</h4><span className={`preview-status ${status === "Found" ? "preview-status-found" : "preview-status-lost"}`}>{status}</span></div><div className="sample-item-meta"><span>{category}</span><span><MapPin size={12} />{location}</span></div><span className="sample-item-date">{date} · illustrative</span></div>
          <ArrowUpRight className="sample-item-arrow" size={17} aria-hidden="true" />
        </article>)}</div>
        <p className="sample-disclaimer">Illustrative sample data for the product preview. No live reports are connected in this phase.</p>
      </div>
    </div>
  </section>;
}
