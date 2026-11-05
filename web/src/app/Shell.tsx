import { NavLink, Outlet, useLocation, Link } from 'react-router-dom';
import { Box, PanelLeftClose, PanelLeftOpen, ChevronRight, CircleHelp } from 'lucide-react';
import { useState } from 'react';
import type { FeatureModule } from '../shared/modules/definition';
import { Badge } from '../shared/ui/Panel';
import { ErrorBoundary } from '../shared/ui/ErrorBoundary';
export function Shell({modules,planned}:{modules:readonly FeatureModule[];planned:readonly {title:string;phase:string}[]}) {
 const [collapsed,setCollapsed]=useState(false); const location=useLocation();
 const active=modules.find(m=>location.pathname===`/${m.path}` || location.pathname.startsWith(`/${m.path}/`));
 return <div className={`app-shell ${collapsed?'collapsed':''}`}><a className="skip-link" href="#main-content">본문으로 이동</a><aside className="sidebar">
 <Link to="/inspections" className="brand" aria-label="Equipment AI Studio 홈"><span className="brand-mark"><Box size={23}/></span><span className="brand-text">EQUIPMENT AI<strong>Studio<span> / </span></strong></span></Link>
 <div className="nav-caption">WORKSPACE</div><nav aria-label="주 메뉴">{modules.map(m=><NavLink key={m.id} to={`/${m.path}`} title={m.title} className={({isActive})=>`nav-item ${isActive?'active':''}`}><m.icon size={18}/><span>{m.title}</span></NavLink>)}</nav>
 <div className="planned"><div className="nav-caption">UPCOMING MODULES</div>{planned.map(({title:label,phase})=><div className="planned-item" key={label}><span>{label}</span><small>P{phase}</small></div>)}</div>
 <div className="sidebar-bottom"><div className="prototype-note"><span className="status-dot"/>Prototype v0.1<small>Frontend foundation</small></div><button className="collapse-button" onClick={()=>setCollapsed(!collapsed)} aria-label={collapsed?'사이드바 펼치기':'사이드바 접기'} aria-expanded={!collapsed}>{collapsed?<PanelLeftOpen size={18}/>:<PanelLeftClose size={18}/>}<span>Collapse sidebar</span></button></div>
 </aside><div className="shell-body"><header className="topbar"><div className="breadcrumb"><span>Workspace</span><ChevronRight size={14}/><strong>{active?.title || 'Page not found'}</strong></div><div className="topbar-right"><Badge tone="warning">MOCK DATA</Badge><span className="environment-label">LOCAL WORKSPACE</span><span className="avatar" aria-label="데모 사용자">DE</span></div></header>
 <main id="main-content" tabIndex={-1}><div className="page-heading"><div><span className="eyebrow">EQUIPMENT AI STUDIO / ENGINEERING WORKSPACE</span><h1>{active?.title || '페이지를 찾을 수 없습니다'}</h1><p>{active?.subtitle || '메뉴에서 작업 화면을 선택하세요.'}</p></div><Link to="/workspace" className="help-link"><CircleHelp size={16}/>환경 정보</Link></div><ErrorBoundary key={location.pathname}><Outlet/></ErrorBoundary></main>
 <footer className="statusbar"><span><span className="status-dot"/>Mock adapter · 실제 설비 미연결</span><span>Phase 1 / 6<span className="footer-divider">|</span>Contract v0.1</span></footer></div></div>;
}
