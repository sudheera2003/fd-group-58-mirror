import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import DashboardLayout from "./layouts/dashboard-layout";
import { Toaster } from "@/components/ui/sonner";


export function App() {
return (
     <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <Routes>
            <Route path="/" element={<DashboardLayout />}/>

        </Routes>
        </BrowserRouter>
        <Toaster position="top-center" richColors />
    </ThemeProvider>
);
}

export default App;