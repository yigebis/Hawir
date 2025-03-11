
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Calendar, Users, FileText, Play, Truck } from "lucide-react";

const Sidebar: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  return (
    <aside className="bg-[#f5f7fa] flex w-full flex-col items-stretch text-black mx-auto pt-8 pb-8 px-6 h-full">
      <div className="flex items-center gap-4 mb-8">
        <img
          src="/lovable-uploads/47aebb02-8e59-453a-b05a-3a24d2ac114f.png"
          alt="Selam Bus Logo"
          className="w-10 h-10 object-contain"
        />
        <div className="text-lg font-semibold">Selam Bus</div>
      </div>
      
      <nav className="mt-6">
        <ul className="flex flex-col gap-6">
          <li>
            <Link to="/" className="block">
              <div className="relative">
                <div className={`${path === '/' ? 'bg-[#F35B04]' : 'bg-transparent'} absolute inset-0 w-full h-10 rounded-md`} />
                <div className="relative z-10 flex items-center gap-4 px-3 py-2">
                  <div className="flex items-center justify-center w-6 h-6">
                    <Calendar className={`${path === '/' ? 'text-white' : 'text-[#333]'} w-5 h-5`} />
                  </div>
                  <span className={`${path === '/' ? 'text-white' : 'text-[#333]'} text-[15px] font-medium`}>
                    Dashboard
                  </span>
                </div>
              </div>
            </Link>
          </li>
          <li>
            <Link to="/manage-travels" className="block">
              <div className="relative">
                <div className={`${path === '/manage-travels' ? 'bg-[#F35B04]' : 'bg-transparent'} absolute inset-0 w-full h-10 rounded-md`} />
                <div className="relative z-10 flex items-center gap-4 px-3 py-2">
                  <div className="flex items-center justify-center w-6 h-6">
                    <Calendar className={`${path === '/manage-travels' ? 'text-white' : 'text-[#333]'} w-5 h-5`} />
                  </div>
                  <span className={`${path === '/manage-travels' ? 'text-white' : 'text-[#333]'} text-sm font-medium`}>
                    Manage Travels
                  </span>
                </div>
              </div>
            </Link>
          </li>
          <li>
            <div className="flex items-center gap-4 px-3 py-2">
              <div className="flex items-center justify-center w-6 h-6">
                <Users className="text-[#333] w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-[#333]">
                Customers
              </span>
            </div>
          </li>
          <li>
            <div className="flex items-center gap-4 px-3 py-2">
              <div className="flex items-center justify-center w-6 h-6">
                <FileText className="text-[#333] w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-[#333]">Reports</span>
            </div>
          </li>
          <li>
            <div className="flex items-center gap-4 px-3 py-2">
              <div className="flex items-center justify-center w-6 h-6">
                <Play className="text-[#333] w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-[#333]">Tours</span>
            </div>
          </li>
          <li>
            <div className="flex items-center gap-4 px-3 py-2">
              <div className="flex items-center justify-center w-6 h-6">
                <Truck className="text-[#333] w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-[#333]">Fleet</span>
            </div>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
