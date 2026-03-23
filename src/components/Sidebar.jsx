import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  PlusCircle,
  FileText,
  Users,
  Receipt,
  FolderOpen,
  CheckCircle,
  Star,
  User,
  Wallet,
  Settings,
  ChevronDown,
  ChevronRight,
  X
} from "lucide-react";
import samadhantraLogo from "@/assets/samadhantra-logo.jpeg";

const Sidebar = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({
    mainMenu: true,
    myProjects: true,
    account: true
  });

  const toggleMenu = (menu) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const mainMenuItems = [
    { name: "Dashboard", path: "/dashboard", icon: Home },
    { name: "Post New Requirement", path: "/dashboard/post-requirement", icon: PlusCircle },
    { name: "My Requirements", path: "/dashboard/requirements", icon: FileText, badge: 3 },
    { name: "Active Announcements", path: "/dashboard/announcements", icon: Users },
    { name: "Quotes & Proposals", path: "/dashboard/quotes", icon: Receipt, badge: 5 }
  ];

  const projectItems = [
    { name: "Active Projects", path: "/dashboard/active-projects", icon: FolderOpen, badge: 2 },
    { name: "Completed Projects", path: "/dashboard/completed-projects", icon: CheckCircle },
    { name: "Reviews & Feedback", path: "/dashboard/reviews", icon: Star }
  ];

  const accountItems = [
    { name: "My Profile", path: "/dashboard/profile", icon: User },
    { name: "Payments & Wallet", path: "/dashboard/payments", icon: Wallet },
    { name: "Settings", path: "/dashboard/settings", icon: Settings }
  ];

  const isActive = (path) => location.pathname === path;

  const renderMenuItem = (item) => (
    <NavLink
      key={item.path}
      to={item.path}
      className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
        isActive(item.path)
          ? "bg-blue-600 text-white shadow-md"
          : "text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400"
      }`}
    >
      <div className="flex items-center gap-3">
        <item.icon className="w-5 h-5" />
        <span>{item.name}</span>
      </div>
      {item.badge && (
        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
          isActive(item.path) 
            ? "bg-white text-blue-600" 
            : "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400"
        }`}>
          {item.badge}
        </span>
      )}
    </NavLink>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky lg:top-0 inset-y-0 left-0 z-50 w-64 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out flex-shrink-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <img src={samadhantraLogo} alt="Samadhantra" className="h-10 w-auto object-contain" />
          <button
            onClick={onToggle}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav p-4 space-y-6 overflow-y-auto h-[calc(100vh-4rem)]" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {/* Main Menu Section */}
          <div>
            <button
              onClick={() => toggleMenu("mainMenu")}
              className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider hover:text-gray-600 dark:hover:text-gray-300"
            >
              <span>Main Menu</span>
              {expandedMenus.mainMenu ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>

            {expandedMenus.mainMenu && (
              <div className="mt-2 space-y-1">
                {mainMenuItems.map(renderMenuItem)}
              </div>
            )}
          </div>

          {/* My Projects Section */}
          <div>
            <button
              onClick={() => toggleMenu("myProjects")}
              className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider hover:text-gray-600 dark:hover:text-gray-300"
            >
              <span>My Projects</span>
              {expandedMenus.myProjects ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>

            {expandedMenus.myProjects && (
              <div className="mt-2 space-y-1">
                {projectItems.map(renderMenuItem)}
              </div>
            )}
          </div>

          {/* Account Section */}
          <div>
            <button
              onClick={() => toggleMenu("account")}
              className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider hover:text-gray-600 dark:hover:text-gray-300"
            >
              <span>Account</span>
              {expandedMenus.account ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>

            {expandedMenus.account && (
              <div className="mt-2 space-y-1">
                {accountItems.map(renderMenuItem)}
              </div>
            )}
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
