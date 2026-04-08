import { Router } from "express";
import { contactController } from "./contact.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { createContactSchema } from "./contact.zod";
import { Role } from "../../../generated/prisma";

const router = Router();

/**
 * POST / - Create a new contact message (public endpoint)
 * Requires: name, email, subject, message
 */
router.post(
  "/",
  validateRequest(createContactSchema),
  contactController.createContact
);

/**
 * Admin only routes
 */

/**
 * GET / - Get all contact messages with pagination (admin only)
 * Query params: page, limit, search, sortBy, sortOrder, isRead
 */
router.get(
  "/",
  checkAuth(Role.ADMIN),
  contactController.getAllContacts
);

/**
 * GET /stats/unread - Get unread contact messages count (admin only)
 */
router.get(
  "/stats/unread",
  checkAuth(Role.ADMIN),
  contactController.getUnreadCount
);

/**
 * GET /:id - Get a single contact message by ID (admin only)
 */
router.get(
  "/:id",
  checkAuth(Role.ADMIN),
  contactController.getContactById
);

/**
 * PATCH /:id/read - Mark a contact message as read (admin only)
 */
router.patch(
  "/:id/read",
  checkAuth(Role.ADMIN),
  contactController.markAsRead
);

/**
 * DELETE /:id - Delete a contact message (admin only)
 */
router.delete(
  "/:id",
  checkAuth(Role.ADMIN),
  contactController.deleteContact
);

export default router;
