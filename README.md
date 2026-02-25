# qb-smartphone (QBCore)

QBCore tabanli, NUI destekli cep telefonu kaynagi.

## Ozellikler
- Ana ekran uygulama sistemi
- Kisiler, Mesajlar, Arama
- Kamera (screenshot-basic ile) ve Galeri
- Harita kisayollari / waypoint
- Mini tarayici (iframe)
- Notlar uygulamasi
- Hesap makinesi
- Ayarlar (wallpaper)
- SQL tablolari ile kalici veri

## Kurulum
1. Kaynagi `resources/[qb]/qb-smartphone` klasorune koyun.
2. `ensure qb-smartphone` satirini `server.cfg` dosyaniza ekleyin.
3. `oxmysql` ve `screenshot-basic` bagimliliklarinin kurulu oldugundan emin olun.
4. `Config.EnableItemRequired` true ise envanterde `Config.PhoneItem` tanimli olmali.

## Komutlar
- `/telefon` (varsayilan)
- `F1` kisayol tusu
