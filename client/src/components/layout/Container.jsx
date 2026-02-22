import { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

const Container = ({ children, showFooter = true }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950">
      {/* Navbar */}
      <Navbar onMenuClick={() => setIsSidebarOpen(true)} />

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <main className="flex-1 pt-20 pb-12">{children}</main>

      {/* Footer */}
      {showFooter && <Footer />}
    </div>
  );
};

export default Container;
