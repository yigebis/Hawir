import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  FileBarChart, 
  Map, 
  Bus,
  ChevronDown,
  User,
  Lock,
  LogOut
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Sidebar = () => {
  const location = useLocation();
  const path = location.pathname;
  const { user, logout } = useAuth();

  const isActive = (routePath: string) => {
    if (routePath === '/' && path === '/') {
      return true;
    }
    if (routePath !== '/' && path.startsWith(routePath)) {
      return true;
    }
    return false;
  };

  return (
    <aside className="bg-[#F3F6FA] flex w-[260px] min-w-[260px] h-screen flex-col items-stretch text-black pt-[30px] pb-[30px] border-r border-gray-200">
      <div className="flex items-center gap-[13px] text-[15px] font-semibold leading-none ml-6 mb-8">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center space-x-2 hover:bg-gray-100 rounded-lg p-1 px-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/lovable-uploads/660fb2a5-c2d9-4b43-80bb-40e54215ee9d.png" alt="Selam Bus" />
                <AvatarFallback>SB</AvatarFallback>
              </Avatar>
              <div className="flex items-center">
                <span className="text-sm font-medium mr-1">{user.name}</span>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
              <p className="text-xs text-gray-500">Agency ID: {user?.agencyId}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/profile" className="flex cursor-pointer items-center">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/change-password" className="flex cursor-pointer items-center">
                <Lock className="mr-2 h-4 w-4" />
                <span>Change Password</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-red-600 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="border-t border-gray-200 mb-6"></div>

      <nav className="px-4">
        <ul className="flex flex-col gap-3">
          <li>
            <Link 
              to="/" 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive('/') 
                  ? 'bg-[#F35B04] text-white' 
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="text-[15px] font-medium">Dashboard</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/manage-travels" 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive('/manage-travels') 
                  ? 'bg-[#F35B04] text-white' 
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span className="text-[15px] font-medium">Manage Travels</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/customers" 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive('/customers') 
                  ? 'bg-[#F35B04] text-white' 
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="text-[15px] font-medium">Customers</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/reports" 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive('/reports') 
                  ? 'bg-[#F35B04] text-white' 
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FileBarChart className="w-5 h-5" />
              <span className="text-[15px] font-medium">Reports</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/tours" 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive('/tours') 
                  ? 'bg-[#F35B04] text-white' 
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Map className="w-5 h-5" />
              <span className="text-[15px] font-medium">Tours</span>
            </Link>
          </li>
          <li>
            <Link 
              to="/fleet" 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive('/fleet') 
                  ? 'bg-[#F35B04] text-white' 
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Bus className="w-5 h-5" />
              <span className="text-[15px] font-medium">Fleet</span>
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
