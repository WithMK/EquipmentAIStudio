import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from './button';
export class ErrorBoundary extends Component<{children:ReactNode},{failed:boolean}> {
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true};}
 componentDidCatch(error:Error,info:ErrorInfo){console.error('Studio view failed',error,info.componentStack);}
 render(){return this.state.failed ? <div className="error-box" role="alert"><h1>화면을 불러오지 못했습니다</h1><p>새로고침 후 다시 확인해 주세요.</p><Button onClick={()=>window.location.reload()}>새로고침</Button></div> : this.props.children;}
}
