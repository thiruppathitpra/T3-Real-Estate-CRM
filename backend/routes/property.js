const express = require("express");
const { Property } = require("../models/models");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();


// ========================================
// GET /api/properties
// GET ALL PROPERTIES
// ========================================

// ========================================
// POST /api/properties/upload
// UPLOAD PROPERTY IMAGES (up to 6)
// Returns an array of public URLs the
// frontend can attach to a property's
// `images` field.
// ========================================

router.post(
  "/upload",
  protect,
  upload.array("images", 6),
  (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No images uploaded",
        });
      }

      const urls = req.files.map(
        (file) => `/uploads/${file.filename}`
      );

      res.json({
        success: true,
        urls,
      });
    } catch (error) {
      console.error("Upload Error:", error);

      res.status(500).json({
        success: false,
        message: "Server error while uploading images",
      });
    }
  }
);

router.get("/", protect, async (req, res) => {
  try {
    const properties = await Property.find()
      .populate("agentId", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: properties.length,
      properties
    });

  } catch (error) {
    console.error("Get Properties Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching properties"
    });
  }
});


// ========================================
// GET /api/properties/:id
// GET SINGLE PROPERTY
// ========================================

router.get("/:id", protect, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate("agentId", "name email");

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }

    res.json({
      success: true,
      property
    });

  } catch (error) {
    console.error("Get Property Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching property"
    });
  }
});


// ========================================
// POST /api/properties
// CREATE PROPERTY
// ========================================

router.post("/", protect, async (req, res) => {
  try {
    const {
      title,
      address,
      city,
      state,
      zipCode,
      price,
      bedrooms,
      bathrooms,
      squareFeet,
      propertyType,
      status,
      images,
      description,
      amenities
    } = req.body;

    // Validation
    if (!title || !address || !city || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "Title, address, city and price are required"
      });
    }

    const property = await Property.create({
      title,
      address,
      city,
      state,
      zipCode,
      price,
      bedrooms,
      bathrooms,
      squareFeet,
      propertyType,
      status,
      agentId: req.user.id,
      images,
      description,
      amenities
    });

    res.status(201).json({
      success: true,
      message: "Property created successfully",
      property
    });

  } catch (error) {
    console.error("Create Property Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while creating property"
    });
  }
});


// ========================================
// PUT /api/properties/:id
// UPDATE PROPERTY
// ========================================

router.put("/:id", protect, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }

    Object.assign(property, req.body);

    property.updatedAt = new Date();

    const updatedProperty = await property.save();

    res.json({
      success: true,
      message: "Property updated successfully",
      property: updatedProperty
    });

  } catch (error) {
    console.error("Update Property Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while updating property"
    });
  }
});


// ========================================
// DELETE /api/properties/:id
// DELETE PROPERTY
// ========================================

router.delete("/:id", protect, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }

    await property.deleteOne();

    res.json({
      success: true,
      message: "Property deleted successfully"
    });

  } catch (error) {
    console.error("Delete Property Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while deleting property"
    });
  }
});


module.exports = router;