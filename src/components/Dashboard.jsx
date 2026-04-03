import { useState, useEffect, useMemo } from "react";
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
  Loader2,
  Clock,
  ArrowRight
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchUserProfile, getUserRequirements, getUserAgreements } from "../services/api";

const Dashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState({
    full_name: "User",
    email: "",
    user_type: "Member"
  });
  const [requirements, setRequirements] = useState([]);
  const [agreements, setAgreements] = useState([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        navigate('/login', { replace: true });
        return;
      }
      
      try {
        setIsLoading(true);
        const [profile, reqData, agreementData] = await Promise.all([
          fetchUserProfile(),
          getUserRequirements(),
          getUserAgreements()
        ]);
        
        setUserData(profile);
        setRequirements(Array.isArray(reqData) ? reqData : (reqData?.requirements || []));
        setAgreements(Array.isArray(agreementData) ? agreementData : (agreementData?.data || []));
        
        localStorage.setItem('userData', JSON.stringify(profile));
      } catch (error) {
        console.error("❌ Failed to fetch dashboard data:", error);
        if (error.status === 401) navigate('/login', { replace: true });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDashboardData();
  }, [navigate]);

  const stats = useMemo(() => {
    const activeReqs = requirements.filter(r => !r.is_archived).length;
    const totalQuotes = agreements.length;
    const completedProjects = agreements.filter(a => a.status === 'completed').length;
    
    return [
      {
        title: "Active Requirements",
        value: activeReqs,
        icon: FileText,
        color: "bg-blue-50",
        iconColor: "text-blue-600"
      },
      {
        title: "Total Quotes",
        value: totalQuotes,
        icon: FileCheck,
        color: "bg-purple-50",
        iconColor: "text-purple-600"
      },
      {
        title: "Matched Providers",
        value: activeReqs > 0 ? "Live" : "0", 
        icon: Users,
        color: "bg-green-50",
        iconColor: "text-green-600"
      },
      {
        title: "Completed Projects",
        value: completedProjects,
        icon: CheckCircle,
        color: "bg-emerald-50",
        iconColor: "text-emerald-600"
      }
    ];
  }, [requirements, agreements]);

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || "U";
  };

  const workflowSteps = [
    { step: 1, title: "Post Requirement", description: "Submit your requirement.", icon: ClipboardCheck, color: "bg-blue-500" },
    { step: 2, title: "Get Matched", description: "We suggest providers.", icon: UserCheck, color: "bg-violet-500" },
    { step: 3, title: "Approve Quote", description: "Compare and approve.", icon: Receipt, color: "bg-indigo-500" },
    { step: 4, title: "Delivery", description: "Service is executed.", icon: Package, color: "bg-emerald-500" },
    { step: 5, title: "Closure", description: "Share feedback.", icon: MessageSquare, color: "bg-slate-500" }
  ];

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden flex flex-col justify-center">
          <div className="relative z-10 space-y-6">
            <Badge variant="outline" className="border-blue-400 text-blue-400 px-4 py-1 rounded-full uppercase text-[10px] tracking-widest font-black">
                Samadhantra Ecosystem
            </Badge>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none italic">
              Your need, <span className="text-blue-500 whitespace-nowrap">clearly defined.</span>
            </h1>
            <p className="text-slate-400 font-bold text-sm max-w-md leading-relaxed">
              Submit your technical requirements and let our engine connect you with verified industry providers.
            </p>
            <Button 
                onClick={() => navigate('/dashboard/post-requirement')}
                className="bg-blue-600 hover:bg-white hover:text-blue-600 text-white px-8 py-7 rounded-2xl font-black text-sm flex items-center gap-3 transition-all"
            >
              <Plus className="w-5 h-5" />
              Post Requirement
            </Button>
          </div>
          <div className="absolute right-[-10%] top-[-10%] w-64 h-64 bg-blue-600/10 rounded-full blur-3xl"></div>
        </div>

        <Card className="bg-white border-slate-100 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center space-y-4 shadow-sm">
          <div className="w-20 h-20 bg-slate-100 rounded-[2rem] flex items-center justify-center text-slate-800 text-2xl font-black shadow-inner">
            {getInitials(userData.full_name)}
          </div>
          <div>
            <p className="font-black text-slate-900 text-xl tracking-tight">{userData.full_name}</p>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">{userData.user_type || "Member"}</p>
          </div>
          <div className="px-4 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-100">
            Account Active
          </div>
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border-slate-50 shadow-sm rounded-[2rem] bg-white hover:shadow-md transition-all overflow-hidden p-6 flex items-center gap-5">
            <div className={`p-4 rounded-2xl ${stat.color} ${stat.iconColor}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.title}</p>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">{stat.value}</h3>
            </div>
          </Card>
        ))}
      </div>

      {/* Active Projects Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Active Projects</h2>
            <Button variant="ghost" onClick={() => navigate('/dashboard/requirements')} className="text-blue-600 font-black text-xs hover:bg-blue-50">View All</Button>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {agreements.length === 0 ? (
              <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-12 text-center flex flex-col items-center">
                <Clock className="w-10 h-10 text-slate-300 mb-4" />
                <p className="font-bold text-slate-500 text-sm">No active project agreements yet.</p>
                <Button variant="link" onClick={() => navigate('/dashboard/announcements')} className="text-blue-600 text-xs font-bold">Browse Announcements</Button>
              </div>
            ) : (
              agreements.slice(0, 3).map((agreement, idx) => (
                <Card key={idx} className="bg-white border-slate-50 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                       <h3 className="font-black text-slate-800 tracking-tight">{agreement.requirement_category}</h3>
                    </div>
                    <p className="text-xs text-slate-400 font-medium line-clamp-1">{agreement.agreed_outcome}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Budget</p>
                       <p className="text-sm font-black text-slate-800">₹{(agreement.budget || 0).toLocaleString()}</p>
                    </div>
                    <Button variant="outline" size="icon" className="rounded-xl border-slate-100" onClick={() => navigate('/dashboard/quotes')}>
                       <ArrowRight className="w-4 h-4 text-blue-600" />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Workflow Sidebar */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Ecosystem Guide</h2>
          <div className="bg-white border-slate-50 rounded-[2.5rem] p-6 shadow-sm space-y-6">
            {workflowSteps.map((step) => (
              <div key={step.step} className="flex items-start gap-4 group">
                <div className={`w-10 h-10 shrink-0 ${step.color} text-white rounded-xl flex items-center justify-center text-xs font-black shadow-lg shadow-indigo-100 group-hover:scale-110 transition-all`}>
                  <step.icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-800 tracking-tight">{step.title}</h4>
                  <p className="text-xs text-slate-400 font-medium">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Badge = ({ children, variant, className }) => (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}>
        {children}
    </span>
);

export default Dashboard;
