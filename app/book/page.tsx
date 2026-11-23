import type {Metadata} from "next";
import {Suspense} from "react";
import BookingForm from "@/components/booking-form";
export const metadata:Metadata={title:"Book a service",description:"Choose a service and tell Abeeb Digital Studio what you want to build."};
export default function BookPage(){
 return <div className="page-shell"><section className="form-page shell"><div className="form-page-intro"><span className="eyebrow"><span className="eyebrow-dot"></span> Book a service</span><h1>Your next project<br/><span className="gradient-text">starts here.</span></h1><p>Choose a service package and tell us a little about your business. We’ll review your details, confirm the scope and send the deposit checkout and onboarding steps.</p><div className="form-assurance"><span>01 / Tell us what you need</span><span>02 / Confirm scope and deposit</span><span>03 / Get building</span></div></div><div className="form-panel"><div className="form-panel-head"><span className="eyebrow">Project booking</span><span className="secure-note">✳ No commitment yet</span></div><Suspense fallback={<div className="form-loading">Loading booking form...</div>}><BookingForm/></Suspense></div></section></div>;
}