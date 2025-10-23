import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { StateMachineProvider } from "./contexts/StateMachineContext";
import { IndexProvider } from "./contexts/IndexContext";
import Editor from "./pages/Editor";
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const BASE_PATH = "/State-Machine-Editor";

function Router() {
  return (
    <BrowserRouter basename={BASE_PATH}>
      <Routes>
        <Route path="/" element={<Editor />} />
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        switchable
      >
        <StateMachineProvider>
          <IndexProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </IndexProvider>
        </StateMachineProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
