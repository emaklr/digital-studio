import Link from "next/link";
export default function SiteFooter() {
 return <footer className="site-footer"><div className="shell">
  <div className="footer-top"><div><Link href="/" className="brand footer-brand"><span className="brand-mark">A<span>.</span></span><span className="brand-name">abeeb<span>digital studio</span></span></Link><p className="footer-note">Thoughtful digital work for businesses ready to move forward.</p></div>
  <div className="footer-links"><div><span className="eyebrow">Explore</span><Link href="/services">Services</Link><Link href="/work">Our work</Link><Link href="/about">About us</Link></div><div><span className="eyebrow">Start here</span><Link href="/book">Book a service</Link><Link href="/custom-project">Custom solution</Link><Link href="/contact">Contact</Link></div></div></div>
  <div className="footer-bottom"><span>© {new Date().getFullYear()} Abeeb Digital Studio. All rights reserved.</span><span>Built with intent. Made for impact.</span></div>
 </div></footer>;
}