# edna_game
Özellikler
Çoklu Karakter Kontrolü: Oyuncular 'Z' tuşu ile birden fazla karakter arasında geçiş yapabilir ve her bir karakteri ayrı ayrı kontrol edebilir.
Seviye Tabanlı İlerleme: Oyun, giderek zorlaşan ve farklı bulmacalar sunan birden fazla seviyeden oluşmaktadır. (Şu anda 3 seviye mevcuttur).
Etkileşimli Ortam:
Kapılar: Belirli koşullar altında açılan kapılar (örn. butonlara basma).
Butonlar: Kapıları veya diğer mekanizmaları tetikleyen interaktif elementler.
Çıkış Kapısı: Seviyenin tamamlanması için ulaşılması gereken hedef.
Parmaklıklar: Engeller oluşturan ve karakterlerin geçişini kısıtlayan yapılar.
Görsel ve İşitsel Geri Bildirim:
Oyuncunun aktif karakterini belirten sarı çerçeve.
Seviye geçişlerinde ve oyun sonu durumlarında değişen arka planlar.
Ses efektleri (zıplama, karakter değiştirme, kapı açma vb. eklenebilir).
Başlangıç, oynanış, duraklatma ve bitiş ekranları ile kullanıcıya yönlendirme.
Basit ve Anlaşılır Kontroller: Kolayca öğrenilebilen tuş kombinasyonları.
Duraklatma Menüsü: Oyunu duraklatma, devam etme veya seviyeyi yeniden başlatma seçenekleri.
Responsive Tasarım: Canvas, temel CSS ile sayfanın ortasında görüntülenir. (Mobil uyumluluk veya dinamik boyutlandırma eklenirse belirtilebilir).
Nasıl Oynanır?
Oyunu Başlatma: HTML dosyasını bir web tarayıcısında açın. Giriş ekranında Enter tuşuna basarak oyunu başlatın.
Karakter Kontrolü:
Sol Ok / A: Karakteri sola hareket ettir.
Sağ Ok / D: Karakteri sağa hareket ettir.
Yukarı Ok / W / Boşluk: Karakteri zıplat.
Z: Kontrol edilen karakteri değiştir.
Hedef: Her seviyede tüm karakterleri kullanarak bulmacaları çöz ve çıkış kapısına (X ile işaretli) ulaş. Tüm seviyeleri tamamladığında oyun sona erecektir.
Duraklatma: Oyun sırasında Esc tuşuna basarak oyunu duraklatabilir ve menü seçeneklerini görebilirsin:
1: Oyuna devam et.
2: Mevcut seviyeyi baştan başlat.
Harika bir fikir! Proje ödeviniz için kapsamlı ve etkileyici bir README dosyası hazırlayalım. Aşağıda, oyununuzu en iyi şekilde tanıtacak bir README şablonu bulunmaktadır. Bölümleri kendi oyununuza ve proje gereksinimlerinize göre düzenleyebilir, detaylandırabilirsiniz.

Edna: Karakter Değiştirmeli Platform Oyunu
Proje Tanımı
Bu proje, JavaScript ve HTML Canvas kullanılarak geliştirilmiş, oyuncuların karakterler arasında geçiş yaparak bulmacaları çözdüğü basit ama eğlenceli bir 2D platform oyunudur. Oyuncular, seviyeler boyunca ilerlemek için ana karakterin yanı sıra "yan karakterlerin" özel yeteneklerini (veya sadece konumlarını) kullanarak çeşitli engelleri aşmalı, butonlara basmalı ve kapıları açmalıdır.

Özellikler
Çoklu Karakter Kontrolü: Oyuncular 'Z' tuşu ile birden fazla karakter arasında geçiş yapabilir ve her bir karakteri ayrı ayrı kontrol edebilir.
Seviye Tabanlı İlerleme: Oyun, giderek zorlaşan ve farklı bulmacalar sunan birden fazla seviyeden oluşmaktadır. (Şu anda 3 seviye mevcuttur).
Etkileşimli Ortam:
Kapılar: Belirli koşullar altında açılan kapılar (örn. butonlara basma).
Butonlar: Kapıları veya diğer mekanizmaları tetikleyen interaktif elementler.
Çıkış Kapısı: Seviyenin tamamlanması için ulaşılması gereken hedef.
Parmaklıklar: Engeller oluşturan ve karakterlerin geçişini kısıtlayan yapılar.
Görsel ve İşitsel Geri Bildirim:
Oyuncunun aktif karakterini belirten sarı çerçeve.
Seviye geçişlerinde ve oyun sonu durumlarında değişen arka planlar.
Ses efektleri (zıplama, karakter değiştirme, kapı açma vb. eklenebilir).
Başlangıç, oynanış, duraklatma ve bitiş ekranları ile kullanıcıya yönlendirme.
Basit ve Anlaşılır Kontroller: Kolayca öğrenilebilen tuş kombinasyonları.
Duraklatma Menüsü: Oyunu duraklatma, devam etme veya seviyeyi yeniden başlatma seçenekleri.
Responsive Tasarım: Canvas, temel CSS ile sayfanın ortasında görüntülenir. (Mobil uyumluluk veya dinamik boyutlandırma eklenirse belirtilebilir).
Nasıl Oynanır?
Oyunu Başlatma: HTML dosyasını bir web tarayıcısında açın. Giriş ekranında Enter tuşuna basarak oyunu başlatın.
Karakter Kontrolü:
Sol Ok / A: Karakteri sola hareket ettir.
Sağ Ok / D: Karakteri sağa hareket ettir.
Yukarı Ok / W / Boşluk: Karakteri zıplat.
Z: Kontrol edilen karakteri değiştir.
Hedef: Her seviyede tüm karakterleri kullanarak bulmacaları çöz ve çıkış kapısına (X ile işaretli) ulaş. Tüm seviyeleri tamamladığında oyun sona erecektir.
Duraklatma: Oyun sırasında Esc tuşuna basarak oyunu duraklatabilir ve menü seçeneklerini görebilirsin:
1: Oyuna devam et.
2: Mevcut seviyeyi baştan başlat.
Dosya Yapısı
index.html: Oyunun yüklendiği ana HTML dosyası. Canvas elementini içerir.
ednaGame.js: Oyunun tüm JavaScript mantığını, çizim fonksiyonlarını, seviye tanımlamalarını ve karakter hareketlerini barındıran ana betik dosyası.
assets/: Oyun için kullanılan görselleri ve ses dosyalarını içeren dizin (varsayılan isim, projenize göre değişebilir).
kapanis.png: Oyun sonu kapanış ekranı görseli.
seviye1.png, seviye2.png, seviye3.png: Seviye arka plan görselleri.
startScreen.png: Başlangıç ekranı görseli.
howToPlay.png: Nasıl oynanır ekranı görseli.
menu.png: Duraklatma menüsü görseli.
player.png: Ana karakter görseli.
sideCharacter.png: Yan karakterlerin görseli.
red_door_closed.png, red_door_open.png: Kapı görselleri.
button_normal.png, button_pressed.png: Buton görselleri.
exit_door.png: Çıkış kapısı görseli.
gray_fence.png, gray_fence2.png: Parmaklık görselleri.
(varsa ses dosyaları)
Geliştirme Ortamı
Tarayıcı: Modern bir web tarayıcısı (Google Chrome, Mozilla Firefox, Microsoft Edge vb.).
Gerekli Değil: Herhangi bir web sunucusuna ihtiyaç duymaz. Doğrudan index.html dosyasını tarayıcıda açarak çalıştırılabilir.
Gelecek Geliştirmeler (İsteğe Bağlı)
