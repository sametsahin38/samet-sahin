const resourceName = typeof GetParentResourceName === 'function' ? GetParentResourceName() : 'qb-smartphone';

const state = {
  data: null,
  directoryResults: [],
  cameraFront: false,
  twitter: { loggedIn: false, username: null, feed: [] }
};

const phone = document.getElementById('phone');
const home = document.getElementById('home');

const post = async (name, data = {}) => {
  const resp = await fetch(`https://${resourceName}/${name}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
  });
  try { return await resp.json(); } catch { return {}; }
};

const setView = async (id) => {
  document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));
  const target = document.getElementById(id === 'phone' ? 'phoneapp' : id);
  if (target) target.classList.add('active');
  await post('setCameraMode', { enabled: id === 'camera' });
  if (id === 'twitter') await post('twitterFeed');
};

const saveSettings = async () => post('saveSettings', state.data.settings);

const appInstalled = (id) => !!state.data.settings.installedApps?.[id];
const installApp = async (id) => {
  state.data.settings.installedApps[id] = true;
  await saveSettings();
  rebuildApps();
  renderStore();
};

const rebuildApps = () => {
  const core = state.data.coreApps || [];
  const optional = (state.data.storeApps || []).filter((a) => appInstalled(a.id));
  state.data.apps = [...core, ...optional];
  renderHome();
};

const renderHome = () => {
  home.innerHTML = '';
  (state.data.apps || []).forEach((app) => {
    const b = document.createElement('button');
    b.className = 'app-icon';
    b.style.background = app.color;
    b.innerText = `${app.icon}\n${app.title}`;
    b.onclick = () => setView(app.id);
    home.appendChild(b);
  });
  setView('home');
};

const renderContacts = () => {
  const list = document.getElementById('contactList');
  list.innerHTML = '';
  (state.data.contacts || []).forEach((c, i) => {
    const li = document.createElement('li');
    li.innerHTML = `<b>${c.name}</b><br>${c.number}`;
    li.onclick = () => {
      document.getElementById('msgTo').value = c.number;
      document.getElementById('dialNumber').value = c.number;
    };
    const del = document.createElement('button');
    del.className = 'ghost'; del.textContent = 'Sil';
    del.onclick = async (e) => { e.stopPropagation(); state.data.contacts.splice(i, 1); await post('saveContacts', state.data.contacts); renderContacts(); };
    li.appendChild(del);
    list.appendChild(li);
  });
};

const renderMessages = () => {
  const list = document.getElementById('messageList'); list.innerHTML = '';
  (state.data.messages || []).forEach((m) => {
    const li = document.createElement('li');
    li.innerHTML = `<b>${m.sender} → ${m.receiver}</b><br>${m.message}<br><small>${m.sent_at || ''}</small>`;
    list.appendChild(li);
  });
};

const renderGallery = () => {
  const grid = document.getElementById('galleryGrid'); grid.innerHTML = '';
  (state.data.gallery || []).forEach((p) => {
    const card = document.createElement('div'); card.className = 'photo-card card';
    card.innerHTML = `<img src="${p.image}" alt="photo"><div>${p.caption || ''}</div>`;

    const row = document.createElement('div'); row.className = 'row';
    const bg = document.createElement('button'); bg.textContent = 'Arkaplan Yap';
    bg.onclick = async () => {
      state.data.settings.wallpaper = { type: 'photo', value: p.image };
      applyWallpaper(); await saveSettings();
    };
    const del = document.createElement('button'); del.className = 'ghost'; del.textContent = 'Sil';
    del.onclick = async () => {
      await post('deletePhoto', { id: p.id });
      state.data.gallery = state.data.gallery.filter((x) => x.id !== p.id);
      renderGallery(); renderWallpaperGalleryChoices();
    };
    row.append(bg, del); card.appendChild(row);
    grid.appendChild(card);
  });
};

const renderStore = () => {
  const wrap = document.getElementById('storeList'); wrap.innerHTML = '';
  (state.data.storeApps || []).forEach((a) => {
    const item = document.createElement('div'); item.className = 'card';
    const left = document.createElement('div');
    left.innerHTML = `<b>${a.icon} ${a.title}</b><br><small>${a.description || ''}</small>`;
    const btn = document.createElement('button');
    const installed = appInstalled(a.id);
    btn.textContent = installed ? 'Yüklü' : 'İndir';
    btn.disabled = installed;
    if (!installed) btn.onclick = () => installApp(a.id);
    item.append(left, btn);
    wrap.appendChild(item);
  });
};

const renderMaps = () => {
  const mapList = document.getElementById('mapList'); mapList.innerHTML = '';
  (state.data.mapLocations || []).forEach((l) => {
    const li = document.createElement('li'); li.innerHTML = `<b>${l.title}</b>`;
    const b = document.createElement('button'); b.textContent = 'İşaretle'; b.onclick = () => post('setWaypoint', { coords: l.coords });
    li.appendChild(b); mapList.appendChild(li);
  });
};

const renderNotes = () => {
  const noteList = document.getElementById('noteList'); noteList.innerHTML = '';
  (state.data.notes || []).forEach((n, i) => {
    const li = document.createElement('li'); li.textContent = n;
    const d = document.createElement('button'); d.className = 'ghost'; d.textContent = 'Sil';
    d.onclick = async () => { state.data.notes.splice(i,1); await post('saveNotes', state.data.notes); renderNotes(); };
    li.appendChild(d); noteList.appendChild(li);
  });
};

const renderDirectory = () => {
  const box = document.getElementById('directoryResults');
  box.innerHTML = state.directoryResults.map((r) => `<div class="card">${r.phone_number}</div>`).join('');
};

const applyWallpaper = () => {
  const wp = state.data.settings.wallpaper;
  if (!wp) return;
  if (wp.type === 'photo') phone.style.background = `center/cover no-repeat url('${wp.value}')`;
  else phone.style.background = wp.value;
};

const renderPresetWallpapers = () => {
  const wrap = document.getElementById('presetWallpapers'); wrap.innerHTML = '';
  (state.data.wallpaperPresets || []).forEach((preset) => {
    const b = document.createElement('button'); b.className = 'chip'; b.style.background = preset;
    b.onclick = async () => { state.data.settings.wallpaper = { type: 'preset', value: preset }; applyWallpaper(); await saveSettings(); };
    wrap.appendChild(b);
  });
};

const renderWallpaperGalleryChoices = () => {
  const wrap = document.getElementById('wallpaperFromGallery'); wrap.innerHTML = '';
  (state.data.gallery || []).slice(0, 8).forEach((p) => {
    const b = document.createElement('button'); b.className = 'chip'; b.style.background = `center/cover no-repeat url('${p.image}')`;
    b.onclick = async () => { state.data.settings.wallpaper = { type: 'photo', value: p.image }; applyWallpaper(); await saveSettings(); };
    wrap.appendChild(b);
  });
};

const renderTwitterFeed = () => {
  const feed = document.getElementById('twFeed'); feed.innerHTML = '';
  (state.twitter.feed || []).forEach((p) => {
    const li = document.createElement('li');
    li.innerHTML = `<b>@${p.username}</b><br>${p.content}${p.image ? `<br><img src="${p.image}" style="max-width:100%;border-radius:8px;margin-top:6px;">` : ''}<br><small>${p.created_at || ''}</small>`;
    feed.appendChild(li);
  });
};

const hydrate = (data) => {
  state.data = data;
  state.data.settings.installedApps = state.data.settings.installedApps || {};
  document.getElementById('owner').innerText = `${data.me.name} (${data.me.phone})`;
  rebuildApps();
  renderContacts(); renderMessages(); renderGallery(); renderMaps(); renderNotes(); renderStore();
  renderPresetWallpapers(); renderWallpaperGalleryChoices();
  applyWallpaper();
};

window.addEventListener('message', async (event) => {
  const { action, payload } = event.data || {};
  if (action === 'setVisible') phone.classList.toggle('hidden', !payload);
  if (action === 'hydrate') hydrate(payload);
  if (action === 'pushMessage') { state.data.messages.unshift(payload); renderMessages(); }
  if (action === 'searchResults') { state.directoryResults = payload || []; renderDirectory(); }
  if (action === 'cameraFlipped') {
    state.cameraFront = !!payload;
    document.getElementById('cameraMode').innerText = state.cameraFront ? 'Ön Kamera' : 'Arka Kamera';
  }
  if (action === 'cameraCaptureKey') document.getElementById('captureBtn').click();
  if (action === 'twitterFeed') { state.twitter.feed = payload || []; renderTwitterFeed(); }
  if (action === 'twitterRegisterResult') {
    if (payload?.ok) document.getElementById('twCred').textContent = `Kullanıcı: ${payload.username} | Şifre: ${payload.password}`;
  }
  if (action === 'twitterLoginResult') {
    state.twitter.loggedIn = payload?.ok;
    state.twitter.username = payload?.username || null;
    document.getElementById('twitterAuth').classList.toggle('hidden', !!payload?.ok);
    document.getElementById('twitterPanel').classList.toggle('hidden', !payload?.ok);
    if (payload?.ok) await post('twitterFeed');
  }
  if (action === 'browserUrl') document.getElementById('browserFrame').src = payload;
});

document.getElementById('closeBtn').onclick = () => post('closePhone');
document.getElementById('homeBtn').onclick = () => setView('home');
setInterval(() => {
  const n = new Date();
  document.getElementById('time').innerText = `${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}`;
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
  const json = await post('capturePhoto', { caption, front: state.cameraFront });
  if (json.ok && json.image) {
    state.data.gallery.unshift({ id: Date.now(), image: json.image, caption });
    renderGallery(); renderWallpaperGalleryChoices();
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
  const r = await post('calculate', { expression });
  document.getElementById('calcResult').innerText = `${r.result ?? 'Hata'}`;
};

document.getElementById('twRegister').onclick = async () => post('twitterRegister');
document.getElementById('twLogin').onclick = async () => {
  await post('twitterLogin', {
    username: document.getElementById('twUser').value.trim(),
    password: document.getElementById('twPass').value.trim()
  });
};
document.getElementById('twPost').onclick = async () => {
  const content = document.getElementById('twText').value.trim();
  const image = document.getElementById('twImage').value.trim();
  if (!content) return;
  await post('twitterPost', { content, image: image || null });
  document.getElementById('twText').value = '';
};
