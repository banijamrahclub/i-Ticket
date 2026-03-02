const express = require('express');
const fs = require('fs');
const path = require('path');
const sheetsService = require('./sheetsService');

const app = express();
const PORT = process.env.PORT || 3000;
const UPLOADS_DIR = path.join(__dirname, 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);

app.use(express.json({ limit: '50mb' }));
app.use(express.static(__dirname));
app.use('/uploads', express.static(UPLOADS_DIR));

// توجيهات الصفحات
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/iticket', (req, res) => res.sendFile(path.join(__dirname, 'iticket.html')));
app.get('/manama', (req, res) => res.sendFile(path.join(__dirname, 'manama.html')));
app.get('/trip', (req, res) => res.sendFile(path.join(__dirname, 'trip.html')));

// صفحات الإدارة
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin_welcome.html')));
app.get('/admin_iticket', (req, res) => res.sendFile(path.join(__dirname, 'admin_iticket.html')));
app.get('/admin_manama', (req, res) => res.sendFile(path.join(__dirname, 'admin_manama.html')));

// API لكل ماركة
app.get('/api/:brand/trips', async (req, res) => {
    const { brand } = req.params;
    const DATA_FILE = path.join(__dirname, `trips_${brand}.json`);

    let localData = [];
    if (fs.existsSync(DATA_FILE)) {
        localData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        return res.json(localData);
    }
    res.json([]);
});

app.post('/api/:brand/trips', async (req, res) => {
    const { brand } = req.params;
    const DATA_FILE = path.join(__dirname, `trips_${brand}.json`);
    let trips = req.body;

    try {
        trips = trips.map(t => {
            if (t.images && Array.isArray(t.images)) {
                t.images = t.images.map((img, idx) => {
                    if (img && img.startsWith('data:image')) {
                        try {
                            const p = img.split(';base64,');
                            const e = p[0].split('/')[1].split('+')[0] === 'jpeg' ? 'jpg' : p[0].split('/')[1].split('+')[0];
                            const f = `img_${brand}_${t.id}_${idx}_${Date.now()}.${e}`;
                            fs.writeFileSync(path.join(UPLOADS_DIR, f), Buffer.from(p[1], 'base64'));
                            return `/uploads/${f}`;
                        } catch (err) { return img; }
                    }
                    return img;
                });
                if (t.images.length > 0) t.image = t.images[0];
            }
            return t;
        });
    } catch (e) { console.error("Image processing error:", e); }

    fs.writeFileSync(DATA_FILE, JSON.stringify(trips, null, 2));
    res.json({ success: true });

    // مزامنة اختيارية مع قوقل شيت (تحتاج تعديل في sheetsService لتدعم الماركتين إذا أردت)
    // sheetsService.syncTripsToSheet(trips).catch(e => {});
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
