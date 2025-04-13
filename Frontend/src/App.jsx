import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Dashboard from "./pages/Dashboard";
import CarpoolPage from "./pages/CarpoolPage";
import NotFound from "./pages/NotFound";
import Messages from "./pages/Messages";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/carpools" element={<CarpoolPage />} />
      <Route path="/messages" element={<Messages />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
