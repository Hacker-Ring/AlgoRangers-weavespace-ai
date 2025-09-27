import { useState } from "react"

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: "testuser@example.com",
    password: "testpassword123"
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch('https://algorangers-weavespace-ai.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        onLogin(data.token, data.user)
      } else {
        setError(data.message || 'Login failed. Please try again.')
      }
    } catch (error) {
      setError("Network error. Please check your connection.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-medium text-gray-900">Welcome Back</h2>
          <p className="text-gray-500 mt-1 text-sm">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 text-sm focus:outline-none focus:border-gray-400"
              placeholder="Email"
            />
          </div>

          <div>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 text-sm focus:outline-none focus:border-gray-400"
              placeholder="Password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 px-4 text-sm hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

          {error && <div className="text-red-600 text-xs text-center">{error}</div>}
        </form>

        <div className="mt-6 p-4 bg-gray-100 border border-gray-200 rounded">
          <h4 className="font-medium text-gray-900 mb-2 text-sm">Test Account:</h4>
          <div className="text-xs text-gray-600 space-y-1">
            <p><span className="font-medium">Email:</span> testuser@example.com</p>
            <p><span className="font-medium">Password:</span> testpassword123</p>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-gray-500 text-xs">
            Don't have an account?{" "}
            <button className="text-black hover:underline">Sign up</button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login