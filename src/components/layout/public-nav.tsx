"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { href: "/#top", label: "Home" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#features", label: "Features" },
  { href: "/#faq", label: "FAQ" },
];

export function PublicNav() {
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const mobileMenu = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    mobileMenu.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  function closeMenu() {
    setOpen(false);
    menuButton.current?.focus();
  }

  return (
    <header className="site-nav">
      <nav aria-label="Main navigation" className="shell site-nav-inner">
        <Link href="/#top" aria-label="FindIt home" className="wordmark focus-ring">
          <span className="brand-mark-small" aria-hidden="true">F</span>
          <span>Find<span>It</span></span>
        </Link>
        <div className="site-nav-links">
          {links.map((item) => <Link key={item.href} href={item.href} className="site-nav-link">{item.label}</Link>)}
        </div>
        <div className="site-nav-actions">
          <Link href="/login" className="site-nav-login">Log in</Link>
          <Link href="/signup" className="nav-cta">Get started</Link>
        </div>
        <button
          ref={menuButton}
          type="button"
          className="mobile-menu-toggle focus-ring"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-controls="mobile-menu"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>
      {open && <nav ref={mobileMenu} id="mobile-menu" aria-label="Mobile navigation" className="mobile-menu">
        {links.map((item) => <Link onClick={closeMenu} key={item.href} href={item.href}>{item.label}</Link>)}
        <Link onClick={closeMenu} href="/login">Log in</Link>
        <Link onClick={() => setOpen(false)} href="/signup" className="nav-cta">Get started</Link>
      </nav>}
    </header>
  );
}
