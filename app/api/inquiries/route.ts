import {NextRequest,NextResponse} from "next/server";
const MAX_BODY_LENGTH=4000;
const EMAIL_PATTERN=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function clean(value:unknown,max=300){if(typeof value!=="string")return "";return value.trim().replace(/[\u0000-\u001f\u007f]/g,"").slice(0,max);}
function escapeHtml(value:string){return value.replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]??char));}
export async function POST(request:NextRequest){
 try{
  const origin=request.headers.get("origin");
  if(origin&&origin!==new URL(request.url).origin)return NextResponse.json({error:"Invalid request origin."},{status:403});
  const length=Number(request.headers.get("content-length")??0);
  if(length>12000)return NextResponse.json({error:"Request is too large."},{status:413});
  const payload=await request.json();
  if(clean(payload.company_website,200))return NextResponse.json({ok:true});
  const name=clean(payload.name,100),email=clean(payload.email,180).toLowerCase(),details=clean(payload.details,MAX_BODY_LENGTH);
  if(!name||!EMAIL_PATTERN.test(email)||details.length<20)return NextResponse.json({error:"Please provide a valid name, email and project description."},{status:400});
  const apiKey=process.env.RESEND_API_KEY,recipient=process.env.LEAD_NOTIFICATION_EMAIL,sender=process.env.LEAD_FROM_EMAIL;
  if(!apiKey||!recipient||!sender)return NextResponse.json({error:"The enquiry inbox is not connected yet. Please try again later."},{status:503});
  const kind=payload.kind==="booking"?"Service booking":"Custom project enquiry";
  const rows=Object.entries(payload).filter(([key])=>key!=="company_website").map(([key,value])=>`<tr><th style="text-align:left;padding:8px 12px;border-bottom:1px solid #e5e7eb">${escapeHtml(key)}</th><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${escapeHtml(clean(value,key==="details"?MAX_BODY_LENGTH:500))}</td></tr>`).join("");
  const response=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${apiKey}`,"Content-Type":"application/json"},body:JSON.stringify({from:sender,to:[recipient],reply_to:email,subject:`[Abeeb Studio] ${kind}: ${name}`,html:`<div style="font-family:Arial,sans-serif;color:#111827"><h2>${kind}</h2><p>A new enquiry was submitted through the Abeeb Digital Studio website.</p><table style="border-collapse:collapse;width:100%">${rows}</table></div>`})});
  if(!response.ok)return NextResponse.json({error:"We could not deliver your request right now. Please try again shortly."},{status:502});
  return NextResponse.json({ok:true});
 }catch{return NextResponse.json({error:"Invalid request. Please check the form and try again."},{status:400});}
}