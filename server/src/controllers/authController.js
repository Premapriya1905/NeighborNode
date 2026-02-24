import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import ApiResponse from '../utils/apiResponse.js';
import ApiError from '../utils/apiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { generateTokens, sanitizeUser } from '../utils/helpers.js';

/**
 * @desc    Register new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName, location } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw ApiError.conflict('Email already registered');
  }

  // Create user
  const user = await User.create({
    email,
    password,
    firstName,
    lastName,
    location
  });

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user._id);

  // Save refresh token to user
  user.refreshToken = refreshToken;
  await user.save();

  // Send response
  ApiResponse.created(res, {
    user: sanitizeUser(user),
    accessToken,
    refreshToken
  }, 'Registration successful');
});

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user and include password
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw ApiError.unauthorized('Invalid credentials');
  }

  // Check password
  const isPasswordMatch = await user.comparePassword(password);

  if (!isPasswordMatch) {
    throw ApiError.unauthorized('Invalid credentials');
  }

  // Update last login
  user.lastLogin = new Date();

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user._id);

  // Save refresh token
  user.refreshToken = refreshToken;
  await user.save();

  // Send response
  ApiResponse.success(res, {
    user: sanitizeUser(user),
    accessToken,
    refreshToken
  }, 'Login successful');
});

/**
 * @desc    Logout user
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req, res) => {
  // Clear refresh token
  await User.findByIdAndUpdate(req.user._id, {
    refreshToken: null
  });

  ApiResponse.success(res, null, 'Logout successful');
});

/**
 * @desc    Refresh access token
 * @route   POST /api/v1/auth/refresh-token
 * @access  Public
 */
export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw ApiError.badRequest('Refresh token is required');
  }

  // Verify refresh token
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    throw ApiError.unauthorized('Invalid refresh token');
  }

  // Find user and verify refresh token matches
  const user = await User.findById(decoded.id).select('+refreshToken');

  if (!user || user.refreshToken !== refreshToken) {
    throw ApiError.unauthorized('Invalid refresh token');
  }

  // Generate new tokens
  const tokens = generateTokens(user._id);

  // Update refresh token
  user.refreshToken = tokens.refreshToken;
  await user.save();

  ApiResponse.success(res, tokens, 'Token refreshed successfully');
});

/**
 * @desc    Get current logged in user
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  ApiResponse.success(res, { user: sanitizeUser(user) }, 'User retrieved successfully');
});

/**
 * @desc    Update user password
 * @route   PUT /api/v1/auth/update-password
 * @access  Private
 */
export const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw ApiError.badRequest('Please provide current password and new password');
  }

  // Get user with password
  const user = await User.findById(req.user._id).select('+password');

  // Check current password
  const isMatch = await user.comparePassword(currentPassword);

  if (!isMatch) {
    throw ApiError.unauthorized('Current password is incorrect');
  }

  // Update password
  user.password = newPassword;
  await user.save();

  // Generate new tokens
  const tokens = generateTokens(user._id);

  ApiResponse.success(res, tokens, 'Password updated successfully');
});

/**
 * @desc    Forgot password
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    // Don't reveal if user exists for security
    return ApiResponse.success(
      res,
      null,
      'If an account exists with this email, a password reset link has been sent'
    );
  }

  // Generate reset token 
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // Print to console for local testing since there's no email service configured
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
  console.log('\\n================ PASSWORD RESET LINK ================');
  console.log(`Email sent to: ${user.email}`);
  console.log(`Use this URL to reset the password: ${resetUrl}`);
  console.log('=====================================================\\n');

  ApiResponse.success(
    res,
    null,
    'If an account exists with this email, a password reset link has been sent'
  );
});

/**
 * @desc    Reset password
 * @route   POST /api/v1/auth/reset-password
 * @access  Public
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    throw ApiError.badRequest('Please provide token and new password');
  }

  // Hash the token to compare with DB
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw ApiError.badRequest('Token is invalid or has expired');
  }

  // Set new password
  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  ApiResponse.success(res, null, 'Password reset successful');
});

/**
 * @desc    Verify email
 * @route   GET /api/v1/auth/verify-email
 * @access  Public
 */
export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;

  // Implement email verification logic here

  ApiResponse.success(res, null, 'Email verified successfully');
});
