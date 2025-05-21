const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static("../build", { extensions: ['html'] }));
console.log("Serving static files from:", "../build");

app.get(/^\/(?!api).*$/, (req, res) => {
    res.sendFile("index.html", { root: "../build" }, (err) => {
        if (err) {
            console.error("Error serving index.html:", err);
            res.status(500).send("Error serving the application");
        }
    });
});

app.get("/api/lessons", async (req, res) => {
    try {
        const snapshot = await db.collection("lessons").get(); 
        const lessons = [];
        snapshot.forEach((doc) => {
            console.log("Found document:", doc.id, doc.data()); 
            lessons.push({ id: doc.id, ...doc.data() });
        });
        console.log("Returning lessons:", lessons);
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
            completedLessons = completedLessons.filter(lesson =>
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
        console.log("Received POST /api/lessons-progress:", { userId, lessonId, action });
        if (!userId || !lessonId || !['add', 'remove'].includes(action)) {
            return res.status(400).json({ error: "userId, lessonId, and valid action (add/remove) are required" });
        }
        if (Array.isArray(lessonId)) {
            return res.status(400).json({ error: "lessonId must be a string, not an array" });
        }
        const userRef = db.collection("users").doc(userId);
        const userDoc = await userRef.get();
        let completedLessons = userDoc.exists ? userDoc.data().completedLessons || [] : [];

        if (action === 'add') {
            if (!completedLessons.some(lesson => lesson.lessonId === lessonId)) {
                completedLessons.push({
                    lessonId: String(lessonId),
                    completedAt: new Date().toISOString()
                });
            }
        } else if (action === 'remove') {
            completedLessons = completedLessons.filter(lesson => lesson.lessonId !== lessonId);
        }

        await userRef.set({ completedLessons }, { merge: true });
        console.log("Updated completedLessons:", completedLessons);
        res.json({ message: "Lesson progress updated", completedLessons });
    } catch (error) {
        console.error("Error updating progress:", error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(5000, () => {
    console.log("Server is running on port 5000");
});