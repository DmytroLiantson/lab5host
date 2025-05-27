const express = require("express");
const cors = require("cors");
const path = require("path");
const admin = require("firebase-admin");
const serviceAccount = JSON.parse(process.env.serviceAccountKey);


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/lessons", async (req, res) => {
  try {
    const snapshot = await db.collection("lessons").get();
    const lessons = [];
    snapshot.forEach((doc) => {
      lessons.push({ id: String(doc.id), ...doc.data() });
    });
    res.json(lessons);
  } catch (error) {
    console.error("Error fetching lessons:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/total-lessons", async (req, res) => {
  try {
    const snapshot = await db.collection("lessons").get();
    res.json({ total: snapshot.size });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/lessons-progress", async (req, res) => {
  try {
    const { userId, dateFilter } = req.query;
    if (!userId) {
      return res.json([]);
    }
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      await userRef.set({ completedLessons: [] });
      return res.json([]);
    }
    let completedLessons = userDoc.data().completedLessons || [];
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      completedLessons = completedLessons.filter(
        (lesson) =>
          new Date(lesson.completedAt).toDateString() === filterDate.toDateString()
      );
    }
    res.json(completedLessons);
  } catch (error) {
    console.error("Error fetching progress:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/lessons-progress", async (req, res) => {
  try {
    const { userId, lessonId, action } = req.body;
    if (!userId || !lessonId || !["add", "remove"].includes(action)) {
      return res
        .status(400)
        .json({ error: "userId, lessonId, and valid action (add/remove) are required" });
    }
    if (Array.isArray(lessonId)) {
      return res.status(400).json({ error: "lessonId must be a string, not an array" });
    }
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();
    let completedLessons = userDoc.exists ? userDoc.data().completedLessons || [] : [];

    if (action === "add") {
      if (!completedLessons.some((lesson) => lesson.lessonId === lessonId)) {
        completedLessons.push({
          lessonId: String(lessonId),
          completedAt: new Date().toISOString(),
        });
      }
    } else if (action === "remove") {
      completedLessons = completedLessons.filter((lesson) => lesson.lessonId !== lessonId);
    }

    await userRef.set({ completedLessons }, { merge: true });
    res.json({ message: "Lesson progress updated", completedLessons });
  } catch (error) {
    console.error("Error updating progress:", error);
    res.status(500).json({ error: error.message });
  }
});

app.use(express.static(path.join(__dirname, "../client/build")));

app.get("*", (req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "API route not found" });
  }
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
