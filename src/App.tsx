import React, { useState, useEffect, lazy, Suspense } from 'react';
import { DollyProvider } from './context/DollyContext';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Loader2 } from 'lucide-react';

// Lazy-load non-essential pages for ultra-fast startup
const DanceLibrary = lazy(() =>
  import('./pages/DanceLibrary').then((module) => ({ default: module.DanceLibrary }))
);
const CustomizeDolly = lazy(() =>
  import('./pages/CustomizeDolly').then((module) => ({ default: module.CustomizeDolly }))
);
const Settings = lazy(() =>
  import('./pages/Settings').then((module) => ({ default: module.Settings }))
);
const AdminStudio = lazy(() =>
  import('./pages/AdminStudio').then((module) => ({ default: module.AdminStudio }))
);

const PageLoader: React.FC = () => (
  <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-3 text-slate-400">
    <Loader2 className="w-7 h-7 text-indigo-400 animate-spin" />
    <span className="text-xs font-semibold tracking-wider uppercase">Loading view...</span>
  </div>
);

export const App: React.FC = () => {
  // Pure pathname router — no hash fallback to keep back/forward consistent
  const [currentPath, setCurrentPath] = useState<string>(
    () => window.location.pathname || '/'
  );

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    setCurrentPath(path);
    window.history.pushState({}, '', path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = () => {
    switch (currentPath) {
      case '/dances':
        return (
          <Suspense fallback={<PageLoader />}>
            <DanceLibrary onNavigateHome={() => navigate('/')} />
          </Suspense>
        );
      case '/customize':
        return (
          <Suspense fallback={<PageLoader />}>
            <CustomizeDolly />
          </Suspense>
        );
      case '/settings':
        return (
          <Suspense fallback={<PageLoader />}>
            <Settings />
          </Suspense>
        );
      case '/admin':
        return (
          <Suspense fallback={<PageLoader />}>
            <AdminStudio />
          </Suspense>
        );
      case '/':
      default:
        // Home is eagerly loaded for instant display
        return <Home />;
    }
  };

  return (
    <DollyProvider>
      <div className="relative min-h-screen bg-[#08090e] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
        <Navbar currentPath={currentPath} onNavigate={navigate} />
        <main id="main-content" className="flex-1 w-full flex flex-col">{renderPage()}</main>
      </div>
    </DollyProvider>
  );
};

export default App;
