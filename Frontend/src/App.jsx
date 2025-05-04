import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Dashboard from "./pages/Dashboard";
import CarpoolPage from "./pages/CarpoolPage";
import NotFound from "./pages/NotFound";
import Messages from "./pages/Messages";
import Layout from "./Components/layout/Layout";
import SignIn from "./Components/Authentication/SignIn";
import SignUp from "./Components/Authentication/SignUp";
import { SocketProvider } from "./contexts/socket";

function App() {
  return (
    <SocketProvider>
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="carpools" element={<CarpoolPage />} />
        <Route path="messages" element={<Messages />} />
        <Route path="signIn" element={<SignIn/>}/> 
        <Route path= "signUp" element={<SignUp/>}/>


      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
    </SocketProvider>
  );
}

export default App;
