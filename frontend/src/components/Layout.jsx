import React from 'react';
import Sidebar from './Sidebar';
import AIChatbot from './AIChatbot';

const Layout = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-[#fdfcfb] w-full font-['Inter'] selection:bg-blue-100 selection:text-blue-900">
            {/* Sidebar Container */}
            <div className="hidden lg:block w-80 flex-shrink-0 h-screen sticky top-0">
                <Sidebar />
            </div>

            {/* Main Workspace */}
            <div className="flex-1 flex flex-col min-h-screen min-w-0">
                <main className="flex-1 p-8 md:p-12 lg:p-20 fade-in">
                    <div className="max-w-7xl mx-auto w-full">
                        {children}
                    </div>
                </main>
            </div>

            {/* AI Assistant FAB */}
            <AIChatbot />
        </div>
    );
};

export default Layout;
