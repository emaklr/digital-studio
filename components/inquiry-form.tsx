"use client";
import {FormEvent,useState} from "react";
import {services} from "@/lib/services";

type Props={mode:"booking"|"custom";initialService?:string;initialPackage?:string};
const paymentsEnabled=process.env.NEXT_PUBLIC_PAYMENTS_ENABLED==="true";

export default function InquiryForm({mode,initialService="",initialPackage=""}:Props){
 const [status,setStatus]=useState<"idle"|"sending"|"success"|"error">("idle");
 const [message,setMessage]=useState("");
 const [selectedService,setSelectedService]=useState(initialService);
 const [selectedPackage,setSelectedPackage]=useState(initialPackage);
 const activeService=services.find(service=>service.slug===selectedService);
 async function handleSubmit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();setStatus("sending");setMessage("");
  const form=event.currentTarget;
  const payload=Object.fromEntries(new FormData(form).entries()) as Record<string,string>;
  payload.kind=mode;
  try{
   if(mode==="booking"&&paymentsEnabled){
    const response=await fetch("/api/checkout/initialize",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
    const result=await response.json();
    if(!response.ok)throw new Error(result.error||"We could not start checkout.");
    if(typeof result.authorizationUrl!=="string")throw new Error("The checkout link was not returned.");
    window.location.assign(result.authorizationUrl);
    return;
   }
   const response=await fetch("/api/inquiries",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
   const result=await response.json();
   if(!response.ok)throw new Error(result.error||"We could not send your request.");
   setStatus("success");
   setMessage(mode==="booking"?"Your booking request has been received. We’ll confirm the project scope and deposit with you by email.":"Your custom project brief has been received. We’ll review it and get back to you.");
   form.reset();
   setSelectedService("");setSelectedPackage("");
  }catch(error){
   setStatus("error");setMessage(error instanceof Error?error.message:"Something went wrong. Please try again.");
  }
 }
 return <form className="inquiry-form" onSubmit={handleSubmit}>
  <div className="form-grid">
   <label>Full name<input name="name" autoComplete="name" placeholder="Your name" required maxLength={100}/></label>
   <label>Work email<input type="email" name="email" autoComplete="email" placeholder="you@company.com" required maxLength={180}/></label>
   <label>Business / company<input name="company" autoComplete="organization" placeholder="Your business name" maxLength={140}/></label>
   <label>Website (optional)<input type="url" name="website" placeholder="https://" maxLength={250}/></label>
   {mode==="booking"?<>
    <label>Service<select name="service" value={selectedService} onChange={event=>{setSelectedService(event.target.value);setSelectedPackage("");}} required><option value="">Choose a service</option>{services.map(service=><option key={service.slug} value={service.slug}>{service.title}</option>)}</select></label>
    <label>Package<select name="package" value={selectedPackage} onChange={event=>setSelectedPackage(event.target.value)} required disabled={!activeService}><option value="">Choose a package</option>{activeService?.packages.map(pkg=><option key={pkg.name} value={pkg.name}>{pkg.name} — ${pkg.price} USD</option>)}</select></label>
   </>:<>
    <label>What do you need?<select name="service" defaultValue="" required><option value="" disabled>Select a solution area</option><option value="website">Website or e-commerce</option><option value="application">Custom application</option><option value="automation">Business automation</option><option value="ai">AI integration</option><option value="other">Something else</option></select></label>
    <label>Estimated budget<select name="budget" defaultValue=""><option value="">Select a range</option><option value="under-500">Under $500</option><option value="500-1500">$500–$1,500</option><option value="1500-5000">$1,500–$5,000</option><option value="5000-plus">$5,000+</option><option value="not-sure">Not sure yet</option></select></label>
   </>}
   <label className="full-field">What are you trying to achieve?<textarea name="details" rows={5} placeholder="Tell us about your business, the challenge and what a good outcome would look like..." required minLength={20} maxLength={4000}></textarea></label>
   <label className="full-field">When would you like to start?<select name="timeline" defaultValue=""><option value="">Choose a timeline</option><option value="asap">As soon as possible</option><option value="2-4-weeks">Within 2–4 weeks</option><option value="1-3-months">Within 1–3 months</option><option value="flexible">I’m flexible</option></select></label>
  </div>
  {mode==="booking"&&<p className="checkout-note">{paymentsEnabled?"Your deposit is calculated from the selected package and shown in NGN at secure checkout.":"Online deposits are being configured. Submit your booking request and we’ll confirm the deposit with you."}</p>}
  <div className="form-bottom"><p>By submitting, you agree that we may contact you about this enquiry. Your details are used only to respond to your request.</p><button className="button button-primary" type="submit" disabled={status==="sending"}>{status==="sending"?"Sending...":mode==="booking"?(paymentsEnabled?"Continue to deposit checkout ↗":"Send booking request ↗"):"Send custom brief ↗"}</button></div>
  {message&&<p className={`form-message ${status==="success"?"form-success":"form-error"}`} role="status">{message}</p>}
  <input type="text" name="company_website" tabIndex={-1} autoComplete="off" className="honeypot" aria-hidden="true"/>
 </form>;
}
