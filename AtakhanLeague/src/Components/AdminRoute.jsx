import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

// Front-end gate for /admin. The backend (verifyAdmin) is the real enforcement.
export default function AdminRoute() {
  const { currentUser } = useSelector((state) => state.user);
  if (!currentUser) return <Navigate to="/sign-in" replace />;
  if (currentUser.role !== 'ADMIN') return <Navigate to="/" replace />;
  return <Outlet />;
}
