const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 4000;

// Cho phép nhận JSON từ client
app.use(express.json());

// Serve static files từ thư mục public
app.use(express.static(path.join(__dirname, "public")));

// API đọc danh sách câu hỏi
app.get("/api/questions", (req, res) => {
    fs.readFile(path.join(__dirname, "data", "questions.json"), "utf8", (err, data) => {
        if (err) return res.status(500).json({ error: "Lỗi đọc file câu hỏi." });
        res.json(JSON.parse(data));
    });
});

// API ghi câu hỏi mới (hỗ trợ nhiều câu hỏi một lúc)
app.post("/api/questions", (req, res) => {
    //console.log("📥 Nhận request:", req.body);

    const incomingData = req.body;
    const newQuestions = Array.isArray(incomingData) ? incomingData : [incomingData];

    // Convert answer/options sang mảng nếu là string
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
        //console.log(`✅ Đã lưu ${newQuestions.length} câu hỏi, tổng: ${questions.length}`);
        res.json({ message: "✅ Thêm thành công", total: questions.length });
    } catch (err) {
        //console.error("❌ Lỗi ghi file:", err);
        res.status(500).json({ error: "❌ Lỗi ghi file" });
    }
});

// Chạy server
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});