// --- Global Database Configuration (Web Service) ---
const brand = window.BRAND || 'iticket';
const API_URL = `/api/${brand}/trips`;

let allTrips = [];
let currentPriceCategories = [];
let currentGalleryGroups = []; // Array of { label: string, images: string[] }

// Fetch Data
async function fetchTrips() {
    console.log(`Attempting to fetch trips from: ${API_URL}`);
    try {
        const response = await fetch(API_URL);
        if (response.ok) {
            allTrips = await response.json() || [];
            window.allTrips = allTrips; // Share with HTML script
            console.log(`Successfully loaded ${allTrips.length} trips.`);
            renderTrips();
            if (typeof renderOffersManagement === 'function') renderOffersManagement();
        } else {
            console.error(`Fetch failed with status: ${response.status}`);
        }
    } catch (error) {
        console.error("Error fetching trips:", error);
    }
}

// Save Data
async function saveAllToCloud(trips) {
    allTrips = trips;
    window.allTrips = allTrips; // Sync global
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

// Price Categories Logic
window.addPriceCategory = (label = '', value = '') => {
    const div = document.createElement('div');
    div.className = 'grid price-row';
    div.style = 'display: grid; grid-template-columns: 1fr 1fr auto auto; gap: 10px; margin-bottom: 10px; align-items: center;';
    div.innerHTML = `
        <input type="text" placeholder="الفئة (مثلاً: كبار)" class="p-label" value="${label}" required>
        <input type="number" placeholder="السعر" class="p-value" value="${value}" required>
        <div style="display: flex; flex-direction: column; gap: 4px;">
            <button type="button" onclick="movePriceRow(this, -1)" style="background: rgba(255,255,255,0.05); color: #888; border: 1px solid #444; border-radius: 4px; padding: 2px 8px; cursor: pointer; font-size: 0.7rem;"><i class="fa fa-chevron-up"></i></button>
            <button type="button" onclick="movePriceRow(this, 1)" style="background: rgba(255,255,255,0.05); color: #888; border: 1px solid #444; border-radius: 4px; padding: 2px 8px; cursor: pointer; font-size: 0.7rem;"><i class="fa fa-chevron-down"></i></button>
        </div>
        <button type="button" onclick="this.parentElement.remove()" class="btn-delete" style="padding: 10px 15px;"><i class="fa fa-trash-alt"></i></button>
    `;
    priceContainer.appendChild(div);
};

window.movePriceRow = (btn, direction) => {
    const row = btn.closest('.price-row');
    if (direction === -1 && row.previousElementSibling) {
        row.parentNode.insertBefore(row, row.previousElementSibling);
    } else if (direction === 1 && row.nextElementSibling) {
        row.parentNode.insertBefore(row.nextElementSibling, row);
    }
};

// Render Table
function renderTrips() {
    const list = document.getElementById('trips-list');
    if (!list) return;
    
    // Helper to get labels
    const getCatLabel = (typeId) => {
        let cats = [];
        if (brand === 'iticket') cats = window.iticketCategories || [];
        else cats = window.manamaCategories || [];
        const found = (cats || []).find(c => c.id === typeId);
        return found ? found.label : typeId;
    };

    if (!allTrips || allTrips.length === 0) {
        list.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 40px; color: #888;">لا توجد رحلات مضافة حالياً.</td></tr>';
        return;
    }

    try {
        list.innerHTML = allTrips.map((trip, index) => {
            if (!trip) return '';
            const displayPrice = (trip.prices && trip.prices.length > 0) ? trip.prices[0].value : (trip.price || '0');
            const displayImage = (trip.images && trip.images.length > 0) ? trip.images[0] : (trip.image || '');

            return `
                <tr>
                    <td>
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <img src="${displayImage}" class="trip-img-mini" onerror="this.src='https://via.placeholder.com/60/222/888?text=No+Img'">
                            <div>
                                <div style="font-weight: bold;">${trip.name || 'بدون اسم'}</div>
                                <div style="font-size: 0.8rem; color: #888;">${trip.category || 'بدون تقسيم'}</div>
                            </div>
                        </div>
                    </td>
                    <td><span style="background: rgba(255,255,255,0.05); padding: 4px 10px; border-radius: 6px; font-size: 0.85rem;">${getCatLabel(trip.type)}</span></td>
                    <td><b style="color: var(--primary-red);">${displayPrice}</b> دينار</td>
                    <td>${trip.duration || '-'}</td>
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
    } catch (err) {
        console.error("Critical Render Error:", err);
        list.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 40px; color: #e74c3c;">خطأ في عرض البيانات. يرجى التأكد من صحة البيانات المضافة.</td></tr>';
    }
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
        description: document.getElementById('trip-description').value,
        // تجميع كافة الصور من الأقسام للعرض في البطاقات
        images: currentGalleryGroups.reduce((acc, g) => acc.concat(g.images), []),
        image: (currentGalleryGroups.length > 0 && currentGalleryGroups[0].images.length > 0) ? currentGalleryGroups[0].images[0] : '',
        badge: document.getElementById('trip-badge').value,
        gallery_groups: currentGalleryGroups
    };

    // relaxed validation
    const submitBtn = tripForm.querySelector('button[type="submit"]');
    
    // No longer mandatory to have groups or labels
    // but we should filter out empty groups
    const finalGroups = currentGalleryGroups.filter(g => g.images.length > 0);

    const tripData = {
        name: document.getElementById('trip-name').value,
        type: document.getElementById('trip-type').value,
        category: document.getElementById('trip-category').value,
        duration: document.getElementById('trip-duration').value,
        transport: document.getElementById('trip-transport').value,
        prices: currentPriceCategories,
        price: currentPriceCategories[0]?.value || 0,
        description: document.getElementById('trip-description').value,
        badge: document.getElementById('trip-badge').value,
        gallery_groups: finalGroups,
        // Fallback for older systems
        images: finalGroups.length > 0 ? finalGroups[0].images : [] 
    };

    const originalBtnText = submitBtn.innerText;
    submitBtn.innerText = 'جاري الحفظ والرفع...';
    submitBtn.disabled = true;

    const updated = [...allTrips];
    if (isEdit) updated[index] = tripData;
    else updated.push(tripData);

    tripModal.style.display = 'none';
    await saveAllToCloud(updated);
    submitBtn.innerText = originalBtnText;
    submitBtn.disabled = false;
};

function renderImagesPreview() { }
window.removeImage = (idx) => { }

const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

// Gallery Groups Management
window.renderGalleryGroups = () => {
    const container = document.getElementById('gallery-groups-container');
    if (!container) return;
    container.innerHTML = currentGalleryGroups.map((group, gIdx) => `
        <div class="gallery-group-item" style="background: rgba(255,255,255,0.03); padding: 15px; border-radius: 12px; margin-bottom: 20px; border: 1px solid #444;">
            <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                <input type="text" placeholder="اسم التصنيف (اختياري)" value="${group.label}" 
                    style="flex: 1; padding: 8px; background: #111; border: 1px solid #333; border-radius: 8px; color: white;"
                    onchange="currentGalleryGroups[${gIdx}].label = this.value">
                <button type="button" onclick="removeGalleryGroup(${gIdx})" class="btn-delete" style="padding: 5px 10px;"><i class="fa fa-trash"></i></button>
            </div>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 10px;">
                ${group.images.map((img, iIdx) => `
                    <div style="position:relative; height: 50px;">
                        <img src="${img}" style="width:100%; height:100%; object-fit:cover; border-radius: 6px;">
                        <button type="button" onclick="removeImageFromGroup(${gIdx}, ${iIdx})" style="position:absolute; top:-5px; right:-5px; background:red; color:white; border:none; border-radius:50%; width:18px; height:18px; font-size:9px; cursor:pointer;">&times;</button>
                    </div>
                `).join('')}
            </div>
            <input type="file" multiple accept="image/*" onchange="addImagesToGroup(event, ${gIdx})" style="font-size: 0.8rem; color: #888;">
        </div>
    `).join('');
};

window.addNewGalleryGroup = (label = '') => {
    currentGalleryGroups.push({ label: label || 'صور عامة', images: [] });
    renderGalleryGroups();
};

window.removeGalleryGroup = (idx) => {
    currentGalleryGroups.splice(idx, 1);
    renderGalleryGroups();
};

window.addImagesToGroup = async (e, gIdx) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
        const base64 = await toBase64(file);
        currentGalleryGroups[gIdx].images.push(base64);
    }
    renderGalleryGroups();
};

window.removeImageFromGroup = (gIdx, iIdx) => {
    currentGalleryGroups[gIdx].images.splice(iIdx, 1);
    renderGalleryGroups();
};

// Open Modals
if (openAddModalBtn) {
    openAddModalBtn.onclick = () => {
        document.getElementById('trip-id').value = "";
        document.getElementById('modal-title').innerText = "إضافة رحلة جديدة";
        document.getElementById('trip-form').reset();
        priceContainer.innerHTML = '';
        currentGalleryGroups = [];
        renderGalleryGroups();
        addPriceCategory('سعر الشخص', '');
        tripModal.style.display = 'flex';
    };
}

window.editTrip = (index) => {
    const trip = allTrips[index];
    document.getElementById('trip-id').value = index;
    document.getElementById('modal-title').innerText = "تعديل الرحلة";
    document.getElementById('trip-name').value = trip.name;
    document.getElementById('trip-type').value = trip.type;
    document.getElementById('trip-category').value = trip.category || '';
    document.getElementById('trip-duration').value = trip.duration;
    document.getElementById('trip-transport').value = trip.transport || '';
    document.getElementById('trip-description').value = trip.description || '';
    document.getElementById('trip-badge').value = trip.badge || '';

    priceContainer.innerHTML = '';
    (trip.prices || []).forEach(p => addPriceCategory(p.label, p.value));
    if (!trip.prices || trip.prices.length === 0) addPriceCategory('السعر', trip.price);
    
    // Handle migration from old images array to gallery groups
    if (trip.gallery_groups && trip.gallery_groups.length > 0) {
        currentGalleryGroups = JSON.parse(JSON.stringify(trip.gallery_groups));
    } else if (trip.images && trip.images.length > 0) {
        currentGalleryGroups = [{ label: 'صور عامة', images: [...trip.images] }];
    } else {
        currentGalleryGroups = [];
    }
    
    renderGalleryGroups();
    tripModal.style.display = 'flex';
};

closeModalBtn.onclick = () => tripModal.style.display = 'none';

fetchTrips();
