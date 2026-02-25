const resourceName = typeof GetParentResourceName === 'function' ? GetParentResourceName() : 'qb-smartphone';

const state = {
  data: null,
  directoryResults: [],
  cameraFront: false,
  twitter: { loggedIn: false, username: null, feed: [] },
  selectedChatNumber: null,
  currentView: 'home'
};

const phone = document.getElementById('phone');
const homeIcons = document.getElementById('homeIcons');

const post = async (name, data = {}) => {
  const resp = await fetch(`https://${resourceName}/${name}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
  });
  try { return await resp.json(); } catch { return {}; }
};

const playNotificationBeep = () => {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(950, ctx.currentTime);
  gain.gain.setValueAtTime(0.001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
  osc.connect(gain); gain.connect(ctx.destination);
  osc.start(); osc.stop(ctx.currentTime + 0.22);
};

const parseMeta = (meta) => {
  if (!meta) return null;
  if (typeof meta === 'object') return meta;
  try { return JSON.parse(meta); } catch { return null; }
};

const normalizeMessages = () => {
  state.data.messages = (state.data.messages || []).map((m) => ({
    ...m,
    msg_type: m.msg_type || 'text',
    meta: parseMeta(m.meta)
  }));
};

const saveSettings = async () => post('saveSettings', state.data.settings);
const appInstalled = (id) => !!state.data.settings.installedApps?.[id];

const installApp = async (id) => {
  state.data.settings.installedApps[id] = true;
  await saveSettings();
  rebuildApps();
  renderStore();
};

const applyButtonScale = () => {
  const scale = Number(state.data.settings.buttonScale || 100);
  document.documentElement.style.setProperty('--btnScale', `${scale / 100}`);
};

const getUnreadCount = () => (state.data.messages || []).filter((m) => m.receiver === state.data.me.phone).length;

const renderHeaderClock = () => {
  const d = new Date();
  const days = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
  document.getElementById('dayName').textContent = days[d.getDay()];
  document.getElementById('time').textContent = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const renderNotifications = () => {
  const unread = getUnreadCount();
  document.getElementById('notifications').innerHTML = `<b>Bildirimler</b><br>${unread > 0 ? `📩 ${unread} okunmamış mesaj` : 'Yeni bildirim yok'}<br>☎ Numaran: <b>${state.data.me.phone}</b>`;
  document.getElementById('topLeftNotice').textContent = unread > 0 ? `Bildirimler (${unread})` : 'Bildirimler';
};

const setView = async (id) => {
  document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));
  const target = document.getElementById(id === 'phone' ? 'phoneapp' : id);
  if (target) target.classList.add('active');
  state.currentView = (id === 'phone' ? 'phoneapp' : id);
  document.getElementById('appBackBtn').classList.toggle('hidden', state.currentView === 'home');
  await post('setCameraMode', { enabled: id === 'camera' });
  if (id === 'twitter') await post('twitterFeed');
  if (id === 'messages') renderMessageContacts();
};

const goBack = async () => {
  if (state.currentView !== 'home') {
    await setView('home');
  } else {
    await post('closePhone');
  }
};

const rebuildApps = () => {
  const core = state.data.coreApps || [];
  const optional = (state.data.storeApps || []).filter((a) => appInstalled(a.id));
  state.data.apps = [...core, ...optional];
  renderHome();
};

const renderHome = () => {
  renderNotifications();
  homeIcons.innerHTML = '';
  (state.data.apps || []).forEach((app) => {
    const b = document.createElement('button');
    b.className = 'app-icon';
    b.style.background = app.color;
    b.innerText = `${app.icon}\n${app.title}`;
    b.onclick = () => setView(app.id);
    homeIcons.appendChild(b);
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
      state.selectedChatNumber = c.number;
      renderMessages();
    };
    const del = document.createElement('button');
    del.className = 'ghost';
    del.textContent = 'Sil';
    del.onclick = async (e) => {
      e.stopPropagation();
      state.data.contacts.splice(i, 1);
      await post('saveContacts', state.data.contacts);
      renderContacts();
      renderMessageContacts();
    };
    li.appendChild(del);
    list.appendChild(li);
  });
};

const renderMessageContacts = () => {
  const list = document.getElementById('chatContacts');
  list.innerHTML = '';
  (state.data.contacts || []).forEach((c) => {
    const li = document.createElement('li');
    li.className = `contact-item ${state.selectedChatNumber === c.number ? 'active' : ''}`;
    li.innerHTML = `<b>${c.name}</b><br><small>${c.number}</small>`;
    li.onclick = () => {
      state.selectedChatNumber = c.number;
      document.getElementById('msgTo').value = c.number;
      renderMessageContacts();
      renderMessages();
    };
    list.appendChild(li);
  });
};

const renderMessages = () => {
  const list = document.getElementById('messageList');
  list.innerHTML = '';
  normalizeMessages();

  const selected = state.selectedChatNumber || document.getElementById('msgTo').value.trim();
  const visible = selected
    ? (state.data.messages || []).filter((m) => m.sender === selected || m.receiver === selected)
    : (state.data.messages || []);

  visible.slice().reverse().forEach((m) => {
    const sentByMe = m.sender === state.data.me.phone;
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${sentByMe ? 'me' : 'them'}`;
    if (m.msg_type === 'location') bubble.classList.add('message-location');
    if (m.msg_type === 'photo') bubble.classList.add('message-photo');

    let html = '';
    if (m.msg_type === 'photo' && m.meta?.image) {
      html += `${m.message}<br><img src="${m.meta.image}" style="max-width:100%;border-radius:8px;margin-top:6px;">`;
    } else if (m.msg_type === 'location' && m.meta?.x) {
      html += `${m.message}<br><small>X:${m.meta.x.toFixed(2)} Y:${m.meta.y.toFixed(2)}</small>`;
    } else {
      html += m.message;
    }

    html += `<div class="chat-meta">${sentByMe ? 'Ben' : m.sender} • ${m.sent_at || ''}</div>`;
    bubble.innerHTML = html;

    if (m.msg_type === 'location' && m.meta?.x) {
      const gps = document.createElement('button');
      gps.textContent = 'GPS’de İşaretle';
      gps.onclick = () => post('setWaypoint', { coords: m.meta });
      bubble.appendChild(gps);
    }

    list.appendChild(bubble);
  });

  list.scrollTop = list.scrollHeight;
  renderNotifications();
};

const renderPhotoPickerForMessage = () => {
  const picker = document.getElementById('photoPicker');
  picker.innerHTML = '';
  (state.data.gallery || []).forEach((p) => {
    const card = document.createElement('button');
    card.className = 'photo-option';
    card.innerHTML = `<img src="${p.image}" alt="foto">`;
    card.onclick = async () => {
      const to = document.getElementById('msgTo').value.trim();
      if (!to) return;
      await post('sendMessage', {
        to,
        msgType: 'photo',
        image: p.image,
        caption: p.caption || 'Galeriden fotoğraf'
      });
      picker.classList.add('hidden');
    };
    picker.appendChild(card);
  });
};

const renderGallery = () => {
  const grid = document.getElementById('galleryGrid');
  grid.innerHTML = '';
  (state.data.gallery || []).forEach((p) => {
    const card = document.createElement('div');
    card.className = 'photo-card card';
    card.innerHTML = `<img src="${p.image}" alt="photo"><div>${p.caption || ''}</div>`;

    const row = document.createElement('div');
    row.className = 'row';

    const bg = document.createElement('button');
    bg.textContent = 'Arkaplan Yap';
    bg.onclick = async () => {
      state.data.settings.wallpaper = { type: 'photo', value: p.image };
      applyWallpaper();
      await saveSettings();
    };

    const del = document.createElement('button');
    del.className = 'ghost';
    del.textContent = 'Sil';
    del.onclick = async () => {
      await post('deletePhoto', { id: p.id });
      state.data.gallery = state.data.gallery.filter((x) => x.id !== p.id);
      renderGallery();
      renderWallpaperGalleryChoices();
      renderPhotoPickerForMessage();
    };

    row.append(bg, del);
    card.appendChild(row);
    grid.appendChild(card);
  });
};

const renderStore = () => {
  const wrap = document.getElementById('storeList');
  wrap.innerHTML = '';
  (state.data.storeApps || []).forEach((a) => {
    const item = document.createElement('div');
    item.className = 'card';
    item.innerHTML = `<div><b>${a.icon} ${a.title}</b><br><small>${a.description || ''}</small></div>`;
    const btn = document.createElement('button');
    const installed = appInstalled(a.id);
    btn.textContent = installed ? 'Yüklü' : 'İndir';
    btn.disabled = installed;
    if (!installed) btn.onclick = () => installApp(a.id);
    item.appendChild(btn);
    wrap.appendChild(item);
  });
};

const renderMaps = () => {
  const mapList = document.getElementById('mapList');
  mapList.innerHTML = '';
  (state.data.mapLocations || []).forEach((l) => {
    const li = document.createElement('li');
    li.innerHTML = `<b>${l.title}</b>`;
    const b = document.createElement('button');
    b.textContent = 'İşaretle';
    b.onclick = () => post('setWaypoint', { coords: l.coords });
    li.appendChild(b);
    mapList.appendChild(li);
  });
};

const renderNotes = () => {
  const noteList = document.getElementById('noteList');
  noteList.innerHTML = '';
  (state.data.notes || []).forEach((n, i) => {
    const li = document.createElement('li');
    li.textContent = n;
    const d = document.createElement('button');
    d.className = 'ghost';
    d.textContent = 'Sil';
    d.onclick = async () => {
      state.data.notes.splice(i, 1);
      await post('saveNotes', state.data.notes);
      renderNotes();
    };
    li.appendChild(d);
    noteList.appendChild(li);
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
  const wrap = document.getElementById('presetWallpapers');
  wrap.innerHTML = '';
  (state.data.wallpaperPresets || []).forEach((preset) => {
    const b = document.createElement('button');
    b.className = 'chip';
    b.style.background = preset;
    b.onclick = async () => {
      state.data.settings.wallpaper = { type: 'preset', value: preset };
      applyWallpaper();
      await saveSettings();
    };
    wrap.appendChild(b);
  });
};

const renderWallpaperGalleryChoices = () => {
  const wrap = document.getElementById('wallpaperFromGallery');
  wrap.innerHTML = '';
  (state.data.gallery || []).slice(0, 8).forEach((p) => {
    const b = document.createElement('button');
    b.className = 'chip';
    b.style.background = `center/cover no-repeat url('${p.image}')`;
    b.onclick = async () => {
      state.data.settings.wallpaper = { type: 'photo', value: p.image };
      applyWallpaper();
      await saveSettings();
    };
    wrap.appendChild(b);
  });
};

const renderTwitterFeed = () => {
  const feed = document.getElementById('twFeed');
  feed.innerHTML = '';
  (state.twitter.feed || []).forEach((p) => {
    const li = document.createElement('li');
    li.innerHTML = `<b>@${p.username}</b><br>${p.content}${p.image ? `<br><img src="${p.image}" style="max-width:100%;border-radius:8px;margin-top:6px;">` : ''}<br><small>${p.created_at || ''}</small>`;
    feed.appendChild(li);
  });
};

const hydrate = (data) => {
  state.data = data;
  state.data.settings.installedApps = state.data.settings.installedApps || {};
  normalizeMessages();

  document.getElementById('owner').innerText = `${data.me.name}`;
  document.getElementById('myPhoneNumber').textContent = `Numaran: ${data.me.phone}`;
  document.getElementById('silentMode').checked = !!state.data.settings.silentMode;
  document.getElementById('dndMode').checked = !!state.data.settings.doNotDisturb;
  document.getElementById('buttonScale').value = Number(state.data.settings.buttonScale || 100);

  applyButtonScale();
  rebuildApps();
  renderContacts();
  renderMessageContacts();
  renderMessages();
  renderGallery();
  renderMaps();
  renderNotes();
  renderStore();
  renderPresetWallpapers();
  renderWallpaperGalleryChoices();
  renderPhotoPickerForMessage();
  applyWallpaper();
};

window.addEventListener('message', async (event) => {
  const { action, payload } = event.data || {};

  if (action === 'setVisible') phone.classList.toggle('hidden', !payload);
  if (action === 'hydrate') hydrate(payload);
  if (action === 'hardwareBack') await goBack();

  if (action === 'pushMessage') {
    const row = { ...payload, meta: parseMeta(payload.meta) };
    state.data.messages.unshift(row);
    if (!state.data.settings.silentMode && row.receiver === state.data.me.phone) playNotificationBeep();
    renderMessages();
  }

  if (action === 'searchResults') {
    state.directoryResults = payload || [];
    renderDirectory();
  }

  if (action === 'cameraFlipped') {
    state.cameraFront = !!payload;
    document.getElementById('cameraMode').innerText = state.cameraFront ? 'Ön Kamera' : 'Arka Kamera';
  }

  if (action === 'cameraCaptureKey') document.getElementById('captureBtn').click();
  if (action === 'playNotificationSound' && !state.data.settings.silentMode) playNotificationBeep();

  if (action === 'twitterFeed') {
    state.twitter.feed = payload || [];
    renderTwitterFeed();
  }

  if (action === 'twitterRegisterResult' && payload?.ok) {
    document.getElementById('twCred').textContent = `Kullanıcı: ${payload.username} | Şifre: ${payload.password}`;
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
document.getElementById('appBackBtn').onclick = () => goBack();

setInterval(renderHeaderClock, 1000);
renderHeaderClock();

document.getElementById('addContact').onclick = async () => {
  const name = document.getElementById('contactName').value.trim();
  const number = document.getElementById('contactNumber').value.trim();
  if (!name || !number) return;
  state.data.contacts.push({ name, number });
  await post('saveContacts', state.data.contacts);
  renderContacts();
  renderMessageContacts();
};

document.getElementById('startChat').onclick = () => {
  const to = document.getElementById('msgTo').value.trim();
  if (!to) return;
  state.selectedChatNumber = to;
  renderMessageContacts();
  renderMessages();
};

document.getElementById('sendMsg').onclick = async () => {
  const to = document.getElementById('msgTo').value.trim();
  const message = document.getElementById('msgText').value.trim();
  if (!to || !message) return;
  state.selectedChatNumber = to;
  await post('sendMessage', { to, message, msgType: 'text' });
  document.getElementById('msgText').value = '';
  renderMessageContacts();
};

document.getElementById('sendLocation').onclick = async () => {
  const to = document.getElementById('msgTo').value.trim();
  if (!to) return;
  state.selectedChatNumber = to;
  await post('shareLocation', { to });
};

document.getElementById('sendGalleryPhoto').onclick = () => {
  document.getElementById('photoPicker').classList.toggle('hidden');
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
    renderGallery();
    renderWallpaperGalleryChoices();
    renderPhotoPickerForMessage();
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

document.getElementById('silentMode').onchange = async (e) => {
  state.data.settings.silentMode = !!e.target.checked;
  await saveSettings();
};

document.getElementById('dndMode').onchange = async (e) => {
  state.data.settings.doNotDisturb = !!e.target.checked;
  await saveSettings();
};

document.getElementById('applyButtonScale').onclick = async () => {
  const val = Math.max(80, Math.min(140, Number(document.getElementById('buttonScale').value || 100)));
  state.data.settings.buttonScale = val;
  applyButtonScale();
  await saveSettings();
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
