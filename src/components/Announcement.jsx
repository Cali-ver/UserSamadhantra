import { useEffect, useState, useMemo } from "react";
import { getActiveAnnouncements, getAllRequirements } from "../services/api";
import SubmitBidModal from "./SubmitBidModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Hammer, User, Clock, LayoutGrid, ListFilter, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const categories = [
  "All",
  "Business & Startup Services",
  "Technology & Digital Solutions",
  "Education & Skill Development",
  "Talent, Internship & Hiring",
  "Investment & Funding",
  "Legal, Compliance & Governance",
  "Marketing, Sales & Growth",
  "Infrastructure & Operations",
  "Research, Innovation & Consulting",
  "Government, CSR & Public Programs",
  "Other"
];

const Announcements = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedReq, setSelectedReq] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState("active"); // "active" or "all"
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const currentUserId = localStorage.getItem('registeredUserId');

  useEffect(() => {
    fetchData();
  }, [viewMode, currentPage]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      let result;
      
      if (viewMode === "active") {
        result = await getActiveAnnouncements();
      } else {
        const skip = (currentPage - 1) * itemsPerPage;
        result = await getAllRequirements(skip, itemsPerPage);
      }

      if (result && (result.status || Array.isArray(result) || result.data)) {
         let items = [];
         if (Array.isArray(result)) {
           items = result;
         } else if (result.data && Array.isArray(result.data)) {
           items = result.data;
         } else if (result.requirements && Array.isArray(result.requirements)) {
           items = result.requirements;
         }
         setData(items);
      } else {
        setError("No data received from service.");
      }
    } catch (err) {
      console.error(err);
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    if (selectedCategory === "All") return data;
    return data.filter(item => item.requirement_category === selectedCategory);
  }, [data, selectedCategory]);

  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const toggleViewMode = () => {
    setViewMode(prev => prev === "active" ? "all" : "active");
    setCurrentPage(1);
    setSelectedCategory("All");
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] gap-4 bg-white rounded-xl border border-slate-200">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <div className="text-center">
            <p className="font-bold text-slate-800 uppercase tracking-widest text-xs">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header Area */}
      <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <Badge variant="outline" className="text-indigo-600 border-indigo-100 px-3 py-1 rounded-full uppercase text-[10px] tracking-widest font-bold">
                {viewMode === "active" ? "Announcements" : "Library Hub"}
            </Badge>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Explore <span className="text-indigo-600">Opportunities</span>
            </h1>
            <p className="text-slate-500 text-sm max-w-lg">
              Targeted matching based on industry domains and technical requirements.
            </p>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-lg self-start lg:self-center border border-slate-200">
              <Button 
                  onClick={() => viewMode !== "active" && toggleViewMode()}
                  variant={viewMode === "active" ? "default" : "ghost"}
                  className="rounded-md h-10 px-6 font-bold text-xs"
              >
                  <LayoutGrid className="w-4 h-4 mr-2" />
                  Active
              </Button>
              <Button 
                  onClick={() => viewMode !== "all" && toggleViewMode()}
                  variant={viewMode === "all" ? "default" : "ghost"}
                  className="rounded-md h-10 px-6 font-bold text-xs"
              >
                  <ListFilter className="w-4 h-4 mr-2" />
                  View All
              </Button>
          </div>
        </div>

        {/* Categories Filter Dropdown */}
        <div className="pt-6 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div className="flex items-center gap-2">
             <Filter className="w-4 h-4 text-slate-400" />
             <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">Industry Domain</h4>
           </div>
           
           <div className="w-full md:w-64">
              <Select 
                value={selectedCategory} 
                onValueChange={(val) => {
                  setSelectedCategory(val);
                  if (viewMode === "all") setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-10 rounded-md border-slate-200 bg-white font-bold text-xs text-slate-700">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat} className="text-xs">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
           </div>
        </div>
      </div>

      {/* Grid Content */}
      {filteredData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-200">
          <Clock className="w-12 h-12 text-slate-200 mb-4" />
          <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-slate-800">No Matching needs</h3>
              <p className="text-slate-500 text-sm">
                  No one has posted a requirement in the "{selectedCategory}" domain yet.
              </p>
          </div>
          <Button 
            onClick={() => {
               setSelectedCategory("All");
               if (data.length === 0) toggleViewMode();
            }} 
            variant="outline" 
            className="mt-6 font-bold"
          >
              Browse All categories
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredData.map((item, idx) => (
              <div
                key={item.id || idx}
                className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-3 w-full">
                    <div className="flex flex-wrap items-center gap-2">
                       <Badge variant="outline" className="bg-slate-50 text-indigo-600 text-[10px] font-bold px-2 py-0.5 rounded-md">
                          {item.requirement_category}
                       </Badge>
                       <Badge variant="secondary" className="text-[10px] font-bold px-2 py-0.5">
                          Verified Lead
                       </Badge>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 line-clamp-1">
                      {item.requirement_category}
                    </h3>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-slate-600 text-sm italic">
                      "{item.problem_description}"
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Closes</span>
                      <span className="text-xs font-bold text-slate-600">{formatDate(item.expires_at)}</span>
                    </div>
                  </div>

                  {String(item.user_id) === String(currentUserId) ? (
                    <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                      <User className="w-4 h-4" />
                      Admin View
                    </div>
                  ) : (
                    <Button
                      onClick={() => {
                        setSelectedReq(item);
                        setIsModalOpen(true);
                      }}
                      className="bg-indigo-600 text-white px-6 py-2 rounded-md font-bold text-sm"
                    >
                      <Hammer className="w-4 h-4 mr-2" />
                      Submit Proposal
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Component */}
          {viewMode === "all" && (
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Showing {((currentPage - 1) * itemsPerPage) + 1} - {((currentPage - 1) * itemsPerPage) + data.length} results
              </p>
              
              <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className="w-10 h-10 p-0"
                >
                    <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <Button variant="default" className="w-10 h-10 font-bold bg-indigo-600 text-white">
                    {currentPage}
                </Button>
                
                {data.length === itemsPerPage && (
                     <Button
                        variant="outline"
                        onClick={() => setCurrentPage(p => p + 1)}
                        className="w-10 h-10 font-bold"
                    >
                        {currentPage + 1}
                    </Button>
                )}

                <Button
                    variant="outline"
                    disabled={data.length < itemsPerPage}
                    onClick={() => setCurrentPage(p => p + 1)}
                    className="w-10 h-10 p-0"
                >
                    <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedReq && (
        <SubmitBidModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          requirementId={selectedReq.requirement_id}
          requirementCategory={selectedReq.requirement_category}
          requirementUserId={selectedReq.user_id}
        />
      )}
    </div>
  );
};

export default Announcements;