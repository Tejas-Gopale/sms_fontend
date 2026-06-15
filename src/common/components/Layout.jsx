// Layout.jsx — uses RoleSidebar (the unified role-aware sidebar)
import RoleSidebar from "./RoleSidebar";

export default function Layout({ children }) {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <RoleSidebar />
      <div className="flex-1 overflow-y-auto p-6 bg-gray-100">
        {children}
      </div>
    </div>
  );
}
