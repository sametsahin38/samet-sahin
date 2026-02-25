const resourceName = typeof GetParentResourceName === 'function' ? GetParentResourceName() : 'qb-smartphone';

const state = {
  visible: false,
  data: null,
  directoryResults: []
};

const phone = document.getElementById('phone');
const home = document.getElementById('home');

const post = async (name, data = {}) => {
  await fetch(`https://${resourceName}/${name}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
};

const setView = (viewId) => {
  document.querySelectorAll('.view').forEach((view) => view.classList.remove('active'));
  const target = document.getElementById(viewId);
  if (target) target.classList.add('active');
};

const renderHome = () => {
  home.innerHTML = '';
  (state.data?.apps || []).forEach((app) => {
    const btn = document.createElement('button');
    btn.className = 'app-icon';
    btn.style.background = app.color;
    btn.innerText = `${app.icon}\n${app.title}`;
    btn.onclick = () => {
      if (app.id === 'phone') setView('phoneapp');
      else setView(app.id);
    };
    home.appendChild(btn);
  });
  setView('home');
};

const renderContacts = () => {
  const list = document.getElementById('contactList');
  list.innerHTML = '';
  (state.data?.contacts || []).forEach((contact, index) => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${contact.name}</strong><br>${contact.number}`;
    li.onclick = () => {
      document.getElementById('msgTo').value = contact.number;
      document.getElementById('dialNumber').value = contact.number;
    };
    const del = document.createElement('button');
    del.innerText = 'Sil';
    del.onclick = async (e) => {
      e.stopPropagation();
      state.data.contacts.splice(index, 1);
      await post('saveContacts', state.data.contacts);
      renderContacts();
    };
    li.appendChild(del);
    list.appendChild(li);
  });
};

const renderMessages = () => {
  const list = document.getElementById('messageList');
  list.innerHTML = '';
  (state.data?.messages || []).forEach((msg) => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${msg.sender} ➜ ${msg.receiver}</strong><br>${msg.message}<br><small>${msg.sent_at || ''}</small>`;
    list.appendChild(li);
  });
};

const renderGallery = () => {
  const grid = document.getElementById('galleryGrid');
  grid.innerHTML = '';
  (state.data?.gallery || []).forEach((photo) => {
    const card = document.createElement('div');
    card.className = 'photo-card';
    card.innerHTML = `<img src="${photo.image}" alt="photo"/><small>${photo.caption || ''}</small>`;
    const del = document.createElement('button');
    del.innerText = 'Sil';
    del.onclick = async () => {
      await post('deletePhoto', { id: photo.id });
      state.data.gallery = state.data.gallery.filter((p) => p.id !== photo.id);
      renderGallery();
    };
    card.appendChild(del);
    grid.appendChild(card);
  });
};

const renderMaps = () => {
  const mapList = document.getElementById('mapList');
  mapList.innerHTML = '';
  (state.data?.mapLocations || []).forEach((loc) => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${loc.title}</strong>`;
    const btn = document.createElement('button');
    btn.innerText = 'Isaretle';
    btn.onclick = () => post('setWaypoint', { coords: loc.coords });
    li.appendChild(btn);
    mapList.appendChild(li);
  });
};

const renderNotes = () => {
  const noteList = document.getElementById('noteList');
  noteList.innerHTML = '';
  (state.data?.notes || []).forEach((note, index) => {
    const li = document.createElement('li');
    li.textContent = note;
    const del = document.createElement('button');
    del.innerText = 'Sil';
    del.onclick = async () => {
      state.data.notes.splice(index, 1);
      await post('saveNotes', state.data.notes);
      renderNotes();
    };
    li.appendChild(del);
    noteList.appendChild(li);
  });
};

const renderDirectory = () => {
  const container = document.getElementById('directoryResults');
  container.innerHTML = state.directoryResults.map((row) => `<div>${row.phone_number}</div>`).join('');
};

const hydrate = (data) => {
  state.data = data;
  document.getElementById('owner').innerText = `${data.me.name} (${data.me.phone})`;
  phone.style.background = data.settings.wallpaper || phone.style.background;
  document.getElementById('wallpaperInput').value = data.settings.wallpaper || '';
  renderHome();
  renderContacts();
  renderMessages();
  renderGallery();
  renderMaps();
  renderNotes();
};

window.addEventListener('message', (event) => {
  const { action, payload } = event.data || {};
  if (action === 'setVisible') {
    state.visible = !!payload;
    phone.classList.toggle('hidden', !state.visible);
  }
  if (action === 'hydrate') hydrate(payload);
  if (action === 'pushMessage') {
    state.data.messages.unshift(payload);
    renderMessages();
  }
  if (action === 'searchResults') {
    state.directoryResults = payload || [];
    renderDirectory();
  }
  if (action === 'browserUrl') {
    document.getElementById('browserFrame').src = payload;
  }
});

document.getElementById('closeBtn').onclick = () => post('closePhone');

setInterval(() => {
  const now = new Date();
  document.getElementById('time').innerText = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}, 1000);

document.getElementById('addContact').onclick = async () => {
  const name = document.getElementById('contactName').value.trim();
  const number = document.getElementById('contactNumber').value.trim();
  if (!name || !number) return;
  state.data.contacts.push({ name, number });
  await post('saveContacts', state.data.contacts);
  renderContacts();
};

document.getElementById('sendMsg').onclick = async () => {
  const to = document.getElementById('msgTo').value.trim();
  const message = document.getElementById('msgText').value.trim();
  if (!to || !message) return;
  await post('sendMessage', { to, message });
};

document.getElementById('dialBtn').onclick = async () => {
  const number = document.getElementById('dialNumber').value.trim();
  await post('dialNumber', { number });
  await post('searchDirectory', { query: number });
};

document.getElementById('captureBtn').onclick = async () => {
  const caption = document.getElementById('photoCaption').value.trim();
  const resp = await fetch(`https://${resourceName}/capturePhoto`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ caption })
  });
  const json = await resp.json();
  if (json.ok && json.image) {
    state.data.gallery.unshift({ id: Date.now(), image: json.image, caption });
    renderGallery();
  }
};

document.getElementById('openUrl').onclick = async () => {
  const url = document.getElementById('browserUrl').value.trim();
  await post('openBrowserUrl', { url });
};

document.getElementById('saveNote').onclick = async () => {
  const note = document.getElementById('noteText').value.trim();
  if (!note) return;
  state.data.notes.unshift(note);
  await post('saveNotes', state.data.notes);
  document.getElementById('noteText').value = '';
  renderNotes();
};

document.getElementById('calcBtn').onclick = async () => {
  const expression = document.getElementById('calcExpr').value;
  const resp = await fetch(`https://${resourceName}/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ expression })
  });
  const json = await resp.json();
  document.getElementById('calcResult').innerText = `${json.result}`;
};

document.getElementById('saveSettings').onclick = async () => {
  const wallpaper = document.getElementById('wallpaperInput').value.trim();
  state.data.settings.wallpaper = wallpaper;
  phone.style.background = wallpaper;
  await post('saveSettings', state.data.settings);
};
