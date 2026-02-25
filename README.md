# qb-smartphone (QBCore)

Geliştirilmiş, Türkçe QBCore telefon sistemi.

## Öne çıkanlar
- F1 ile telefon açma
- Backspace ile geri/telefon kapatma
- Her telefona benzersiz numara atanması
- Ana ekranda sadece bildirim alanı ve uygulama ikonları
- Temel uygulamalar: Rehber, Mesajlar, Arama, Kamera
- App Store: İsteğe bağlı uygulama indirme (Galeri, Harita, Tarayıcı, Notlar, Hesap, Birdy)
- Mesajlaşma:
  - Numarayla mesaj gönderme
  - Galeriden fotoğraf mesajı gönderme
  - Anlık konum gönderme
  - Konum mesajına tıklayıp GPS işaretleme
- Kamera uygulaması:
  - Enter ile fotoğraf çekme
  - Sağ tık ile ön/arka kamera değiştirme
- Ayarlarda arkaplan:
  - URL yerine hazır preset
  - Telefonda çekilen fotoğraflardan arkaplan seçimi

## Kurulum
1. Kaynağı `resources/[qb]/qb-smartphone` içine koyun.
2. `server.cfg` dosyasına `ensure qb-smartphone` ekleyin.
3. Bağımlılıklar: `qb-core`, `oxmysql`, `screenshot-basic`
