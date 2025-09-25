import { Router } from "express";
import Board from "../models/Board.js";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/auth.js";
import { isMongoConnected } from "../storage.js";

const router = Router();

router.use(authMiddleware);

// In-memory store for boards
const inMemoryBoards = new Map();
let nextBoardId = 1;

function canAccess(board, userId) {
  const uid = String(userId);
  return (
    String(board.owner) === uid ||
    (board.members || []).some((m) => String(m) === uid)
  );
}

router.post("/", async (req, res) => {
  if (isMongoConnected()) {
    const { title, data } = req.body || {};
    const board = await Board.create({
      title: title || "Untitled Board",
      owner: req.user.sub,
      members: [],
      data: data || {},
    });
    return res.status(201).json(board);
  } else {
    const { title, data } = req.body || {};
    const board = {
      id: `board_${nextBoardId++}`,
      _id: `board_${nextBoardId - 1}`,
      title: title || "Untitled Board",
      owner: req.user.sub,
      members: [],
      data: data || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    inMemoryBoards.set(board.id, board);
    return res.status(201).json(board);
  }
});

router.get("/:id", async (req, res) => {
  let board;
  if (isMongoConnected()) {
    board = await Board.findById(req.params.id);
  } else {
    board = inMemoryBoards.get(req.params.id);
  }

  if (!board) return res.status(404).json({ error: "Not found" });
  if (!canAccess(board, req.user.sub))
    return res.status(403).json({ error: "Forbidden" });

  return res.json(board);
});

router.put("/:id", async (req, res) => {
  let board;
  if (isMongoConnected()) {
    board = await Board.findById(req.params.id);
  } else {
    board = inMemoryBoards.get(req.params.id);
  }

  if (!board) return res.status(404).json({ error: "Not found" });
  if (!canAccess(board, req.user.sub))
    return res.status(403).json({ error: "Forbidden" });

  board.title = req.body.title ?? board.title;
  board.data = req.body.data ?? board.data;
  board.updatedAt = new Date().toISOString();

  if (isMongoConnected()) {
    await board.save();
  }

  // emit socket update
  const io = req.app.get("io");
  if (io) {
    io.to(`teamBoard:${board.id || board._id}`).emit("teamBoard:update", {
      id: board.id || board._id,
      data: board.data,
      title: board.title,
    });
  }

  return res.json(board);
});

router.post("/:id/share", async (req, res) => {
  // This is complex with in-memory, as it requires looking up users.
  // For now, we'll only support this for DB mode.
  if (!isMongoConnected()) {
    return res
      .status(501)
      .json({ error: "Sharing is not implemented for in-memory mode." });
  }

  const board = await Board.findById(req.params.id);
  if (!board) return res.status(404).json({ error: "Not found" });
  if (String(board.owner) !== String(req.user.sub))
    return res.status(403).json({ error: "Only owner can share" });

  const { email } = req.body || {};
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: "User not found" });

  if (!board.members.find((m) => String(m) === String(user.id))) {
    board.members.push(user.id);
    await board.save();
  }

  const io = req.app.get("io");
  if (io)
    io.to(`user:${user.id}`).emit("board:shared", {
      boardId: board.id,
      title: board.title,
    });
  return res.json({ ok: true });
});

export default router;
