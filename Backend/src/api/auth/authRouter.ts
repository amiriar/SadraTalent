import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import { AuthGuard } from "@/common/guard/AuthGuard";
import {
  handleServiceResponse,
  validateRequest,
} from "@/common/utils/httpHandlers";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";
import { z } from "zod";
import { authController } from "./authController";
import {
  AuthLoginSchema,
  AuthRegisterSchema,
  RefreshTokenBodySchema,
} from "./authModel";
import {
  AuthSchema,
  LoginResponseSchema,
  LoginSchema,
  RefreshTokenSchema,
  SendOtpSchema,
  VerifyOtpSchema,
} from "./authSchema";
import { authService } from "./authService";

export const authRegistry = new OpenAPIRegistry();
export const authRouter: Router = express.Router();

// Register Auth Schema
authRegistry.register("Auth", AuthSchema);

// Register user
authRegistry.registerPath({
  method: "post",
  path: "/auth/register",
  tags: ["Auth"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: AuthSchema,
        },
      },
    },
  },
  responses: createApiResponse(AuthSchema, "Successfully registered user"),
});
authRouter.post(
  "/register",
  validateRequest(AuthRegisterSchema),
  authController.register
);

// Login user
authRegistry.registerPath({
  method: "post",
  path: "/auth/login",
  tags: ["Auth"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: LoginSchema,
        },
      },
    },
  },
  responses: createApiResponse(LoginResponseSchema, "Successfully logged in"),
});
authRouter.post(
  "/login",
  validateRequest(AuthLoginSchema),
  authController.login
);

// // Forget password
// authRegistry.registerPath({
//   method: "post",
//   path: "/auth/forget-password",
//   tags: ["Auth"],
//   request: {
//     body: {
//       content: {
//         "application/json": {
//           schema: AuthSchema,
//         },
//       },
//     },
//   },
//   responses: createApiResponse(AuthSchema, "Password reset link sent"),
// });
// authRouter.post("/forget-password", validateRequest(AuthSchema), authController.forgetPassword);

// Refresh token

authRegistry.registerPath({
  method: "post",
  path: "/auth/refresh-token",
  tags: ["Auth"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: RefreshTokenSchema,
        },
      },
    },
  },
  responses: createApiResponse(RefreshTokenSchema, "Token refreshed"),
});
authRouter.post(
  "/refresh-token",
  validateRequest(RefreshTokenBodySchema),
  authController.refreshToken
);

// Logout user
authRegistry.registerPath({
  method: "post",
  path: "/auth/logout",
  tags: ["Auth"],
  responses: {
    200: {
      description: "Successfully logged out",
    },
    500: {
      description: "Internal server error",
    },
  },
});
authRouter.post("/logout", AuthGuard, authController.logout);

// Send OTP
authRegistry.registerPath({
  method: "post",
  path: "/auth/send-otp",
  tags: ["Auth"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: SendOtpSchema,
        },
      },
    },
  },
  responses: createApiResponse(SendOtpSchema, "OTP sent successfully"),
});
authRouter.post(
  "/send-otp",
  validateRequest(
    z.object({
      body: z.object({
        phone: z.string(),
      }),
    })
  ),
  async (req, res) => {
    try {
      const { phone } = req.body;
      const serviceResponse = await authService.sendOtp(phone);
      return handleServiceResponse(serviceResponse, res);
    } catch (error) {
      return res.status(500).json({ error: "An unexpected error occurred" });
    }
  }
);

// Verify OTP
authRegistry.registerPath({
  method: "post",
  path: "/auth/verify-otp",
  tags: ["Auth"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            phone: z.string(),
            code: z.string(),
          }),
        },
      },
    },
  },
  responses: createApiResponse(
    LoginResponseSchema,
    "OTP verified successfully"
  ),
});
authRouter.post(
  "/verify-otp",
  // validateRequest(
  //   z.object({
  //     phone: z.string(),
  //     code: z.string(),
  //   })
  // ),
  async (req, res) => {
    const { phone, code } = req.body;
    const serviceResponse = await authService.loginWithOtp(phone, code);
    return handleServiceResponse(serviceResponse, res);
  }
);
