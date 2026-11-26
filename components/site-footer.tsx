import Link from "next/link";
import Brand from "@/components/brand";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell">
        <div className="footer-top">
          <div className="footer-brand-block">
            <Brand />
            <p className="footer-note">Websites, web applications and digital systems built to help businesses move forward.</p>
          </div>
          <div className="footer-links">
            <div>
              <span className="eyebrow">Explore</span>
              <Link href="/services">Services</Link>
              <Link href="/work">Our work</Link>
              <Link href="/about">About the studio</Link>
            </div>
            <div>
              <span className="eyebrow">Start here</span>
              <Link href="/book">Book a service</Link>
              <Link href="/custom-project">Custom project</Link>
              <Link href="/contact">Contact</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Abeeb Digital Studio. All rights reserved.</span>
          <span>Built with intent. Made for impact.</span>
        </div>
      </div>
    </footer>
  );
}
