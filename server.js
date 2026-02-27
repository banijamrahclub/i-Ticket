const express = require('express');
const fs = require('fs');
const path = require('path');
const sheetsService = require('./sheetsService');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'trips.json');

app.use(express.json());
app.use(express.static(__dirname));

// الحصول على قائمة الرحلات
app.get('/api/trips', async (req, res) => {
    // حاول أولاً الحصول من قوقل شيت
    const sheetTrips = await sheetsService.getTripsFromSheet();

    if (sheetTrips !== null) {
        // إذا نجحنا في جلب البيانات من شيت، نحدث trips.json محلياً للمصداقية
        fs.writeFileSync(DATA_FILE, JSON.stringify(sheetTrips, null, 2));
        return res.json(sheetTrips);
    }

    // إذا فشل (مثلاً لا توجد صلاحيات أو ID خاطئ)، نستخدم الملف المحلي
    if (fs.existsSync(DATA_FILE)) {
        const data = fs.readFileSync(DATA_FILE);
        res.json(JSON.parse(data));
    } else {
        res.json([]);
    }
});

// حفظ قائمة الرحلات
app.post('/api/trips', async (req, res) => {
    const trips = req.body;

    // حفظ في الملف المحلي أولاً
    fs.writeFileSync(DATA_FILE, JSON.stringify(trips, null, 2));

    // مزامنة مع قوقل شيت في الخلفية
    const syncSuccess = await sheetsService.syncTripsToSheet(trips);

    res.json({ success: true, sheetsSynced: syncSuccess });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
