// src/components/ProtectedRoute.tsx
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import type { RootState } from '../app/store';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useSelector((state: RootState) => {
    const authStatus = state.user.isAuthenticated;
    console.log('PROTECTED ROUTE: isAuthenticated status from Redux:', authStatus);
    return authStatus;
  });

  if (!isAuthenticated) {
    console.log('PROTECTED ROUTE: Not authenticated, navigating to /login');
    return <Navigate to="/login" replace />;
  }

  console.log('PROTECTED ROUTE: Authenticated, rendering children/outlet');
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;