# Edna: Karakter Değiştirmeli Platform Oyunu

## Proje Tanımı

Bu proje, JavaScript ve HTML Canvas kullanılarak geliştirilmiş, oyuncuların karakterler arasında geçiş yaparak bulmacaları çözdüğü basit ama eğlenceli bir 2D platform oyunudur. Oyuncular, seviyeler boyunca ilerlemek için ana karakterin yanı sıra "yan karakterlerin" özel yeteneklerini (veya sadece konumlarını) kullanarak çeşitli engelleri aşmalı, butonlara basmalı ve kapıları açmalıdır.

## Özellikler

* **Çoklu Karakter Kontrolü:** Oyuncular `'Z'` tuşu ile birden fazla karakter arasında geçiş yapabilir ve her bir karakteri ayrı ayrı kontrol edebilir.
* **Seviye Tabanlı İlerleme:** Oyun, giderek zorlaşan ve farklı bulmacalar sunan birden fazla seviyeden oluşmaktadır. (Şu anda 3 seviye mevcuttur).
* **Etkileşimli Ortam:**
    * **Kapılar:** Belirli koşullar altında açılan kapılar (örn. butonlara basma).
    * **Butonlar:** Kapıları veya diğer mekanizmaları tetikleyen interaktif elementler.
    * **Çıkış Kapısı:** Seviyenin tamamlanması için ulaşılması gereken hedef.
    * **Parmaklıklar:** Engeller oluşturan ve karakterlerin geçişini kısıtlayan yapılar.
* **Görsel ve İşitsel Geri Bildirim:**
    * Oyuncunun aktif karakterini belirten sarı çerçeve.
    * Seviye geçişlerinde ve oyun sonu durumlarında değişen arka planlar.
    * Ses efektleri (zıplama, karakter değiştirme, kapı açma vb. eklenebilir).
    * Başlangıç, oynanış, duraklatma ve bitiş ekranları ile kullanıcıya yönlendirme.
* **Basit ve Anlaşılır Kontroller:** Kolayca öğrenilebilen tuş kombinasyonları.
* **Duraklatma Menüsü:** Oyunu duraklatma, devam etme veya seviyeyi yeniden başlatma seçenekleri.
* **Responsive Tasarım:** Canvas, temel CSS ile sayfanın ortasında görüntülenir.

## Nasıl Oynanır?

1.  **Oyunu Başlatma:** `index.html` dosyasını bir web tarayıcısında açın. Giriş ekranında `Enter` tuşuna basarak oyunu başlatın.
2.  **Karakter Kontrolü:**
    * `Sol Ok` / `A`: Karakteri sola hareket ettir.
    * `Sağ Ok` / `D`: Karakteri sağa hareket ettir.
    * `Yukarı Ok` / `W` / `Boşluk`: Karakteri zıplat.
    * `Z`: Kontrol edilen karakteri değiştir.
3.  **Hedef:** Her seviyede tüm karakterleri kullanarak bulmacaları çöz ve çıkış kapısına (`X` ile işaretli) ulaş. Tüm seviyeleri tamamladığında oyun sona erecektir.
4.  **Duraklatma:** Oyun sırasında `Esc` tuşuna basarak oyunu duraklatabilir ve menü seçeneklerini görebilirsin:
    * `1`: Oyuna devam et.
    * `2`: Mevcut seviyeyi baştan başlat.

## Dosya Yapısı

Proje aşağıdaki temel dosya yapısına sahiptir:
