import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Eye, EyeOff, User, Mail, Phone, Lock, Check } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "user", // Hidden field, automatically set to "user"
    phone: "",
    gender: "",
    password: "",
    confirmPassword: "",
    isAgree: false,
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name) {
      newErrors.name = "Name is required";
    } else if (formData.name.length > 255) {
      newErrors.name = "Name must be less than 255 characters";
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    } else if (formData.email.length > 255) {
      newErrors.email = "Email must be less than 255 characters";
    }

    // Phone validation
    if (!formData.phone) {
      newErrors.phone = "Phone is required";
    } else if (formData.phone.length > 255) {
      newErrors.phone = "Phone must be less than 255 characters";
    }

    // Gender validation
    if (!formData.gender) {
      newErrors.gender = "Gender is required";
    } else if (!["male", "female"].includes(formData.gender)) {
      newErrors.gender = "Gender must be male or female";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Agreement validation
    if (!formData.isAgree) {
      newErrors.isAgree = "You must agree to the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await register();
    } catch (err) {
      console.error("Registration failed:", err);
      setErrors((prev) => ({
        ...prev,
        form: "Registration failed. Please try again.",
      }));
    } finally {
      setLoading(false);
    }
  };

  const openTermsDialog = (e) => {
    e.preventDefault();
    setShowTerms(true);
  };

  const acceptTerms = () => {
    setFormData((prev) => ({
      ...prev,
      isAgree: true,
    }));
    setShowTerms(false);
  };

  const register = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/register`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      
      if (response.data.success) {
        Swal.fire({
          icon: "success",
          title: "Registration Successful",
          text: "You can now log in.",
          confirmButtonText: "OK",
          confirmButtonColor: "#6D4C3D",
        }).then(() => {
          navigate("/login");
        });
      } else {
        setErrors((prev) => ({
          ...prev,
          form: response.data.message || "Registration failed. Please try again.",
        }));
      }
    } catch (error) {
      console.error("Error during registration:", error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Left side - Decorative */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#6D4C3D] to-[#8B5A2B] relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1546213290-e1b492ab3eee?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.3,
          }}
        ></div>
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-12 z-10">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold mb-6 leading-tight">Join Our Community</h1>
            <p className="text-xl mb-10 opacity-90">Create an account and start your journey with us today.</p>
            <div className="space-y-8">
              <div className="flex items-center">
                <div className="bg-white bg-opacity-20 p-3 rounded-full mr-5">
                  <Check className="h-6 w-6" />
                </div>
                <p className="text-lg">Access to exclusive content</p>
              </div>
              <div className="flex items-center">
                <div className="bg-white bg-opacity-20 p-3 rounded-full mr-5">
                  <Check className="h-6 w-6" />
                </div>
                <p className="text-lg">Connect with other members</p>
              </div>
              <div className="flex items-center">
                <div className="bg-white bg-opacity-20 p-3 rounded-full mr-5">
                  <Check className="h-6 w-6" />
                </div>
                <p className="text-lg">Stay updated with latest trends</p>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black to-transparent opacity-60"></div>
      </div>

      {/* Right side - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Create your account</h2>
            <p className="mt-2 text-sm text-gray-600">Join our community and start your journey</p>
          </div>

          {errors.form && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4 relative shadow-sm border-l-4 border-red-500">
              <div className="flex items-center">
                <svg
                  className="h-5 w-5 text-red-400 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm font-medium">{errors.form}</p>
                <button
                  type="button"
                  className="ml-auto text-red-500 hover:text-red-700"
                  onClick={() => setErrors((prev) => ({ ...prev, form: null }))}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {/* Hidden role field */}
            <input type="hidden" name="role" value="user" />
            
            <div className="space-y-5">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-3 border ${
                      errors.name ? "border-red-300" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6D4C3D] focus:border-[#6D4C3D] transition-colors`}
                    placeholder="John Doe"
                  />
                </div>
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-3 border ${
                      errors.email ? "border-red-300" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6D4C3D] focus:border-[#6D4C3D] transition-colors`}
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              {/* Phone Field */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-3 border ${
                      errors.phone ? "border-red-300" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6D4C3D] focus:border-[#6D4C3D] transition-colors`}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
              </div>

              {/* Gender Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <div className="flex space-x-6">
                  <div className="flex items-center">
                    <input
                      id="male"
                      name="gender"
                      type="radio"
                      value="male"
                      checked={formData.gender === "male"}
                      onChange={handleChange}
                      className="h-5 w-5 text-[#6D4C3D] focus:ring-[#6D4C3D] border-gray-300"
                    />
                    <label htmlFor="male" className="ml-2 block text-sm text-gray-700">
                      Male
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="female"
                      name="gender"
                      type="radio"
                      value="female"
                      checked={formData.gender === "female"}
                      onChange={handleChange}
                      className="h-5 w-5 text-[#6D4C3D] focus:ring-[#6D4C3D] border-gray-300"
                    />
                    <label htmlFor="female" className="ml-2 block text-sm text-gray-700">
                      Female
                    </label>
                  </div>
                </div>
                {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender}</p>}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-10 py-3 border ${
                      errors.password ? "border-red-300" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6D4C3D] focus:border-[#6D4C3D] transition-colors`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-10 py-3 border ${
                      errors.confirmPassword ? "border-red-300" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6D4C3D] focus:border-[#6D4C3D] transition-colors`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="isAgree"
                    name="isAgree"
                    type="checkbox"
                    checked={formData.isAgree}
                    onChange={handleChange}
                    className="h-5 w-5 text-[#6D4C3D] focus:ring-[#6D4C3D] border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="isAgree" className="font-medium text-gray-700">
                    I agree to the{" "}
                    <button
                      type="button"
                      className="text-[#6D4C3D] font-medium hover:text-[#8B5A2B] underline"
                      onClick={openTermsDialog}
                    >
                      Terms and Conditions
                    </button>
                  </label>
                </div>
              </div>
              {errors.isAgree && <p className="mt-1 text-sm text-red-600">{errors.isAgree}</p>}
            </div>

            <div className="flex flex-col space-y-4">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-[#6D4C3D] to-[#8B5A2B] hover:from-[#8B5A2B] hover:to-[#6D4C3D] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6D4C3D] transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <svg
                      className="h-5 w-5 text-white group-hover:text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                )}
                {loading ? "Processing..." : "Create Account"}
              </button>

              <div className="text-center">
                <a href="/login" className="font-medium text-[#6D4C3D] hover:text-[#8B5A2B] transition-colors">
                  Already have an account? Sign in
                </a>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Terms and Conditions Dialog */}
      {showTerms && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowTerms(false)}></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-[#6D4C3D] px-4 py-3 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-white" id="modal-title">
                  Terms and Conditions
                </h3>
              </div>
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="max-h-96 overflow-y-auto text-sm">
                  <h3 className="font-bold text-lg mb-2">1. Introduction</h3>
                  <p className="mb-4">
                    Welcome to our platform. These Terms and Conditions govern your use of our website and services. By
                    accessing or using our services, you agree to be bound by these Terms.
                  </p>

                  <h3 className="font-bold text-lg mb-2">2. User Accounts</h3>
                  <p className="mb-4">
                    When you create an account with us, you must provide accurate, complete, and current information. You
                    are responsible for safeguarding your password and for all activities that occur under your account.
                  </p>

                  <h3 className="font-bold text-lg mb-2">3. Privacy Policy</h3>
                  <p className="mb-4">
                    Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your
                    personal information. By using our services, you agree to our collection and use of information in
                    accordance with our Privacy Policy.
                  </p>

                  <h3 className="font-bold text-lg mb-2">4. User Conduct</h3>
                  <p className="mb-4">
                    You agree not to use our services for any illegal or unauthorized purpose. You must not violate any laws
                    in your jurisdiction, including copyright or trademark laws.
                  </p>

                  <h3 className="font-bold text-lg mb-2">5. Termination</h3>
                  <p className="mb-4">
                    We reserve the right to terminate or suspend your account and access to our services at our sole
                    discretion, without notice, for conduct that we believe violates these Terms or is harmful to other
                    users, us, or third parties, or for any other reason.
                  </p>

                  <h3 className="font-bold text-lg mb-2">6. Changes to Terms</h3>
                  <p className="mb-4">
                    We reserve the right to modify these Terms at any time. If we make changes, we will provide notice of
                    such changes, such as by sending an email, providing a notice through our services, or updating the date
                    at the top of these Terms.
                  </p>

                  <h3 className="font-bold text-lg mb-2">7. Contact Information</h3>
                  <p className="mb-4">
                    If you have any questions about these Terms, please contact us at support@example.com.
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#6D4C3D] text-base font-medium text-white hover:bg-[#8B5A2B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6D4C3D] sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                  onClick={acceptTerms}
                >
                  I Agree
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6D4C3D] sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowTerms(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}