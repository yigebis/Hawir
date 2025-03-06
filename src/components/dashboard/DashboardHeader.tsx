import React from "react";

const DashboardHeader: React.FC = () => {
  return (
    <header className="flex w-full items-stretch gap-5 flex-wrap justify-between max-md:max-w-full">
      <h1 className="text-[rgba(243,91,4,1)] text-base font-bold tracking-[2.4px] my-auto">
        Dashboard
      </h1>
      <div className="flex items-stretch gap-[40px_66px]">
        <div className="border flex items-stretch gap-[40px_46px] text-[11px] text-[rgba(153,153,153,1)] font-light px-3.5 py-[7px] rounded-[10px] border-[rgba(3,3,3,1)] border-solid">
          <input
            type="text"
            placeholder="Search for destination"
            className="bg-transparent outline-none"
          />
          <button aria-label="Search">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/091e50b0e3084a89a54855377607a220/b8945386bc8c20206a2c7c5a7564b27fe697c89fe1f7227ff244d788ba9024b4?placeholderIfAbsent=true"
              alt="Search Icon"
              className="aspect-[1] object-contain w-4 shrink-0"
            />
          </button>
        </div>
        <div className="flex items-stretch gap-[19px] my-auto">
          <button aria-label="Notifications">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/091e50b0e3084a89a54855377607a220/f12fb339959c89948074b4a33ef1654a79bbe2507fb39648f7ea95ea0bf2ed29?placeholderIfAbsent=true"
              alt="Notification Icon"
              className="aspect-[1] object-contain w-[17px] shrink-0 my-auto"
            />
          </button>
          <button aria-label="Profile">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/091e50b0e3084a89a54855377607a220/ad25af35a3fc99a57279047e9e412bd9b1ada2fc5f7b181badba5af32a8ab495?placeholderIfAbsent=true"
              alt="Profile Icon"
              className="aspect-[1] object-contain w-[23px] shrink-0"
            />
          </button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
