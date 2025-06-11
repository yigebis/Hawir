
import React from "react";
import { useTranslation } from 'react-i18next';
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import NotificationDropdown from "@/components/notifications/NotificationDropdown";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

const DashboardHeader = () => {
  const { t } = useTranslation();
  const { agency } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleNotificationClick = () => {
    navigate('/notifications');
  };

  return (
    <header className="bg-white border-b border-gray-200 px-3 sm:px-6 py-4">
      <div className="flex justify-between items-center">
        <div className="flex-1 min-w-0">
          <h1 className={`font-bold text-gray-900 ${isMobile ? 'text-lg' : 'text-2xl'} truncate`}>
            {agency?.name || "Hawir Travel Agency"}
          </h1>
          <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'} truncate`}>
            {t('dashboard.title')}
          </p>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
          <Button variant="ghost" size="sm" onClick={handleNotificationClick}>
            <Bell className="h-5 w-5" />
          </Button>
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
