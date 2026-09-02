const express = require("express");
const mongoose = require("mongoose");

const { protect } = require("../middleware/auth");

const router = express.Router();

const { Client } = require("../models/models");
const { User, Property } = require("../models/models");

// ========================================
// GET ALL CLIENTS
// GET /api/clients
// ========================================
router.get("/", protect, async (req, res) => {
  try {
    const clients = await Client.find()
      .populate("agentId", "name email role")
      .populate("interestedProperties", "title price city")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: clients.length,
      clients
    });

  } catch (error) {
    console.error("Get Clients Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load clients"
    });
  }
});

// ========================================
// GET SINGLE CLIENT
// GET /api/clients/:id
// ========================================
router.get("/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid client ID"
      });
    }

    const client = await Client.findById(id)
      .populate("agentId", "name email role")
      .populate("interestedProperties", "title price city");

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found"
      });
    }

    res.json({
      success: true,
      client
    });

  } catch (error) {
    console.error("Get Client Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load client"
    });
  }
});

// ========================================
// PROPERTY MATCHES FOR A CLIENT
// GET /api/clients/:id/matches
// Matches available properties against the
// client's budget range and preferred city.
// ========================================
router.get("/:id/matches", protect, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid client ID"
      });
    }

    const client = await Client.findById(id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found"
      });
    }

    const filter = { status: "available" };

    if (client.budget && (client.budget.min || client.budget.max)) {
      filter.price = {};
      if (client.budget.min) filter.price.$gte = client.budget.min * 0.85;
      if (client.budget.max) filter.price.$lte = client.budget.max * 1.15;
    }

    let properties = await Property.find(filter).sort({ price: 1 });

    if (client.city) {
      const city = client.city.toLowerCase();

      properties = properties.sort((a, b) => {
        const aMatch = (a.city || "").toLowerCase() === city;
        const bMatch = (b.city || "").toLowerCase() === city;

        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
        return 0;
      });
    }

    res.json({
      success: true,
      count: properties.length,
      properties
    });

  } catch (error) {
    console.error("Client Matches Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to find matching properties"
    });
  }
});

// ========================================
// ADD CLIENT
// POST /api/clients
// ========================================
router.post("/", protect, async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      city,
      agentId,
      status,
      clientType,
      budget,
      interestedProperties,
      notes
    } = req.body;

    // Validation
    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Client name and phone are required"
      });
    }

    // Determine agent
    let selectedAgentId = agentId;

    if (!selectedAgentId) {
      const agent = await User.findOne({ role: "agent" });

      if (agent) {
        selectedAgentId = agent._id;
      }
    }

    if (!selectedAgentId) {
      return res.status(400).json({
        success: false,
        message: "Agent is required"
      });
    }

    const client = await Client.create({
      name: name.trim(),
      email: email ? email.toLowerCase().trim() : undefined,
      phone: phone.trim(),
      address: address || "",
      city: city || "",
      agentId: selectedAgentId,
      status: status || "active",
      clientType: clientType || "buyer",
      budget: budget || {},
      interestedProperties: interestedProperties || [],
      notes: notes || ""
    });

    const populatedClient = await Client.findById(client._id)
      .populate("agentId", "name email role")
      .populate("interestedProperties", "title price city");

    res.status(201).json({
      success: true,
      message: "Client added successfully",
      client: populatedClient
    });

  } catch (error) {
    console.error("Add Client Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to add client"
    });
  }
});

// ========================================
// UPDATE CLIENT
// PUT /api/clients/:id
// ========================================
router.put("/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid client ID"
      });
    }

    const {
      name,
      email,
      phone,
      address,
      city,
      agentId,
      status,
      clientType,
      budget,
      interestedProperties,
      notes
    } = req.body;

    const updateData = {
      name: name?.trim(),
      email: email ? email.toLowerCase().trim() : "",
      phone: phone?.trim(),
      address: address || "",
      city: city || "",
      status: status || "active",
      clientType: clientType || "buyer",
      budget: budget || {},
      interestedProperties: interestedProperties || [],
      notes: notes || "",
      updatedAt: new Date()
    };

    if (agentId) {
      updateData.agentId = agentId;
    }

    const client = await Client.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    )
      .populate("agentId", "name email role")
      .populate("interestedProperties", "title price city");

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found"
      });
    }

    res.json({
      success: true,
      message: "Client updated successfully",
      client
    });

  } catch (error) {
    console.error("Update Client Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update client"
    });
  }
});

// ========================================
// DELETE CLIENT
// DELETE /api/clients/:id
// ========================================
router.delete("/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid client ID"
      });
    }

    const client = await Client.findByIdAndDelete(id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found"
      });
    }

    res.json({
      success: true,
      message: "Client deleted successfully"
    });

  } catch (error) {
    console.error("Delete Client Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to delete client"
    });
  }
});

module.exports = router;