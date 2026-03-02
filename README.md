# TreeBreaker (Forge uyumlu Datapack)

Bu sürüm, plugin değil **datapack** olarak hazırlanmıştır.
Özellikle **Forge 1.20.1** için uyumlu olacak şekilde düzenlenmiştir.

## Neden önce görünmemiş olabilir?

Ekran görüntünde `/datapack list` sadece `vanilla` gösteriyor.
Bu genelde şu 2 sebepten olur:

1. ZIP yapısı yanlış (zipin içinde ekstra klasör seviyesi var)
2. Sürüm uyumsuz `pack_format`

Bu repo içindeki sürüm şimdi `pack_format: 15` (Minecraft/Forge 1.20.1) olacak şekilde ayarlandı.

## Doğru kurulum (çok önemli)

### 1) ZIP'i doğru oluştur
`datapack-treebreaker` klasörünün **içeriği** zip kökünde olmalı.
Yani zip açılınca direkt şunlar görünmeli:

- `pack.mcmeta`
- `data/`

Linux/macOS örnek:
```bash
cd datapack-treebreaker
zip -r ../treebreaker-datapack.zip pack.mcmeta data
```

Windows'ta da benzer mantık: `pack.mcmeta` + `data` seçip sıkıştır.

### 2) Doğru klasöre at
- Tek oyuncu: `saves/<DunyaAdi>/datapacks/`
- Sunucu: `<server>/world/datapacks/`

### 3) Oyunda yenile
```mcfunction
/reload
/datapack list available
/datapack list enabled
```

Eğer `available` listesinde görünüp aktif değilse:
```mcfunction
/datapack enable "file/treebreaker-datapack.zip"
```

## Ne yapar?

- Oyuncu log/stem kırınca tetiklenir.
- Sadece oyuncunun elinde balta varsa çalışır.
- Hedef log çevresinde yaprak kontrolü yapar.
- Yaprak yoksa (ör. odun ev), zincir kırma yapmaz.
- Yaprak varsa yukarı doğru sınırlı şekilde logları temizler.

## Dosyalar

- `datapack-treebreaker/pack.mcmeta`
- `datapack-treebreaker/data/minecraft/tags/functions/load.json`
- `datapack-treebreaker/data/treebreaker/advancements/mined_log.json`
- `datapack-treebreaker/data/treebreaker/functions/*.mcfunction`

## Komut uyumluluğu notu

Önceki sürümdeki `return` komutu bazı sürümlerde sorun çıkarabiliyordu.
Bu sürümde akış scoreboard tabanlı hale getirildi; Forge 1.20.1 ile daha uyumlu.
