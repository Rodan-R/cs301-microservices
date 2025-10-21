import { z } from "zod";

const uuid = z.string().uuid();

// CREATE (POST /agents)
// DB sets: agent_id, created_at
// Me sets: deleted_ etc. fields ONLY updated via DELETE endpoint
export const createAgentSchema = z.object({
  firstName: z.string().trim().min(1, "first_name is required"),
  lastName: z.string().trim().min(1, "last_name is required"),
  email: z.string().trim().email().transform(v => v.toLowerCase()),
  // role: z.literal("agent").default("agent"),
  // admin_id: uuid, 
});

// UPDATE (PATCH /agents/:agent_id)
// ONLY allow fields that exist and can change. Role fixed to 'agent' so NO CHANGE.
export const updateAgentSchema = z.object({
  first_name: z.string().trim().min(1).optional(),
  last_name: z.string().trim().min(1).optional(),
  email: z.string().trim().email().transform(v => v.toLowerCase()).optional(),
}).refine(obj => Object.keys(obj).length > 0, {
  message: "Provide at least one field to update",
});

// PARAMS (e.g., /agents/:agent_id)
export const agentIdParams = z.object({
  agentID: uuid,
});

// SOFT DELETE (PATCH /agents/:agent_id/delete or smth???)
export const softDeleteSchema = z.object({
  deleted_by: uuid,
  delete_reason: z.string().trim().min(1).optional(),
});

// ???? LIST QUERY (/agents?page=&limit=)
export const listAgentsQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  offset: z.coerce.number().int().min(20).max(100).default(25),
});
