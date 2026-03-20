const express = require('express');
const fs = require('fs');
const path = require('path');
const sheetsService = require('./sheetsService');

const app = express();
const PORT = process.env.PORT || 3000;

// --- إعدادات مسار التخزين المستمر (Render Disk) ---
// إذا كان التطبيق يعمل على ريندر، سنستخدم المسار المعرف في المتغيرات البيئية، وإلا سنستخدم المجلد الحالي
const STORAGE_ROOT = process.env.RENDER_DISK_PATH || __dirname;
const UPLOADS_DIR = path.join(STORAGE_ROOT, 'uploads');

// التأكد من وجود مجلد الرفع
if (!fs.existsSync(UPLOADS_DIR)) {
    console.log(`Creating uploads directory at: ${UPLOADS_DIR}`);
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// هجرة البيانات: إذا كانت هناك ملفات JSON في المجلد الحالي وليست في الديسك، انقلها
const filesToMigrate = ['trips_iticket.json', 'trips_manama.json', 'config.json'];
filesToMigrate.forEach(fileName => {
    const localFile = path.join(__dirname, fileName);
    const diskFile = path.join(STORAGE_ROOT, fileName);
    if (STORAGE_ROOT !== __dirname && fs.existsSync(localFile) && !fs.existsSync(diskFile)) {
        console.log(`Migrating ${fileName} to persistent disk...`);
        fs.copyFileSync(localFile, diskFile);
    }
});

app.use(express.json({ limit: '50mb' }));
app.use(express.static(__dirname));

// تقديم الصور من المجلد المستمر (Disk)
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

// --- إدارة الإعدادات العامة (Config) ---
const CONFIG_FILE = path.join(STORAGE_ROOT, 'config.json');

app.get('/api/config', (req, res) => {
    if (fs.existsSync(CONFIG_FILE)) {
        try {
            const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
            return res.json(config);
        } catch (e) {
            console.error("Error reading config:", e);
        }
    }
    res.json({
        iticket_desc: "الرحلات الخارجية والمؤتمرات والسياحة الدولية. استمتع بأفضل العروض حول العالم.",
        manama_desc: "اكتشف أرقى الفنادق، الشاليهات، والمنتجعات الاستثنائية في مملكة البحرين. إقامتك المثالية تبدأ هنا."
    });
});

app.post('/api/config', (req, res) => {
    try {
        let currentConfig = {};
        if (fs.existsSync(CONFIG_FILE)) {
            const raw = fs.readFileSync(CONFIG_FILE, 'utf8').trim();
            if (raw) {
                try { currentConfig = JSON.parse(raw); } catch (pe) {}
            }
        }
        const updatedConfig = { ...currentConfig, ...req.body };
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(updatedConfig, null, 2), 'utf8');
        res.json({ success: true, config: updatedConfig });
    } catch (e) {
        res.status(500).json({ error: e.toString() });
    }
});

app.get('/ping', (req, res) => res.send('pong ' + Date.now()));

// API لربط الملفات مع المجلد المستمر
function getDataFilePath(brand) {
    return path.join(STORAGE_ROOT, `trips_${brand}.json`);
}

app.get('/api/:brand/trips', async (req, res) => {
    const { brand } = req.params;
    const DATA_FILE = getDataFilePath(brand);

    if (fs.existsSync(DATA_FILE)) {
        try {
            const localData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
            return res.json(localData);
        } catch (e) {
            console.error("Error reading data file:", e);
        }
    }
    res.json([]);
});

// دالة لحفظ الصورة محلياً (في Render Disk)
function saveImageLocally(fileName, base64Data) {
    try {
        const filePath = path.join(UPLOADS_DIR, fileName);
        fs.writeFileSync(filePath, base64Data, 'base64');
        return `/uploads/${fileName}`; // المسار الذي سيتم استخدامه في المتصفح
    } catch (error) {
        console.error('Local Save Error:', error);
        return null;
    }
}

// دالة لرفع الصورة إلى قيت هاب (اختياري، كنسخة احتياطية)
async function uploadToGitHub(fileName, base64Data) {
    const GITHUB_CONFIG = {
        token: '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',
        owner: 'banijamrahclub',
        repo: 'i-Ticket-photo',
        branch: 'main'
    };

    if (GITHUB_CONFIG.token === 'YOUR_GITHUB_TOKEN' || !GITHUB_CONFIG.token) return null;

    const axios = require('axios');
    const url = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/uploads/${fileName}`;

    try {
        await axios.put(url, {
            message: `Upload image: ${fileName}`,
            content: base64Data,
            branch: GITHUB_CONFIG.branch
        }, {
            headers: {
                'Authorization': `token ${GITHUB_CONFIG.token}`,
                'Content-Type': 'application/json',
                'User-Agent': 'Travel-App'
            }
        });
        return `https://raw.githubusercontent.com/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/${GITHUB_CONFIG.branch}/uploads/${fileName}`;
    } catch (error) {
        // لا نريد تعطيل العملية إذا فشل قيت هاب، طالما تم الحفظ في التخزين المستمر
        return null;
    }
}

app.post('/api/:brand/trips', async (req, res) => {
    const { brand } = req.params;
    const DATA_FILE = getDataFilePath(brand);
    let trips = req.body;

    for (let t of trips) {
        if (t.images && Array.isArray(t.images)) {
            const uploadPromises = t.images.map(async (img, idx) => {
                if (img && img.startsWith('data:image')) {
                    const parts = img.split(';base64,');
                    const mime = parts[0].split(':')[1];
                    const ext = mime.split('/')[1] === 'jpeg' ? 'jpg' : mime.split('/')[1];
                    const fileName = `img_${brand}_${t.id}_${idx}_${Date.now()}.${ext}`;
                    const base64Content = parts[1];

                    // أولاً: حفظ الصورة في ريندر ديسك (التخزين الأساسي والمضمون)
                    const localUrl = saveImageLocally(fileName, base64Content);
                    
                    // ثانياً: محاولة الرفع لقيت هاب (اختياري كنسخة احتياطية)
                    // إذا أردت الرفع لقيت هاب أيضاً، افعل ذلك هنا. 
                    // إذا كان localUrl موجوداً، سنستخدمه لضمان ظهور الصورة حتى لو فشل قيت هاب.
                    
                    // سنستخدم الرابط المحلي كخيار افتراضي لأنه الأسرع والأضمن مع ريندر ديسك
                    if (localUrl) return localUrl;

                    return 'https://via.placeholder.com/800x600?text=Save+Failed';
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
    console.log(`Persistent storage set to: ${STORAGE_ROOT}`);
});

