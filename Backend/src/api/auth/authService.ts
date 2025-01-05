import { UserRepository } from "@/api/admin/user/userRepository";
import type { IUser } from "@/api/admin/user/userSchema";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { env } from "@/common/utils/envConfig";
import { logger } from "@/server";
import bcrypt from "bcrypt";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import UserModel from "@/api/admin/user/userSchema";

export class AuthService {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository = new UserRepository()) {
    this.userRepository = userRepository;
  }

  // Authenticates a user
  async authenticate(
    usernameOrEmail: string,
    password: string
  ): Promise<ServiceResponse<IUser | null>> {
    try {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(usernameOrEmail);
      let user: IUser | null;
      if (isEmail) {
        user = await this.userRepository.findByEmailAsync(usernameOrEmail);
      } else {
        user = await this.userRepository.findByUsernameAsync(usernameOrEmail);
      }
      if (!user) {
        return ServiceResponse.failure(
          "User Not Found",
          null,
          StatusCodes.NOT_FOUND
        );
      }

      if (!(await this.comparePassword(password, user.password))) {
        return ServiceResponse.failure(
          "Invalid credentials",
          null,
          StatusCodes.UNAUTHORIZED
        );
      }

      // Generate access token and refresh token
      const accessTokenResponse = await this.generateToken(user);
      const refreshTokenResponse = await this.generateRefreshToken(user); // Implement this method

      if (!accessTokenResponse.success || !refreshTokenResponse.success) {
        return ServiceResponse.failure(
          "Failed to generate tokens",
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        );
      }

      user.refreshToken = refreshTokenResponse.responseObject;
      user.save();

      return ServiceResponse.success<IUser>("User authenticated", {
        // @ts-ignore
        accessToken: accessTokenResponse.responseObject,
        refreshToken: refreshTokenResponse.responseObject,
      });
    } catch (ex) {
      const errorMessage = `Error authenticating user: ${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while authenticating the user.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async comparePassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // Registers a new user
  async register(
    userData: Partial<IUser>
  ): Promise<ServiceResponse<IUser | null>> {
    try {
      // Hash the password before saving
      if (userData.password) {
        userData.password = await bcrypt.hash(userData.password, 10);
      }
      const user = await this.userRepository.createAsync(userData);
      return ServiceResponse.success<IUser>(
        "User registered successfully",
        user
      );
    } catch (ex) {
      const errorMessage = `Error registering user: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while registering the user.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async generateToken(user: IUser): Promise<ServiceResponse<string | null>> {
    try {
      // Sign the JWT token with a secret (you can replace this with a private key if using RS256)
      const token = jwt.sign(
        { _id: user._id }, // You can customize the payload
        env.JWT_SECRET || "your_secret_key", // Make sure to set this in your environment variables
        { expiresIn: "1h" } // Set the token expiration time as needed
      );

      return ServiceResponse.success<string>(
        "Token generated successfully",
        token
      );
    } catch (ex) {
      const errorMessage = `Error generating token for user: ${
        (ex as Error).message
      }`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while generating the token.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async refreshToken(
    id: string,
    token: string
  ): Promise<ServiceResponse<string | null>> {
    try {
      const user = await this.userRepository.findByIdAsync(id);
      if (!user) {
        return ServiceResponse.failure(
          "User not found",
          null,
          StatusCodes.NOT_FOUND
        );
      }

      // Get token response
      const tokenResponse = await this.generateToken(user);

      // Ensure that tokenResponse contains a token
      if (tokenResponse.success && tokenResponse.responseObject) {
        return ServiceResponse.success(
          "Token refreshed successfully",
          tokenResponse.responseObject
        );
      }

      return ServiceResponse.failure(
        "Failed to generate a new token",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    } catch (ex) {
      const errorMessage = `Error refreshing token: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while refreshing the token.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Logs out a user
  async logout(id: string): Promise<ServiceResponse<boolean>> {
    try {
      const user = await this.userRepository.findByIdAsync(id);
      if (!user) {
        return ServiceResponse.failure(
          "User not found",
          false,
          StatusCodes.NOT_FOUND
        );
      }
      // Store the refresh token in the user record
      user.refreshToken = null; // Assuming you want to clear the refresh token on logout
      return ServiceResponse.success<boolean>(
        "User logged out successfully",
        true
      );
    } catch (ex) {
      const errorMessage = `Error logging out user: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while logging out the user.",
        false,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  // // Handles password reset logic
  // async forgetPassword(email: string): Promise<ServiceResponse<any>> {
  //   try {
  //     const user = await this.authRepository.findByEmailAsync(email);
  //     if (!user) {
  //       return ServiceResponse.failure("User not found", null, StatusCodes.NOT_FOUND);
  //     }

  //     // Generate a password reset token
  //     const resetToken = await generateResetToken(user); // Implement this utility to generate a reset token
  //     // Send the reset token to the user's email (implement email service)
  //     // await sendResetPasswordEmail(user.email, resetToken);

  //     return ServiceResponse.success("Password reset link sent", { resetToken });
  //   } catch (ex: any) {
  //     logger.error(`Error handling forget password for user: ${ex.message}`);
  //     return ServiceResponse.failure("An error occurred while processing the password reset.", null, StatusCodes.INTERNAL_SERVER_ERROR);
  //   }
  // }

  // New method to generate refresh token
  async generateRefreshToken(
    user: IUser
  ): Promise<ServiceResponse<string | null>> {
    // Implement your logic to generate a refresh token
    // This could be similar to generateToken but with different payload or expiration
    const refreshToken = jwt.sign(
      { _id: user._id }, // Customize the payload as needed
      env.JWT_REFRESH_SECRET || "your_refresh_secret_key", // Use a different secret for refresh tokens
      { expiresIn: "7d" } // Set a longer expiration time for refresh tokens
    );

    return ServiceResponse.success<string>(
      "Refresh token generated successfully",
      refreshToken
    );
  }

  async validateToken(token: string): Promise<any | boolean> {
    try {
      const decodedToken = jwt.verify(token, env.JWT_REFRESH_SECRET);
      return decodedToken;
    } catch (error: any) {
      console.error(`Token validation failed: ${error.message}`);
      return false;
    }
  }

  // New method to send OTP
  async sendOtp(phoneNumber: string): Promise<ServiceResponse<boolean>> {
    const otp = Math.floor(10000 + Math.random() * 90000).toString(); // Generate a 6-digit OTP
    const expirationTime = new Date(Date.now() + 10 * 60 * 1000); // Set expiration time to 10 minutes

    // Check if user exists, if not create a new user
    let user = await this.userRepository.findByPhoneNumberAsync(phoneNumber);
    if (!user) {
      user = await UserModel.create({ phoneNumber }); // Assuming User is the model for users
      await user.save(); // Save the new user
    }

    // Save OTP and expiration time to the user record
    user.otp = otp; // Save OTP
    user.otpExpire = expirationTime; // Save expiration time
    await user.save(); // Save user record

    // Send OTP via email (implement this function)
    // await sendOtpEmail(email, otp);

    return ServiceResponse.success(`OTP sent successfully, Code: ${otp}`, true);
  }

  // New method to verify OTP
  async verifyOtp(
    phoneNumber: string,
    otp: string
  ): Promise<ServiceResponse<boolean>> {
    const user = await this.userRepository.findByPhoneNumberAsync(phoneNumber);
    if (!user || user.otp !== otp) {
      return ServiceResponse.failure(
        "Invalid OTP",
        false,
        StatusCodes.UNAUTHORIZED
      );
    }

    // Check if OTP is expired
    if (user.otp && user.otpExpire && new Date() > user.otpExpire) {
      return ServiceResponse.failure(
        "OTP has expired",
        false,
        StatusCodes.UNAUTHORIZED
      );
    }

    // Clear OTP after successful verification
    user.otp = null;
    user.otpExpire = null;
    await user.save();

    return ServiceResponse.success("OTP verified", true);
  }

  // Modified login method to support OTP
  async loginWithOtp(
    phoneNumber: string,
    otp: string
  ): Promise<ServiceResponse<IUser | null>> {
    const otpVerification = await this.verifyOtp(phoneNumber, otp);
    if (!otpVerification.success) {
      return ServiceResponse.failure(
        "Invalid OTP",
        null,
        StatusCodes.UNAUTHORIZED
      );
    }

    const user = await this.userRepository.findByPhoneNumberAsync(phoneNumber);
    if (!user) {
      return ServiceResponse.failure(
        "User Not Found",
        null,
        StatusCodes.NOT_FOUND
      );
    }

    const accessTokenResponse = await this.generateToken(user);
    const refreshTokenResponse = await this.generateRefreshToken(user); // Implement this method

    if (!accessTokenResponse.success || !refreshTokenResponse.success) {
      return ServiceResponse.failure(
        "Failed to generate tokens",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }

    user.refreshToken = refreshTokenResponse.responseObject;
    user.save();

    return ServiceResponse.success<IUser>("User authenticated", {
      // @ts-ignore
      accessToken: accessTokenResponse.responseObject,
      refreshToken: refreshTokenResponse.responseObject,
    });
  }
}

export const authService = new AuthService();
