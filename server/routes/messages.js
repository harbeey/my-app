import { Router } from "express";
import Message from "../models/Message.js";
import { authMiddleware } from "../middleware/auth.js";
import { isMongoConnected } from "../storage.js";
import mongoose from "mongoose";

const router = Router();

router.use(authMiddleware);

// In-memory store for messages
const inMemoryMessages = [];

// Unread counts per user
router.get("/unread/counts", async (req, res) => {
  const me = req.user.sub;
  let counts = {};

  if (isMongoConnected()) {
    const pipeline = [
      {
        $match: {
          to: new mongoose.Types.ObjectId(me),
          readAt: { $exists: false },
        },
      },
      { $group: { _id: "$from", count: { $sum: 1 } } },
    ];
    const agg = await Message.aggregate(pipeline);
    counts = Object.fromEntries(agg.map((a) => [String(a._id), a.count]));
  } else {
    const unread = inMemoryMessages.filter(
      (msg) => String(msg.to) === String(me) && !msg.readAt
    );
    for (const msg of unread) {
      const fromId = String(msg.from);
      counts[fromId] = (counts[fromId] || 0) + 1;
    }
  }

  return res.json(counts);
});

// List conversation with a user
router.get("/:userId", async (req, res) => {
  const other = req.params.userId;
  const me = req.user.sub;
  let msgs;

  if (isMongoConnected()) {
    msgs = await Message.find({
      $or: [
        { from: me, to: other },
        { from: other, to: me },
      ],
    })
      .sort({ createdAt: 1 })
      .lean();
  } else {
    msgs = inMemoryMessages
      .filter(
        (msg) =>
          (String(msg.from) === String(me) &&
            String(msg.to) === String(other)) ||
          (String(msg.from) === String(other) && String(msg.to) === String(me))
      )
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }

  return res.json(msgs);
});

// Send a message
router.post("/:userId", async (req, res) => {
  const to = req.params.userId;
  const me = req.user.sub;
  const { body } = req.body || {};
  if (!body) return res.status(400).json({ error: "Message body required" });

  let msg;
  if (isMongoConnected()) {
    msg = await Message.create({ from: me, to, body });
  } else {
    msg = {
      _id: `msg_${Date.now()}`,
      from: me,
      to,
      body,
      createdAt: new Date().toISOString(),
      toObject: () => msg, // for socket compatibility
    };
    inMemoryMessages.push(msg);
  }

  const io = req.app.get("io");
  if (io)
    io.to(`user:${to}`).emit("msg:new", {
      ...msg.toObject(),
      id: String(msg._id),
    });

  return res.status(201).json(msg);
});

// Mark conversation read
router.post("/:userId/read", async (req, res) => {
  const other = req.params.userId;
  const me = req.user.sub;

  if (isMongoConnected()) {
    await Message.updateMany(
      { from: other, to: me, readAt: { $exists: false } },
      { $set: { readAt: new Date() } }
    );
  } else {
    inMemoryMessages.forEach((msg) => {
      if (
        String(msg.from) === String(other) &&
        String(msg.to) === String(me) &&
        !msg.readAt
      ) {
        msg.readAt = new Date().toISOString();
      }
    });
  }

  return res.json({ ok: true });
});

export default router;
