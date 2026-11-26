import Link from "next/link";
import Brand from "@/components/brand";

const navItems = [
  {href:"/services",label:"Services"},
  {href:"/work",label:"Work"},
  {href:"/about",label:"About"},
  {href:"/contact",label:"Contact"},
];

export default function SiteHeader() {
  return <header className="site-header">
    <div className="shell nav-wrap">
      <Brand/>
      <nav className="desktop-nav" aria-label="Main navigation">
        <Link href="/" className="nav-home">Home</Link>
        {navItems.map((item)=><Link href={item.href} key={item.href}>{item.label}</Link>)}
      </nav>
      <Link href="/book" className="button button-small button-primary nav-cta">Start a Project</Link>
      <details className="mobile-nav">
        <summary aria-label="Open navigation"><span/><span/></summary>
        <div className="mobile-nav-panel">
          <Link href="/">Home</Link>
          {navItems.map((item)=><Link href={item.href} key={item.href}>{item.label}</Link>)}
          <Link href="/custom-project">Custom Project</Link>
          <Link href="/book">Start a Project</Link>
        </div>
      </details>
    </div>
  </header>;
}
