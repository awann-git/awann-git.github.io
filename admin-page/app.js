// ====== Firebase Imports ======
import { db, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, where } from './firebase.js';

// ====== Referensi Elemen ======
const modal = document.getElementById('contentModal');
const addContentBtn = document.getElementById('addContentBtn');
const closeBtn = document.querySelector('.close-btn');
const cancelBtn = document.getElementById('cancelBtn');
const saveBtn = document.getElementById('saveBtn');
const modalTitle = document.getElementById('modalTitle');
const contentForm = document.getElementById('contentForm');
const tbody = document.querySelector('.content-section table tbody');

// ====== Stats Elements ======
const publishedCountEl = document.querySelector('.stat-card:nth-child(1) h3');
const draftCountEl = document.querySelector('.stat-card:nth-child(2) h3');

let editingId = null;

// ====== Load Data dari Firebase ======
function loadPosts() {
    const q = query(collection(db, 'posts'));
    
    onSnapshot(q, (querySnapshot) => {
        posts = [];
        querySnapshot.forEach((doc) => {
            posts.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        // Sort by date (newest first)
        posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        renderPosts();
        updateStats();
    });
}

// ====== Update Stats Counter ======
function updateStats() {
    const publishedCount = posts.filter(post => post.status === 'published').length;
    const draftCount = posts.filter(post => post.status === 'draft').length;
    
    publishedCountEl.textContent = publishedCount;
    draftCountEl.textContent = draftCount;
}

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
            <td>${formatDate(post.createdAt)}</td>
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

// ====== Format Date ======
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
    });
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

// ====== Simpan Konten ke Firebase ======
saveBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    const title = document.getElementById('contentTitle').value.trim();
    const category = document.getElementById('contentCategory').value;
    const status = document.getElementById('contentStatus').value;
    const body = document.getElementById('contentBody').value.trim();

    if (!title || !category) {
        alert('Harap isi semua field yang diperlukan!');
        return;
    }

    try {
        if (editingId) {
            // Edit post di Firebase
            const postRef = doc(db, 'posts', editingId);
            await updateDoc(postRef, {
                title,
                category,
                status,
                body,
                updatedAt: new Date().toISOString()
            });
            alert('Konten berhasil diperbarui!');
        } else {
            // Tambah baru ke Firebase
            await addDoc(collection(db, 'posts'), {
                title,
                category,
                status,
                body,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            alert('Konten berhasil ditambahkan!');
        }

        closeModal();
    } catch (error) {
        console.error('Error saving post:', error);
        alert('Terjadi kesalahan saat menyimpan konten');
    }
});

// ====== Fungsi Edit dan Hapus ======
function addTableEventListeners() {
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
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
        btn.addEventListener('click', async () => {
            const id = btn.getAttribute('data-id');
            if (confirm('Apakah Anda yakin ingin menghapus konten ini?')) {
                try {
                    await deleteDoc(doc(db, 'posts', id));
                    alert('Konten berhasil dihapus!');
                } catch (error) {
                    console.error('Error deleting post:', error);
                    alert('Terjadi kesalahan saat menghapus konten');
                }
            }
        });
    });
}

// ====== Jalankan Pertama Kali ======
let posts = [];
loadPosts();