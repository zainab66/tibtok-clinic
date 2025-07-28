// src/components/PublicRoute.tsx
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import type { RootState } from '../app/store';

const PublicRoute = ({ children }: { children?: React.ReactNode }) => {
  const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated);

  // If the user is authenticated, redirect them to the dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // If not authenticated, render the children (Login/Register page) or Outlet
  return children ? <>{children}</> : <Outlet />;
};

export default PublicRoute;