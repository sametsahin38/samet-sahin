# TreeBreaker (Paper/Spigot)

Bu eklenti, **sadece gerçek ağaçları** zincirleme kırar.
Odun ev, depo veya dekor amaçlı yerleştirilmiş log blokları yaprak kontrolünü geçemediği için kırılmaz.

## Sorunu nasıl çözüyor?

Buglı sürümlerde sadece "log bağlı mı" kontrolü yapıldığı için etraftaki tüm odunlar kırılabiliyor.
Bu sürümde ek olarak:

1. Oyuncunun baltayla kırması gerekir.
2. Kırılan blok bir log olmalıdır.
3. Yukarı yönde minimum gövde yüksekliği aranır (`min-trunk-height`).
4. Kırılan blok çevresinde yeterli yaprak olmalı (`min-nearby-leaves`).
5. Kırılacak log sayısı üst sınırla kısıtlanır (`max-logs-per-tree`).

Bu kombinasyon, odun evlerin yanlışlıkla yok olmasını büyük ölçüde engeller.

## Derleme

```bash
mvn package
```

Çıktı: `target/treebreaker-1.0.0.jar`

## Kurulum

1. JAR dosyasını sunucunun `plugins/` klasörüne at.
2. Sunucuyu yeniden başlat.
3. `plugins/TreeBreaker/config.yml` dosyasından eşikleri ihtiyacına göre ayarla.
