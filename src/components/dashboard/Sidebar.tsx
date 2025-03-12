
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  FileBarChart, 
  Map, 
  Bus 
} from "lucide-react";

const Sidebar: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

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
        <img
          src="https://cdn.builder.io/api/v1/image/assets/091e50b0e3084a89a54855377607a220/641273b6196bb7c5fbc8634b7c433a5e44d67b761f08127ff70cd2a1af3bdcfa?placeholderIfAbsent=true"
          alt="Selam Bus Logo"
          className="aspect-[0.95] object-contain w-9 shrink-0"
        />
        <div className="my-auto">Selam Bus</div>
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
