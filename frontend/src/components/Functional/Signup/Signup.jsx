import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authManager } from "../../../api/features/auth/manage";
import { 
  validatePassword, 
  validateRegistrationForm,
  getPasswordStrengthText,
  getPasswordStrengthColor
} from "../../../api/features/auth/validation";

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'password') {
      const validation = validatePassword(value);
      setPasswordValidation(validation);
    }

    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const validation = validateRegistrationForm(formData);
    if (!validation.isValid) {
      setError(validation.errors.join(', '));
      return;
    }

    setIsLoading(true);

    try {
      const { confirmPassword, ...registrationData } = formData;
      await authManager.register(registrationData);
      
      // After successful registration, show success message and redirect to login
      setError('Registration successful! Please login.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      // Handle specific error messages
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Failed to sign up. Please try again.');
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
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Username"
            className="w-96 h-12 px-4 border border-black focus:outline-none"
            autoComplete="username"
            required
          />
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
              autoComplete="new-password"
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
          {formData.password && passwordValidation && (
            <div className="w-96">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${getPasswordStrengthColor(passwordValidation.strength)}`}
                  style={{ width: `${Math.min((passwordValidation.strength / 4) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Password Strength: {getPasswordStrengthText(passwordValidation.strength)}
              </p>
            </div>
          )}
          <div className="relative w-96">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              className="w-full h-12 px-4 border border-black focus:outline-none"
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? "Hide" : "Show"}
            </button>
          </div>

          {error && (
            <div className={`text-sm ${error.includes('successful') ? 'text-green-500' : 'text-red-500'}`}>
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
            {isLoading ? 'Signing up...' : 'Sign Up'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Signup;
