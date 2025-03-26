import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authManager } from '../../../api/features/auth/manage';
import userManager from '../../../api/features/users/manage';
import { storeTokens } from '../../../api/features/auth/utils';

const Signin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Use authManager for login
      const response = await authManager.login(formData);
      
      // Store tokens
      storeTokens(response.access, response.refresh);
      
      // Get user data
      const userData = await userManager.getCurrentUser();
      
      // Dispatch login event with user data
      window.dispatchEvent(new CustomEvent('userLoggedIn', { 
        detail: {
          username: userData.username,
          profile_picture: userData.profile_picture,
          full_name: userData.full_name
        }
      }));
      
      // Navigate to home page or dashboard
      navigate('/');
    } catch (err) {
      // Handle specific error messages
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Failed to sign in. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center w-full h-full space-y-5">
        <div className="flex flex-col items-center justify-center w-full space-y-5">
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-96 h-12 px-4 border border-black focus:outline-none"
            autoComplete="email"
            required
          />
          <div className="relative w-96">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full h-12 px-4 border border-black focus:outline-none"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {error && (
            <div className="text-red-500 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-96 h-12 border border-black hover:text-white hover:bg-black ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Signin;
