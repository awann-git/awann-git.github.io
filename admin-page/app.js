// Import Firebase SDK modular (harus pakai type="module" di index.html)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// ====== KONFIGURASI FIREBASE (ganti pakai punyamu) ======
const firebaseConfig = {
  apiKey: "AIzaSyDmEGhJ-DhKPtwtH3bfsMDudaXFmOE6y5A",
  authDomain: "jkt48music.firebaseapp.com",
  projectId: "jkt48music",
  storageBucket: "jkt48music.firebasestorage.app",
  messagingSenderId: "721247494117",
  appId: "1:721247494117:web:bfd4c87a88ceba21e8d90c",
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ====== Elemen DOM ======
const modal = document.getElementById('contentModal');
const addContentBtn = document.getElementById('addContentBtn');
const closeBtn = document.querySelector('.close-btn');
const cancelBtn = document.getElementById('cancelBtn');
const saveBtn = document.getElementById('saveBtn');
const modalTitle = document.getElementById('modalTitle');
const contentForm = document.getElementById('contentForm');
const tbody = document.querySelector('.content-section table tbody');

// Card jumlah konten
const publishedCountEl = document.querySelector('.stat-card:nth-child(1) h3');
const draftCountEl = document.querySelector('.stat-card:nth-child(2) h3');

let editingId = null;

// ====== Render Post ======
async function renderPosts(snapshotDocs) {
  tbody.innerHTML = '';

  let publishedCount = 0;
  let draftCount = 0;

  snapshotDocs.forEach(docSnap => {
    const post = { id: docSnap.id, ...docSnap.data() };
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${post.title}</td>
      <td>${post.category}</td>
      <td>${post.date}</td>
      <td><span class="status ${post.status}">${post.status}</span></td>
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

    if (post.status === "published") publishedCount++;
    if (post.status === "draft") draftCount++;
  });

  publishedCountEl.textContent = publishedCount;
  draftCountEl.textContent = draftCount;

  addTableEventListeners();
}

// ====== Ambil Data Real-time ======
const postsRef = collection(db, "posts");
onSnapshot(postsRef, (snapshot) => {
  renderPosts(snapshot.docs);
});

// ====== Tambah / Edit ======
saveBtn.addEventListener('click', async (e) => {
  e.preventDefault();

  const title = document.getElementById('contentTitle').value.trim();
  const category = document.getElementById('contentCategory').value;
  const status = document.getElementById('contentStatus').value;
  const body = document.getElementById('contentBody').value.trim();

  if (!title || !category) {
    alert('Harap isi semua field!');
    return;
  }

  const data = {
    title,
    category,
    status,
    body,
    date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
  };

  try {
    if (editingId) {
      await updateDoc(doc(db, "posts", editingId), data);
      alert("Konten berhasil diperbarui!");
    } else {
      await addDoc(postsRef, data);
      alert("Konten berhasil ditambahkan!");
    }
    closeModal();
  } catch (err) {
    console.error("Error:", err);
  }
});

// ====== Event Table ======
function addTableEventListeners() {
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      const postDoc = (await getDocs(postsRef)).docs.find(d => d.id === id);
      if (!postDoc) return;

      const post = postDoc.data();
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
      if (confirm('Yakin ingin hapus konten ini?')) {
        await deleteDoc(doc(db, "posts", id));
        alert("Konten dihapus!");
      }
    });
  });
}

// ====== Modal Control ======
addContentBtn.addEventListener('click', () => {
  modalTitle.textContent = 'Tambah Konten Baru';
  contentForm.reset();
  editingId = null;
  modal.style.display = 'flex';
});
const closeModal = () => modal.style.display = 'none';
closeBtn.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);
window.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
