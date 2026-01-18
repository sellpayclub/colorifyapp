import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";
import Colorify from "./pages/Colorify";
import ColorifyAuth from "./pages/ColorifyAuth";
import ColorifyLanding from "./pages/ColorifyLanding";
import ColorifyImageAdmin from "./pages/ColorifyImageAdmin";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/colorify-landing" element={<ColorifyLanding />} />
          <Route path="/colorify-login" element={<ColorifyAuth />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Colorify />
            </ProtectedRoute>
          } />
          <Route path="/colorify" element={
            <ProtectedRoute>
              <Colorify />
            </ProtectedRoute>
          } />
          <Route path="/admin/colorify-images" element={
            <ProtectedRoute requireAdmin>
              <ColorifyImageAdmin />
            </ProtectedRoute>
          } />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;