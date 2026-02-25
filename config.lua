Config = {}

Config.OpenCommand = 'telefon'
Config.OpenKey = 'F1'
Config.CloseControl = 177 -- BACKSPACE
Config.MaxGalleryPhotos = 300
Config.EnableItemRequired = false
Config.PhoneItem = 'phone'

Config.DefaultWallpaper = {
    type = 'preset',
    value = 'linear-gradient(145deg,#0f172a,#1e293b,#334155)'
}

Config.WallpaperPresets = {
    'linear-gradient(145deg,#0f172a,#1e293b,#334155)',
    'linear-gradient(145deg,#111827,#1f2937,#4b5563)',
    'linear-gradient(145deg,#1d4ed8,#06b6d4,#22d3ee)',
    'linear-gradient(145deg,#7c3aed,#a855f7,#ec4899)',
    'linear-gradient(145deg,#14532d,#15803d,#22c55e)'
}

Config.CoreApps = {
    { id = 'contacts', title = 'Rehber', icon = '👥', color = '#1d4ed8', category = 'core' },
    { id = 'messages', title = 'Mesajlar', icon = '💬', color = '#2563eb', category = 'core' },
    { id = 'phone', title = 'Arama', icon = '📞', color = '#0f766e', category = 'core' },
    { id = 'camera', title = 'Kamera', icon = '📷', color = '#334155', category = 'core' },
    { id = 'appstore', title = 'App Store', icon = '🛍️', color = '#111827', category = 'core' },
    { id = 'settings', title = 'Ayarlar', icon = '⚙️', color = '#1f2937', category = 'core' }
}

Config.StoreApps = {
    { id = 'gallery', title = 'Galeri', icon = '🖼️', color = '#7c3aed', description = 'Telefon fotoğraflarını görüntüle.' },
    { id = 'maps', title = 'Harita', icon = '🗺️', color = '#15803d', description = 'Hazır konumlar ve waypoint.' },
    { id = 'browser', title = 'Tarayıcı', icon = '🌐', color = '#0369a1', description = 'Mini web görüntüleyici.' },
    { id = 'notes', title = 'Notlar', icon = '📝', color = '#b45309', description = 'Kişisel notlar tut.' },
    { id = 'calculator', title = 'Hesap', icon = '🧮', color = '#334155', description = 'Hızlı hesap makinesi.' },
    { id = 'twitter', title = 'Birdy', icon = '🐦', color = '#0ea5e9', description = 'Twitter benzeri sosyal akış.' }
}

Config.MapLocations = {
    { title = 'Police HQ', coords = vector3(441.2, -981.9, 30.6) },
    { title = 'Hospital', coords = vector3(299.8, -584.9, 43.2) },
    { title = 'Mechanic', coords = vector3(-337.4, -136.9, 39.0) },
    { title = 'Airport', coords = vector3(-1037.6, -2738.0, 13.8) }
}
