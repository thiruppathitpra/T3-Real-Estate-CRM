const express = require("express");
const router = express.Router();

const { Lead } = require("../models/models");

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

// ========================================
// META WEBHOOK VERIFICATION
// ========================================
router.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("WhatsApp webhook verified");
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

// ========================================
// RECEIVE WHATSAPP MESSAGES
// ========================================
router.post("/webhook", async (req, res) => {
  try {
    console.log(
      "WhatsApp Webhook:",
      JSON.stringify(req.body, null, 2)
    );

    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;

    // Ignore webhook events that don't contain messages
    if (!value?.messages?.length) {
      return res.sendStatus(200);
    }

    const message = value.messages[0];
    const contact = value.contacts?.[0];

    // Customer name
    const name =
      contact?.profile?.name || "WhatsApp User";

    // WhatsApp phone number
    const phone =
      message.from || contact?.wa_id;

    // Get message text
    let messageText = "";

    if (message.type === "text") {
      messageText = message.text?.body || "";
    } else {
      messageText = `[${message.type} message]`;
    }

    // Check whether this WhatsApp number already exists
    let lead = await Lead.findOne({ phone });

    if (lead) {
      // Existing lead → add new WhatsApp message to notes
      const newNote =
        `WhatsApp: ${messageText}`;

      lead.notes = lead.notes
        ? `${lead.notes}\n${newNote}`
        : newNote;

      lead.lastContactedAt = new Date();
      lead.updatedAt = new Date();

      await lead.save();

      console.log(
        "✅ Existing lead updated:",
        lead._id
      );
    } else {
      // New lead
      lead = await Lead.create({
        name: name,
        phone: phone,
        status: "new",
        source: "ad",
        priority: "warm",
        notes: `WhatsApp: ${messageText}`
      });

      console.log(
        "✅ New WhatsApp Lead Created:",
        lead._id
      );
    }

    // Tell Meta webhook was received successfully
    return res.sendStatus(200);

  } catch (error) {
    console.error(
      "❌ WhatsApp webhook error:",
      error
    );

    return res.sendStatus(500);
  }
});

module.exports = router;