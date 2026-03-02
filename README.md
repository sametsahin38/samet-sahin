# TreeBreaker (Forge uyumlu Datapack)

Bu proje artık plugin değil, **datapack** olarak hazırlandı.
Forge sunucularda/tek oyuncuda datapack desteklendiği için doğrudan kullanılabilir.

## Ne yapar?

- Oyuncu bir **log/stem** bloğunu kırdığında tetiklenir.
- Sadece oyuncunun elinde **balta** varsa çalışır.
- Kırılan logun üst tarafında yaprak kontrolü yapar.
- Yaprak benzeri yapı yoksa (ör. odun ev), zincirleme kırma başlamaz.
- Uygun görünüyorsa yukarı doğru sınırlı derinlikte logları temizler.

> Not: Datapack yapısı gereği kırılan blokları `air` ile değiştirir; doğal kırılma loot mekaniği plugin kadar esnek değildir.

## Kurulum (Forge)

1. `datapack-treebreaker` klasörünü ZIP'e çevir:
   - klasörün içeriği kökte kalacak şekilde paketle (`pack.mcmeta` zip kökünde olmalı).
2. ZIP dosyasını dünya klasöründeki `datapacks/` içine at:
   - Tek oyuncu: `saves/<DunyaAdi>/datapacks/`
   - Sunucu: `<server>/world/datapacks/`
3. Oyunda veya sunucu konsolunda:
   ```mcfunction
   /reload
   ```
4. Kontrol için:
   ```mcfunction
   /datapack list
   ```

## Proje yapısı

- `datapack-treebreaker/pack.mcmeta`
- `data/minecraft/tags/functions/load.json`
- `data/treebreaker/advancements/mined_log.json`
- `data/treebreaker/functions/*.mcfunction`

## Davranış detayları

- `mined_log` advancement, oyuncu log kırınca `treebreaker:on_mine` fonksiyonunu çalıştırır.
- `on_mine` fonksiyonu baltayı doğrular ve yakındaki logu hedefler.
- `has_leaves` fonksiyonu yaprak arar; yaprak yoksa işlem iptal edilir.
- `break_step` fonksiyonu 3x3 alanda sadece log/stem türlerini yukarı doğru sınırlı adımda temizler.
