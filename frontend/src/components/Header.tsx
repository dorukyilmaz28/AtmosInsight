'use client';

import { motion } from 'framer-motion';
import { Cloud } from 'lucide-react';

interface HeaderProps {
  // Navigation removed - only language toggle needed
  children?: React.ReactNode;
}

export default function Header({}: HeaderProps) {

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="sticky top-0 z-50 bg-gray-800/50 backdrop-blur-md border-b border-gray-600/30"
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <motion.div 
            className="flex items-center space-x-2 sm:space-x-3"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
              <Cloud className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white">AtmosInsight</h1>
              <p className="text-xs text-gray-300 -mt-1 hidden sm:block">NASA Space Apps</p>
            </div>
          </motion.div>

          {/* Language Indicator */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="flex items-center space-x-1 bg-gray-800/50 rounded-lg p-1 border border-gray-600/30">
              <span className="px-2 sm:px-3 py-1 text-xs font-medium text-white bg-cyan-500/20 border border-cyan-400/50 rounded-md">
                EN
              </span>
            </div>
          </div>
        </div>

      </div>
    </motion.header>
  );
}
