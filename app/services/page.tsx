import type {Metadata} from "next";
import Link from "next/link";
import SectionHeading from "@/components/section-heading";
import ServiceCard from "@/components/service-card";
import {services} from "@/lib/services";

export const metadata:Metadata={title:"Services",description:"Explore website, e-commerce, software, automation and AI services from Abeeb Digital Studio."};
export default function ServicesPage(){
 return <div className="page-shell"><section className="page-hero shell"><span className="eyebrow"><span className="eyebrow-dot"></span> Services</span><h1>Tools that solve<br/><span className="gradient-text">the right problems.</span></h1><p>Choose a service package with a clear starting price, or tell us about a challenge that needs something more custom.</p><div className="page-hero-actions"><Link className="button button-primary" href="/book">Find your starting point </Link><Link className="text-link" href="/custom-project">I need something custom </Link></div></section>
 <section className="section shell"><div className="services-grid">{services.map(service=><ServiceCard key={service.slug} service={service}/>)}</div></section>
 <section className="section pricing-note-section"><div className="shell pricing-note"><div><span className="eyebrow">A note on pricing</span><h2>Clear starting points.<br/>No surprise scope.</h2></div><p>Prices shown are starting prices in USD, not a one-size-fits-all quote. Your final proposal depends on requirements, integrations, content, third-party costs and delivery scope. We confirm the scope and deposit before work begins.</p></div></section>
 <section className="section shell"><SectionHeading eyebrow="Not sure?" title="Start with the outcome, not the technology." copy="Tell us what is slowing your business down. We’ll recommend a practical next step." align="center"/><div className="center-action"><Link className="button button-primary" href="/custom-project">Describe your challenge </Link></div></section>
 </div>;
}