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

// --- إعدادات قيت هاب (GitHub) لتخزين الصور ---
const GITHUB_CONFIG = {
    token: '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', // تم التحديث إلى Classic Token
    owner: 'banijamrahclub', // اسم المستخدم
    repo: 'i-Ticket-photo', // اسم المستودع
    branch: 'main'
};

// دالة لرفع الصورة إلى قيت هاب
async function uploadToGitHub(fileName, base64Data) {
    if (GITHUB_CONFIG.token === 'YOUR_GITHUB_TOKEN') return null;

    const axios = require('axios');
    const url = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/uploads/${fileName}`;

    try {
        const response = await axios.put(url, {
            message: `Upload image: ${fileName}`,
            content: base64Data,
            branch: GITHUB_CONFIG.branch
        }, {
            headers: {
                'Authorization': `token ${GITHUB_CONFIG.token}`,
                'Content-Type': 'application/json',
                'User-Agent': 'Travel-App' // هيدر مطلوب من قيت هاب
            }
        });
        // إرجاع الرابط المباشر للصورة على قيت هاب
        return `https://raw.githubusercontent.com/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/${GITHUB_CONFIG.branch}/uploads/${fileName}`;
    } catch (error) {
        console.error('GitHub Upload Error:', error.response ? error.response.data : error.message);
        return null;
    }
}

app.post('/api/:brand/trips', async (req, res) => {
    const { brand } = req.params;
    const DATA_FILE = path.join(__dirname, `trips_${brand}.json`);
    let trips = req.body;

    // معالجة الصور ورفعها لقيت هاب (بشكل متوازي لتسريع العملية)
    for (let t of trips) {
        if (t.images && Array.isArray(t.images)) {
            const uploadPromises = t.images.map(async (img, idx) => {
                if (img && img.startsWith('data:image')) {
                    const parts = img.split(';base64,');
                    const mime = parts[0].split(':')[1];
                    const ext = mime.split('/')[1] === 'jpeg' ? 'jpg' : mime.split('/')[1];
                    const fileName = `img_${brand}_${t.id}_${idx}_${Date.now()}.${ext}`;
                    const base64Content = parts[1];

                    const githubUrl = await uploadToGitHub(fileName, base64Content);
                    if (githubUrl) return githubUrl;

                    // في حال فشل الرفع، نرجع رابطاً فارغاً أو رسالة خطأ بدلاً من التخزين المحلي
                    console.error(`Failed to upload ${fileName} to GitHub. Local storage is skipped.`);
                    return 'https://via.placeholder.com/800x600?text=Upload+Failed+Check+Permissions';
                }
                return img;
            });

            t.images = await Promise.all(uploadPromises);
            if (t.images.length > 0) t.image = t.images[0];
        }
    }

    fs.writeFileSync(DATA_FILE, JSON.stringify(trips, null, 2));
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
