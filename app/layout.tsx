import type {Metadata} from "next";
import "./globals.css";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";

export const metadata:Metadata={
 metadataBase:process.env.NEXT_PUBLIC_SITE_URL?new URL(process.env.NEXT_PUBLIC_SITE_URL):undefined,
 title:{default:"Abeeb Digital Studio — Digital solutions that move business forward",template:"%s | Abeeb Digital Studio"},
 description:"We design and build high-performing websites, useful software, and intelligent automation for ambitious businesses.",
 openGraph:{title:"Abeeb Digital Studio",description:"Digital solutions that move business forward.",type:"website"}
};
export default function RootLayout({children}:{children:React.ReactNode}){
 return <html lang="en"><body><SiteHeader/><main>{children}</main><SiteFooter/></body></html>;
}