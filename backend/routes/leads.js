const express = require("express");
const { protect } = require("../middleware/auth");

const router = express.Router();

const { Lead, User, Property } = require("../models/models");

// ========================================
// GET ALL LEADS
// GET /api/leads
// ========================================
router.get("/", protect, async (req, res) => {
  try {
    const {
      search,
      status,
      source,
      priority
    } = req.query;

    let filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { propertyInterest: { $regex: search, $options: "i" } }
      ];
    }

    if (status) filter.status = status;
    if (source) filter.source = source;
    if (priority) filter.priority = priority;

    const leads = await Lead.find(filter)
      .populate("agentId", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: leads.length,
      leads
    });

  } catch (error) {
    console.error("Get Leads Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch leads"
    });
  }
});

// ========================================
// GET FOLLOW-UPS
// GET /api/leads/followups?range=overdue|today|upcoming
// Powers the Follow-ups & Reminders view.
// ========================================
router.get("/followups", protect, async (req, res) => {
  try {
    const { range = "all" } = req.query;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    let filter = {
      nextFollowUp: { $ne: null },
      status: { $nin: ["converted", "lost"] }
    };

    if (range === "overdue") {
      filter.nextFollowUp = { $lt: startOfToday };
    } else if (range === "today") {
      filter.nextFollowUp = { $gte: startOfToday, $lte: endOfToday };
    } else if (range === "upcoming") {
      filter.nextFollowUp = { $gt: endOfToday };
    }

    const leads = await Lead.find(filter)
      .populate("agentId", "name email")
      .sort({ nextFollowUp: 1 });

    res.json({
      success: true,
      count: leads.length,
      leads
    });

  } catch (error) {
    console.error("Get Followups Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch follow-ups"
    });
  }
});

// ========================================
// GET SINGLE LEAD
// GET /api/leads/:id
// ========================================
router.get("/:id", protect, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate("agentId", "name email");

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found"
      });
    }

    res.json({
      success: true,
      lead
    });

  } catch (error) {
    console.error("Get Lead Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch lead"
    });
  }
});

// ========================================
// PROPERTY MATCHES FOR A LEAD
// GET /api/leads/:id/matches
// Matches available properties against the
// lead's budget range and stated interest.
// ========================================
router.get("/:id/matches", protect, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found"
      });
    }

    const filter = { status: "available" };

    if (lead.budgetMin || lead.budgetMax) {
      filter.price = {};
      if (lead.budgetMin) filter.price.$gte = lead.budgetMin * 0.85;
      if (lead.budgetMax) filter.price.$lte = lead.budgetMax * 1.15;
    }

    let properties = await Property.find(filter).sort({ price: 1 });

    // Prioritize properties whose city/title match the lead's
    // stated interest, without excluding the rest.
    if (lead.propertyInterest) {
      const term = lead.propertyInterest.toLowerCase();

      properties = properties.sort((a, b) => {
        const aMatch =
          (a.city || "").toLowerCase().includes(term) ||
          (a.title || "").toLowerCase().includes(term);
        const bMatch =
          (b.city || "").toLowerCase().includes(term) ||
          (b.title || "").toLowerCase().includes(term);

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
    console.error("Lead Matches Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to find matching properties"
    });
  }
});

// ========================================
// CREATE LEAD
// POST /api/leads
// Includes lead automation:
//  - duplicate phone detection (409 unless ?force=true)
//  - round-robin auto-assignment when no agent given
//  - default next follow-up (+1 day) when none given
// ========================================
router.post("/", protect, async (req, res) => {
  try {

    const {
      name,
      email,
      phone,
      propertyInterest,
      plotNumber,
      budgetMin,
      budgetMax,
      loanRequired,
      downPayment,
      priority,
      siteVisit,
      siteVisitDate,
      status,
      source,
      notes,
      nextFollowUp,
      agentId
    } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name and phone are required"
      });
    }

    const cleanPhone = phone.trim();

    // ---- Duplicate detection ----
    if (req.query.force !== "true") {
      const existing = await Lead.findOne({ phone: cleanPhone });

      if (existing) {
        return res.status(409).json({
          success: false,
          duplicate: true,
          message: "A lead with this phone number already exists",
          existingLead: existing
        });
      }
    }

    // ---- Round-robin auto-assignment ----
    let selectedAgentId = agentId;

    if (!selectedAgentId) {
      const agents = await User.find({ role: { $in: ["agent", "admin"] } });

      if (agents.length > 0) {
        const counts = await Lead.aggregate([
          { $match: { status: { $nin: ["converted", "lost"] } } },
          { $group: { _id: "$agentId", count: { $sum: 1 } } }
        ]);

        const countMap = {};
        counts.forEach((c) => {
          if (c._id) countMap[c._id.toString()] = c.count;
        });

        agents.sort(
          (a, b) =>
            (countMap[a._id.toString()] || 0) -
            (countMap[b._id.toString()] || 0)
        );

        selectedAgentId = agents[0]._id;
      }
    }

    // ---- Default follow-up reminder ----
    let followUpDate = nextFollowUp;

    if (!followUpDate) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      followUpDate = tomorrow;
    }

    const lead = await Lead.create({
      name: name.trim(),
      email: email ? email.toLowerCase().trim() : undefined,
      phone: cleanPhone,
      propertyInterest,
      plotNumber,
      budgetMin,
      budgetMax,
      loanRequired,
      downPayment,
      priority: priority || "warm",
      siteVisit: siteVisit || "not-scheduled",
      siteVisitDate,
      status: status || "new",
      source: source || "website",
      notes,
      nextFollowUp: followUpDate,
      agentId: selectedAgentId
    });

    const populatedLead = await Lead.findById(lead._id)
      .populate("agentId", "name email");

    res.status(201).json({
      success: true,
      message: "Lead created successfully",
      lead: populatedLead
    });

  } catch (error) {

    console.error("Create Lead Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to create lead",
      error: error.message
    });
  }
});

// ========================================
// UPDATE LEAD
// PUT /api/leads/:id
// Automation: moving status to "contacted"
// stamps lastContactedAt automatically.
// ========================================
router.put("/:id", protect, async (req, res) => {
  try {

    const updates = { ...req.body };

    if (updates.status === "contacted" && !updates.lastContactedAt) {
      updates.lastContactedAt = new Date();
    }

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true
      }
    ).populate("agentId", "name email");


    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found"
      });
    }


    res.json({
      success: true,
      message: "Lead updated successfully",
      lead
    });

  } catch (error) {

    console.error("Update Lead Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update lead",
      error: error.message
    });
  }
});


// ========================================
// DELETE LEAD
// DELETE /api/leads/:id
// ========================================
router.delete("/:id", protect, async (req, res) => {
  try {

    const lead = await Lead.findByIdAndDelete(
      req.params.id
    );


    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found"
      });
    }


    res.json({
      success: true,
      message: "Lead deleted successfully"
    });

  } catch (error) {

    console.error("Delete Lead Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to delete lead"
    });
  }
});


module.exports = router;
