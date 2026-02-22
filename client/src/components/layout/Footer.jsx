import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Mail, Heart } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 py-12">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">N</span>
              </div>
              <span className="text-2xl font-display font-bold gradient-text">
                NeighborNode
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
              Connecting neighbors through skills, services, and trust. Building stronger communities, one service at a time.
            </p>
            <div className="flex gap-3">
              <a href="#" className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors">
                <Twitter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </a>
              <a href="#" className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors">
                <Github className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </a>
              <a href="#" className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors">
                <Linkedin className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </a>
              <a href="#" className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors">
                <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/services" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Browse Services
                </Link>
              </li>
              <li>
                <Link to="/create-service" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Post a Service
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Safety Guidelines
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-600 dark:text-gray-400 text-sm text-center md:text-left">
            © {currentYear} NeighborNode. All rights reserved.
          </p>
          <p className="text-gray-600 dark:text-gray-400 text-sm flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-red-500 fill-current" /> for local communities
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;