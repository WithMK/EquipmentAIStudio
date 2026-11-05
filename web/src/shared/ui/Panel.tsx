import type { ReactNode } from 'react';
export function Panel({title,meta,children,className=''}:{title:string;meta?:ReactNode;children:ReactNode;className?:string}) {
 return <section className={`panel ${className}`}><div className="panel-heading"><h2>{title}</h2>{meta}</div>{children}</section>;
}
export function Badge({children,tone='neutral'}:{children:ReactNode;tone?:'neutral'|'accent'|'warning'}) { return <span className={`badge ${tone}`}>{children}</span>; }
