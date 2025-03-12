
import React from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

const Index: React.FC = () => {
  return (
    <DashboardLayout showHeader={true}>
      <div className="p-4">
        <h1 className="text-2xl font-bold text-[#F35B04] mb-6">Welcome to Selam Bus Dashboard</h1>
        <p className="text-gray-600">Select an option from the sidebar to get started.</p>
      </div>
    </DashboardLayout>
  );
};

export default Index;
