
import React from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  return (
    <aside className="bg-[rgba(243,246,250,1)] flex w-full flex-col items-stretch text-black mx-auto pt-[30px] pb-[441px] px-4 max-md:mt-6 max-md:pb-[100px]">
      <div className="flex items-stretch gap-[13px] text-[15px] font-semibold leading-none ml-2.5">
        <img
          src="https://cdn.builder.io/api/v1/image/assets/091e50b0e3084a89a54855377607a220/641273b6196bb7c5fbc8634b7c433a5e44d67b761f08127ff70cd2a1af3bdcfa?placeholderIfAbsent=true"
          alt="Selam Bus Logo"
          className="aspect-[0.95] object-contain w-9 shrink-0"
        />
        <div className="my-auto">Selam Bus</div>
      </div>
      <div className="bg-[rgba(0,0,0,0.22)] flex shrink-0 h-px mt-[18px]" />

      <nav className="mt-11">
        <ul className="flex flex-col gap-4">
          <li>
            <Link to="/" className="block">
              <div className="relative">
                <div className={`${path === '/' ? 'bg-[rgba(243,91,4,1)]' : 'bg-transparent'} absolute inset-0 w-[146px] h-[34px] rounded-[5px]`} />
                <div className="relative z-10 flex items-center gap-[11px] pl-2 py-2">
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets/091e50b0e3084a89a54855377607a220/717bbb1e8d3120a2eee3c7e0586da1875fa30e019232df1d67d43c8a388413b8?placeholderIfAbsent=true"
                    alt="Dashboard Icon"
                    className="aspect-[1] object-contain w-6 shrink-0"
                  />
                  <span className={`${path === '/' ? 'text-white' : 'text-black'} text-[15px] font-semibold leading-none`}>
                    Dashboard
                  </span>
                </div>
              </div>
            </Link>
          </li>
          <li>
            <Link to="/manage-travels" className="block">
              <div className="relative">
                <div className={`${path === '/manage-travels' ? 'bg-[rgba(243,91,4,1)]' : 'bg-transparent'} absolute inset-0 w-[146px] h-[34px] rounded-[5px]`} />
                <div className="relative z-10 flex items-center gap-[11px] pl-2 py-2">
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets/091e50b0e3084a89a54855377607a220/ce569e8fac2f33fd8b6b9baaf9a1a608536d8eeb9eb61cbcb9d73c1bc064b63f?placeholderIfAbsent=true"
                    alt="Manage Travels Icon"
                    className="aspect-[1] object-contain w-6 shrink-0"
                  />
                  <span className={`${path === '/manage-travels' ? 'text-white' : 'text-black'} text-sm font-medium leading-none`}>
                    Manage Travels
                  </span>
                </div>
              </div>
            </Link>
          </li>
          <li>
            <div className="flex items-center gap-[11px] pl-2 py-2">
              <img
                src="https://cdn.builder.io/api/v1/image/assets/091e50b0e3084a89a54855377607a220/508be3be296baa6b39d8d6a71ce791e36dc90774322ee153935148d2f91a49d8?placeholderIfAbsent=true"
                alt="Customers Icon"
                className="aspect-[1] object-contain w-[26px] shrink-0"
              />
              <span className="text-sm font-medium leading-none">
                Customers
              </span>
            </div>
          </li>
          <li>
            <div className="flex items-center gap-[11px] pl-2 py-2">
              <img
                src="https://cdn.builder.io/api/v1/image/assets/091e50b0e3084a89a54855377607a220/5d1aee4a76e528dd8cc63bec7f10b603f276fbbc7b3762f31afe03be58c998db?placeholderIfAbsent=true"
                alt="Reports Icon"
                className="aspect-[1] object-contain w-6 shrink-0"
              />
              <span className="text-sm font-medium leading-none">Reports</span>
            </div>
          </li>
          <li>
            <div className="flex items-center gap-[11px] pl-2 py-2">
              <img
                src="https://cdn.builder.io/api/v1/image/assets/091e50b0e3084a89a54855377607a220/81453af59fc1f10e9f7786cdd0931180dca359e1869aed968f2bbfe1b0e269f4?placeholderIfAbsent=true"
                alt="Tours Icon"
                className="aspect-[1] object-contain w-[25px] shrink-0"
              />
              <span className="text-sm font-medium leading-none">Tours</span>
            </div>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
