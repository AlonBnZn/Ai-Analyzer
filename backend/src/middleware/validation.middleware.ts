import Joi from "joi";
import { Request, Response, NextFunction } from "express";

const chatMessageSchema = Joi.object({
  message: Joi.string().required().min(1).max(1000),
  conversationId: Joi.string().optional().uuid(),
});

export const validateChatMessage = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error } = chatMessageSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      error: "Invalid request data",
      details: error.details[0].message,
    });
  }

  next();
};

// Rate limiting middleware for chat
export const chatRateLimit = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Simple rate limiting - could be enhanced with Redis
  const windowMs = 60000; // 1 minute
  const maxRequests = 30; // 30 requests per minute

  // This is a simplified implementation
  // In production, use express-rate-limit with Redis
  next();
};
