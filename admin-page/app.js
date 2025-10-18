// ====== Referensi Elemen ======
const modal = document.getElementById('contentModal');
const addContentBtn = document.getElementById('addContentBtn');
const closeBtn = document.querySelector('.close-btn');
const cancelBtn = document.getElementById('cancelBtn');
const saveBtn = document.getElementById('saveBtn');
const modalTitle = document.getElementById('modalTitle');
const contentForm = document.getElementById('contentForm');
const tbody = document.querySelector('.content-section table tbody');

let editingId = null;

// ====== Load Data dari localStorage ======
let posts = JSON.parse(localStorage.getItem('posts')) || [];

// ====== Render Tabel ======
function renderPosts() {
    tbody.innerHTML = '';
    if (posts.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#888;">Belum ada konten</td></tr>`;
        return;
    }

    posts.forEach((post) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${post.title}</td>
            <td>${post.category}</td>
            <td>${post.date}</td>
            <td><span class="status ${post.status}">${post.status.charAt(0).toUpperCase() + post.status.slice(1)}</span></td>
            <td>
                <div class="action-buttons">
                    <div class="action-btn edit-btn" data-id="${post.id}">
                        <i class="fas fa-edit"></i>
                    </div>
                    <div class="action-btn delete-btn" data-id="${post.id}">
                        <i class="fas fa-trash"></i>
                    </div>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    addTableEventListeners();
}

// ====== Simpan ke localStorage ======
function saveToLocalStorage() {
    localStorage.setItem('posts', JSON.stringify(posts));
}

// ====== Buka Modal Tambah ======
addContentBtn.addEventListener('click', () => {
    modalTitle.textContent = 'Tambah Konten Baru';
    contentForm.reset();
    editingId = null;
    modal.style.display = 'flex';
});

// ====== Tutup Modal ======
function closeModal() {
    modal.style.display = 'none';
}
closeBtn.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);
window.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

// ====== Simpan Konten ======
saveBtn.addEventListener('click', (e) => {
    e.preventDefault();

    const title = document.getElementById('contentTitle').value.trim();
    const category = document.getElementById('contentCategory').value;
    const status = document.getElementById('contentStatus').value;
    const body = document.getElementById('contentBody').value.trim();

    if (!title || !category) {
        alert('Harap isi semua field yang diperlukan!');
        return;
    }

    if (editingId) {
        // Edit post
        const index = posts.findIndex(p => p.id === editingId);
        posts[index] = { ...posts[index], title, category, status, body };
        alert('Konten berhasil diperbarui!');
    } else {
        // Tambah baru
        const newPost = {
            id: Date.now(),
            title,
            category,
            status,
            body,
            date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
        };
        posts.unshift(newPost);
        alert('Konten berhasil ditambahkan!');
    }

    saveToLocalStorage();
    renderPosts();
    closeModal();
});

// ====== Fungsi Edit dan Hapus ======
function addTableEventListeners() {
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = Number(btn.getAttribute('data-id'));
            const post = posts.find(p => p.id === id);
            if (!post) return;

            editingId = id;
            modalTitle.textContent = 'Edit Konten';
            document.getElementById('contentTitle').value = post.title;
            document.getElementById('contentCategory').value = post.category;
            document.getElementById('contentStatus').value = post.status;
            document.getElementById('contentBody').value = post.body;
            modal.style.display = 'flex';
        });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = Number(btn.getAttribute('data-id'));
            if (confirm('Apakah Anda yakin ingin menghapus konten ini?')) {
                posts = posts.filter(p => p.id !== id);
                saveToLocalStorage();
                renderPosts();
                alert('Konten berhasil dihapus!');
            }
        });
    });
}

// ====== Jalankan Pertama Kali ======
renderPosts();
