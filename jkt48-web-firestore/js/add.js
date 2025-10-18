document.getElementById("songForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const song = {
    title: document.getElementById("title").value,
    album: document.getElementById("album").value,
    release: document.getElementById("release").value,
    composer: document.getElementById("composer").value,
    lyrics: document.getElementById("lyrics").value,
  };

  const res = await fetch("/api/add-song", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(song),
  });

  const msg = await res.text();
  alert(msg);
  e.target.reset();
});
