import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import MembershipStep1 from "@/components/MembershipStep1";
import MembershipStep2 from "@/components/MembershipStep2";
import MembershipStep3 from "@/components/MembershipStep3";
import MembershipStep4 from "@/components/MembershipStep4";
import MembershipStep5 from "@/components/MembershipStep5";
import SuccessPage from "@/components/SuccessPage";
import LoginPage from "@/components/LoginPage";
import Dashboard from "@/components/Dashboard";
import DashboardLayout from "@/components/DashboardLayout";
import PostRequirement from "@/components/PostRequirement";
import NotFound from "@/pages/NotFound";
import "./App.css";
import UserProfile from "./components/Profile";
import EditProfile from "./components/ProfileEdit";
import MyRequirements from "./components/MyRequirement";
import UploadProfilePhoto from "./components/ProfilePhoto";
import EditRequirement from "./components/EditRequirement";
import Announcements from "./components/Announcement";
import MyQuotes from "./components/MyQuotes";
import FAQ from "./components/FAQ";
import Contact from "./components/Contact";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Router>
          <Routes>
            {/* Registration Flow */}
            <Route path="/" element={<MembershipStep1 />} />
            <Route path="/step-2" element={<MembershipStep2 />} />
            <Route path="/step-3" element={<MembershipStep3 />} />
            <Route path="/step-4" element={<MembershipStep4 />} />
            <Route path="/step-5" element={<MembershipStep5 />} />
            <Route path="/success" element={<SuccessPage />} />
            
            {/* Authentication */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Dashboard Routes - Wrapped in DashboardLayout for Navbar and Sidebar */}
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/post-requirement" element={<PostRequirement />} />
              <Route path="/dashboard/requirements" element={<MyRequirements />} />
              <Route path="/dashboard/requirements/edit/:id" element={<EditRequirement />} />
              <Route path="/dashboard/profile" element={<UserProfile />} />
              <Route path="/dashboard/profile/edit" element={<EditProfile />} />
              <Route path="/dashboard/profile/photo" element={<UploadProfilePhoto />} />
              <Route path="/dashboard/announcements" element={<Announcements />} />
              <Route path="/dashboard/quotes" element={<MyQuotes />} />
              <Route path="/dashboard/faq" element={<FAQ />} />
              <Route path="/dashboard/contact" element={<Contact />} />
            </Route>
            
            {/* 404 Not Found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
