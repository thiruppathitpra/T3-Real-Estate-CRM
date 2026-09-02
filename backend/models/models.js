const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// ========================================
// USER MODEL
// ========================================

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
    trim: true,
  },

  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: true,
    lowercase: true,
    trim: true,
  },

  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 6,
    select: false,
  },

  phone: {
    type: String,
    trim: true,
  },

  role: {
    type: String,
    enum: ["admin", "agent"],
    default: "agent",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// ========================================
// HASH PASSWORD
// ========================================

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);

  this.password = await bcrypt.hash(
    this.password,
    salt
  );
});

// ========================================
// COMPARE PASSWORD
// ========================================

userSchema.methods.matchPassword = async function (
  enteredPassword
) {
  return await bcrypt.compare(
    enteredPassword,
    this.password
  );
};

// ========================================
// PROPERTY MODEL
// ========================================

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please provide a property title"],
    trim: true,
  },

  address: {
    type: String,
    required: true,
    trim: true,
  },

  city: {
    type: String,
    required: true,
    trim: true,
  },

  state: {
    type: String,
    trim: true,
  },

  zipCode: {
    type: String,
    trim: true,
  },

  price: {
    type: Number,
    required: [true, "Please provide a price"],
  },

  bedrooms: Number,

  bathrooms: Number,

  squareFeet: Number,

  propertyType: {
    type: String,
    enum: [
      "residential",
      "commercial",
      "land",
      "condo",
    ],
    default: "residential",
  },

  status: {
    type: String,
    enum: [
      "available",
      "sold",
      "pending",
      "rented",
    ],
    default: "available",
  },

  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  images: [String],

  description: String,

  amenities: [String],

  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// ========================================
// CLIENT MODEL
// ========================================

const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide client name"],
    trim: true,
  },

  email: {
    type: String,
    trim: true,
    lowercase: true,
  },

  phone: {
    type: String,
    required: true,
    trim: true,
  },

  address: {
    type: String,
    trim: true,
  },

  city: {
    type: String,
    trim: true,
  },

  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  status: {
    type: String,
    enum: [
      "active",
      "inactive",
      "converted",
    ],
    default: "active",
  },

  clientType: {
    type: String,
    enum: [
      "buyer",
      "seller",
      "investor",
    ],
    default: "buyer",
  },

  budget: {
    min: Number,
    max: Number,
  },

  interestedProperties: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
    },
  ],

  notes: {
    type: String,
    trim: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// ========================================
// LEAD MODEL
// ========================================

const leadSchema = new mongoose.Schema({
  // Customer
  name: {
    type: String,
    required: [true, "Please provide lead name"],
    trim: true,
  },

  email: {
    type: String,
    trim: true,
    lowercase: true,
  },

  phone: {
    type: String,
    required: [true, "Please provide phone number"],
    trim: true,
  },

  // Property
  propertyInterest: {
    type: String,
    trim: true,
  },

  plotNumber: {
    type: String,
    trim: true,
  },

  // Budget
  budgetMin: {
    type: Number,
    min: 0,
  },

  budgetMax: {
    type: Number,
    min: 0,
  },

  // Loan
  loanRequired: {
    type: String,
    enum: ["Yes", "No", "Maybe"],
    default: "No",
  },

  // Down Payment
  downPayment: {
    type: Number,
    min: 0,
  },

  // Priority
  priority: {
    type: String,
    enum: ["hot", "warm", "cold"],
    default: "warm",
  },

  // Site Visit
  siteVisit: {
    type: String,
    enum: [
      "Not-Scheduled",
      "Scheduled",
      "Completed",
      "Cancelled",
    ],
    default: "Not-Scheduled",
  },

  siteVisitDate: {
    type: Date,
  },

  // Lead Status
  status: {
    type: String,
    enum: [
      "new",
      "contacted",
      "qualified",
      "negotiating",
      "converted",
      "lost",
    ],
    default: "new",
  },

  // Source
  source: {
    type: String,
    enum: [
      "website",
      "referral",
      "ad",
      "walk-in",
      "other",
    ],
    default: "website",
  },

  // Assigned Agent
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  // Notes
  notes: {
    type: String,
    trim: true,
  },

  // Follow-up
  lastContactedAt: {
    type: Date,
  },

  nextFollowUp: {
    type: Date,
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// ========================================
// EXPORT MODELS
// ========================================

module.exports = {
  User: mongoose.model("User", userSchema),

  Property: mongoose.model(
    "Property",
    propertySchema
  ),

  Client: mongoose.model(
    "Client",
    clientSchema
  ),

  Lead: mongoose.model(
    "Lead",
    leadSchema
  ),
};