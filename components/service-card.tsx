import Link from "next/link";
import type {Service} from "@/lib/services";
export default function ServiceCard({service}:{service:Service}) {
 return <article className="service-card"><div className="service-card-top"><span>{service.number}</span><span className="arrow-circle">↗</span></div><h3>{service.title}</h3><p>{service.short}</p><div className="service-card-bottom"><span>{service.priceLabel}</span><Link href={`/services/${service.slug}`} aria-label={`Explore ${service.title}`}>Explore service <span aria-hidden="true">→</span></Link></div></article>;
}