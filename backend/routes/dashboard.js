const express = require("express");
const { Property, Client, Lead } = require("../models/models");
const { protect } = require("../middleware/auth");

const router = express.Router();

// ========================================
// GET /api/dashboard
// TEST ROUTE
// ========================================

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Dashboard API is working",
  });
});

// ========================================
// GET /api/dashboard/stats
// TOP-LINE STATS FOR THE DASHBOARD CARDS
// ========================================

router.get("/stats", protect, async (req, res) => {
  try {
    const [
      totalProperties,
      availableProperties,
      totalClients,
      totalLeads,
      newLeads,
      convertedLeads,
      hotLeads,
    ] = await Promise.all([
      Property.countDocuments(),
      Property.countDocuments({ status: "available" }),
      Client.countDocuments(),
      Lead.countDocuments(),
      Lead.countDocuments({ status: "new" }),
      Lead.countDocuments({ status: "converted" }),
      Lead.countDocuments({ priority: "hot" }),
    ]);

    res.json({
      success: true,
      stats: {
        totalProperties,
        availableProperties,
        totalClients,
        totalLeads,
        newLeads,
        convertedLeads,
        hotLeads,
      },
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load dashboard stats",
    });
  }
});

// ========================================
// GET /api/dashboard/reports
// EXTENSIVE REPORTS: funnel, breakdowns,
// monthly trend, and agent performance.
// ========================================

router.get("/reports", protect, async (req, res) => {
  try {
    const [
      leadsByStatus,
      leadsBySource,
      leadsByPriority,
      propertiesByStatus,
      propertiesByType,
      monthlyLeadsRaw,
      agentPerformanceRaw,
      totalLeads,
      convertedLeads,
    ] = await Promise.all([
      Lead.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Lead.aggregate([
        { $group: { _id: "$source", count: { $sum: 1 } } },
      ]),
      Lead.aggregate([
        { $group: { _id: "$priority", count: { $sum: 1 } } },
      ]),
      Property.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Property.aggregate([
        { $group: { _id: "$propertyType", count: { $sum: 1 } } },
      ]),
      Lead.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(
                new Date().setMonth(new Date().getMonth() - 5, 1)
              ),
            },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
      Lead.aggregate([
        { $match: { agentId: { $ne: null } } },
        {
          $group: {
            _id: "$agentId",
            totalLeads: { $sum: 1 },
            converted: {
              $sum: {
                $cond: [{ $eq: ["$status", "converted"] }, 1, 0],
              },
            },
            hot: {
              $sum: {
                $cond: [{ $eq: ["$priority", "hot"] }, 1, 0],
              },
            },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "agent",
          },
        },
        { $unwind: "$agent" },
        {
          $project: {
            agentName: "$agent.name",
            totalLeads: 1,
            converted: 1,
            hot: 1,
          },
        },
        { $sort: { totalLeads: -1 } },
      ]),
      Lead.countDocuments(),
      Lead.countDocuments({ status: "converted" }),
    ]);

    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    const monthlyLeadsTrend = monthlyLeadsRaw.map((m) => ({
      label: `${monthNames[m._id.month - 1]} ${m._id.year}`,
      count: m.count,
    }));

    const conversionRate =
      totalLeads > 0
        ? Number(((convertedLeads / totalLeads) * 100).toFixed(1))
        : 0;

    res.json({
      success: true,
      reports: {
        leadsByStatus,
        leadsBySource,
        leadsByPriority,
        propertiesByStatus,
        propertiesByType,
        monthlyLeadsTrend,
        agentPerformance: agentPerformanceRaw,
        conversionRate,
      },
    });
  } catch (error) {
    console.error("Dashboard Reports Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load reports",
    });
  }
});

module.exports = router;
