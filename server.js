const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors()); // <-- Thêm dòng này
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Route mặc định
app.get("/", (req, res) => {
    res.send(`
        <h2>✅ Quiz Backend API đang chạy!</h2>
        <p>Dùng <a href="/api/questions">/api/questions</a> để lấy danh sách câu hỏi.</p>
        <p>POST vào <code>/api/questions</code> để thêm câu hỏi mới.</p>
    `);
});

// Alias /questions → /api/questions
app.get("/questions", (req, res) => {
    res.redirect("/api/questions");
});

// API đọc danh sách câu hỏi
app.get("/api/questions", (req, res) => {
    fs.readFile(path.join(__dirname, "data", "questions.json"), "utf8", (err, data) => {
        if (err) return res.status(500).json({ error: "Lỗi đọc file câu hỏi." });
        res.json(JSON.parse(data));
    });
});

// API ghi câu hỏi mới
app.post("/api/questions", (req, res) => {
    const incomingData = req.body;
    const newQuestions = Array.isArray(incomingData) ? incomingData : [incomingData];

    newQuestions.forEach(q => {
        if (typeof q.answer === "string") q.answer = q.answer.split("|").map(a => a.trim());
        if (typeof q.options === "string") q.options = q.options.split("|").map(o => o.trim());
    });

    const dirPath = path.join(__dirname, "data");
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath);

    const filePath = path.join(dirPath, "questions.json");

    let questions = [];
    if (fs.existsSync(filePath)) {
        try {
            questions = JSON.parse(fs.readFileSync(filePath, "utf8"));
            if (!Array.isArray(questions)) questions = [];
        } catch {
            questions = [];
        }
    }

    questions.push(...newQuestions);

    try {
        fs.writeFileSync(filePath, JSON.stringify(questions, null, 2), "utf8");
        res.json({ message: "✅ Thêm thành công", total: questions.length });
    } catch {
        res.status(500).json({ error: "❌ Lỗi ghi file" });
    }
});

app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});