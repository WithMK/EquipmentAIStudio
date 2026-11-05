import { lazy, Suspense } from 'react';
import { createBrowserRouter, Link, Navigate } from 'react-router-dom';
import { modules, plannedModules } from './modules';
import { Shell } from './Shell';
import { Button } from '../shared/ui/button';
export function createRouter() {
 return createBrowserRouter([{element:<Shell modules={modules} planned={plannedModules}/>,children:[
 {index:true,element:<Navigate to="/inspections" replace/>},
 ...modules.flatMap(m=>[{path:m.path,load:m.load},...(m.routes||[]).map(r=>({path:`${m.path}/${r.path}`,load:r.load}))].map(r=>{const Page=lazy(r.load);return {path:r.path,element:<Suspense fallback={<p role="status">화면을 불러오는 중…</p>}><Page/></Suspense>};})),
 {path:'*',element:<div className="empty-state"><h2>등록되지 않은 경로입니다</h2><p>주소를 확인하거나 검사 작업 공간으로 이동하세요.</p><Button asChild><Link to="/inspections">Inspection Explorer</Link></Button></div>},
 ]}],{basename:import.meta.env.BASE_URL});
}
