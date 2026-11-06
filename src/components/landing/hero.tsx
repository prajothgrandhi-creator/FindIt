import Link from "next/link";
import { ArrowRight, BookOpen, Headphones, Search, Sparkles } from "lucide-react";

function PreviewListing({ kind }: { kind: "headphones" | "notebook" }) {
  const isHeadphones = kind === "headphones";
  return <article className={`preview-listing ${isHeadphones ? "preview-listing-front" : "preview-listing-back"}`}>
    <div className={`preview-art ${isHeadphones ? "preview-art-headphones" : "preview-art-notebook"}`} aria-hidden="true">
      {isHeadphones ? <Headphones size={43} strokeWidth={1.35} /> : <BookOpen size={43} strokeWidth={1.35} />}
      <span className="preview-art-shine" />
    </div>
    <div className="preview-listing-info">
      <div><span className="preview-sample-label">SAMPLE LISTING</span><h3>{isHeadphones ? "Over-ear headphones" : "Red canvas notebook"}</h3></div>
      <span className={`preview-status ${isHeadphones ? "preview-status-found" : "preview-status-lost"}`}>{isHeadphones ? "Found" : "Lost"}</span>
      <p>{isHeadphones ? "Library commons · This morning" : "Lecture hall · Yesterday"}</p>
    </div>
  </article>;
}

export function LandingHero() {
  return <section id="top" className="hero-glow relative overflow-hidden">
    <div className="shell hero-layout">
      <div className="hero-copy">
        <p className="eyebrow">CAMPUS LOST &amp; FOUND</p>
        <h1 className="page-heading hero-heading">Lost something?<span>Let’s bring it home.</span></h1>
        <p className="hero-description">From misplaced essentials to unexpected discoveries, FindIt helps your campus community reconnect people with the things that matter.</p>
        <div className="hero-actions">
          <Link href="/signup" className="landing-action landing-action-primary">Get started <ArrowRight size={16} /></Link>
          <Link href="/#how-it-works" className="landing-action landing-action-secondary">Explore how it works</Link>
        </div>
        <p className="hero-note"><span className="hero-note-mark" aria-hidden="true"><Sparkles size={13} /></span>A more thoughtful way to find what’s missing.</p>
      </div>
      <div className="hero-product" aria-label="Illustrative FindIt product preview with sample listings">
        <div className="hero-product-orbit hero-product-orbit-outer" />
        <div className="hero-product-orbit hero-product-orbit-inner" />
        <div className="hero-product-center"><span className="brand-mark">F</span></div>
        <PreviewListing kind="headphones" />
        <PreviewListing kind="notebook" />
        <div className="match-indicator"><span className="match-indicator-icon"><Sparkles size={14} /></span><span><b>Possible match</b><small>Sample interaction</small></span></div>
        <div className="hero-preview-label"><Search size={13} /> Product preview · sample content</div>
      </div>
    </div>
  </section>;
}
