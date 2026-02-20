// Local Storage Keys
const TRIPS_KEY = 'iticket_trips';

// Default Data with real high-quality images for testing
const defaultTrips = [
    { id: 101, name: 'إسطنبول الساحرة - صيف 2024', type: 'tourism', price: 350, duration: '8 أيام', transport: 'طيران الخليج', image: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?q=80&w=2071&auto=format&fit=crop', badge: 'الأكثر مبيعاً' },
    { id: 102, name: 'باكو وقبلة - طبيعة أذربيجان', type: 'tourism', price: 290, duration: '7 أيام', transport: 'شامل الفنادق', image: 'https://images.unsplash.com/photo-1528643501235-9856d8facfa4?q=80&w=1974&auto=format&fit=crop', badge: 'خصم 10%' },
    { id: 103, name: 'عمرة شهر رمضان المبارك', type: 'religious', price: 120, duration: '10 أيام', transport: 'باصات VIP', image: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?q=80&w=2070&auto=format&fit=crop', badge: 'دينية' },
    { id: 104, name: 'بوكيت - شواطئ تايلاند', type: 'tourism', price: 420, duration: '9 أيام', transport: 'شامل الجولات', image: 'https://images.unsplash.com/photo-1589394815844-d4f13459526b?q=80&w=2076&auto=format&fit=crop', badge: 'صيف 2024' },
    { id: 105, name: 'زيارة كربلاء المقدسة - الأربعين', type: 'religious', price: 180, duration: '12 يوم', transport: 'طيران + سكن', image: 'https://images.unsplash.com/photo-1628131349581-22949646b158?q=80&w=2070&auto=format&fit=crop', badge: 'دينية' },
    { id: 106, name: 'سراييفو - جمال البوسنة', type: 'tourism', price: 480, duration: '10 أيام', transport: 'طيران مباشر', image: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?q=80&w=1974&auto=format&fit=crop', badge: 'طبيعة' },
    { id: 107, name: 'ماليزيا - كوالالمبور ولنكاوي', type: 'tourism', price: 390, duration: '8 أيام', transport: 'فنادق 4 نجوم', image: 'https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=2070&auto=format&fit=crop', badge: '' },
    { id: 108, name: 'جورجيا - تبليسي وباتومي', type: 'tourism', price: 310, duration: '7 أيام', transport: 'مرشد سياحي', image: 'https://images.unsplash.com/photo-1565008518242-20dc95116123?q=80&w=2071&auto=format&fit=crop', badge: 'عرض محدود' },
    { id: 109, name: 'المدينة المنورة - زيارة النبي (ص)', type: 'religious', price: 95, duration: '5 أيام', transport: 'باص حديث', image: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?q=80&w=2070&auto=format&fit=crop', badge: 'دينية' },
    { id: 110, name: 'دبي - تسوق وترفيه', type: 'tourism', price: 250, duration: '4 أيام', transport: 'طيران الإمارات', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=2070&auto=format&fit=crop', badge: 'قريب جداً' },
    { id: 111, name: 'المالديف - منتجعات فاخرة', type: 'tourism', price: 850, duration: '6 أيام', transport: 'إقامة شاملة', image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=1965&auto=format&fit=crop', badge: 'VIP' },
    { id: 112, name: 'مشهد المقدسة - الإمام الرضا (ع)', type: 'religious', price: 220, duration: '8 أيام', transport: 'طيران + سكن', image: 'https://images.unsplash.com/photo-1599581102925-50e5040e34b9?q=80&w=2070&auto=format&fit=crop', badge: 'دينية' },
    { id: 113, name: 'شرم الشيخ - غوص وسباحة', type: 'tourism', price: 210, duration: '5 أيام', transport: 'فنادق 5 نجوم', image: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?q=80&w=1974&auto=format&fit=crop', badge: 'موسم الشتاء' },
    { id: 114, name: 'باريس - مدينة الأضواء', type: 'tourism', price: 590, duration: '7 أيام', transport: 'طيران فرنسي', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073&auto=format&fit=crop', badge: 'رومانسي' },
    { id: 115, name: 'لندن - جولة ضبابية', type: 'tourism', price: 620, duration: '7 أيام', transport: 'بريطانيا ترافل', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=2070&auto=format&fit=crop', badge: '' },
    { id: 116, name: 'النجف الأشرف - ضيافة حيدرية', type: 'religious', price: 140, duration: '7 أيام', transport: 'باصات حديثة', image: 'https://images.unsplash.com/photo-1628131349581-22949646b158?q=80&w=2070&auto=format&fit=crop', badge: 'دينية' },
    { id: 117, name: 'روما - رحلة التاريخ', type: 'tourism', price: 540, duration: '6 أيام', transport: 'بيتزا تورز', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=1996&auto=format&fit=crop', badge: 'ثقافة' },
    { id: 118, name: 'كابادوكيا - مدينة المناطيد', type: 'tourism', price: 380, duration: '5 أيام', transport: 'تصوير احترافي', image: 'https://images.unsplash.com/photo-1558230559-00965492cc2e?q=80&w=2070&auto=format&fit=crop', badge: 'مطلوب جداً' },
    { id: 119, name: 'القدس - رحلة الأقصى', type: 'religious', price: 0, duration: 'قريباً', transport: '-', image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop', badge: 'قريبا بإذن الله' },
    { id: 120, name: 'سويسرا - جبال الألب', type: 'tourism', price: 920, duration: '10 أيام', transport: 'طيران فاخر', image: 'https://images.unsplash.com/photo-1527668752968-14dc70a27c95?q=80&w=2070&auto=format&fit=crop', badge: 'فخامة' },
    { id: 121, name: 'القاهرة - الأهرامات والنيل', type: 'tourism', price: 230, duration: '6 أيام', transport: 'مصر للطيران', image: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?q=80&w=2070&auto=format&fit=crop', badge: 'تاريخي' },
    { id: 122, name: 'بالي - جنة إندونيسيا', type: 'tourism', price: 470, duration: '9 أيام', transport: 'منتجعات شاطئية', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=2076&auto=format&fit=crop', badge: 'استرخاء' },
    { id: 123, name: 'رحلة قم المقدسة - زيارة السيدة', type: 'religious', price: 130, duration: '6 أيام', transport: 'باص VIP', image: 'https://images.unsplash.com/photo-1560086701-d00735bfa95f?q=80&w=1932&auto=format&fit=crop', badge: 'دينية' },
    { id: 124, name: 'النمسا - زيارة فيينا', type: 'tourism', price: 560, duration: '7 أيام', transport: 'طيران مباشر', image: 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?q=80&w=2072&auto=format&fit=crop', badge: '' },
    { id: 125, name: 'اليونان - صيف سانتوريني', type: 'tourism', price: 680, duration: '7 أيام', transport: 'فنادق إطلالة', image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=2070&auto=format&fit=crop', badge: 'شهر عسل' },
    { id: 126, name: 'موسكو - الساحة الحمراء', type: 'tourism', price: 410, duration: '8 أيام', transport: 'فنادق روسية', image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=1935&auto=format&fit=crop', badge: 'شتاء روسي' },
    { id: 127, name: 'سنغافورة - جولة عصرية', type: 'tourism', price: 530, duration: '6 أيام', transport: 'طيران راقي', image: 'https://images.unsplash.com/photo-1525596662741-e94ff9f26de1?q=80&w=1974&auto=format&fit=crop', badge: '' },
    { id: 128, name: 'الأردن - البتراء ووادي رم', type: 'tourism', price: 270, duration: '5 أيام', transport: 'رحلة برية', image: 'https://images.unsplash.com/photo-1547228224-34042858544d?q=80&w=1964&auto=format&fit=crop', badge: 'مغامرة' },
    { id: 129, name: 'عمان - صلالة الخضراء', type: 'tourism', price: 190, duration: '5 أيام', transport: 'باصات مريحة', image: 'https://images.unsplash.com/photo-1578918942944-79354924c8c7?q=80&w=2070&auto=format&fit=crop', badge: 'خريف صلالة' },
    { id: 130, name: 'شيراز - جنة إيران', type: 'tourism', price: 210, duration: '7 أيام', transport: 'طيران + سياحة', image: 'https://images.unsplash.com/photo-1566373721348-7357c9197931?q=80&w=2070&auto=format&fit=crop', badge: 'طبيعة' }
];

// Load Trips
function getTrips() {
    const data = localStorage.getItem(TRIPS_KEY);
    if (!data || JSON.parse(data).length === 0) {
        // If first time or cleared, save defaults to LocalStorage
        saveTrips(defaultTrips);
        return defaultTrips;
    }
    return JSON.parse(data);
}

// Save Trips
function saveTrips(trips) {
    localStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
    // Trigger update on main site if active in other tab
    window.dispatchEvent(new Event('storage'));
}

// UI Elements
const tripsList = document.getElementById('trips-list');
const tripModal = document.getElementById('trip-modal');
const tripForm = document.getElementById('trip-form');
const openAddModalBtn = document.getElementById('open-add-modal');
const closeModalBtn = document.getElementById('close-modal');

// Render Table
function renderTrips() {
    const trips = getTrips();
    tripsList.innerHTML = trips.map(trip => `
        <tr>
            <td>
                <div style="display: flex; align-items: center; gap: 15px;">
                    <img src="${trip.image}" class="trip-img-mini">
                    <span>${trip.name}</span>
                </div>
            </td>
            <td>${trip.type === 'religious' ? 'دينية' : 'سياحية'}</td>
            <td>${trip.price} دينار</td>
            <td>${trip.duration}</td>
            <td>
                <div class="actions">
                    <i class="fa fa-edit btn-edit" onclick="editTrip(${trip.id})"></i>
                    <i class="fa fa-trash btn-delete" onclick="deleteTrip(${trip.id})"></i>
                </div>
            </td>
        </tr>
    `).join('');
}

// Delete Trip
window.deleteTrip = (id) => {
    if (confirm('هل أنت متأكد من حذف هذه الرحلة؟')) {
        const trips = getTrips().filter(t => t.id !== id);
        saveTrips(trips);
        renderTrips();
    }
}

// Open Form for Add/Edit
openAddModalBtn.onclick = () => {
    tripForm.reset();
    document.getElementById('trip-id').value = '';
    document.getElementById('modal-title').innerText = 'إضافة رحلة جديدة';
    document.getElementById('image-preview').style.display = 'none';
    tripModal.style.display = 'flex';
}

closeModalBtn.onclick = () => {
    tripModal.style.display = 'none';
}

// Live Image Preview
document.getElementById('trip-image').addEventListener('input', function (e) {
    const preview = document.getElementById('image-preview');
    if (e.target.value) {
        preview.src = e.target.value;
        preview.style.display = 'block';
    } else {
        preview.style.display = 'none';
    }
});

// Edit Trip
window.editTrip = (id) => {
    const trip = getTrips().find(t => t.id === id);
    if (trip) {
        document.getElementById('trip-id').value = trip.id;
        document.getElementById('trip-name').value = trip.name;
        document.getElementById('trip-type').value = trip.type;
        document.getElementById('trip-price').value = trip.price;
        document.getElementById('trip-duration').value = trip.duration;
        document.getElementById('trip-transport').value = trip.transport;
        document.getElementById('trip-image').value = trip.image;
        document.getElementById('trip-badge').value = trip.badge;

        const preview = document.getElementById('image-preview');
        preview.src = trip.image;
        preview.style.display = 'block';

        document.getElementById('modal-title').innerText = 'تعديل بيانات الرحلة';
        tripModal.style.display = 'flex';
    }
}

// Form Submission
tripForm.onsubmit = (e) => {
    e.preventDefault();
    const id = document.getElementById('trip-id').value;
    const trips = getTrips();

    const tripData = {
        id: id ? parseInt(id) : Date.now(),
        name: document.getElementById('trip-name').value,
        type: document.getElementById('trip-type').value,
        price: document.getElementById('trip-price').value,
        duration: document.getElementById('trip-duration').value,
        transport: document.getElementById('trip-transport').value,
        image: document.getElementById('trip-image').value,
        badge: document.getElementById('trip-badge').value
    };

    if (id) {
        const index = trips.findIndex(t => t.id === parseInt(id));
        trips[index] = tripData;
    } else {
        trips.push(tripData);
    }

    saveTrips(trips);
    renderTrips();
    tripModal.style.display = 'none';
};

// Start
renderTrips();
