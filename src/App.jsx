import { BrowserRouter, Routes, Route } from "react-router-dom";
import SuperAdminHome from "./super_admin/pages/SuperAdminHome";
import SchoolsList from "./super_admin/pages/SchoolsList";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<SuperAdminHome />} />

        <Route
          path="/super-admin/dashboard"
          element={<SuperAdminHome />}
        />

        <Route
          path="/super-admin/schools"
          element={<SchoolsList />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;