// --- Global Database Configuration (Web Service) ---
const brand = window.BRAND || 'iticket';
const API_URL = `/api/${brand}/trips`;

window.allTrips = [];
let currentPriceCategories = [];
let currentGalleryGroups = []; // Array of { label: string, images: string[] }

// Fetch Data
async function fetchTrips() {
    try {
        const response = await fetch(API_URL);
        if (response.ok) {
            window.allTrips = await response.json();
            renderTrips();
            if (typeof renderOffersManagement === 'function') renderOffersManagement();
        }
    } catch (error) {
        console.error("Error fetching trips:", error);
    }
}

// Save Data
async function saveAllToCloud(trips) {
    window.allTrips = trips;
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
    div.style = 'display: grid; grid-template-columns: 1fr 1fr auto; gap: 10px; margin-bottom: 10px;';
    div.innerHTML = `
        <input type="text" placeholder="الفئة (مثلاً: كبار)" class="p-label" value="${label}" required>
        <input type="number" placeholder="السعر" class="p-value" value="${value}" required>
        <button type="button" onclick="this.parentElement.remove()" class="btn-delete" style="padding: 5px 10px;"><i class="fa fa-times"></i></button>
    `;
    priceContainer.appendChild(div);
};

// Time Periods Logic
window.addTimePeriod = (label = '', checkIn = '', checkOut = '') => {
    const container = document.getElementById('time-periods-container');
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'time-period-row';
    div.style = 'display: grid; grid-template-columns: 1fr 1fr 1fr auto; gap: 8px; margin-bottom: 10px; background: rgba(0,0,0,0.2); padding: 10px; border-radius: 8px;';
    div.innerHTML = `
        <input type="text" placeholder="اسم الفترة (اختياري)" class="tp-label" value="${label}" style="padding: 5px; background: #000; border: 1px solid #333; color: white; font-size: 0.8rem; border-radius: 4px;">
        <div>
            <div style="font-size: 0.7rem; color: #888;">الدخول</div>
            <input type="time" class="tp-in" value="${checkIn}" style="width: 100%; padding: 5px; background: #000; border: 1px solid #333; color: white; font-size: 0.8rem; border-radius: 4px;">
        </div>
        <div>
            <div style="font-size: 0.7rem; color: #888;">الخروج</div>
            <input type="time" class="tp-out" value="${checkOut}" style="width: 100%; padding: 5px; background: #000; border: 1px solid #333; color: white; font-size: 0.8rem; border-radius: 4px;">
        </div>
        <button type="button" onclick="this.parentElement.remove()" class="btn-delete" style="padding: 5px 10px; align-self: center;"><i class="fa fa-times"></i></button>
    `;
    container.appendChild(div);
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

    tripsList.innerHTML = window.allTrips.map((trip, index) => {
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
                        <i class="fa ${trip.hidden ? 'fa-eye-slash' : 'fa-eye'}" 
                           style="color: ${trip.hidden ? '#888' : '#2ecc71'}; cursor: pointer; background: rgba(255,255,255,0.05); padding: 8px; border-radius: 8px;" 
                           title="${trip.hidden ? 'مخفي' : 'ظاهر'}" 
                           onclick="toggleTripVisibility(${index})"></i>
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
        const updated = [...window.allTrips];
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

    const timePeriods = [];
    document.querySelectorAll('.time-period-row').forEach(row => {
        timePeriods.push({
            label: row.querySelector('.tp-label').value,
            checkIn: row.querySelector('.tp-in').value,
            checkOut: row.querySelector('.tp-out').value
        });
    });

    const tripData = {
        id: isEdit ? window.allTrips[index].id : Date.now().toString(),
        name: document.getElementById('trip-name').value,
        type: document.getElementById('trip-type').value,
        category: document.getElementById('trip-category').value,
        location: document.getElementById('trip-location').value,
        price: prices.length > 0 ? prices[0].value : '0',
        prices: prices,
        duration: document.getElementById('trip-duration').value,
        transport: document.getElementById('trip-transport').value,
        description: document.getElementById('trip-description').value,
        // تجميع كافة الصور من الأقسام للعرض في البطاقات
        images: currentGalleryGroups.reduce((acc, g) => acc.concat(g.images), []),
        image: (currentGalleryGroups.length > 0 && currentGalleryGroups[0].images.length > 0) ? currentGalleryGroups[0].images[0] : '',
        badge: document.getElementById('trip-badge').value,
        gallery_groups: currentGalleryGroups,
        seasonal_prices: getSeasonalPrices(),
        hidden: document.getElementById('trip-hidden').checked,
        timePeriods: timePeriods,
        maxPeople: document.getElementById('trip-max-people').value,
        familiesOnly: document.getElementById('trip-families-only').checked,
        terms: document.getElementById('trip-terms').value,
        instructions: document.getElementById('trip-instructions').value
    };

    const submitBtn = tripForm.querySelector('button[type="submit"]');
    
    // تم إزالة التحقق الإجباري من تصنيفات الصور بناءً على طلب المستخدم
    // أصبحت تصنيفات الصور اختيارية الآن
    
    const originalBtnText = submitBtn.innerText;
    submitBtn.innerText = 'جاري الحفظ والرفع...';
    submitBtn.disabled = true;

    const updated = [...window.allTrips];
    if (isEdit) updated[index] = tripData;
    else updated.push(tripData);

    // إغلاق النافذة فوراً لتحسين السرعة للمستخدم
    tripModal.style.display = 'none';

    await saveAllToCloud(updated);

    submitBtn.innerText = originalBtnText;
    submitBtn.disabled = false;
};


function renderImagesPreview() {
    // This function is now superseded by Gallery Group management
}

window.removeImage = (idx) => {
    // This function is now superseded by Gallery Group management
}

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
        <div class="gallery-group-item" style="background: rgba(255,255,255,0.03); padding: 20px; border-radius: 15px; margin-bottom: 25px; border: 1px solid #444;">
            <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                <input type="text" placeholder="اسم التصنيف (مثال: جناح ملكي)" value="${group.label || ''}" 
                    style="flex: 1; padding: 10px; background: #111; border: 1px solid #333; border-radius: 8px; color: white; font-weight: bold;"
                    onchange="currentGalleryGroups[${gIdx}].label = this.value">
                <button type="button" onclick="removeGalleryGroup(${gIdx})" class="btn-delete" style="padding: 5px 15px;"><i class="fa fa-trash"></i></button>
            </div>

            <div style="margin-bottom: 15px;">
                <label style="display: block; font-size: 0.8rem; color: #888; margin-bottom: 5px;">وصف التصنيف (اختياري)</label>
                <textarea placeholder="أضف تفاصيل خاصة بهذا التصنيف..." 
                    style="width: 100%; padding: 10px; background: #111; border: 1px solid #333; border-radius: 8px; color: white; height: 60px; font-size: 0.9rem;"
                    onchange="currentGalleryGroups[${gIdx}].description = this.value">${group.description || ''}</textarea>
            </div>

            <div style="margin-bottom: 15px;">
                <label style="display: block; font-size: 0.8rem; color: #888; margin-bottom: 5px;">أسعار هذا التصنيف (اختياري)</label>
                <div id="group-prices-${gIdx}">
                    ${(group.prices || []).map((p, pIdx) => `
                        <div style="display: flex; gap: 5px; margin-bottom: 5px;">
                            <input type="text" placeholder="النوع" value="${p.label}" style="flex:1; padding:5px; background:#000; border:1px solid #222; color:white; font-size:0.8rem;" onchange="currentGalleryGroups[${gIdx}].prices[${pIdx}].label = this.value">
                            <input type="number" placeholder="السعر" value="${p.value}" style="width:70px; padding:5px; background:#000; border:1px solid #222; color:white; font-size:0.8rem;" onchange="currentGalleryGroups[${gIdx}].prices[${pIdx}].value = this.value">
                            <button type="button" onclick="removePriceFromGroup(${gIdx}, ${pIdx})" style="background:none; border:none; color:red; cursor:pointer;">&times;</button>
                        </div>
                    `).join('')}
                </div>
                <button type="button" onclick="addPriceToGroup(${gIdx})" style="background: rgba(255,255,255,0.05); color: #ccc; border: 1px dashed #555; padding: 5px 10px; border-radius: 5px; font-size: 0.75rem; cursor: pointer;">+ إضافة سعر خاص</button>
            </div>

            <div style="margin-bottom: 15px; background: rgba(255, 255, 255, 0.02); padding: 10px; border-radius: 8px;">
                <label style="display: block; font-size: 0.8rem; color: #f1c40f; margin-bottom: 8px; font-weight: bold;"><i class="fa fa-calendar-alt"></i> أسعار الأشهر لهذا التصنيف (اختياري)</label>
                <div id="group-seasons-${gIdx}">
                    ${(group.seasonal_prices || []).map((season, sIdx) => `
                        <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 8px; margin-bottom: 10px; border: 1px solid #333;">
                            <div style="display: flex; gap: 5px; margin-bottom: 8px;">
                                <input type="text" placeholder="اسم الفترة (مثلاً: يوليو)" value="${season.label}" 
                                    style="flex: 1; padding: 5px; background: #111; border: 1px solid #444; color: white; font-size: 0.8rem;"
                                    onchange="currentGalleryGroups[${gIdx}].seasonal_prices[${sIdx}].label = this.value">
                                <button type="button" onclick="removeSeasonFromGroup(${gIdx}, ${sIdx})" style="background:none; border:none; color:#e74c3c; cursor:pointer;"><i class="fa fa-times"></i></button>
                            </div>
                            <div class="group-season-prices-${gIdx}-${sIdx}">
                                ${(season.prices || []).map((p, pIdx) => `
                                    <div style="display: flex; gap: 3px; margin-bottom: 3px;">
                                        <input type="text" placeholder="النوع" value="${p.label}" style="flex:1; padding:3px; background:#000; border:1px solid #222; color:white; font-size:0.75rem;" onchange="currentGalleryGroups[${gIdx}].seasonal_prices[${sIdx}].prices[${pIdx}].label = this.value">
                                        <input type="number" placeholder="السعر" value="${p.value}" style="width:60px; padding:3px; background:#000; border:1px solid #222; color:white; font-size:0.75rem;" onchange="currentGalleryGroups[${gIdx}].seasonal_prices[${sIdx}].prices[${pIdx}].value = this.value">
                                        <button type="button" onclick="removePriceFromGroupSeason(${gIdx}, ${sIdx}, ${pIdx})" style="background:none; border:none; color:red; cursor:pointer; font-size:0.7rem;">&times;</button>
                                    </div>
                                `).join('')}
                                <button type="button" onclick="addPriceToGroupSeason(${gIdx}, ${sIdx})" style="background:none; border:1px dashed #444; color:#666; font-size:0.7rem; width:100%; margin-top:5px; cursor:pointer;">+ إضافة سعر</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <button type="button" onclick="addSeasonToGroup(${gIdx})" style="background: rgba(241, 196, 15, 0.1); color: #f1c40f; border: 1px solid rgba(241, 196, 15, 0.2); padding: 5px 10px; border-radius: 5px; font-size: 0.75rem; cursor: pointer; width: 100%;">+ إضافة فترة زمنية (شهر)</button>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 10px; margin-bottom: 15px; background: rgba(0,0,0,0.2); padding: 10px; border-radius: 10px;">
                ${group.images.map((img, iIdx) => `
                    <div style="position:relative; height: 60px; border: 1px solid #333; border-radius: 6px; overflow: hidden;">
                        <img src="${img}" style="width:100%; height:100%; object-fit:cover;">
                        <button type="button" onclick="removeImageFromGroup(${gIdx}, ${iIdx})" style="position:absolute; top:2px; right:2px; background:rgba(255,0,0,0.7); color:white; border:none; border-radius:50%; width:18px; height:18px; font-size:9px; cursor:pointer; display:flex; align-items:center; justify-content:center;">&times;</button>
                    </div>
                `).join('')}
                <label style="height: 60px; border: 1px dashed #444; border-radius: 6px; display: flex; align-items: center; justify-content: center; cursor: pointer; background: rgba(255,255,255,0.02); transition: 0.3s;" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background='rgba(255,255,255,0.02)'">
                    <i class="fa fa-plus" style="color: #666;"></i>
                    <input type="file" multiple accept="image/*" onchange="addImagesToGroup(event, ${gIdx})" style="display: none;">
                </label>
            </div>
        </div>
    `).join('');
};

window.addSeasonToGroup = (gIdx) => {
    if(!currentGalleryGroups[gIdx].seasonal_prices) currentGalleryGroups[gIdx].seasonal_prices = [];
    currentGalleryGroups[gIdx].seasonal_prices.push({ label: '', prices: [] });
    renderGalleryGroups();
};

window.removeSeasonFromGroup = (gIdx, sIdx) => {
    currentGalleryGroups[gIdx].seasonal_prices.splice(sIdx, 1);
    renderGalleryGroups();
};

window.addPriceToGroupSeason = (gIdx, sIdx) => {
    if(!currentGalleryGroups[gIdx].seasonal_prices[sIdx].prices) currentGalleryGroups[gIdx].seasonal_prices[sIdx].prices = [];
    currentGalleryGroups[gIdx].seasonal_prices[sIdx].prices.push({ label: '', value: '' });
    renderGalleryGroups();
};

window.removePriceFromGroupSeason = (gIdx, sIdx, pIdx) => {
    currentGalleryGroups[gIdx].seasonal_prices[sIdx].prices.splice(pIdx, 1);
    renderGalleryGroups();
};

window.addPriceToGroup = (gIdx) => {
    if(!currentGalleryGroups[gIdx].prices) currentGalleryGroups[gIdx].prices = [];
    currentGalleryGroups[gIdx].prices.push({ label: 'سعر افتراضي', value: '' });
    renderGalleryGroups();
};

window.removePriceFromGroup = (gIdx, pIdx) => {
    currentGalleryGroups[gIdx].prices.splice(pIdx, 1);
    renderGalleryGroups();
};

window.addNewGalleryGroup = (label = '') => {
    currentGalleryGroups.push({ label: label, images: [], description: '', prices: [], seasonal_prices: [] });
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
        priceContainer.innerHTML = '';
        document.getElementById('trip-hidden').checked = false;
        document.getElementById('trip-checkin').value = "";
        document.getElementById('trip-checkout').value = "";
        document.getElementById('trip-max-people').value = "";
        document.getElementById('trip-families-only').checked = false;
        document.getElementById('trip-terms').value = "";
        document.getElementById('trip-instructions').value = "";
        document.getElementById('time-periods-container').innerHTML = '';
        
        // Default Gallery Groups
        currentGalleryGroups = [];
        
        renderGalleryGroups();
        addPriceCategory('سعر الشخص', '');
        tripModal.style.display = 'flex';
    };
}

window.editTrip = (index) => {
    const trip = window.allTrips[index];
    document.getElementById('trip-id').value = index;
    document.getElementById('modal-title').innerText = "تعديل الرحلة";
    document.getElementById('trip-name').value = trip.name;
    document.getElementById('trip-type').value = trip.type;
    document.getElementById('trip-category').value = trip.category || '';
    document.getElementById('trip-location').value = trip.location || '';
    document.getElementById('trip-duration').value = trip.duration;
    document.getElementById('trip-transport').value = trip.transport || '';
    document.getElementById('trip-description').value = trip.description || '';
    document.getElementById('trip-badge').value = trip.badge || '';
    document.getElementById('trip-hidden').checked = trip.hidden || false;
    document.getElementById('trip-max-people').value = trip.maxPeople || '';
    document.getElementById('trip-families-only').checked = trip.familiesOnly || false;
    document.getElementById('trip-terms').value = trip.terms || '';
    document.getElementById('trip-instructions').value = trip.instructions || '';

    // Time Periods
    const timeContainer = document.getElementById('time-periods-container');
    timeContainer.innerHTML = '';
    if (trip.timePeriods && trip.timePeriods.length > 0) {
        trip.timePeriods.forEach(p => addTimePeriod(p.label, p.checkIn, p.checkOut));
    } else if (trip.checkIn || trip.checkOut) {
        // Migration from old fields
        addTimePeriod('الفترة الأساسية', trip.checkIn, trip.checkOut);
    }

    priceContainer.innerHTML = '';
    (trip.prices || []).forEach(p => addPriceCategory(p.label, p.value));
    if (!trip.prices || trip.prices.length === 0) addPriceCategory('السعر', trip.price);
    
    // Seasonal Prices
    renderSeasonalPrices(trip.seasonal_prices || []);

    // التحقق من نظام الصور (جديد أو قديم) لضمان عدم فقدان البيانات
    if (trip.gallery_groups && trip.gallery_groups.length > 0) {
        currentGalleryGroups = JSON.parse(JSON.stringify(trip.gallery_groups));
    } else if (trip.images && trip.images.length > 0) {
        // تحويل الصور القديمة إلى تصنيف تلقائي "صور الرحلة"
        currentGalleryGroups = [{ label: 'صور الرحلة', images: [...trip.images] }];
    } else {
        currentGalleryGroups = [];
    }
    renderGalleryGroups();

    tripModal.style.display = 'flex';
};

closeModalBtn.onclick = () => tripModal.style.display = 'none';

// Seasonal Prices Management
function renderSeasonalPrices(seasonalList) {
    const container = document.getElementById('seasonal-prices-container');
    if(!container) return;
    container.innerHTML = seasonalList.map((season, sIdx) => `
        <div style="background: rgba(255,255,255,0.02); padding: 15px; border-radius: 12px; margin-bottom: 15px; border: 1px solid #333;">
            <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                <input type="text" class="season-label" placeholder="اسم الفترة (مثال: شهر يونيو)" value="${season.label}" style="flex:1; padding:8px; background:#111; border:1px solid #444; color:white; border-radius:8px;">
                <button type="button" onclick="this.parentElement.parentElement.remove()" style="background:none; border:none; color:#e74c3c; cursor:pointer;"><i class="fa fa-trash"></i></button>
            </div>
            <div class="season-prices-sub">
                ${season.prices.map(p => `
                    <div class="price-row-season" style="display: flex; gap: 5px; margin-bottom: 5px;">
                        <input type="text" class="sp-label" placeholder="النوع" value="${p.label}" style="flex:1; padding:5px; background:#000; border:1px solid #222; color:white; font-size:0.8rem;">
                        <input type="number" class="sp-value" placeholder="السعر" value="${p.value}" style="width:70px; padding:5px; background:#000; border:1px solid #222; color:white; font-size:0.8rem;">
                    </div>
                `).join('')}
                <button type="button" onclick="addPriceToSeason(this)" style="font-size:0.7rem; background:none; border:1px dashed #555; color:#888; padding:3px 8px; border-radius:4px; cursor:pointer;">+ إضافة سعر للفترة</button>
            </div>
        </div>
    `).join('');
}

window.addNewSeason = () => {
    const container = document.getElementById('seasonal-prices-container');
    const div = document.createElement('div');
    div.style = "background: rgba(255,255,255,0.02); padding: 15px; border-radius: 12px; margin-bottom: 15px; border: 1px solid #333;";
    div.innerHTML = `
        <div style="display: flex; gap: 10px; margin-bottom: 10px;">
            <input type="text" class="season-label" placeholder="اسم الفترة (مثال: شهر يوليو)" style="flex:1; padding:8px; background:#111; border:1px solid #444; color:white; border-radius:8px;">
            <button type="button" onclick="this.parentElement.parentElement.remove()" style="background:none; border:none; color:#e74c3c; cursor:pointer;"><i class="fa fa-trash"></i></button>
        </div>
        <div class="season-prices-sub">
            <button type="button" onclick="addPriceToSeason(this)" style="font-size:0.7rem; background:none; border:1px dashed #555; color:#888; padding:3px 8px; border-radius:4px; cursor:pointer;">+ إضافة سعر للفترة</button>
        </div>
    `;
    container.appendChild(div);
};

window.addPriceToSeason = (btn) => {
    const sub = btn.parentElement;
    const row = document.createElement('div');
    row.className = "price-row-season";
    row.style = "display: flex; gap: 5px; margin-bottom: 5px;";
    row.innerHTML = `
        <input type="text" class="sp-label" placeholder="النوع" style="flex:1; padding:5px; background:#000; border:1px solid #222; color:white; font-size:0.8rem;">
        <input type="number" class="sp-value" placeholder="السعر" style="width:70px; padding:5px; background:#000; border:1px solid #222; color:white; font-size:0.8rem;">
        <button type="button" onclick="this.parentElement.remove()" style="background:none; border:none; color:red; cursor:pointer;">&times;</button>
    `;
    sub.insertBefore(row, btn);
};

function getSeasonalPrices() {
    const seasons = [];
    document.querySelectorAll('#seasonal-prices-container > div').forEach(div => {
        const label = div.querySelector('.season-label').value;
        const prices = [];
        div.querySelectorAll('.price-row-season').forEach(row => {
            prices.push({
                label: row.querySelector('.sp-label').value,
                value: row.querySelector('.sp-value').value
            });
        });
        if(label) seasons.push({ label, prices });
    });
    return seasons;
}

window.toggleTripVisibility = async (index) => {
    const updated = [...window.allTrips];
    updated[index].hidden = !updated[index].hidden;
    await saveAllToCloud(updated);
};

fetchTrips();
