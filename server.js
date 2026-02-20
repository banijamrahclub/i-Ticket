const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'trips.json');

// يسمح للسيرفر بفهم البيانات القادمة من الواجهة
app.use(express.json());
// يسمح للسيرفر بعرض ملفات الموقع (HTML, CSS, JS)
app.use(express.static(__dirname));

// الحصول على قائمة الرحلات
app.get('/api/trips', (req, res) => {
    if (fs.existsSync(DATA_FILE)) {
        const data = fs.readFileSync(DATA_FILE);
        res.json(JSON.parse(data));
    } else {
        res.json([]);
    }
});

// حفظ قائمة الرحلات
app.post('/api/trips', (req, res) => {
    const trips = req.body;
    fs.writeFileSync(DATA_FILE, JSON.stringify(trips, null, 2));
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
