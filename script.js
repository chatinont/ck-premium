const defaultProductData = [
    { sku: "TB-001", name: "แก้วเยติ 20 oz (กล่องสีนํ้าตาล ฟู๊ดเกรด)", material: "sus 201", capacity: "600 ml", stock: "36000", priceRetail: "65", priceWholesale: "58" },
    { sku: "TB-002", name: "แก้วเยติ 20 oz ( กล่องสีขาว )", material: "sus 304", capacity: "600 ml", stock: "36000", priceRetail: "65", priceWholesale: "58" }
];

// Load database from localStorage or fallback to default
let loadedDB = JSON.parse(localStorage.getItem('productDatabase'));
let productData = (loadedDB && loadedDB.length > 0) ? loadedDB : defaultProductData;

// App State
let displayedProducts = [...productData];
let currentEditingSku = null;

// DOM Elements
const container = document.getElementById('product-container');
const searchInput = document.getElementById('searchInput');
const totalItemsEl = document.getElementById('totalItems');
const gridBtn = document.getElementById('grid-view-btn');
const listBtn = document.getElementById('list-view-btn');
const exportBtn = document.getElementById('export-btn');

const modal = document.getElementById('imageModal');
const closeModal = document.querySelector('.close-modal');
const sizeInput = document.getElementById('sizeInput');
const imageInput = document.getElementById('imageUrlInput');
const imagePreview = document.getElementById('imagePreview');
const placeholderText = document.querySelector('.placeholder-text');
const saveBtn = document.getElementById('saveImageBtn');
const removeBtn = document.getElementById('removeImageBtn');
const modalSkuEl = document.getElementById('modalSku');

// Get saved images and sizes from LocalStorage
const getSavedImages = () => JSON.parse(localStorage.getItem('productImages')) || {};
const saveImagesMap = (map) => localStorage.setItem('productImages', JSON.stringify(map));
const getSavedSizes = () => JSON.parse(localStorage.getItem('productSizes')) || {};
const saveSizesMap = (map) => localStorage.setItem('productSizes', JSON.stringify(map));

// Render Products
function renderProducts() {
    container.innerHTML = '';
    const imagesMap = getSavedImages();
    const sizesMap = getSavedSizes();

    totalItemsEl.textContent = displayedProducts.length;

    displayedProducts.forEach(product => {
        const imageUrl = imagesMap[product.sku] || product.imageUrl;
        const sizeInfo = sizesMap[product.sku] || product.size || "-";

        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-image-container" onclick="openImageModal('${product.sku}')">
                ${imageUrl
                ? `<img src="${imageUrl}" class="product-image" alt="${product.name}" onerror="this.src=''; this.parentElement.innerHTML='<div class=\\'image-placeholder-icon\\'><svg width=\\'40\\' height=\\'40\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'currentColor\\' stroke-width=\\'2\\'><rect x=\\'3\\' y=\\'3\\' width=\\'18\\' height=\\'18\\' rx=\\'2\\' ry=\\'2\\'></rect><circle cx=\\'8.5\\' cy=\\'8.5\\' r=\\'1.5\\'></circle><polyline points=\\'21 15 16 10 5 21\\'></polyline></svg>ภาพเสีย</div><div class=\\'image-overlay\\'><button class=\\'upload-btn\\'>แก้ไขรูปภาพ</button></div>';">`
                : `<div class="image-placeholder-icon">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                        <span>ไม่มีรูปภาพ</span>
                       </div>`
            }
                <div class="image-overlay">
                    <button class="upload-btn">${imageUrl ? 'แก้ไขข้อมูล' : '+ เพิ่มรูป/ขนาด'}</button>
                </div>
            </div>
            <div class="product-info">
                <div class="product-sku">${product.sku}</div>
                <h3 class="product-title">${product.name}</h3>
                
                <div class="product-meta">
                    <div class="meta-item">
                        <span class="meta-label">วัสดุ</span>
                        <span class="meta-value">${product.material}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">ความจุ</span>
                        <span class="meta-value">${product.capacity}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">สต็อก (ลัง)</span>
                        <span class="meta-value">${product.stock}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">ขนาด</span>
                        <span class="meta-value">${sizeInfo}</span>
                    </div>
                </div>

                <div class="product-prices">
                    <div class="price-box retail">
                        <span class="price-label">ปลีก (50+)</span>
                        <span class="price-value">฿${product.priceRetail}</span>
                    </div>
                    <div class="price-box wholesale">
                        <span class="price-label">ส่ง (100+)</span>
                        <span class="price-value wholesale">฿${product.priceWholesale}</span>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// Search
searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    displayedProducts = productData.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.sku.toLowerCase().includes(term)
    );
    renderProducts();
});

// View Toggles
gridBtn.addEventListener('click', () => {
    container.classList.remove('list-view');
    gridBtn.classList.add('active');
    listBtn.classList.remove('active');
});

listBtn.addEventListener('click', () => {
    container.classList.add('list-view');
    listBtn.classList.add('active');
    gridBtn.classList.remove('active');
});

// Modal Actions
window.openImageModal = (sku) => {
    currentEditingSku = sku;
    modalSkuEl.textContent = sku;
    const imagesMap = getSavedImages();
    const sizesMap = getSavedSizes();
    const existingUrl = imagesMap[sku] || '';
    const existingSize = sizesMap[sku] || '';

    sizeInput.value = existingSize;
    imageInput.value = existingUrl;
    updatePreview(existingUrl);

    modal.classList.add('show');
};

const closeImageModal = () => {
    modal.classList.remove('show');
    currentEditingSku = null;
};

closeModal.addEventListener('click', closeImageModal);
window.addEventListener('click', (e) => {
    if (e.target === modal) closeImageModal();
});

function updatePreview(url) {
    if (url) {
        imagePreview.src = url;
        imagePreview.style.display = 'block';
        placeholderText.style.display = 'none';
        imagePreview.onerror = () => {
            imagePreview.style.display = 'none';
            placeholderText.style.display = 'block';
            placeholderText.textContent = 'รูปภาพที่ URL นี้ไม่สามารถโหลดได้';
        }
    } else {
        imagePreview.style.display = 'none';
        placeholderText.style.display = 'block';
        placeholderText.textContent = 'ตัวอย่างรูปภาพจะแสดงที่นี่';
    }
}

imageInput.addEventListener('input', (e) => updatePreview(e.target.value));

saveBtn.addEventListener('click', () => {
    if (!currentEditingSku) return;
    const url = imageInput.value.trim();
    const sizeVal = sizeInput.value.trim();

    const imgMap = getSavedImages();
    if (url) imgMap[currentEditingSku] = url;
    else delete imgMap[currentEditingSku];
    saveImagesMap(imgMap);

    const szMap = getSavedSizes();
    if (sizeVal) szMap[currentEditingSku] = sizeVal;
    else delete szMap[currentEditingSku];
    saveSizesMap(szMap);

    renderProducts();
    closeImageModal();
});

removeBtn.addEventListener('click', () => {
    if (!currentEditingSku) return;
    const imgMap = getSavedImages();
    delete imgMap[currentEditingSku];
    saveImagesMap(imgMap);
    const szMap = getSavedSizes();
    delete szMap[currentEditingSku];
    saveSizesMap(szMap);
    renderProducts();
    closeImageModal();
});

// Google Sheet Integration (JSONP)
const syncSheetBtn = document.getElementById('syncSheetBtn');
if (syncSheetBtn) {
    syncSheetBtn.addEventListener('click', () => {
        const url = syncSheetBtn.getAttribute('data-url');
        const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
        if (!match) return alert('กรุณาตรวจสอบลิงก์ Google Sheet ในไฟล์ index.html');
        const sheetId = match[1];

        syncSheetBtn.textContent = 'กำลังซิงค์...';
        syncSheetBtn.disabled = true;

        window.processGoogleSheetData = (data) => {
            try {
                if (data.status === 'error') throw new Error('Google API Error');
                const cols = data.table.cols.map(c => c.label);
                const rows = data.table.rows;

                if (rows.length === 0) {
                    alert('ไม่พบข้อมูลใน Google Sheet ครับ');
                    return;
                }

                const newData = rows.map(r => {
                    let rowObj = {};
                    cols.forEach((col, i) => {
                        rowObj[col] = (r.c && r.c[i] && r.c[i].v != null) ? String(r.c[i].v) : "";
                    });
                    return {
                        sku: rowObj["รหัสสินค้า (SKU)"] || "-",
                        name: rowObj["ชื่อสินค้า (ภาษาไทย)"] || "-",
                        material: rowObj["วัสดุ (เกรดสแตนเลส)"] || "-",
                        capacity: rowObj["ความจุ"] || "-",
                        stock: rowObj["สต็อก (ชิ้น/ลัง)"] || "-",
                        size: rowObj["ขนาด (กxยxส)"] || "-",
                        priceRetail: rowObj["ราคาขายปลีก (50 ชิ้น)"] || "-",
                        priceWholesale: rowObj["ราคาขายส่ง (100+ ชิ้น)"] || "-",
                        imageUrl: rowObj["URL รูปภาพ"] || ""
                    };
                });

                productData = newData;
                localStorage.setItem('productDatabase', JSON.stringify(productData));
                displayedProducts = [...productData];
                renderProducts();
                alert('อัปเดตข้อมูลสำเร็จ! พบสินค้า ' + newData.length + ' รายการ');

            } catch (e) {
                alert('เกิดข้อผิดพลาดในการแปลข้อมูล');
            } finally {
                syncSheetBtn.textContent = 'อัปเดตข้อมูล (Google Sheet)';
                syncSheetBtn.disabled = false;
                delete window.processGoogleSheetData;
            }
        };

        const script = document.createElement('script');
        script.src = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json;responseHandler:processGoogleSheetData`;
        script.onerror = () => {
            alert('ไม่สามารถเชื่อมต่อ Google Sheet ได้ กรุณาเช็คการแชร์ไฟล์');
            syncSheetBtn.textContent = 'อัปเดตข้อมูล (Google Sheet)';
            syncSheetBtn.disabled = false;
        };
        document.body.appendChild(script);
        script.onload = () => document.body.removeChild(script);
    });
}

// Init
renderProducts();
