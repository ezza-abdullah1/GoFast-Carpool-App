import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useEffect, useRef } from 'react';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = sessionStorage.getItem("token");
  const hasShownToast = useRef(false);

  useEffect(() => {
    if (!isAuthenticated && !hasShownToast.current) {
      toast.error("You need to be logged in to access this page");
      hasShownToast.current = true;
    }
  }, [isAuthenticated]);

  return isAuthenticated ? (
    children
  ) : (
    <Navigate to="/" state={{ openSignUp: true }} replace />
  );
};

export default ProtectedRoute;
