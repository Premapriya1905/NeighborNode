import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, Users, Shield, Star, ArrowRight, Sparkles, Heart, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: Users,
      title: 'Connect Locally',
      description: 'Find trusted neighbors offering services in your building or street'
    },
    {
      icon: Shield,
      title: 'Verified Trust',
      description: 'Verified residents with ratings and reviews you can rely on'
    },
    {
      icon: Star,
      title: 'Easy Booking',
      description: 'Simple booking system with real-time notifications'
    },
    {
      icon: Heart,
      title: 'Community First',
      description: 'Build meaningful connections while getting things done'
    }
  ];

  const categories = [
    { name: 'Home Services', emoji: '🏠', count: 124 },
    { name: 'Tutoring', emoji: '📚', count: 89 },
    { name: 'Pet Care', emoji: '🐕', count: 56 },
    { name: 'Tech Support', emoji: '💻', count: 78 },
    { name: 'Fitness', emoji: '💪', count: 45 },
    { name: 'Creative', emoji: '🎨', count: 67 },
  ];

  const stats = [
    { number: '1,200+', label: 'Active Neighbors' },
    { number: '500+', label: 'Services Posted' },
    { number: '3,000+', label: 'Bookings Completed' },
    { number: '4.8', label: 'Average Rating' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 pattern-dots text-primary-500"></div>
        
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 mb-6"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Your Hyperlocal Community Marketplace</span>
            </motion.div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold mb-6">
              Connect with{' '}
              <span className="gradient-text">Neighbors</span>
              <br />
              Through Services
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
              Discover trusted local services, share your skills, and build meaningful relationships right in your neighborhood.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/services" className="btn btn-primary text-lg px-8 py-4 w-full sm:w-auto">
                <Search className="w-5 h-5" />
                Browse Services
                <ArrowRight className="w-5 h-5" />
              </Link>
              {!isAuthenticated && (
                <Link to="/register" className="btn btn-outline text-lg px-8 py-4 w-full sm:w-auto">
                  Get Started Free
                </Link>
              )}
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-500" />
                <span>Verified Neighbors</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>Trusted Reviews</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-blue-500" />
                <span>Top Rated Services</span>
              </div>
            </div>
          </motion.div>

          {/* Hero Image/Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-16 max-w-5xl mx-auto"
          >
            <div className="relative">
              <div className="glass-strong rounded-3xl shadow-soft-lg p-8 backdrop-blur-xl">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {stats.map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="text-center"
                    >
                      <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                        {stat.number}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {stat.label}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-800">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Why Choose <span className="gradient-text">NeighborNode</span>?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Built for community trust and convenience, right in your neighborhood
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card-glass p-6 hover:scale-105 transition-transform duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center mb-4 shadow-glow">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Popular Categories
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Find services that match your needs
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                className="card-hover p-6 text-center cursor-pointer"
              >
                <div className="text-4xl mb-3">{category.emoji}</div>
                <h3 className="font-semibold mb-1">{category.name}</h3>
                <p className="text-sm text-gray-500">{category.count} services</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link to="/services" className="btn btn-outline">
              View All Categories
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center text-white"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Ready to Connect with Your Community?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of neighbors sharing skills and building trust
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn bg-white text-primary-600 hover:bg-gray-100 text-lg px-8 py-4">
                Sign Up Now
              </Link>
              <Link to="/services" className="btn border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-4">
                Explore Services
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
