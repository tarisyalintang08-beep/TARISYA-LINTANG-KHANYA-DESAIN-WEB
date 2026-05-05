/**
 * KONFIGURASI DATA & STATE
 */
let keranjang = JSON.parse(localStorage.getItem('keranjang')) || [];

// Inisialisasi saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    tampilKeranjang(); // Hanya berjalan jika elemennya ada (Halaman Checkout)
    renderSideCart();  // Hanya berjalan jika elemennya ada (Halaman Produk)
});

/**
 * UTILS: SIMPAN & UPDATE
 */
function saveCart() {
    localStorage.setItem('keranjang', JSON.stringify(keranjang));
    updateCartCount();
    
    // Refresh tampilan sesuai halaman aktif
    if (document.getElementById('keranjangList')) tampilKeranjang();
    if (document.getElementById('sideCartItems')) renderSideCart();
}

function updateCartCount() {
    const countEl = document.getElementById('cartCount');
    if (countEl) {
        let count = keranjang.reduce((sum, p) => sum + p.qty, 0);
        countEl.innerText = count;
    }
}

/**
 * FUNGSI CORE KERANJANG
 */
// Menambah produk (Digunakan di Halaman Produk)
function tambahKeranjang(nama, harga, event) {
    let item = keranjang.find(p => p.nama === nama);
    if (item) { 
        item.qty += 1; 
    } else { 
        keranjang.push({ nama, harga, qty: 1 }); 
    }
    
    saveCart();
    
    // Feedback visual (opsional)
    if (event && event.currentTarget) {
        const btn = event.currentTarget;
        const originalIcon = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(() => { btn.innerHTML = originalIcon; }, 1000);
    }
}

// Mengubah jumlah (Digunakan di sidebar & checkout)
function ubahQty(indexOrName, delta) {
    let item;
    
    // Cek apakah parameter berupa index (angka) atau nama (string)
    if (typeof indexOrName === 'number') {
        item = keranjang[indexOrName];
    } else {
        item = keranjang.find(p => p.nama === indexOrName);
    }

    if (item) {
        item.qty += delta;
        if (item.qty <= 0) {
            // Jika hapus dari checkout butuh konfirmasi
            if (typeof indexOrName === 'number') {
                hapusItem(indexOrName);
                return;
            } else {
                keranjang = keranjang.filter(p => p.nama !== indexOrName);
            }
        }
        saveCart();
    }
}

function hapusItem(index) {
    if (confirm("Hapus item ini dari keranjang?")) {
        keranjang.splice(index, 1);
        saveCart();
    }
}

/**
 * TAMPILAN HALAMAN CHECKOUT
 */
function tampilKeranjang() {
    const list = document.getElementById('keranjangList');
    const totalElement = document.getElementById('totalHarga');
    if (!list) return;

    list.innerHTML = "";
    let total = 0;

    if (keranjang.length === 0) {
        list.innerHTML = `<p style="text-align:center; padding: 20px; color: #aaa;">Keranjang kosong.</p>`;
        totalElement.innerText = "0";
        return;
    }

    keranjang.forEach((item, index) => {
        const subtotal = item.harga * item.qty;
        total += subtotal;
        
        list.innerHTML += `
            <div class="order-item" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; background: #fff; padding: 10px; border-radius: 8px; border: 1px solid #f0f0f0;">
                <div class="order-item-info">
                    <span class="order-item-name" style="display:block; font-weight:600; color: #718355;">${item.nama}</span>
                    <span class="order-item-price" style="font-size: 0.8rem; color: #888;">IDR ${item.harga.toLocaleString('id-ID')}</span>
                </div>
                <div style="display:flex; align-items:center; gap: 10px;">
                    <div class="qty-controls" style="display:flex; align-items:center; gap: 8px; background: #f8f9f5; padding: 4px 8px; border-radius: 20px; border: 1px solid #97A97C;">
                        <button onclick="ubahQty(${index}, -1)" class="qty-btn" style="width:24px; height:24px; border-radius:50%; border:none; background:#fff; cursor:pointer;">-</button>
                        <span style="font-weight:600; font-size:0.9rem; min-width:15px; text-align:center;">${item.qty}</span>
                        <button onclick="ubahQty(${index}, 1)" class="qty-btn" style="width:24px; height:24px; border-radius:50%; border:none; background:#fff; cursor:pointer;">+</button>
                    </div>
                    <i class="fas fa-trash-alt" onclick="hapusItem(${index})" style="color: #e74c3c; cursor: pointer; font-size: 0.9rem; margin-left: 5px; opacity: 0.7;"></i>
                </div>
            </div>`;
    });
    totalElement.innerText = total.toLocaleString('id-ID');
}

/**
 * SIDEBAR KERANJANG (Halaman Produk)
 */
function toggleCart() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.querySelector('.cart-overlay');
    if (sidebar && overlay) {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
        renderSideCart();
    }
}

function renderSideCart() {
    const container = document.getElementById('sideCartItems');
    const totalDisplay = document.getElementById('sideCartTotal');
    if (!container || !totalDisplay) return;

    container.innerHTML = '';
    let total = 0;

    if (keranjang.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#999; margin-top:30px;">Cart is empty</p>';
        totalDisplay.innerText = 'IDR 0';
        return;
    }

    keranjang.forEach(item => {
        total += (item.harga * item.qty);
        container.innerHTML += `
            <div class="cart-item" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; padding-bottom:10px; border-bottom:1px solid #fafafa;">
                <div class="cart-item-info">
                    <h4 style="margin:0; font-size:0.9rem;">${item.nama}</h4>
                    <p style="margin:0; font-size:0.8rem; color:#777;">IDR ${item.harga.toLocaleString('id-ID')}</p>
                </div>
                <div class="qty-controls" style="display:flex; align-items:center; gap:10px;">
                    <button class="qty-btn" onclick="ubahQty('${item.nama}', -1)" style="width:25px; height:25px; cursor:pointer;">-</button>
                    <span>${item.qty}</span>
                    <button class="qty-btn" onclick="ubahQty('${item.nama}', 1)" style="width:25px; height:25px; cursor:pointer;">+</button>
                </div>
            </div>`;
    });
    totalDisplay.innerText = 'IDR ' + total.toLocaleString('id-ID');
}

/**
 * PROSES ORDER & STRUK
 */
function buatStruk() {
    const nama = document.getElementById('nama').value;
    const wa = document.getElementById('wa').value;
    const alamat = document.getElementById('alamat').value;
    const bayar = document.getElementById('pembayaran').value;

    if (!nama || !wa || !alamat || keranjang.length === 0) {
        alert("Lengkapi data formulir dan pastikan keranjang tidak kosong.");
        return;
    }

    const sekarang = new Date();
    const tanggalFormatted = sekarang.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    const jamFormatted = sekarang.getHours().toString().padStart(2, '0') + ":" + sekarang.getMinutes().toString().padStart(2, '0');

    const orderID = "LT-" + Math.floor(1000 + Math.random() * 9000);
    let grandTotal = 0;
    let produkHtml = "";

    keranjang.forEach(p => {
        const sub = p.harga * p.qty;
        produkHtml += `
            <div class="product-item-row" style="display:flex; justify-content:space-between; font-size: 0.85rem; margin-bottom: 5px;">
                <span>${p.nama} x${p.qty}</span>
                <span>${sub.toLocaleString('id-ID')}</span>
            </div>`;
        grandTotal += sub;
    });

    document.getElementById('strukContent').innerHTML = `
        <div class="struk-header-content" style="text-align:center; margin-bottom:15px;">
            <h3 style="margin:0;">L'ART DE TISSA</h3>
            <p style="margin:0; font-size:0.8rem;">Order ID: ${orderID}</p>
            <p style="margin:0; font-size:0.8rem;">${tanggalFormatted} | ${jamFormatted} WIB</p>
        </div>
        <div class="struk-id-row"><strong>Customer:</strong> ${nama}</div>
        <div class="struk-id-row"><strong>WhatsApp:</strong> ${wa}</div>
        <div class="struk-id-row"><strong>Payment:</strong> ${bayar}</div>
        <div class="struk-id-row" style="margin-bottom:15px;"><strong>Address:</strong> ${alamat}</div>
        <div style="border-top: 1px dashed #eee; padding-top: 10px;">
            ${produkHtml}
        </div>
        <div class="struk-total-box" style="display:flex; justify-content:space-between; font-weight:bold; margin-top:10px; border-top:2px solid #eee; padding-top:5px;">
            <span>TOTAL PAID</span>
            <span>IDR ${grandTotal.toLocaleString('id-ID')}</span>
        </div>
        <div style="margin-top: 15px; background: #f0f4eb; padding: 10px; border-radius: 8px; font-size: 0.75rem;">
            <p style="color: #718355; font-weight: bold; margin-bottom: 4px;">METODE PEMBAYARAN:</p>
            <p style="margin: 0;">${bayar === "BCA Transfer" ? "BCA: 15427394976 a/n Tissa" : "Dana/OVO: 0895618781807 a/n Tissa"}</p>
        </div>
    `;
    document.getElementById('strukOverlay').style.display = 'flex';
}

function downloadStruk() {
    const btn = document.getElementById('btnDownload');
    const element = document.getElementById('strukToDownload');
    
    btn.innerHTML = "Processing...";

    html2canvas(element, { scale: 2, backgroundColor: "#ffffff" }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'Receipt-LartDeTissa.jpg';
        link.href = canvas.toDataURL('image/jpeg', 0.9);
        link.click();
        btn.innerHTML = '<i class="fas fa-image"></i> Download Receipt (JPG)';
    });
}

function tutupStruk() {
    localStorage.removeItem('keranjang');
    window.location.href = "produk.html";
}