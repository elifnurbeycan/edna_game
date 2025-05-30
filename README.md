# Edna: Karakter Değiştirmeli Platform Oyunu

## Proje Tanımı

Bu proje, JavaScript ve HTML Canvas kullanılarak geliştirilmiş, oyuncuların karakterler arasında geçiş yaparak seviyeleri tamamladığı basit ama eğlenceli bir 2D platform oyunudur. Oyuncular, seviyeler boyunca ilerlemek için ana karakterin yanı sıra "yan karakterleri" de kullanarak çeşitli engelleri aşmalı, butonlara basmalı ve kapıları açmalıdır.

## Özellikler

* **Çoklu Karakter Kontrolü:** Oyuncular `'Z'` tuşu ile birden fazla karakter arasında geçiş yapabilir ve her bir karakteri ayrı ayrı kontrol edebilir.
* **Seviye Tabanlı İlerleme:** Oyun, giderek zorlaşır ve birden fazla seviyeden oluşmaktadır. (Şu anda 3 seviye mevcuttur).
* **Etkileşimli Ortam:**
    * **Kapılar:** Belirli koşullar altında açılan kapılar (örn. butonlara basma).
    * **Butonlar:** Kapıları tetikleyen interaktif elementler.
    * **Çıkış Kapısı:** Seviyenin tamamlanması için ulaşılması gereken hedef.
    * **Parmaklıklar:** Engeller oluşturan ve karakterlerin geçişini kısıtlayan yapılar.
* **Görsel ve İşitsel Geri Bildirim:**
    * Oyuncunun aktif karakterini belirten sarı çerçeve.
    * Seviye geçişlerinde ve oyun sonu durumlarında değişen arka planlar.
    * Ses efektleri (zıplama, yürüme, fon müziği).
    * Başlangıç, oynanış, duraklatma ile kullanıcıya yönlendirme.
* **Basit ve Anlaşılır Kontroller:** Kolayca öğrenilebilen tuş kombinasyonları.
* **Duraklatma Menüsü:** Oyunu duraklatma, devam etme veya yeniden başlatma seçenekleri.
* **Responsive Tasarım:** Canvas, temel CSS ile sayfanın ortasında görüntülenir.

## Nasıl Oynanır?

1.  **Oyunu Başlatma:** `index.html` dosyasını bir web tarayıcısında açın. Giriş ekranında `Enter` tuşuna basarak oyunu başlatın.
2.  **Karakter Kontrolü:**
    * `Sol Ok`: Karakteri sola hareket ettir.
    * `Sağ Ok`: Karakteri sağa hareket ettir.
    * `Yukarı Ok`: Karakteri zıplat.
    * `Z`: Kontrol edilen karakteri değiştir.
3.  **Hedef:** Her seviyede tüm karakterleri kullanarak çıkış kapısına ulaş. Tüm seviyeleri tamamladığında oyun baştan başlayacaktır.
4.  **Duraklatma:** Oyun sırasında `Esc` tuşuna basarak oyunu duraklatabilir ve menü seçeneklerini görebilirsin:
    * `1`: Oyuna devam et.
    * `2`: Mevcut seviyeyi baştan başlat.

## Dosya Yapısı

Proje aşağıdaki temel dosya yapısına sahiptir:
* index.html
* ednaGame.js
* muzikler 
* resimler

## Kullanılan Araçlar / Varlık Oluşturma

Bu projenin görsel varlıkları (arka planlar, karakterler, objeler vb.) tamamen tarafımdan tasarlanmış ve çizilmiştir. Bu süreçte aşağıdaki grafik tasarım uygulamaları kullanılmıştır:

* **LibreSprite:** Pixel art görsellerinin çizimi, animasyonların oluşturulması ve düzenlenmesi için açık kaynaklı bir araçtır. Oyun içindeki tüm karakterler, etkileşimli objeler (kapılar, butonlar) ve parmaklıklar bu program kullanılarak tasarlanmıştır.
* **PixelApp:** Basit pixel art çizimleri için kullanışlı bir pixel art editörüdür. Oyundaki ana ve yan karakterler, arka plan elementleri ve başlangıç ekranı görselleri bu uygulama ile oluşturulmuştur.

Her bir pikselin özenle yerleştirildiği bu tasarımlar, oyunun retro ve minimalist estetiğini oluşturmada önemli bir rol oynamıştır.

## Yapay Zeka Kullanımı
Yapay zeka olarak gemini aracını belli kısımlarda kullandım fakat kendisi link vermediği için linkimi koyamadım. Geminiyi hata aldığım zamanlarda, hangi araçları kullanmam gerektiği konusunda kullandım.

## Oyunumdan Görseller 
![](ekrangoruntusu/resim1.png)
![](ekrangoruntusu/resim2.png)

## Youtube Video Linkim
https://youtu.be/rAzIhuF6UAA
## Değiştirdiğim Oyun
https://kz.itch.io/edna


