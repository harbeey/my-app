import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { authMiddleware } from "../middleware/auth.js";
import { TeamService } from "../services/teamService.js"; // Assuming you create this service

const router = Router();

// Default settings for a new team
const defaultTeamSettings = {
  allowMemberInvites: true,
  allowTaskCreation: true,
  allowTaskAssignment: true,
  maxMembers: 10,
  visibility: "public",
};

router.use(authMiddleware);

router.get("/", async (req, res) => {
  try {
    const teams = await TeamService.findAll();
    res.json(teams);
  } catch (error) {
    console.error("Error fetching teams:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch teams", details: error.message });
  }
});

router.get("/mine", async (req, res) => {
  try {
    const teams = await TeamService.findByUserId(req.user.sub);
    res.json(teams);
  } catch (error) {
    console.error("Error fetching user teams:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch user teams", details: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    let { name, description, settings } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Team name is required" });
    }

    const teamId = `team_${uuidv4()}`;
    const now = new Date().toISOString();

    // Create a base team object to reduce duplication
    const teamData = {
      id: teamId,
      name: name.trim(),
      description: description || "",
      settings: { ...defaultTeamSettings, ...settings },
      members: [
        {
          userId: req.user.sub,
          email: req.user.email,
          name: req.user.name || req.user.email,
          role: "owner",
          isActive: true,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    const team = await TeamService.create(teamData);

    const io = req.app.get("io");
    if (io) io.emit("team:created", team); // Broadcast team creation
    res.status(201).json({ ok: true, team });
  } catch (error) {
    console.error("Error creating team:", error);
    res
      .status(500)
      .json({ error: "Failed to create team", details: error.message });
  }
});

router.post("/:id/join", async (req, res) => {
  try {
    const team = await TeamService.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    const isAlreadyMember = team.members.some((m) => m.userId === req.user.sub);

    if (isAlreadyMember) {
      return res.json({
        ok: true,
        message: "Already a member of this team",
        team,
      });
    }

    if (
      team.members.length <
      (team.settings.maxMembers || defaultTeamSettings.maxMembers)
    ) {
      team.members.push({
        userId: req.user.sub,
        email: req.user.email,
        name: req.user.name || req.user.email,
        role: "member",
        isActive: true,
      });
      team.updatedAt = new Date().toISOString();
      await TeamService.update(team);
    }

    const io = req.app.get("io");
    if (io) io.emit("team:updated", team); // Broadcast team update
    res.json({ ok: true, team });
  } catch (error) {
    console.error("Error joining team:", error);
    res
      .status(500)
      .json({ error: "Failed to join team", details: error.message });
  }
});

export default router;
