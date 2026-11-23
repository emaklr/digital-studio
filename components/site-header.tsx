import Link from "next/link";
const navItems = [{href:"/services",label:"Services"},{href:"/work",label:"Our work"},{href:"/about",label:"About"}];
export default function SiteHeader() {
  return <header className="site-header"><div className="shell nav-wrap">
    <Link href="/" className="brand" aria-label="Abeeb Digital Studio home"><span className="brand-mark">A<span>.</span></span><span className="brand-name">abeeb<span>digital studio</span></span></Link>
    <nav className="desktop-nav" aria-label="Main navigation">{navItems.map(item=><Link href={item.href} key={item.href}>{item.label}</Link>)}</nav>
    <Link href="/book" className="button button-small button-light nav-cta">Start a project <span aria-hidden="true">↗</span></Link>
    <details className="mobile-nav"><summary aria-label="Open navigation"><span></span><span></span></summary><div className="mobile-nav-panel">{navItems.map(item=><Link href={item.href} key={item.href}>{item.label}</Link>)}<Link href="/custom-project">Custom project</Link><Link href="/book">Book a service ↗</Link></div></details>
  </div></header>;
}