import React from 'react';
import Sidebar from './Sidebar';
import AIChatbot from './AIChatbot';

const Layout = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-[#f8fafc] w-full font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
            {/* Unified Sidebar */}
            <div className="hidden lg:block w-72 flex-shrink-0 h-screen sticky top-0 bg-white border-r border-gray-100 z-50">
                <Sidebar />
            </div>

            {/* Expansive Main Surface */}
            <div className="flex-1 flex flex-col min-h-screen min-w-0">
                <main className="flex-1 p-8 md:p-12 w-full animate-in fade-in duration-500">
                    <div className="max-w-[1600px] mx-auto w-full">
                        {children}
                    </div>
                </main>
            </div>

            {/* Integrated AI Assistant */}
            <AIChatbot />
        </div>
    );
};

export default Layout;
