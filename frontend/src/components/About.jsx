import React from 'react'

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About Us</h1>
          <p className="text-xl text-gray-600">
            Learn more about our mission, vision, and the team behind our success.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
          <p className="text-gray-700 leading-relaxed">
            Founded in 2024, we set out to create a platform that simplifies complex tasks 
            and empowers users to achieve more. Our team of dedicated professionals works 
            tirelessly to deliver exceptional value to our customers.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <h3 className="text-xl font-semibold mb-4">Our Mission</h3>
            <p className="text-gray-700">
              To provide innovative solutions that enhance productivity and drive success 
              for individuals and businesses worldwide.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <h3 className="text-xl font-semibold mb-4">Our Vision</h3>
            <p className="text-gray-700">
              To be the leading platform that transforms how people work and collaborate 
              in the digital age.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About