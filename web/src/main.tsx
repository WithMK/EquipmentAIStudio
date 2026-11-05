import ReviewPanel from './features/image-review/ReviewPanel';
import { ReviewSlotContext } from './shared/modules/reviewSlot';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { ServicesContext } from './shared/services/context';
import { ErrorBoundary } from './shared/ui/ErrorBoundary';
import { createServices } from './app/services';
import { createRouter } from './app/router';
import './app/theme.css';
const root=createRoot(document.getElementById('root')!);
try {
 const services=createServices();
 const queryClient=new QueryClient({defaultOptions:{queries:{staleTime:30_000,retry:1,refetchOnWindowFocus:false}}});
 root.render(<StrictMode><ErrorBoundary><ServicesContext.Provider value={services}><QueryClientProvider client={queryClient}><ReviewSlotContext.Provider value={ReviewPanel}><RouterProvider router={createRouter()}/></ReviewSlotContext.Provider></QueryClientProvider></ServicesContext.Provider></ErrorBoundary></StrictMode>);
} catch(error) {
 root.render(<div className="error-box" role="alert"><h1>워크스페이스 설정 오류</h1><p>{error instanceof Error?error.message:'시작할 수 없습니다.'}</p></div>);
}
