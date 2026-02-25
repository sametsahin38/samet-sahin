# qb-smartphone (QBCore)

Geliştirilmiş QBCore telefon sistemi.

## Öne çıkanlar
- F1 ile telefon açma
- Backspace ile geri/telefon kapatma
- Temel uygulamalar: Rehber, Mesajlar, Arama, Kamera
- App Store: İsteğe bağlı uygulama indirme (Galeri, Harita, Tarayıcı, Notlar, Hesap, Birdy)
- Kamera uygulamasında:
  - Enter ile fotoğraf çekme
  - Sağ tık ile ön/arka kamera değiştirme
- Ayarlarda arkaplan:
  - URL yerine hazır preset
  - Telefonda çekilen fotoğraflardan arkaplan seçimi
- Birdy (Twitter benzeri):
  - Rastgele kullanıcı/şifre üretimi ile kayıt
  - Giriş, post paylaşımı, görsel ekleme, global akış

## Kurulum
1. Kaynağı `resources/[qb]/qb-smartphone` içine koyun.
2. `server.cfg` dosyasına `ensure qb-smartphone` ekleyin.
3. Bağımlılıklar: `qb-core`, `oxmysql`, `screenshot-basic`
