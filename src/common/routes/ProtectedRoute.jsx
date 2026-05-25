import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

/**
 * ProtectedRoute
 * 
 * Props:
 *   children  — component to render if authorised
 *   roles     — array of allowed role strings, e.g. ["SCHOOL_ADMIN", "PRINCIPAL"]
 *               If omitted, any authenticated user passes through.
 * 
 * Usage:
 *   <ProtectedRoute roles={["SCHOOL_ADMIN", "PRINCIPAL"]}>
 *     <SchoolAdminDashboard />
 *   </ProtectedRoute>
 */
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // If specific roles required, check intersection
  if (roles && roles.length > 0) {
    const userRoles = user.roles || [];
    const hasRole = roles.some((r) => userRoles.includes(r));
    if (!hasRole) {
      // Redirect to their correct dashboard instead of /
      const { getDashboardRoute } = require("../utils/roleConfig");
      return <Navigate to={getDashboardRoute(userRoles)} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
// import { Navigate } from "react-router-dom";
// import { useAuth } from "../hooks/useAuth";

// const ProtectedRoute = ({ children, role }) => {

//   const { user, loading } = useAuth();

//   if (loading) return null;

//   if (!user) {
//     return <Navigate to="/" replace />;
//   }

//   if (role && !user.roles.includes(role)) {
//     return <Navigate to="/" replace />;
//   }

//   return children;
// };

// export default ProtectedRoute;