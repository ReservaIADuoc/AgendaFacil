import { Routes, Route } from "react-router";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Features from "./pages/Features";
import PricingPage from "./pages/PricingPage";
import TestimonialsPage from "./pages/TestimonialsPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Booking from "./pages/Booking";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="features" element={<Features />} />
        <Route path="pricing" element={<PricingPage />} />
        <Route path="testimonials" element={<TestimonialsPage />} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/book/:username" element={<Booking />} />
    </Routes>
  );
}
