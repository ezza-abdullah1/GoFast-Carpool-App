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
import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";
import store from "./Components/Authentication/redux/store";
import ForgotPasswordModal from "./Components/Authentication/ForgotPasswordModal";
import ResetPassword from "./Components/Authentication/ResetPassword";
import ResetCode from "./Components/Authentication/ResetCode";
import ProfileSettings from "./pages/ProfileSettings";

import ProtectedRoute from "./pages/ProtectedRoutes";
function App() {
  return (
    <Provider store={store}>

      <SocketProvider>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} /><Route
              path="dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            /><Route
              path="carpools"
              element={
                <ProtectedRoute>
                  <CarpoolPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="messages"
              element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile-settings"
              element={
                <ProtectedRoute>
                  <ProfileSettings />
                </ProtectedRoute>
              }
            />
            <Route path="signIn" element={<SignIn />} />
            <Route path="signUp" element={<SignUp />} />
            <Route path="forgotPassword" element={<ForgotPasswordModal />} />
            <Route path="resetPassword" element={<ResetPassword />} />
            <Route path="resetCode" element={<ResetCode />} />


          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </SocketProvider>
    </Provider>

  );
}

export default App;
