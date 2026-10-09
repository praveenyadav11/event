import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import CreateEvent from "./pages/CreateEvent";
import Booking from "./pages/Booking";
import BookingSuccess from "./pages/BookingSuccess";
import MyTickets from "./pages/MyTickets";
import CheckIn from "./pages/CheckIn";
import StudentDashboard from "./pages/StudentDashboard";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import EditProfile from "./pages/EditProfile";
import AdminDashboard from "./pages/AdminDashboard";



function Private({ children }) {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="flex-center" style={{ minHeight: "100vh" }}>
        Loading...
      </div>
    );
  return user ? children : <Navigate to="/login" />;
}

function OrganizerOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="flex-center" style={{ minHeight: "100vh" }}>
        Loading...
      </div>
    );
  if (!user) return <Navigate to="/login" />;
  if (!["organizer", "admin"].includes(user.role))
    return <Navigate to="/events" />;
  return children;
}
//roleroute
function RoleRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="flex-center" style={{ minHeight: "100vh" }}>
        Loading...
      </div>
    );
  if (!user) return <Navigate to="/login" />;
  // Allow admin to access any role route
  if (user.role === "admin") return children;
  if (user.role !== role) return <Navigate to="/dashboard" />;
  return children;
}
// Placeholder dashboards
// function StudentDashboard() {
//   return (
//     <div style={{ padding: "6rem 2rem" }}>
//       <h2>Student Dashboard — Phase 6</h2>
//     </div>
//   );
// }
// function OrganizerDashboard() {
//   return (
//     <div style={{ padding: "6rem 2rem" }}>
//       <h2>Organizer Dashboard — Phase 6</h2>
//     </div>
//   );
// }

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route
            path="/create-event"
            element={
              <OrganizerOnly>
                <CreateEvent />
              </OrganizerOnly>
            }
          />
          import StudentDashboard from './pages/StudentDashboard'; import
          OrganizerDashboard from './pages/OrganizerDashboard'; import
          EditProfile from './pages/EditProfile'; // Replace placeholder routes:
          <Route
            path="/dashboard"
            element={
              <Private>
                <StudentDashboard />
              </Private>
            }
          />
          <Route
            path="/organizer/dashboard"
            element={
              <OrganizerOnly>
                <OrganizerDashboard />
              </OrganizerOnly>
            }
          />
          <Route
            path="/profile/edit"
            element={
              <Private>
                <EditProfile />
              </Private>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
          <Route
            path="/booking/:eventId"
            element={
              <Private>
                <Booking />
              </Private>
            }
          />
          <Route
            path="/booking/success/:bookingId"
            element={
              <Private>
                <BookingSuccess />
              </Private>
            }
          />
          <Route
            path="/my-tickets"
            element={
              <Private>
                <MyTickets />
              </Private>
            }
          />
          <Route
            path="/checkin/:eventId"
            element={
              <OrganizerOnly>
                <CheckIn />
              </OrganizerOnly>
            }
          />
          <Route
            path="/admin"
            element={
              <RoleRoute role="admin">
                <AdminDashboard />
              </RoleRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
