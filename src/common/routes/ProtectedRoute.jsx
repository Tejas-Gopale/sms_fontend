
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getDashboardRoute } from "../utils/roleConfig";
import { pushToast } from "../utils/toastBus";

/**
 * ProtectedRoute
 * Props:
 *   children — component to render if authorised
 *   roles    — array of allowed role strings (optional; omit = any authenticated user)
 */
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) return <Navigate to="/" replace />;

  if (roles && roles.length > 0) {
    const userRoles = user.roles || [];
    const hasRole = roles.some((r) => userRoles.includes(r));
    if (!hasRole) {
      pushToast("You are not authorized to access this page.", "error");
      return <Navigate to={getDashboardRoute(userRoles)} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
//routes adding as per claud :- 17-07-2026
// import { Navigate } from "react-router-dom";
// import { useAuth } from "../hooks/useAuth";
// import { getDashboardRoute } from "../utils/roleConfig";

// /**
//  * ProtectedRoute
//  * Props:
//  *   children — component to render if authorised
//  *   roles    — array of allowed role strings (optional; omit = any authenticated user)
//  */
// const ProtectedRoute = ({ children, roles }) => {
//   const { user, loading } = useAuth();

//   if (loading) return null;

//   if (!user) return <Navigate to="/" replace />;

//   if (roles && roles.length > 0) {
//     const userRoles = user.roles || [];
//     const hasRole = roles.some((r) => userRoles.includes(r));
//     if (!hasRole) return <Navigate to={getDashboardRoute(userRoles)} replace />;
//   }

//   return children;
// };

// export default ProtectedRoute;
