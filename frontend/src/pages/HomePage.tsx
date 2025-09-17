import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Users,
  Briefcase,
  GraduationCap,
  Building2,
  ArrowRight,
  Globe,
  Heart,
} from "lucide-react";
import { motion } from "framer-motion";

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <Briefcase className="w-8 h-8 text-pink-400" />,
      title: "Job Board",
      description:
        "Discover opportunities posted by alumni. Find internships, full-time positions, and referrals from your network.",
      link: "/referrals",
    },
    {
      icon: <Users className="w-8 h-8 text-pink-400" />,
      title: "Alumni Network",
      description:
        "Connect with fellow IIIT Ranchi alumni, share experiences, and build professional relationships across industries.",
      link: "#",
    },
    {
      icon: <GraduationCap className="w-8 h-8 text-pink-400" />,
      title: "Mentorship",
      description:
        "Get guidance from experienced IIIT Ranchi alumni or mentor current students to give back to your community.",
      link: "#",
    },
    {
      icon: <Building2 className="w-8 h-8 text-pink-400" />,
      title: "Company Insights",
      description:
        "Learn about companies from IIIT Ranchi alumni who work there. Get insider information about culture and opportunities.",
      link: "#",
    },
  ];

  const stats = [
    { number: "500+", label: "IIIT Ranchi Alumni" },
    { number: "50+", label: "Job Postings" },
    { number: "25+", label: "Companies" },
    { number: "95%", label: "Success Rate" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-8 pb-32 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"
            animate={{
              x: [0, -100, 0],
              y: [0, 50, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <span className="bg-gradient-to-r from-pink-400 via-red-400 to-pink-600 bg-clip-text text-transparent">
                Connect. Grow.
              </span>
              <br />
              <span className="bg-gradient-to-r from-red-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
                Succeed.
              </span>
            </motion.h1>
            <motion.p
              className="text-lg sm:text-xl text-gray-300 mb-8 sm:mb-12 max-w-2xl mx-auto font-medium px-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Join our vibrant IIIT Ranchi alumni community and unlock
              opportunities for career growth, mentorship, and professional
              networking. This is an unofficial platform created by alumni, for
              alumni.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center px-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              {!isAuthenticated ? (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/login"
                    className="btn btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto"
                  >
                    Join Our Network
                  </Link>
                </motion.div>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/referrals"
                    className="btn btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 flex items-center justify-center w-full sm:w-auto"
                  >
                    Explore Jobs
                    <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                  </Link>
                </motion.div>
              )}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/referrals"
                  className="btn btn-secondary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto"
                >
                  Browse Opportunities
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 sm:py-20 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="glass-card p-4 sm:p-6">
                  <div className="bg-gradient-to-br from-pink-400 to-red-500 bg-clip-text text-transparent text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300">
                    {stat.number}
                  </div>
                  <div className="text-gray-300 font-medium text-sm sm:text-base">
                    {stat.label}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12 sm:mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything you need to{" "}
              <span className="bg-gradient-to-r from-pink-400 to-red-500 bg-clip-text text-transparent">
                thrive
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto px-4">
              Our unofficial IIIT Ranchi alumni platform provides all the tools
              and connections you need for professional success
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="card-3d p-6 sm:p-8 group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4">
                  <div className="flex-shrink-0 p-3 bg-gradient-to-br from-pink-500/20 to-red-500/20 rounded-xl group-hover:from-pink-500/30 group-hover:to-red-500/30 transition-all duration-300">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 group-hover:text-pink-400 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-300 mb-4 text-sm sm:text-base">
                      {feature.description}
                    </p>
                    <Link
                      to={feature.link}
                      className="inline-flex items-center bg-gradient-to-r from-pink-400 to-red-500 bg-clip-text text-transparent hover:from-pink-500 hover:to-red-600 transition-all duration-300 font-medium text-sm sm:text-base"
                    >
                      Learn more <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-16 sm:py-20 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12 sm:mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              How it{" "}
              <span className="bg-gradient-to-r from-pink-400 to-red-500 bg-clip-text text-transparent">
                works
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 px-4">
              Get started in three simple steps
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {[
              {
                step: "1",
                title: "Sign Up",
                description:
                  "Create your profile as an IIIT Ranchi alumni or current student and verify your credentials",
              },
              {
                step: "2",
                title: "Connect",
                description:
                  "Join the network, update your profile, and start connecting with fellow IIIT Ranchi alumni",
              },
              {
                step: "3",
                title: "Grow",
                description:
                  "Explore opportunities, share knowledge, and advance your career together",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                className="text-center group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="glass-card p-6 sm:p-8">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-pink-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 pulse-glow">
                    <span className="text-white font-bold text-lg sm:text-xl">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 group-hover:text-pink-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-300 text-sm sm:text-base">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-pink-500/20 via-red-500/20 to-purple-500/20"
            animate={{
              background: [
                "linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(239, 68, 68, 0.2) 50%, rgba(168, 85, 247, 0.2) 100%)",
                "linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(236, 72, 153, 0.2) 50%, rgba(239, 68, 68, 0.2) 100%)",
                "linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(168, 85, 247, 0.2) 50%, rgba(236, 72, 153, 0.2) 100%)",
              ],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to join our community?
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl mx-auto px-4">
              Connect with fellow IIIT Ranchi alumni, discover new
              opportunities, and take your career to the next level through our
              community-driven platform.
            </p>
            {!isAuthenticated ? (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/login"
                  className="btn btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4"
                >
                  Get Started Today
                </Link>
              </motion.div>
            ) : (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/referrals"
                  className="btn btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4"
                >
                  Explore Opportunities
                </Link>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="glass-card mx-4 mb-4 py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-red-500 rounded-lg flex items-center justify-center pulse-glow">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
                <span className="text-xl font-bold text-white">Alumniiio</span>
              </div>
              <p className="text-gray-300 text-sm sm:text-base">
                An unofficial platform connecting IIIT Ranchi alumni and
                students for professional growth and success.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-white">Quick Links</h3>
              <ul className="space-y-2 text-gray-300 text-sm sm:text-base">
                <li>
                  <Link
                    to="/referrals"
                    className="hover:text-pink-400 transition-colors"
                  >
                    Job Board
                  </Link>
                </li>
                <li>
                  <Link
                    to="/login"
                    className="hover:text-pink-400 transition-colors"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:text-pink-400 transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-pink-400 transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-white">Resources</h3>
              <ul className="space-y-2 text-gray-300 text-sm sm:text-base">
                <li>
                  <a href="#" className="hover:text-pink-400 transition-colors">
                    Career Guide
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-pink-400 transition-colors">
                    Mentorship
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-pink-400 transition-colors">
                    Events
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-pink-400 transition-colors">
                    News
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-white">Connect</h3>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="text-gray-300 hover:text-pink-400 transition-colors"
                >
                  <Globe className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="text-gray-300 hover:text-pink-400 transition-colors"
                >
                  <Heart className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-600 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-gray-400 text-sm sm:text-base">
            <p>&copy; 2024 Alumniiio. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
