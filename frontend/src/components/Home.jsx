import React from 'react'
import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Welcome to Our Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Discover amazing features and services that will help you achieve your goals. 
            Join thousands of satisfied users today.
          </p>
          <div className="space-x-4">
            <Link
              to="/signup"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition duration-200 font-medium text-lg"
            >
              Get Started
            </Link>
            <Link
              to="/about"
              className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition duration-200 font-medium text-lg"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-2xl mb-4">
              ⚡
            </div>
            <h3 className="text-xl font-semibold mb-2">Fast & Reliable</h3>
            <p className="text-gray-600">Lightning-fast performance with 99.9% uptime guarantee.</p>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600 text-2xl mb-4">
              🔒
            </div>
            <h3 className="text-xl font-semibold mb-2">Secure</h3>
            <p className="text-gray-600">Enterprise-grade security to keep your data safe.</p>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 text-2xl mb-4">
              💡
            </div>
            <h3 className="text-xl font-semibold mb-2">Innovative</h3>
            <p className="text-gray-600">Cutting-edge features that give you the competitive edge.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home