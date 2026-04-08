import { prisma } from "../../lib/prisma";
import { IQueryParams } from "../../interfaces/query.interface";
import { QueryBuilder } from "../../utilities/QueryBuilder";

export interface CreateContactDTO {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactResponse {
  id: string;
  name: string;
  email: string;
  subject: string;
  createdAt: Date;
}

export interface ContactMessageResponse {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

class ContactService {
  /**
   * Create a new contact message
   */
  async createContact(data: CreateContactDTO): Promise<ContactResponse> {
    try {
      const contactMessage = await prisma.contactMessage.create({
        data: {
          name: data.name,
          email: data.email,
          subject: data.subject,
          message: data.message,
        },
        select: {
          id: true,
          name: true,
          email: true,
          subject: true,
          createdAt: true,
        },
      });

      return contactMessage;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all contact messages (admin only) with QueryBuilder pagination
   */
  async getAllContacts(query: IQueryParams) {
    try {
      const contactQueryBuilder = new QueryBuilder(
        prisma.contactMessage,
        query,
        {
          searchableFields: ["name", "email", "subject", "message"],
          filterableFields: ["isRead"],
        }
      );

      const result = await contactQueryBuilder
        .search()
        .filter()
        .sort()
        .paginate()
        .execute();

      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get a single contact message by ID
   */
  async getContactById(contactId: string) {
    try {
      const message = await prisma.contactMessage.findUnique({
        where: { id: contactId },
        select: {
          id: true,
          name: true,
          email: true,
          subject: true,
          message: true,
          isRead: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!message) {
        throw new Error("Contact message not found");
      }

      // Mark as read
      await prisma.contactMessage.update({
        where: { id: contactId },
        data: { isRead: true },
      });

      return message;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Mark contact message as read
   */
  async markAsRead(contactId: string) {
    try {
      const message = await prisma.contactMessage.update({
        where: { id: contactId },
        data: { isRead: true },
        select: {
          id: true,
          isRead: true,
        },
      });

      return message;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a contact message
   */
  async deleteContact(contactId: string) {
    try {
      await prisma.contactMessage.delete({
        where: { id: contactId },
      });

      return { message: "Contact message deleted successfully" };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get unread contact messages count
   */
  async getUnreadCount() {
    try {
      const count = await prisma.contactMessage.count({
        where: { isRead: false },
      });

      return { unreadCount: count };
    } catch (error) {
      throw error;
    }
  }
}

export const contactService = new ContactService();
