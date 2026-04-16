// --- Global Database Configuration (Web Service) ---
const brand = window.BRAND || 'iticket';
const API_URL = `/api/${brand}/trips`;

let allTrips = [];
let currentPriceCategories = [];
let currentImagesBase64 = [];

// Fetch Data
async function fetchTrips() {
    try {
        const response = await fetch(API_URL);
        if (response.ok) {
            allTrips = await response.json();
            renderTrips();
        }
    } catch (error) {
        console.error("Error fetching trips:", error);
    }
}

// Save Data
async function saveAllToCloud(trips) {
    allTrips = trips;
    renderTrips();

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(trips)
        });
        if (!response.ok) throw new Error('Failed to save');
    } catch (error) {
        console.error("Cloud Sync Error:", error);
        alert("تنبيه: تم الحفظ محلياً ولكن فشلت المزامنة مع السيرفر.");
    }
}

// UI Elements
const tripsList = document.getElementById('trips-list');
const tripModal = document.getElementById('trip-modal');
const tripForm = document.getElementById('trip-form');
const openAddModalBtn = document.getElementById('open-add-modal');
const closeModalBtn = document.getElementById('close-modal');
const priceContainer = document.getElementById('price-categories-container');
const imagesPreviewContainer = document.getElementById('images-preview-container');

// Price Categories Logic
window.addPriceCategory = (label = '', value = '') => {
    const div = document.createElement('div');
    div.className = 'grid price-row';
    div.style = 'display: grid; grid-template-columns: 1fr 1fr auto; gap: 10px; margin-bottom: 10px;';
    div.innerHTML = `
        <input type="text" placeholder="الفئة (مثلاً: كبار)" class="p-label" value="${label}" required>
        <input type="number" placeholder="السعر" class="p-value" value="${value}" required>
        <button type="button" onclick="this.parentElement.remove()" class="btn-delete" style="padding: 5px 10px;"><i class="fa fa-times"></i></button>
    `;
    priceContainer.appendChild(div);
};

// Render Table
function renderTrips() {
    if (!tripsList) return;
    
    // Helper to get labels from the categories loaded in the HTML script
    const getCatLabel = (typeId) => {
        let cats = [];
        if (brand === 'iticket') cats = window.iticketCategories || [];
        else cats = window.manamaCategories || [];
        const found = cats.find(c => c.id === typeId);
        return found ? found.label : typeId;
    };

    tripsList.innerHTML = allTrips.map((trip, index) => {
        const displayPrice = trip.prices && trip.prices.length > 0 ? trip.prices[0].value : (trip.price || '0');
        const displayImage = trip.images && trip.images.length > 0 ? trip.images[0] : (trip.image || '');

        return `
            <tr>
                <td>
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <img src="${displayImage}" class="trip-img-mini" onerror="this.src='https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1935&auto=format&fit=crop'">
                        <div>
                            <div style="font-weight: bold;">${trip.name}</div>
                            <div style="font-size: 0.8rem; color: #888;">${trip.category || 'بدون تقسيم'}</div>
                        </div>
                    </div>
                </td>
                <td><span style="background: rgba(255,255,255,0.05); padding: 4px 10px; border-radius: 6px; font-size: 0.85rem;">${getCatLabel(trip.type)}</span></td>
                <td><b style="color: var(--primary-red);">${displayPrice}</b> دينار</td>
                <td>${trip.duration}</td>
                <td>
                    <div class="actions">
                        <i class="fa fa-link" style="color: #f1c40f; cursor: pointer; background: rgba(241, 196, 15, 0.1); padding: 8px; border-radius: 8px;" title="نسخ الرابط" onclick="copyTripLink('${trip.id}')"></i>
                        <i class="fa fa-edit btn-edit" onclick="editTrip(${index})"></i>
                        <i class="fa fa-trash btn-delete" onclick="deleteTrip(${index})"></i>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

window.copyTripLink = (tripId) => {
    const link = `${window.location.origin}/trip?id=${tripId}&brand=${brand}`;
    navigator.clipboard.writeText(link).then(() => alert("تم نسخ رابط الرحلة!"));
};

// Delete Trip
window.deleteTrip = async (index) => {
    if (confirm('هل أنت متأكد من حذف هذه الرحلة؟')) {
        const updated = [...allTrips];
        updated.splice(index, 1);
        await saveAllToCloud(updated);
    }
}

// Form Submission
tripForm.onsubmit = async (e) => {
    e.preventDefault();
    const index = document.getElementById('trip-id').value;
    const isEdit = index !== "";

    const prices = [];
    document.querySelectorAll('.price-row').forEach(row => {
        prices.push({
            label: row.querySelector('.p-label').value,
            value: row.querySelector('.p-value').value
        });
    });

    const tripData = {
        id: isEdit ? allTrips[index].id : Date.now().toString(),
        name: document.getElementById('trip-name').value,
        type: document.getElementById('trip-type').value,
        category: document.getElementById('trip-category').value,
        price: prices.length > 0 ? prices[0].value : '0',
        prices: prices,
        duration: document.getElementById('trip-duration').value,
        transport: document.getElementById('trip-transport').value,
        description: document.getElementById('trip-description').value, // إضافة الوصف
        images: currentImagesBase64,
        image: currentImagesBase64.length > 0 ? currentImagesBase64[0] : '',
        badge: document.getElementById('trip-badge').value
    };

    const submitBtn = tripForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerText;
    submitBtn.innerText = 'جاري الحفظ والرفع...';
    submitBtn.disabled = true;

    const updated = [...allTrips];
    if (isEdit) updated[index] = tripData;
    else updated.push(tripData);

    // إغلاق النافذة فوراً لتحسين السرعة للمستخدم
    tripModal.style.display = 'none';

    await saveAllToCloud(updated);

    submitBtn.innerText = originalBtnText;
    submitBtn.disabled = false;
};

// Multiple Images Handling
document.getElementById('trip-images-file').addEventListener('change', async function (e) {
    const files = Array.from(e.target.files);
    if (files.length + currentImagesBase64.length > 16) {
        alert("الحد الأقصى هو 16 صورة إجمالاً");
        return;
    }

    for (const file of files) {
        const base64 = await toBase64(file);
        currentImagesBase64.push(base64);
    }
    renderImagesPreview();
});

function renderImagesPreview() {
    imagesPreviewContainer.innerHTML = '';
    currentImagesBase64.forEach((src, idx) => {
        const div = document.createElement('div');
        div.style = 'position:relative; width:100%; height:60px;';
        div.innerHTML = `
            <img src="${src}" style="width:100%; height:100%; object-fit:cover; border-radius:8px;">
            <button type="button" onclick="removeImage(${idx})" style="position:absolute; top:-5px; right:-5px; background:#e22; color:white; border:none; border-radius:50%; width:20px; height:20px; font-size:10px; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 5px rgba(0,0,0,0.3);"><i class="fa fa-times"></i></button>
        `;
        imagesPreviewContainer.appendChild(div);
    });
}

window.removeImage = (idx) => {
    currentImagesBase64.splice(idx, 1);
    renderImagesPreview();
}

const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

// Open Add Modal
openAddModalBtn.onclick = () => {
    tripForm.reset();
    priceContainer.innerHTML = '';
    imagesPreviewContainer.innerHTML = '';
    currentImagesBase64 = [];
    addPriceCategory('السعر الأساسي', '');
    document.getElementById('trip-id').value = '';
    document.getElementById('trip-category').value = '';
    document.getElementById('trip-description').value = ''; // تصفير الوصف
    document.getElementById('modal-title').innerText = 'إضافة رحلة جديدة';
    tripModal.style.display = 'flex';
};

closeModalBtn.onclick = () => tripModal.style.display = 'none';

// Edit Trip
window.editTrip = (index) => {
    const trip = allTrips[index];
    if (trip) {
        document.getElementById('trip-id').value = index;
        document.getElementById('trip-name').value = trip.name;
        document.getElementById('trip-type').value = trip.type;
        document.getElementById('trip-category').value = trip.category || '';
        document.getElementById('trip-duration').value = trip.duration;
        document.getElementById('trip-transport').value = trip.transport;
        document.getElementById('trip-description').value = trip.description || ''; // تحميل الوصف
        document.getElementById('trip-badge').value = trip.badge;
        document.getElementById('modal-title').innerText = 'تعديل بيانات الرحلة';

        priceContainer.innerHTML = '';
        if (trip.prices && trip.prices.length > 0) {
            trip.prices.forEach(p => addPriceCategory(p.label, p.value));
        } else {
            addPriceCategory('السعر الأساسي', trip.price);
        }

        currentImagesBase64 = trip.images || (trip.image ? [trip.image] : []);
        renderImagesPreview();

        tripModal.style.display = 'flex';
    }
};

fetchTrips();
