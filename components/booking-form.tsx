"use client";
import {useSearchParams} from "next/navigation";
import InquiryForm from "@/components/inquiry-form";
export default function BookingForm(){const params=useSearchParams();return <InquiryForm mode="booking" initialService={params.get("service")??""} initialPackage={params.get("package")??""}/>;}