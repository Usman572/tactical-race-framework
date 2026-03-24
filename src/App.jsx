import { BrowserRouter, Routes, Route } from "react-router-dom";

import PublicLayout from "./layouts/PublicLayout";
import PartnerLayout from "./layouts/PartnerLayout";
import AdminLayout from "./layouts/AdminLayout";

import Home from "./pages/public/Home";
import Login from "./pages/public/Login";
import CreateRace from "./pages/public/CreateRace";
import Races from "./pages/public/Races";
import RaceDetails from "./pages/public/RaceDetails";
import LiveHUD from "./pages/public/LiveHUD";
import PartnerDashboard from "./pages/partner/PartnerDashboard";
import PartnerRaces from "./pages/partner/PartnerRaces";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminPartners from "./pages/admin/AdminPartners";
import AdminRaces from "./pages/admin/AdminRaces";
import AdminCreateRace from "./pages/admin/AdminCreateRace";
import AdminEditRace from "./pages/admin/AdminEditRace";

import PartnerCreateRace from "./pages/partner/PartnerCreateRace";
import PartnerEditRace from "./pages/partner/PartnerEditRace";
import JoinRequests from "./pages/shared/JoinRequests";

import { AuthProvider } from "./context/AuthContext";
import { RaceProvider } from "./context/RaceContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Register from "./pages/public/Register";
import UserProfile from "./pages/public/UserProfile";
import Messages from "./pages/public/Messages";
import Leaderboard from "./pages/public/Leaderboard";
import Achievements from "./pages/public/Achievements";
import { ThemeProvider } from "./context/ThemeContext";
import { SocketProvider } from "./context/SocketContext";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <RaceProvider>
            <BrowserRouter>
              <ErrorBoundary>
                <Routes>
                  <Route path="/" element={<PublicLayout />}>
                    <Route index element={<Home />} />
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                    <Route path="races/new" element={<CreateRace />} />
                    <Route path="races" element={<Races />} />
                    <Route path="races/:id" element={<RaceDetails />} />
                    <Route path="races/:id/hud" element={<LiveHUD />} />
                    <Route path="profile/:id" element={<UserProfile />} />
                    <Route path="messages" element={<Messages />} />
                    <Route path="leaderboard" element={<Leaderboard />} />
                    <Route path="achievements" element={<Achievements />} />
                  </Route>

                  <Route path="/partner" element={
                    <ProtectedRoute allowedRoles={['partner', 'admin']}>
                      <PartnerLayout />
                    </ProtectedRoute>
                  }>
                    <Route index element={<PartnerDashboard />} />
                    <Route path="races" element={<PartnerRaces />} />
                    <Route path="races/new" element={<PartnerCreateRace />} />
                    <Route path="races/:id/edit" element={<PartnerEditRace />} />
                    <Route path="requests" element={<JoinRequests />} />
                  </Route>

                  <Route path="/admin" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminLayout />
                    </ProtectedRoute>
                  }>
                    <Route index element={<AdminDashboard />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="partners" element={<AdminPartners />} />
                    <Route path="races" element={<AdminRaces />} />
                    <Route path="races/new" element={<AdminCreateRace />} />
                    <Route path="races/:id/edit" element={<AdminEditRace />} />
                    <Route path="requests" element={<JoinRequests />} />
                  </Route>
                </Routes>
              </ErrorBoundary>
            </BrowserRouter>
          </RaceProvider>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
