import Link from "next/link";

const productLinks = [
  { href: "/#top", label: "Home" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#features", label: "Features" },
  { href: "/#faq", label: "FAQ" },
];

export function PublicFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div className="footer-brand">
          <Link href="/#top" className="footer-wordmark">Find<span>It</span></Link>
          <p>Lost something? Bring it home.</p>
          <small>A campus community, a little more connected.</small>
        </div>
        <div>
          <h2>Explore</h2>
          <nav aria-label="Product links" className="footer-links">
            {productLinks.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
          </nav>
        </div>
        <div>
          <h2>More</h2>
          <nav aria-label="Help and policies" className="footer-links">
            <Link href="/help">Help center</Link>
            <Link href="/safety">Safety</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms <span className="footer-draft">Draft</span></Link>
          </nav>
        </div>
      </div>
      <div className="shell footer-bottom"><span>© 2026 FindIt</span><span>Designed for campus communities.</span></div>
    </footer>
  );
}
