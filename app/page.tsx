import Link from "next/link";
import {formatPrice, services} from "@/lib/services";

const serviceHighlights = [
  {
    number: "01",
    icon: "◉",
    tone: "blue",
    title: "Business websites",
    description: "Professional, mobile-ready sites that make it easy for customers to understand your offer and enquire.",
    href: "/services/websites",
  },
  {
    number: "02",
    icon: "▣",
    tone: "green",
    title: "E-commerce",
    description: "Product catalogues, shopping carts and checkout experiences built to help you sell online.",
    href: "/services/ecommerce",
  },
  {
    number: "03",
    icon: "▤",
    tone: "violet",
    title: "Web apps & portals",
    description: "Custom dashboards, portals and workflow tools shaped around how your business operates.",
    href: "/services/web-applications",
  },
  {
    number: "04",
    icon: "⚙",
    tone: "orange",
    title: "Repairs & integrations",
    description: "Bug fixes, API connections, automation and useful AI integrations for the systems you rely on.",
    href: "/custom-project",
  },
];

const strengths = [
  {icon: "✦", title: "Modern design"},
  {icon: "▯", title: "Mobile responsive"},
  {icon: "◇", title: "Secure & reliable"},
  {icon: "↗", title: "Built for growth"},
];

const studioProducts = [
  {
    name: "FixTrust",
    type: "Marketplace · Proptech",
    description: "A more transparent way to find artisans and manage building projects.",
    className: "fixtrust-preview",
    label: "FIXTRUST",
    status: "In development",
  },
  {
    name: "Ritewheel Autos",
    type: "Digital commerce · Automotive",
    description: "A clearer digital car-shopping experience for discovering vehicles.",
    className: "ritewheel-preview",
    label: "RITEWHEEL",
    status: "In development",
  },
];

const websiteService = services.find((service) => service.slug === "websites");
const websitePackages = websiteService?.packages ?? [];

export default function HomePage() {
  return (
    <div className="home-page">
      <section className="hero hero-reimagined">
        <div className="hero-grid shell">
          <div className="hero-copy">
            <div className="hero-kicker">
              <span className="status-pulse" />
              Independent digital solutions studio
            </div>
            <h1>
              Your next website <span className="hero-blue">should do more.</span>
            </h1>
            <p className="hero-lede">
              We build fast, mobile-friendly websites and digital tools that help customers
              understand your offer, trust your business and take the next step.
            </p>
            <div className="hero-actions">
              <Link className="button button-primary" href="/book">
                Start a project <span aria-hidden="true">↗</span>
              </Link>
              <Link className="button button-quiet" href="/services">
                Explore our services <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div className="strength-grid" aria-label="What you can expect">
              {strengths.map((strength) => (
                <div className="strength-item" key={strength.title}>
                  <span aria-hidden="true">{strength.icon}</span>
                  <small>{strength.title}</small>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-visual" aria-label="Responsive website and business dashboard preview">
            <div className="visual-halo" />
            <div className="desktop-device">
              <div className="desktop-screen">
                <div className="browser-bar">
                  <span className="browser-dots"><i /><i /><i /></span>
                  <span className="browser-address">abeebdigital.studio</span>
                  <span className="browser-menu">•••</span>
                </div>
                <div className="mock-site">
                  <div className="mock-site-nav">
                    <span className="mock-brand">AB<span>.</span></span>
                    <div><i /> <i /> <i /> <i /></div>
                    <b>Let&apos;s talk <span>↗</span></b>
                  </div>
                  <div className="mock-site-hero">
                    <div className="mock-site-copy">
                      <small>MAKE YOUR NEXT MOVE</small>
                      <strong>Build your<br />vision.</strong>
                      <p>Digital experiences for a smarter tomorrow.</p>
                      <span>Get started <b>↗</b></span>
                    </div>
                    <div className="building-scene" aria-hidden="true">
                      <div className="building-sky" />
                      <div className="building-main"><i /><i /><i /><i /><i /><i /></div>
                      <div className="building-wing"><i /><i /><i /><i /></div>
                      <div className="building-ground" />
                    </div>
                  </div>
                  <div className="mock-service-row">
                    <span><b>✦</b> Design</span>
                    <span><b>▤</b> Development</span>
                    <span><b>⌘</b> Integration</span>
                    <span><b>↗</b> Growth</span>
                  </div>
                </div>
              </div>
              <div className="desktop-lower"><span /></div>
              <div className="desktop-foot" />
            </div>

            <div className="analytics-card">
              <div className="analytics-heading"><span>Revenue overview</span><small>Monthly⌄</small></div>
              <svg viewBox="0 0 240 82" role="img" aria-label="Illustrative upward-trending analytics chart">
                <path className="chart-gridline" d="M0 18H240 M0 43H240 M0 68H240" />
                <path className="chart-fill" d="M4 67 L30 53 L54 58 L79 39 L103 45 L129 27 L154 34 L180 17 L205 24 L236 5 L236 80 L4 80Z" />
                <path className="chart-line" d="M4 67 L30 53 L54 58 L79 39 L103 45 L129 27 L154 34 L180 17 L205 24 L236 5" />
              </svg>
              <div className="analytics-metrics">
                <div><small>Total leads</small><b>842</b></div>
                <div><small>Conversion</small><b>12.5%</b></div>
                <div><small>Growth</small><b>+24%</b></div>
              </div>
            </div>

            <div className="phone-device">
              <div className="phone-frame">
                <div className="phone-speaker" />
                <div className="phone-screen">
                  <div className="phone-nav"><b>AB<span>.</span></b><i>☰</i></div>
                  <div className="phone-hero-copy">
                    <small>QUALITY SOLUTIONS</small>
                    <strong>Make your<br />business move.</strong>
                    <p>Websites and digital tools that work.</p>
                    <span>Get a quote ↗</span>
                  </div>
                  <div className="phone-image"><i /><i /><i /></div>
                  <div className="phone-bottom"><b /><b /><b /></div>
                </div>
              </div>
            </div>
            <span className="visual-caption">ONE EXPERIENCE. EVERY SCREEN.</span>
          </div>
        </div>
        <div className="hero-bottom shell">
          <span>WEBSITES · WEB APPLICATIONS · DIGITAL SYSTEMS</span>
          <span>BUILT AROUND YOUR BUSINESS <b>↓</b></span>
        </div>
      </section>

      <section className="services-section section">
        <div className="shell">
          <div className="section-heading-row">
            <div className="section-heading">
              <span className="eyebrow"><span className="eyebrow-dot" /> What we do</span>
              <h2>Practical digital solutions.<br /><span>Built for business.</span></h2>
            </div>
            <p className="section-intro">
              From your first website to the systems behind your operations, we build the tools
              that help your business move forward.
            </p>
          </div>
          <div className="showcase-services">
            {serviceHighlights.map((service) => (
              <Link className="showcase-service" href={service.href} key={service.number}>
                <div className="showcase-service-top">
                  <span className={"service-icon tone-" + service.tone} aria-hidden="true">{service.icon}</span>
                  <span className="service-index">{service.number}</span>
                </div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <span className="service-go" aria-hidden="true">↗</span>
              </Link>
            ))}
          </div>
          <div className="services-foot">
            <span>Need something more specific?</span>
            <Link href="/custom-project">Tell us what you need <b>→</b></Link>
          </div>
        </div>
      </section>

      <section className="website-pricing-section section">
        <div className="shell">
          <div className="pricing-heading">
            <div className="section-heading">
              <span className="eyebrow"><span className="eyebrow-dot" /> Website packages</span>
              <h2>A clear place to <span>start.</span></h2>
            </div>
            <p>Thoughtful design, reliable development and launch support. Choose a starting point and we&apos;ll shape the details around your business.</p>
          </div>
          <div className="home-package-grid">
            {websitePackages.map((item, index) => (
              <article className={index === 1 ? "home-package featured-package" : "home-package"} key={item.name}>
                <div className="package-topline">
                  <span>{index === 0 ? "01 / STARTER" : index === 1 ? "02 / GROWTH" : "03 / PREMIUM"}</span>
                  {index === 1 && <span className="package-popular">MOST CHOSEN</span>}
                </div>
                <h3>{index === 0 ? "Starter" : index === 1 ? "Growth" : "Premium"}</h3>
                <p className="package-summary">{item.summary}</p>
                <div className="package-price">{formatPrice(item.price)}<span>+</span></div>
                <small className="package-price-note">Starting price · USD</small>
                <ul>
                  {item.features.slice(0, 3).map((feature) => (
                    <li key={feature}><span aria-hidden="true">✓</span>{feature}</li>
                  ))}
                </ul>
                <Link className={index === 1 ? "button button-primary button-full" : "button button-package button-full"} href="/services/websites">
                  Explore package <span aria-hidden="true">↗</span>
                </Link>
              </article>
            ))}
          </div>
          <p className="pricing-footnote">
            Prices are starting points, not fixed quotes. Every package includes deployment and handover.
            A 50% deposit starts a fixed-scope project; the balance is due before final handover.
          </p>
        </div>
      </section>

      <section className="custom-strip-section">
        <div className="shell">
          <Link className="custom-strip" href="/custom-project">
            <span className="custom-strip-icon" aria-hidden="true">{"</>"}</span>
            <span className="custom-strip-copy">
              <small>FOR BIGGER IDEAS</small>
              <strong>Custom portals, e-commerce, APIs and larger projects.</strong>
              <em>Tell us what you&apos;re building. We&apos;ll scope it together.</em>
            </span>
            <span className="custom-strip-arrow" aria-hidden="true">↗</span>
          </Link>
          <Link className="partner-strip" href="/contact">
            <span className="partner-icon" aria-hidden="true">♟</span>
            <span><strong>Agency partnerships available</strong><small>White-label development support for marketing, branding and SEO agencies.</small></span>
            <span className="partner-arrow" aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <section className="studio-work-section section">
        <div className="shell">
          <div className="section-heading-row">
            <div className="section-heading">
              <span className="eyebrow"><span className="eyebrow-dot" /> Built in the studio</span>
              <h2>Ideas we&apos;re <span>bringing to life.</span></h2>
            </div>
            <Link className="underlined-link" href="/work">See our studio work <span>↗</span></Link>
          </div>
          <div className="studio-products-grid">
            {studioProducts.map((product) => (
              <Link className="studio-product" href="/work" key={product.name}>
                <div className={"product-art " + product.className}>
                  <span className="product-art-label">{product.label} / STUDIO PROJECT</span>
                  <div className="product-art-screen">
                    <span>{product.name}</span>
                    <strong>{product.name === "FixTrust" ? "Build with confidence." : "Find your next drive."}</strong>
                    <small>{product.name === "FixTrust" ? "Projects · Milestones · Payments" : "Discover · Compare · Connect"}</small>
                  </div>
                  <span className="product-art-arrow">↗</span>
                </div>
                <div className="product-meta">
                  <div><small>{product.type}</small><h3>{product.name}</h3><p>{product.description}</p></div>
                  <span className="product-status">{product.status}</span>
                </div>
              </Link>
            ))}
          </div>
          <p className="work-disclaimer">FixTrust and Ritewheel Autos are studio-owned products currently in development, not completed client engagements.</p>
        </div>
      </section>

      <section className="contact-section">
        <div className="shell contact-panel">
          <div className="contact-message">
            <span className="eyebrow"><span className="eyebrow-dot" /> Your next move starts here</span>
            <h2>Let&apos;s build something<br /><span>that works.</span></h2>
            <p>Tell us what your business needs. We&apos;ll have a straightforward conversation about the right solution.</p>
            <Link className="button button-primary" href="/book">Start a project <span aria-hidden="true">↗</span></Link>
          </div>
          <div className="contact-details">
            <a href="https://wa.me/2348167014764" target="_blank" rel="noreferrer">
              <span className="contact-detail-icon whatsapp-icon" aria-hidden="true">◉</span>
              <span><small>WhatsApp</small><strong>+234 816 701 4764</strong></span>
              <b>↗</b>
            </a>
            <a href="mailto:seundavid357@gmail.com">
              <span className="contact-detail-icon email-icon" aria-hidden="true">✉</span>
              <span><small>Email</small><strong>seundavid357@gmail.com</strong></span>
              <b>↗</b>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
