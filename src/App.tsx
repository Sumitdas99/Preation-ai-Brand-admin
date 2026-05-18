import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./context/store";
import routers from "./routers";
import { ThemeProvider } from "@/components/theme-provider";

const queryClient = new QueryClient();

const App = () => (
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <QueryClientProvider client={queryClient}>
        {/* Theme provider handles light/dark mode */}
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          {/* Global Tooltip Provider (delayDuration=0 makes sidebars snappy) */}
          <TooltipProvider delayDuration={0}>
            <Toaster />
            <Sonner />
            <RouterProvider router={routers} />
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </PersistGate>
  </Provider>
);

export default App;