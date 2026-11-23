type Props={eyebrow:string;title:string;copy?:string;align?:"left"|"center"};
export default function SectionHeading({eyebrow,title,copy,align="left"}:Props) {
 return <div className={`section-heading ${align==="center"?"section-heading-center":""}`}><span className="eyebrow"><span className="eyebrow-dot"></span>{eyebrow}</span><h2>{title}</h2>{copy&&<p>{copy}</p>}</div>;
}