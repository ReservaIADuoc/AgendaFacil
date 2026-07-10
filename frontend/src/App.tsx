import { Routes, Route, useLocation } from "react-router";
import Layout from "./layouts/Layout";
import Home from "./pages/Home";
import Features from "./pages/Features";
import PricingPage from "./pages/PricingPage";
import TestimonialsPage from "./pages/TestimonialsPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Onboarding from "./pages/Onboarding";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Booking from "./pages/Booking";
import BookingSuccess from "./pages/BookingSuccess";
import NotFound from "./pages/NotFound";
import ClientsView from "./pages/dashboard/ClientsView";
import ServicesView from "./pages/dashboard/ServicesView";
import AnalyticsView from "./pages/dashboard/AnalyticsView";
import { Toaster } from "sonner";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "./components/shared/PageTransition";

import { AuthProvider } from "./contexts/AuthContext";
import { NotificationsProvider } from "./contexts/NotificationsContext";

// Placeholders for new views
const ManageAppointment = () => <div className="p-8"><h1 className="text-2xl font-bold">Gestionar Cita</h1><p>Portal del cliente en construcción...</p></div>;

export default function App() {
  const location = useLocation();

  return (
    <AuthProvider>
      <NotificationsProvider>
        <Toaster richColors position="top-right" />
      <AnimatePresence mode="wait">
        <PageTransition key={location.pathname}>
          <Routes location={location}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="features" element={<Features />} />
              <Route path="pricing" element={<PricingPage />} />
              <Route path="testimonials" element={<TestimonialsPage />} />
            </Route>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="clients" element={<ClientsView />} />
              <Route path="services" element={<ServicesView />} />
              <Route path="analytics" element={<AnalyticsView />} />
            </Route>
            <Route path="/book/:username" element={<Booking />} />
            <Route path="/book/:username/success" element={<BookingSuccess />} />
            <Route path="/book/manage/:id" element={<ManageAppointment />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </PageTransition>
      </AnimatePresence>
        </NotificationsProvider>
      </AuthProvider>
  );
}
