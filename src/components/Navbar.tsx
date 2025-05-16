
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="w-full border-b border-gray-100 py-4 bg-white/80 backdrop-blur-md z-50">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="text-xl font-medium text-gray-900">
            YourApp
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/dashboard" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Dashboard
          </Link>
          <a href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Features
          </a>
          <a href="#about" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            About
          </a>
          <a href="#contact" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Contact
          </a>
          <Button size="sm" className="bg-[#9b87f5] hover:bg-[#7E69AB] text-white">
            Get Started
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-600 hover:text-gray-900 focus:outline-none"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute w-full bg-white border-b border-gray-100 shadow-lg z-50">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <Link
              to="/dashboard"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
            <a
              href="#features"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </a>
            <a
              href="#about"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </a>
            <a
              href="#contact"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </a>
            <Button size="sm" className="bg-[#9b87f5] hover:bg-[#7E69AB] text-white w-full">
              Get Started
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
