const User = require('../models/User');
const OTP = require('../models/OTP');
const { generateToken } = require('../utils/jwtHelper');
const { generateOTP } = require('../utils/otpGenerator');
const emailService = require('./emailService');

class AuthService {
  async signup({ name, email, password, avatar, role }) {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      if (!existingUser.isVerified) {
        // User started registration but didn't verify OTP, recreate OTP and send to email
        await OTP.deleteMany({ email: existingUser.email });
        const otpCode = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        await OTP.create({ email: existingUser.email, otp: otpCode, expiresAt });
        
        await emailService.sendOTPEmail({
          to: existingUser.email,
          name: existingUser.name,
          otp: otpCode,
        });

        return {
          user: {
            id: existingUser._id,
            name: existingUser.name,
            email: existingUser.email,
            role: existingUser.role,
            isVerified: false,
          },
          otpSent: true,
        };
      }
      throw new Error('An account with this email address already exists.');
    }

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      avatar: avatar || undefined,
      role: role || 'USER',
      isVerified: false,
    });

    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await OTP.create({ email: newUser.email, otp: otpCode, expiresAt });

    await emailService.sendOTPEmail({
      to: newUser.email,
      name: newUser.name,
      otp: otpCode,
    });

    return {
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        avatar: newUser.avatar,
        isVerified: false,
      },
      otpSent: true,
    };
  }

  async verifyOTP({ email, otp }) {
    const otpRecord = await OTP.findOne({ email: email.toLowerCase(), otp: String(otp).trim() });
    if (!otpRecord) {
      throw new Error('Invalid or expired OTP code.');
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new Error('User not found.');
    }

    user.isVerified = true;
    await user.save();
    await OTP.deleteMany({ email: user.email });

    const token = generateToken({ id: user._id, role: user.role });

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isVerified: user.isVerified,
      },
    };
  }

  async resendOTP(email) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new Error('User with this email was not found.');
    }

    await OTP.deleteMany({ email: user.email });
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await OTP.create({ email: user.email, otp: otpCode, expiresAt });

    await emailService.sendOTPEmail({
      to: user.email,
      name: user.name,
      otp: otpCode,
    });

    return {
      email: user.email,
      otpSent: true,
    };
  }

  async login({ email, password }) {
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      throw new Error('Invalid email or password.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error('Invalid email or password.');
    }

    if (user.isBanned) {
      throw new Error('This account has been suspended by an administrator.');
    }

    if (!user.isVerified) {
      // Re-send OTP if unverified
      const otpCode = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await OTP.deleteMany({ email: user.email });
      await OTP.create({ email: user.email, otp: otpCode, expiresAt });

      const err = new Error('Please verify your email with the OTP sent to proceed.');
      err.requiresVerification = true;
      err.email = user.email;
      err.demoOTP = otpCode;
      throw err;
    }

    const token = generateToken({ id: user._id, role: user.role });

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        bio: user.bio,
        isVerified: user.isVerified,
      },
    };
  }

  async getProfile(userId) {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new Error('User not found.');
    }
    return user;
  }

  async updateProfile(userId, { name, phone, bio, avatar }) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found.');
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (bio !== undefined) user.bio = bio;
    if (avatar) user.avatar = avatar;

    await user.save();
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      bio: user.bio,
      isVerified: user.isVerified,
    };
  }
}

module.exports = new AuthService();
