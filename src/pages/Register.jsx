import axios from "axios"
import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import Swal from "sweetalert2"
import { Eye, EyeOff } from "lucide-react"
import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogContentText from "@mui/material/DialogContentText"
import DialogTitle from "@mui/material/DialogTitle"
import useMediaQuery from "@mui/material/useMediaQuery"
import { useTheme } from "@mui/material/styles"
import {
    TextField,
    MenuItem,
    FormControlLabel,
    Radio,
    RadioGroup,
    Checkbox,
    FormControl,
    FormLabel,
    InputAdornment,
    IconButton,
  } from "@mui/material"
  
export default function Register() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: "",
        phone: "",
        gender: "",
        password: "",
        confirmPassword: "",
        isAgree: false,
      })
    
      const [errors, setErrors] = useState({})
      const [showPassword, setShowPassword] = useState(false)
      const [showConfirmPassword, setShowConfirmPassword] = useState(false)
      const [loading, setLoading] = useState(false)
      const [showTerms, setShowTerms] = useState(false)
    
      // MUI Dialog responsive setup
      const theme = useTheme()
      const fullScreen = useMediaQuery(theme.breakpoints.down("md"))
    
      const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData((prev) => ({
          ...prev,
          [name]: type === "checkbox" ? checked : value,
        }))
    
        // Clear error when field is edited
        if (errors[name]) {
          setErrors((prev) => ({
            ...prev,
            [name]: null,
          }))
        }
      }
    
      const validateForm = () => {
        const newErrors = {}
    
        // Name validation
        if (!formData.name) {
          newErrors.name = "Name is required"
        } else if (formData.name.length > 255) {
          newErrors.name = "Name must be less than 255 characters"
        }
    
        // Email validation
        if (!formData.email) {
          newErrors.email = "Email is required"
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = "Email is invalid"
        } else if (formData.email.length > 255) {
          newErrors.email = "Email must be less than 255 characters"
        }
    
        // Role validation
        if (!formData.role) {
          newErrors.role = "Role is required"
        } else if (!["admin", "user", "owner", "developer"].includes(formData.role)) {
          newErrors.role = "Role must be admin, user, owner, or developer"
        }
    
        // Phone validation
        if (!formData.phone) {
          newErrors.phone = "Phone is required"
        } else if (formData.phone.length > 255) {
          newErrors.phone = "Phone must be less than 255 characters"
        }
    
        // Gender validation
        if (!formData.gender) {
          newErrors.gender = "Gender is required"
        } else if (!["male", "female"].includes(formData.gender)) {
          newErrors.gender = "Gender must be male or female"
        }
    
        // Password validation
        if (!formData.password) {
          newErrors.password = "Password is required"
        } else if (formData.password.length < 8) {
          newErrors.password = "Password must be at least 8 characters"
        }
    
        // Confirm password validation
        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = "Passwords do not match"
        }
    
        // Agreement validation
        if (!formData.isAgree) {
          newErrors.isAgree = "You must agree to the terms and conditions"
        }
    
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
      }
    
      const handleSubmit = async (e) => {
        e.preventDefault()
    
        if (!validateForm()) {
          return
        }
    
        setLoading(true)
    
        try {
          // Simulate registration request
          await new Promise((resolve) => setTimeout(resolve, 1000))
    
          // Here you would typically make an API call to register the user
          console.log("Register with:", formData)
    
          // Redirect or show success message
          alert("Registration successful!")
        } catch (err) {
          console.error("Registration failed:", err)
          setErrors((prev) => ({
            ...prev,
            form: "Registration failed. Please try again.",
          }))
        } finally {
          setLoading(false)
        }
      }
    
      const openTermsDialog = (e) => {
        e.preventDefault()
        setShowTerms(true)
      }
    
      const acceptTerms = () => {
        setFormData((prev) => ({
          ...prev,
          isAgree: true,
        }))
        setShowTerms(false)
      }
    return(
        <>
             <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Decorative */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#6D4C3D] to-[#8B5A2B] relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-12 z-10">
          <div className="max-w-md">
            <h1 className="text-4xl font-bold mb-6">Join Our Community</h1>
            <p className="text-xl mb-8">Create an account and start your journey with us today.</p>
            <div className="space-y-6">
              <div className="flex items-center">
                <div className="bg-white bg-opacity-20 p-2 rounded-full mr-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-lg">Access to exclusive content</p>
              </div>
              <div className="flex items-center">
                <div className="bg-white bg-opacity-20 p-2 rounded-full mr-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-lg">Connect with other members</p>
              </div>
              <div className="flex items-center">
                <div className="bg-white bg-opacity-20 p-2 rounded-full mr-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-lg">Stay updated with latest trends</p>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black to-transparent opacity-60"></div>
      </div>

      {/* Right side - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Create your account</h2>
            <p className="mt-2 text-sm text-gray-600">Join our community and start your journey</p>
          </div>

          {errors.form && (
            <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4 relative shadow-sm border-l-4 border-red-500">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{errors.form}</p>
                </div>
                <div className="ml-auto pl-3">
                  <div className="-mx-1.5 -my-1.5">
                    <button
                      type="button"
                      className="inline-flex bg-red-100 text-red-500 rounded-md p-1.5 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      onClick={() => setErrors((prev) => ({ ...prev, form: null }))}
                    >
                      <span className="sr-only">Dismiss</span>
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="rounded-md shadow-sm -space-y-px">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                {/* Name Field */}
                <div className="sm:col-span-3">
                  <TextField
                    fullWidth
                    id="name"
                    name="name"
                    label="Full Name"
                    variant="outlined"
                    value={formData.name}
                    onChange={handleChange}
                    error={!!errors.name}
                    helperText={errors.name}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-gray-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </InputAdornment>
                      ),
                    }}
                  />
                </div>

                {/* Email Field */}
                <div className="sm:col-span-3">
                  <TextField
                    fullWidth
                    id="email"
                    name="email"
                    label="Email Address"
                    variant="outlined"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={!!errors.email}
                    helperText={errors.email}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-gray-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                          </svg>
                        </InputAdornment>
                      ),
                    }}
                  />
                </div>

                {/* Role Field */}
                <div className="sm:col-span-3">
                  <TextField
                    select
                    fullWidth
                    id="role"
                    name="role"
                    label="Role"
                    variant="outlined"
                    value={formData.role}
                    onChange={handleChange}
                    error={!!errors.role}
                    helperText={errors.role}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-gray-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </InputAdornment>
                      ),
                    }}
                  >
                    <MenuItem value="">Select a role</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="user">User</MenuItem>
                    <MenuItem value="owner">Owner</MenuItem>
                    <MenuItem value="developer">Developer</MenuItem>
                  </TextField>
                </div>

                {/* Phone Field */}
                <div className="sm:col-span-3">
                  <TextField
                    fullWidth
                    id="phone"
                    name="phone"
                    label="Phone Number"
                    variant="outlined"
                    value={formData.phone}
                    onChange={handleChange}
                    error={!!errors.phone}
                    helperText={errors.phone}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-gray-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                          </svg>
                        </InputAdornment>
                      ),
                    }}
                  />
                </div>

                {/* Gender Field */}
                <div className="sm:col-span-6">
                  <FormControl component="fieldset" error={!!errors.gender}>
                    <FormLabel component="legend" className="text-gray-700">
                      Gender
                    </FormLabel>
                    <RadioGroup row name="gender" value={formData.gender} onChange={handleChange}>
                      <FormControlLabel
                        value="male"
                        control={<Radio color="primary" />}
                        label={
                          <div className="flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 mr-1 text-blue-500"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Male
                          </div>
                        }
                      />
                      <FormControlLabel
                        value="female"
                        control={<Radio color="primary" />}
                        label={
                          <div className="flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 mr-1 text-pink-500"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Female
                          </div>
                        }
                      />
                    </RadioGroup>
                    {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender}</p>}
                  </FormControl>
                </div>

                {/* Password Field */}
                <div className="sm:col-span-3">
                  <TextField
                    fullWidth
                    id="password"
                    name="password"
                    label="Password"
                    variant="outlined"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    error={!!errors.password}
                    helperText={errors.password}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-gray-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </div>

                {/* Confirm Password Field */}
                <div className="sm:col-span-3">
                  <TextField
                    fullWidth
                    id="confirmPassword"
                    name="confirmPassword"
                    label="Confirm Password"
                    variant="outlined"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-gray-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                          >
                            {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-center">
              <FormControlLabel
                control={<Checkbox checked={formData.isAgree} onChange={handleChange} name="isAgree" color="primary" />}
                label={
                  <span className="text-sm text-gray-700">
                    I agree to the{" "}
                    <button
                      type="button"
                      className="text-[#6D4C3D] font-medium hover:text-[#8B5A2B] underline"
                      onClick={openTermsDialog}
                    >
                      Terms and Conditions
                    </button>
                  </span>
                }
              />
            </div>
            {errors.isAgree && <p className="mt-1 text-sm text-red-600">{errors.isAgree}</p>}

            <div className="flex flex-col space-y-4">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-[#6D4C3D] to-[#8B5A2B] hover:from-[#8B5A2B] hover:to-[#6D4C3D] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6D4C3D] transition-all duration-300 shadow-lg hover:shadow-xl"
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
                      aria-hidden="true"
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

      {/* Terms and Conditions Dialog using MUI */}
      <Dialog
        fullScreen={fullScreen}
        open={showTerms}
        onClose={() => setShowTerms(false)}
        aria-labelledby="responsive-dialog-title"
        PaperProps={{
          style: {
            borderRadius: "12px",
            maxWidth: "600px",
          },
        }}
      >
        <DialogTitle id="responsive-dialog-title" style={{ backgroundColor: "#6D4C3D", color: "white" }}>
          {"Terms and Conditions"}
        </DialogTitle>
        <DialogContent dividers>
          <DialogContentText component="div">
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
          </DialogContentText>
        </DialogContent>
        <DialogActions style={{ padding: "16px" }}>
          <Button
            onClick={() => setShowTerms(false)}
            style={{
              color: "#6D4C3D",
              borderRadius: "8px",
              padding: "8px 16px",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={acceptTerms}
            autoFocus
            style={{
              backgroundColor: "#6D4C3D",
              color: "white",
              borderRadius: "8px",
              padding: "8px 16px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            I Agree
          </Button>
        </DialogActions>
      </Dialog>
    </div>
        </>
    )
}

// Simple Eye and EyeOff icon components
function EyeIcon() {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
    )
  }
  
  function EyeOffIcon() {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
        <line x1="2" x2="22" y1="2" y2="22"></line>
      </svg>
    )
  }