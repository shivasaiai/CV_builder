import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import TemplatesPage from "./pages/Templates";
import BuilderPage from "./pages/Builder";
import BuilderNew from "./pages/BuilderNew";
import TestBuilder from "./pages/TestBuilder";
import TemplateTestPage from "./pages/TemplateTest";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/templates" element={<TemplatesPage />} />
          <Route path="/builder/:sessionId" element={<BuilderPage />} />
          <Route path="/builder-new/:sessionId" element={<BuilderNew />} />
          <Route path="/test-builder" element={<TestBuilder />} />
          <Route path="/template-test" element={<TemplateTestPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
