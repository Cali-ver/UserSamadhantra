import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Users,
  FileCheck,
  CheckCircle,
  ClipboardCheck,
  UserCheck,
  Receipt,
  Package,
  MessageSquare,
  Plus,
  Loader2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { fetchUserProfile } from "../services/api";

const Dashboard = () => {
  const navigate = useNavigate();
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [userData, setUserData] = useState({
    full_name: "User",
    email: "",
    membershipType: "Member"
  });

  useEffect(() => {
    // ✅ FETCH USER PROFILE FROM API
    const loadUserProfile = async () => {
      const authToken = localStorage.getItem('authToken');
      
      if (!authToken) {
        console.error("❌ No auth token found - redirecting to home");
        navigate('/login', { replace: true });
        return;
      }
      
      console.log("✅ User authenticated with token:", authToken);
      
      try {
        setIsLoadingProfile(true);
        const profile = await fetchUserProfile();
        
        // Check payment_status before allowing access
        // const paymentStatus = (profile?.payment_status || '').toLowerCase().trim();
        
        // if (paymentStatus !== 'paid') {
        //   console.error("❌ Payment not completed. Current status:", paymentStatus);
        //   // Redirect to payment page if not paid
        //   navigate('/step-5', { replace: true });
        //   return;
        // }
        
        setUserData({
          full_name: profile.full_name || "User",
          email: profile.email || "",
          membershipType: profile.user_type || "Member",
          ...profile
        });
        
        // Update localStorage with fresh data
        localStorage.setItem('userData', JSON.stringify(profile));
        
        console.log("✅ User profile loaded:", profile);
      } catch (error) {
        console.error("❌ Failed to fetch user profile:", error);
        
        // If authentication fails, clear tokens and redirect
        if (error.message.includes("authentication") || error.message.includes("token")) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('token_type');
          localStorage.removeItem('userData');
          navigate('/login', { replace: true });
          return;
        }
        
        // Fallback to localStorage if API fails but token exists
        const storedUser = localStorage.getItem('userData');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setUserData({
            full_name: user.full_name || "User",
            email: user.email || "",
            membershipType: user.user_type || user.membershipType || "Member"
          });
          console.log("⚠️ Using cached user data");
        }
      } finally {
        setIsLoadingProfile(false);
      }
    };
    
    loadUserProfile();
  }, [navigate]);

  // Helper function for initials
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .filter(Boolean)
      .join('')
      .toUpperCase()
      .slice(0, 2) || "U";
  };
  const statsData = [
    {
      title: "Active Requirements",
      value: "3",
      icon: FileText,
      color: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400"
    },
    {
      title: "Providers Matched",
      value: "5",
      icon: Users,
      color: "bg-green-100 dark:bg-green-900/30",
      iconColor: "text-green-600 dark:text-green-400"
    },
    {
      title: "Quotes Received",
      value: "8",
      icon: FileCheck,
      color: "bg-purple-100 dark:bg-purple-900/30",
      iconColor: "text-purple-600 dark:text-purple-400"
    },
    {
      title: "Projects Completed",
      value: "12",
      icon: CheckCircle,
      color: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400"
    }
  ];

  const workflowSteps = [
    {
      step: 1,
      title: "Post Requirement",
      status: "Current Step",
      statusColor: "text-blue-600 dark:text-blue-400",
      description: 'Login to your dashboard and submit your requirement.',
      highlight: '"Your need, clearly defined"',
      bgColor: "from-blue-500 to-blue-600",
      icon: ClipboardCheck
    },
    {
      step: 2,
      title: "Get Matched Service Providers",
      status: "Next Step",
      statusColor: "text-orange-600 dark:text-orange-400",
      description: "We suggest the most suitable service providers.",
      highlight: '"Smart matching within the ecosystem"',
      bgColor: "from-violet-500 to-violet-600",
      icon: UserCheck
    },
    {
      step: 3,
      title: "Receive & Approve Quote",
      status: "Upcoming",
      statusColor: "text-green-600 dark:text-green-400",
      description: "Compare quotes and approve the best option.",
      highlight: '"Transparent pricing & scope"',
      bgColor: "from-violet-500 to-violet-600",
      icon: Receipt
    },
    {
      step: 4,
      title: "Service Delivered",
      status: "Completed",
      statusColor: "text-green-600 dark:text-green-400",
      description: "The approved service is executed successfully.",
      highlight: '"Timely and reliable delivery"',
      bgColor: "from-green-500 to-green-600",
      icon: Package
    },
    {
      step: 5,
      title: "Feedback & Project Closure",
      status: "Completed",
      statusColor: "text-green-600 dark:text-green-400",
      description: "Share feedback and close the project formally.",
      highlight: '"Completion with confidence"',
      bgColor: "from-violet-500 to-violet-600",
      icon: MessageSquare
    }
  ];

  const activeProjects = [
    {
      title: "Home Renovation",
      status: "In Progress",
      statusColor: "bg-green-500",
      category: "Construction & Interior",
      description: "Complete home renovation including living room, kitchen, and two bedrooms.",
      progress: 65,
      provider: "Urban Design Solutions",
      budget: "₹5,75,000"
    },
    {
      title: "Office IT Setup",
      status: "Quotes Review",
      statusColor: "bg-orange-500",
      category: "IT Services",
      description: "Complete IT infrastructure setup for new office including network, servers, and workstations.",
      progress: 30,
      quotesReceived: "5 Proposals",
      budgetRange: "₹2-3 Lakhs"
    }
  ];

  // Show loading spinner while fetching profile
  if (isLoadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Left Part - Main Content */}
        <div className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-2xl md:text-3xl font-bold mb-3 italic">
              Your need, clearly defined
            </h1>
            <p className="text-blue-100 text-sm mb-6 max-w-md">
              Login to your dashboard and submit your requirement. We'll connect you with the best service providers.
            </p>
            <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2 shadow-lg">
              <Plus className="w-5 h-5" />
              Post Your Requirement
            </button>
          </div>
          {/* Decorative wave */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-blue-600/30 to-transparent"></div>
        </div>

        {/* Right Part - User Profile */}
        <div className="w-full md:w-56 bg-gradient-to-b from-blue-500 to-blue-700 rounded-2xl p-6 text-white flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-violet-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {getInitials(userData.full_name)}
          </div>
          <p className="mt-4 font-bold text-lg">{userData.full_name}</p>
          <p className="text-blue-200 text-sm">{userData.membershipType || "Member"}</p>
          <span className="mt-3 px-4 py-1.5 bg-green-500 text-white text-xs font-medium rounded-full shadow-md">
            Active
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat, index) => (
          <Card key={index} className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
            <CardContent className="p-5">
              <div className={`w-10 h-10 ${stat.color} rounded-full flex items-center justify-center mb-3`}>
                <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 dark:text-white">{stat.value}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* How Samadhantra Works */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">How Samadhantra Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {workflowSteps.map((step) => (
            <Card key={step.step} className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {step.step}
                  </span>
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-white truncate">{step.title}</h3>
                </div>
                <span className={`text-xs font-medium ${step.statusColor}`}>{step.status}</span>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                  {step.description} <span className="text-gray-700 dark:text-gray-300 font-medium">{step.highlight}</span>
                </p>
                <div className={`mt-3 h-24 bg-gradient-to-br ${step.bgColor} rounded-lg flex items-center justify-center`}>
                  <step.icon className="w-10 h-10 text-white/80" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Active Projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Active Projects</h2>
          <button className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300 border border-blue-600 dark:border-blue-400 px-3 py-1.5 rounded-lg">
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeProjects.map((project, index) => (
            <Card key={index} className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-800 dark:text-white">{project.title}</h3>
                  <span className={`px-2 py-1 ${project.statusColor} text-white text-xs rounded-full`}>
                    {project.status}
                  </span>
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mb-2">{project.category}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{project.description}</p>
                
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Project Progress</span>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{project.progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                {/* Project Details */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {project.provider ? (
                    <>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Provider</p>
                        <p className="font-medium text-gray-700 dark:text-gray-200">{project.provider}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Budget</p>
                        <p className="font-medium text-gray-700 dark:text-gray-200">{project.budget}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Quotes Received</p>
                        <p className="font-medium text-blue-600 dark:text-blue-400">{project.quotesReceived}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Budget Range</p>
                        <p className="font-medium text-gray-700 dark:text-gray-200">{project.budgetRange}</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
