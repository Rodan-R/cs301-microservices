import { Router } from "express";
import pool from "../db/pool.js";
import * as agentTX from "../db/tx.js"
// import { publish } from "../queues/sqs.js";
import { validate, validateParams } from "../middlewares/validate.js";
import { requireAuth } from "../middlewares/auth.js";

import * as schema from "../schemas/agents.schema.js";


const router = Router();

router.post ("/v1/agent/createAgent", requireAuth, validate(schema.createAgentSchema), async(req, res) => {
  try {
      // read adminID from token
      const adminID = req.user?.id;

      if (!adminID) {
        return res.status(403).json({ error: "Forbidden", message: "Missing adminID" });
      }

      const agentID = await agentTX.createAgent({
        ...req.validated, 
        adminID,
      });

      return res.status(201).json({ agentID });
    } catch (e) {
      next(e)
      // return res.status(500).json({ error: "ServerError: ", message: e.message });
    }
});

router.get ("/v1/agent/:agentID", requireAuth, validateParams(schema.agentIdParams), async(req, res) => {
  try {
      // read adminID from token
      const adminID = req.user?.id;
      const agentID = req.validatedParams

      if (!adminID) {
        return res.status(403).json({ error: "Forbidden", message: "Missing adminID" });
      }

      const agent = await agentTX.getAgentByIDByAdminID({
        agentID, 
        adminID,
      });

      if (!agent) return res.status(404).json({ error: "NotFound" });
      return res.status(201).json({ agent });
    } catch (e) {
      next(e)
      // return res.status(500).json({ error: "ServerError: ", message: e.message });
    }
});

router.get ("/v1/agent/", requireAuth, validateParams(schema.agentIdParams), async(req, res) => {
  try {
      // read adminID from token
      const adminID = req.user?.id;
      const agentID = req.validatedParams

      if (!adminID) {
        return res.status(403).json({ error: "Forbidden", message: "Missing adminID" });
      }

      const agent = await agentTX.getAllAgentByAdminID({
        agentID, 
        adminID,
      });

      if (!agent) return res.status(404).json({ error: "NotFound" });
      return res.status(201).json({ agent });
    } catch (e) {
      next(e)
      // return res.status(500).json({ error: "ServerError: ", message: e.message });
    }
});

router.put ("/v1/agent/updateAgent", requireAuth, validate(schema.updateAgentSchema), async(req, res) => {
  try {
      // read adminID from token
      const adminID = req.user?.id;

      if (!adminID) {
        return res.status(403).json({ error: "Forbidden", message: "Missing adminID" });
      }

      const agentID = await agentTX.updateAgentByAdminID({
        ...req.validated, 
        adminID,
      });

      return res.status(201).json({ agentID });
    } catch (e) {
      next(e)
      // return res.status(500).json({ error: "ServerError: ", message: e.message });
    }
});

router.delete ("/v1/agent/deleteAgent", requireAuth, validate(schema.softDeleteSchema), async(req, res) => {
  try {
      // read adminID from token
      const adminID = req.user?.id;

      if (!adminID) {
        return res.status(403).json({ error: "Forbidden", message: "Missing adminID" });
      }

      const agentID = await agentTX.softDeleteAgent({
        ...req.validated, 
        adminID,
      });

      return res.status(201).json({ agentID });
    } catch (e) {
      next(e)
      // return res.status(500).json({ error: "ServerError: ", message: e.message });
    }
});

export default router;
