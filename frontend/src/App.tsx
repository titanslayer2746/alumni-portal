import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingSpinner from "./components/LoadingSpinner";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import JobBoard from "./pages/JobBoard";
import PostJob from "./pages/PostJob";
import Login from "./pages/Login";
import Chat from "./pages/Chat";
import AdminPage from "./pages/AdminPage";
import PendingPage from "./pages/PendingPage";
import ProfilePage from "./pages/ProfilePage";
import "./App.css";

const AppContent: React.FC = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner message="Initializing..." />;
  }

  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="pt-24">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/pending"
              element={
                <ProtectedRoute requiredRole="pending">
                  <PendingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/referrals"
              element={
                <ProtectedRoute>
                  <JobBoard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/post-referral"
              element={
                <ProtectedRoute allowedRoles={["alumni", "admin"]}>
                  <PostJob />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
