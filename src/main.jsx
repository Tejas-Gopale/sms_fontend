import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import React from "react";
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './common/hooks/useAuth.jsx';

// ✅ 1. Ye do cheezein import karna zaroori hai
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// ✅ 2. QueryClient ka ek instance yahan create karo
const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      {/* ✅ 3. Client prop pass karna mat bhulna */}
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </AuthProvider>
  </StrictMode>
)
// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import React from "react";
// import ReactDOM from "react-dom/client";
// import './index.css'
// import App from './App.jsx'
// import { AuthProvider } from './common/hooks/useAuth.jsx';

// createRoot(document.getElementById('root')).render(
//    <AuthProvider>
//     <App />
//   </AuthProvider>
// )
