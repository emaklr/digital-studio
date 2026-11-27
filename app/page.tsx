import Link from "next/link";
import HeroDashboard from "@/components/hero-dashboard";
import {formatPrice,services} from "@/lib/services";

const serviceHighlights = [
  {number:"01",icon:"globe",title:"Business Websites",description:"Professional, mobile-ready sites that make it easy for customers to understand your offer and enquire.",href:"/services/websites"},
  {number:"02",icon:"basket",title:"E-commerce",description:"Product catalogues, carts and secure checkout integrations that make it easier to sell online.",href:"/services/ecommerce"},
  {number:"03",icon:"grid",title:"Web Apps & Portals",description:"Custom dashboards, portals and workflow tools shaped around how your business operates.",href:"/services/web-applications"},
  {number:"04",icon:"settings",title:"Repairs & Integrations",description:"Bug fixes, API connections and improvements to the systems your business already uses.",href:"/custom-project"},
];

const strengths=[
  {icon:"monitor",title:"Modern Design"},
  {icon:"mobile",title:"Mobile Responsive"},
  {icon:"shield",title:"Secure & Reliable"},
  {icon:"chart",title:"Built for Growth"},
];

function StudioIcon({name}:{name:string}) {
  const common={fill:"none",stroke:"currentColor",strokeWidth:1.8,strokeLinecap:"round" as const,strokeLinejoin:"round" as const};
  return <svg viewBox="0 0 32 32" aria-hidden="true" {...common}>
    {name==="globe"&&<><circle cx="16" cy="16" r="11.5"/><path d="M4.8 16h22.4M16 4.5c3.2 3.2 4.8 7 4.8 11.5s-1.6 8.3-4.8 11.5c-3.2-3.2-4.8-7-4.8-11.5S12.8 7.7 16 4.5Z"/></>}
    {name==="basket"&&<><path d="M5 13h22l-2 14H7L5 13Z"/><path d="m11 13 5-8 5 8M10 18v5M16 18v5M22 18v5"/></>}
    {name==="grid"&&<><rect x="4.5" y="4.5" width="9" height="9" rx="1.5"/><rect x="18.5" y="4.5" width="9" height="9" rx="1.5"/><rect x="4.5" y="18.5" width="9" height="9" rx="1.5"/><rect x="18.5" y="18.5" width="9" height="9" rx="1.5"/></>}
    {name==="settings"&&<><path d="m13 3 .8 2.5a11 11 0 0 1 4.4 0L19 3l3 1.7-.8 2.5a10 10 0 0 1 2.2 3.8l2.6.5v3.4l-2.6.5a10 10 0 0 1-2.2 3.8l.8 2.5-3 1.7-.8-2.5a11 11 0 0 1-4.4 0l-.8 2.5-3-1.7.8-2.5a10 10 0 0 1-2.2-3.8L6 14.9v-3.4l2.6-.5a10 10 0 0 1 2.2-3.8L10 4.7 13 3Z"/><circle cx="16" cy="13.2" r="3.4"/></>}
    {name==="monitor"&&<><rect x="4" y="5" width="24" height="17" rx="2"/><path d="M12 27h8M16 22v5"/></>}
    {name==="mobile"&&<><rect x="9" y="3" width="14" height="26" rx="2.5"/><path d="M14 7h4M15 25h2"/></>}
    {name==="shield"&&<><path d="M16 3 26 7v7c0 7-4.3 11.6-10 15-5.7-3.4-10-8-10-15V7l10-4Z"/><path d="m11.5 15 3 3 6-6"/></>}
    {name==="chart"&&<><path d="M5 27V17h5v10M13.5 27V10h5v17M22 27V4h5v23"/></>}
    {name==="users"&&<><circle cx="12" cy="11" r="4"/><path d="M4 27v-2c0-4 3-7 8-7s8 3 8 7v2M21 7.5a4 4 0 0 1 0 7.5M23 19c3 .8 5 3 5 6v2"/></>}
    {name==="mail"&&<><rect x="3.5" y="6" width="25" height="20" rx="2.5"/><path d="m5 8 11 9 11-9"/></>}
  </svg>;
}

const websitePackages=services.find((service)=>service.slug==="websites")?.packages??[];
const packageNames=["Starter","Growth","Premium"];

export default function HomePage() {
  return <div className="home-page">
    <section className="premium-hero">
      <div className="shell hero-inner">
        <div className="hero-copy">
          <span className="hero-kicker"><i/>Digital Solutions Studio</span>
          <h1>Your Next<br/>Website Should<br/><span>Do More.</span></h1>
          <p>We design and build high-performing websites, web applications and digital systems that help businesses grow, operate better and win more customers.</p>
          <div className="hero-actions">
            <Link href="/book" className="button button-primary">Start a Project</Link>
            <Link href="/work" className="button button-secondary">View Our Work</Link>
          </div>
          <div className="hero-strengths">
            {strengths.map((item)=><div className="hero-strength" key={item.title}><span><StudioIcon name={item.icon}/></span><small>{item.title}</small></div>)}
          </div>
        </div>
        <HeroDashboard/>
      </div>
    </section>

    <section className="premium-services section">
      <div className="shell">
        <div className="premium-section-intro">
          <div className="section-heading">
            <span className="eyebrow"><i/> Our Services</span>
            <h2>Practical Digital Solutions<br/>for Businesses and Agencies.</h2>
          </div>
          <p>From professional websites to custom applications, we design, build and maintain digital products that solve real business problems.</p>
        </div>
        <div className="premium-service-grid">
          {serviceHighlights.map((service)=><Link className="premium-service-card" href={service.href} key={service.number}>
            <span className="premium-service-icon"><StudioIcon name={service.icon}/></span>
            <span className="premium-service-copy"><strong>{service.title}</strong><small>{service.description}</small></span>
          </Link>)}
        </div>
      </div>
    </section>

    <section className="premium-pricing section">
      <div className="shell pricing-content">
        <div className="premium-pricing-intro">
          <div className="section-heading">
            <span className="eyebrow"><i/> Website Packages</span>
            <h2>Simple Packages to Get You Started.</h2>
          </div>
          <p>Clear pricing. Flexible solutions. All packages include deployment and support.</p>
        </div>
        <div className="premium-package-grid">
          {websitePackages.map((item,index)=><article className={index===1?"premium-package premium-package-featured":"premium-package"} key={item.name}>
            <div className="premium-package-top"><span>{packageNames[index]??item.name}</span>{index===1&&<small>Most Popular</small>}</div>
            <div className="premium-package-price">{formatPrice(item.price)}<span>+</span></div>
            <ul>{item.features.slice(0,3).map((feature)=><li key={feature}><b>✓</b>{feature}</li>)}</ul>
            <Link href={`/book?service=websites&package=${encodeURIComponent(item.name)}`} className={index===1?"button button-featured button-full":"button button-package-light button-full"}>View Package</Link>
          </article>)}
        </div>
        <p className="pricing-note">Prices are starting points in USD. A 50% deposit starts fixed-scope work; the balance is due before final handover.</p>
        <div className="premium-offers">
          <Link className="custom-offer" href="/custom-project">
            <span className="offer-icon offer-code">{"</>"}</span>
            <span><strong>Custom Projects</strong><small>Portals, e-commerce, APIs and larger projects.<br/>Request a tailored quote.</small></span>
          </Link>
          <Link className="agency-offer" href="/contact">
            <span className="offer-icon offer-users"><StudioIcon name="users"/></span>
            <span><strong>Agency Partnerships</strong><small>White-label development support for<br/>marketing, branding and SEO agencies.</small></span>
          </Link>
        </div>
      </div>
    </section>

    <section className="premium-contact-section">
      <div className="shell premium-contact-panel">
        <div className="premium-contact-message">
          <h2>Let’s Build Something<br/><span>That Works.</span></h2>
          <p>Message us for a free initial project discussion.</p>
        </div>
        <div className="premium-contact-details">
          <a href="https://wa.me/2348167014764" target="_blank" rel="noreferrer" className="contact-detail">
            <span className="contact-icon contact-whatsapp" aria-hidden="true">W</span>
            <span><small>WhatsApp</small><strong>+234 816 701 4764</strong></span>
          </a>
          <a href="mailto:seundavid357@gmail.com" className="contact-detail">
            <span className="contact-icon contact-email"><StudioIcon name="mail"/></span>
            <span><small>Email</small><strong>seundavid357@gmail.com</strong></span>
          </a>
        </div>
        <Link href="/book" className="button button-primary contact-cta">Start a Project</Link>
      </div>
    </section>
  </div>;
}
