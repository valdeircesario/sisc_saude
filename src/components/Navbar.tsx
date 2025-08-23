import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, LogIn, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar: React.FC = () => {
  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link 
            to="/" 
            className="flex items-center space-x-3 text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
          >
            <Heart className="h-8 w-8 text-red-500" />
            <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              SISC-Saúde
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            <Link
              to="/cadastro-paciente"
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <UserPlus className="h-4 w-4" />
              <span>Cadastre-se</span>
            </Link>
            
            <Link
              to="/login-paciente"
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <LogIn className="h-4 w-4" />
              <span>Entrar</span>
            </Link>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;