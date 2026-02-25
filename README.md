# qb-smartphone (QBCore)

Gerçekçiliği artırılmış, Türkçe QBCore telefon sistemi.

## Öne çıkanlar
- F1 ile telefon açma
- Backspace ile geri/telefon kapatma
- Her telefona benzersiz numara atanması
- Ana ekranda sol üst bildirimler, sağ üst gerçek saat + gün
- Her uygulamada geri akışı: ekrandaki geri butonu veya Backspace ile ana ekrana dönüş
- Mesajlaşma ekranı WhatsApp benzeri: kişi listesi + sohbet alanı + altta mesaj yazma bölümü
- Giden/gelen mesaj balonları farklı renklerde
- Temel uygulamalar: Rehber, Mesajlaşma, Arama, Kamera
- Uygulama Mağazası: isteğe bağlı uygulama indirme
- Mesajlaşma gerçekçi akış:
  - Rehber kişisinden sohbet başlatma
  - Numarayla mesaj gönderme
  - Galeriden fotoğraf paylaşma
  - Anlık konum paylaşma
  - Konum mesajından GPS'de işaretleme
- Bildirim sistemi:
  - Mesaj gelince ekranda önizleme uyarısı
  - Bildirim sesi
  - Ayarlardan Sessiz Mod ve Rahatsız Etme
- Ayarlar:
  - Kendi telefon numarasını en altta görme
  - Buton boyutunu büyütme/küçültme
  - Arkaplan özelleştirme (preset + galeriden)
- Twitter uygulaması (eski Birdy)

## Kurulum
1. Kaynağı `resources/[qb]/qb-smartphone` içine koyun.
2. `server.cfg` dosyasına `ensure qb-smartphone` ekleyin.
3. Bağımlılıklar: `qb-core`, `oxmysql`, `screenshot-basic`
