// HTML dosyasındaki canvas elementini DOĞRU ID'si olan 'ednaCanvas' ile yakala
const canvas = document.getElementById('ednaCanvas');

// Canvas bulunduysa devam et
if (canvas) {
    // Canvas üzerinde 2D çizim yapmak için context objesini al
    const ctx = canvas.getContext('2d');

    if (ctx) {
        console.log('Canvas ve 2D context başarıyla alındı! Oyun başlatılıyor...');

        // =========== OYUN OBJELERİ / DEĞİŞKENLERİ ===========
        let player = {
            x: 100,
            y: 100, // Oyuncunun başlangıç Y konumunu biraz yukarı aldık
            width: 40,
            height: 70,
            speed: 3,
            dy: 0,
            gravity: 0.5,
            jumpPower: -10,
            isOnGround: false
        };

        // NOT: Artık 'ground' objesini direkt olarak kullanmayacağız, seviye yapısı üzerinden gelecek.
        // let ground = { ... }; // Bu satır kaldırıldı.

        // =========== SEVİYE YAPISI ===========
        const tileSize = 40; // Her bir blok/karenin piksel boyutu

        // Bu level dizisi, yüklediğiniz 800x480 piksel boyutundaki seviye1.png görselinin
        // 40x40 piksellik bloklarına göre manuel olarak eşleştirilmiştir.
        // Her '#' bir katı bloğu (zemin/duvar), her ' ' bir boş alanı temsil eder.
        const level = [
            "####################", // Satır 0 - Üst duvar/tavan
            "####################", // Satır 1 - Üst duvar/tavan devamı
            "##         #########", // Satır 2
            "##                 #", // Satır 3
            "#                  #", // Satır 4 - Görseldeki orta-üst platformun üst kısmı
            "#        ###########", // Satır 5 - Orta-üst platformun alt kısmı
            "#        ###########", // Satır 6
            "#     ##############", // Satır 7 - Görseldeki büyük orta zemin bloğu
            "#     #######      #", // Satır 8 - Büyük orta zemin bloğunun devamı
            "####               #", // Satır 9 - Bu satırda boşluk bırakıldı (karakterin düşebilmesi için)
            "####             ###", // Satır 10 - Görseldeki sol alt platform
            "####################"  // Satır 11 - En alt zemin/duvar
        ];

        // Bu kısımlar 800x480 görseline göre otomatik olarak doğru olacaktır:
        const levelWidth = level[0].length * tileSize;  // 20 * 40 = 800
        const levelHeight = level.length * tileSize;    // 12 * 40 = 480

        canvas.width = levelWidth;
        canvas.height = levelHeight;

        // =========== GÖRSEL KAYNAKLARI YÜKLEME ===========
        const playerImage = new Image();
        playerImage.src = 'resimler/ana_karakter.png';
        playerImage.onload = () => console.log('Ana karakter piksel görseli başarıyla yüklendi!');
        playerImage.onerror = () => console.error('Ana karakter piksel görseli yüklenemedi! Dosya yolunu veya adını kontrol edin: ' + playerImage.src);

        const backgroundImage = new Image();
        backgroundImage.src = 'resimler/seviye1.png';
        backgroundImage.onload = () => console.log('Seviye arka plan görseli başarıyla yüklendi!');
        backgroundImage.onerror = () => console.error('Seviye arka plan görseli yüklenemedi! Dosya yolunu veya adını kontrol edin: ' + backgroundImage.src);

        // YENİ EKLENECEK GÖRSELLER: Kapı ve Buton (Verilen boyutlara göre güncellendi)
        const doorClosedImage = new Image();
        doorClosedImage.src = 'resimler/red_door.png'; // Dosya adı güncellendi
        doorClosedImage.onload = () => console.log('Kapalı kapı görseli başarıyla yüklendi!');
        doorClosedImage.onerror = () => console.error('Kapalı kapı görseli yüklenemedi! Dosya yolunu veya adını kontrol edin: ' + doorClosedImage.src);

        const doorOpenImage = new Image();
        doorOpenImage.src = 'resimler/red_door_opened.png'; // Dosya adı güncellendi
        doorOpenImage.onload = () => console.log('Açık kapı görseli başarıyla yüklendi!');
        doorOpenImage.onerror = () => console.error('Açık kapı görseli yüklenemedi! Dosya yolunu veya adını kontrol edin: ' + doorOpenImage.src);

        const buttonNormalImage = new Image();
        buttonNormalImage.src = 'resimler/red_button.png'; // Dosya adı güncellendi
        buttonNormalImage.onload = () => console.log('Normal buton görseli başarıyla yüklendi!');
        buttonNormalImage.onerror = () => console.error('Normal buton görseli yüklenemedi! Dosya yolunu veya adını kontrol edin: ' + buttonNormalImage.src);

        const buttonPressedImage = new Image();
        buttonPressedImage.src = 'resimler/red_button_pressed.png'; // Dosya adı güncellendi
        buttonPressedImage.onload = () => console.log('Basılı buton görseli başarıyla yüklendi!');
        buttonPressedImage.onerror = () => console.error('Basılı buton görseli yüklenemedi! Dosya yolunu veya adını kontrol edin: ' + buttonPressedImage.src);

        


        // =========== KLAVYE GİRDİ YÖNETİMİ ===========
        let pressedKeys = {};

        window.addEventListener('keydown', (e) => {
            pressedKeys[e.code] = true;
        });

        window.addEventListener('keyup', (e) => {
            pressedKeys[e.code] = false;
        });

        // =========== YARDIMCI FONKSİYONLAR ===========

        // AABB (Axis-Aligned Bounding Box) Çarpışma Algılama Fonksiyonu
        // İki dikdörtgenin (rect1 ve rect2) çarpışıp çarpmadığını kontrol eder.
        function checkCollision(rect1, rect2) {
            return rect1.x < rect2.x + rect2.width &&
                   rect1.x + rect1.width > rect2.x &&
                   rect1.y < rect2.y + rect2.height &&
                   rect1.y + rect1.height > rect2.y;
        }


        // =========== OYUN DÖNGÜSÜ TANIMLARI ===========

        let gameRunning = true;

        // Oyunun durumunu güncelleyen fonksiyon
        function update() {
            // --- Yatay Hareket ---
            let prevPlayerX = player.x; // Yatay çarpışma çözümü için önceki X konumunu kaydet

            if (pressedKeys['ArrowLeft']) {
                player.x -= player.speed;
            }
            if (pressedKeys['ArrowRight']) {
                player.x += player.speed;
            }

            // --- Yatay Çarpışma Kontrolü ---
            // Oyuncunun yeni yatay konumu ile seviyedeki katı blokları kontrol et
            for (let row = 0; row < level.length; row++) {
                for (let col = 0; col < level[row].length; col++) {
                    // Sadece katı bloklarla çarpışma kontrolü yapıyoruz
                    if (level[row][col] === '#') {
                        // Bloğun Canvas üzerindeki piksel koordinatlarını hesapla
                        const block = {
                            x: col * tileSize,
                            y: row * tileSize,
                            width: tileSize,
                            height: tileSize
                        };

                        // Oyuncu ile mevcut blok arasında çarpışma var mı?
                        if (checkCollision(player, block)) {
                            // Çarpışma varsa, oyuncuyu önceki X konumuna geri it
                            player.x = prevPlayerX;
                            // Buraya yatay hız sıfırlama (player.dx kullanılsaydı) gelebilir.
                            // player.dx = 0;
                        }
                    }
                }
            }


            // --- Dikey Hareket (Yerçekimi ve Zıplama) ---
            let prevPlayerY = player.y; // Dikey çarpışma çözümü için önceki Y konumunu kaydet
            player.isOnGround = false; // Her karede başta yerde olmadığını varsay, sonra çarpışma ile doğrula

            player.dy += player.gravity; // Dikey hıza yerçekimini uygula
            player.y += player.dy; // Oyuncunun dikey konumunu güncelle

            // --- Dikey Çarpışma Kontrolü ---
            // Oyuncunun yeni dikey konumu ile seviyedeki katı blokları kontrol et
            for (let row = 0; row < level.length; row++) {
                for (let col = 0; col < level[row].length; col++) {
                    if (level[row][col] === '#') {
                        const block = {
                            x: col * tileSize,
                            y: row * tileSize,
                            width: tileSize,
                            height: tileSize
                        };

                        // Oyuncu ile mevcut blok arasında çarpışma var mı?
                        if (checkCollision(player, block)) {
                            // Eğer yukarıdan aşağıya doğru çarpışıyorsak (yani oyuncu bloğun üzerine düşüyorsa)
                            // Oyuncunun bir önceki alt kenarı bloğun üst kenarının üzerindeyse
                            if (prevPlayerY + player.height <= block.y) {
                                player.y = block.y - player.height; // Oyuncuyu bloğun tam üzerine sabitle
                                player.dy = 0; // Dikey hızı sıfırla
                                player.isOnGround = true; // Yerde olduğunu işaretle
                            }
                            // Eğer aşağıdan yukarıya doğru çarpışıyorsak (yani oyuncu bloğun altına vuruyorsa)
                            // Oyuncunun bir önceki üst kenarı bloğun alt kenarının altındaysa
                            else if (prevPlayerY >= block.y + block.height) {
                                player.y = block.y + block.height; // Oyuncuyu bloğun altına sabitle
                                player.dy = 0; // Dikey hızı sıfırla (burada zıplama gücünü de sıfırlayabiliriz)
                            }
                            // Not: Yan çarpmalar zaten yatay çarpışma kontrolünde çözülmeliydi.
                            // Bu kısım sadece dikey çözümü sağlar.
                        }
                    }
                }
            }


            // --- Zıplama ---
            // Boşluk (Space) tuşuna basılıysa ve oyuncu yerdeyse zıpla
            if (pressedKeys['ArrowUp'] && player.isOnGround) {
                player.dy = player.jumpPower;
                player.isOnGround = false;
            }

            // --- Canvas Sınırları (Güvenlik için, normalde seviye sınırları daha önemlidir) ---
            // Oyuncunun Canvas'ın altından düşmesini engelle (eğer seviye bitiyorsa ölüm bölgesi olur)
            if (player.y + player.height > canvas.height) {
                player.y = canvas.height - player.height;
                player.dy = 0;
                player.isOnGround = true;
            }
        }

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

        // YÜKLENEN ARKA PLAN GÖRSELİNİ ÇİZ
        // Görsel yüklendiyse seviye1.png'yi çiz, yoksa geçici mavi arka planı kullan
            if (backgroundImage.complete && backgroundImage.naturalWidth !== 0) {
            // Canvas boyutlarınız HTML'de 800x600 olarak ayarlıydı, ancak kodda 800x480'e küçültülüyor.
            // seviye1.png'nizin 800x480 piksel boyutunda olduğundan emin olun.
                ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
            } else {
            // Eğer görsel yüklenemezse veya henüz yüklenmediyse yedek olarak mavi arka planı çiz
                ctx.fillStyle = '#87CEEB'; // Açık mavi gökyüzü
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }


        // Seviyedeki görünmez çarpışma bloklarını işle (eğer `#` sadece çarpışma içinse görseli çizme)
        // ÖNEMLİ: Eğer seviye1.png zaten zemini ve duvarları içeriyorsa,
        // buradaki 'if (tileType === '#')' bloğunun içindeki 'ctx.fillRect' satırlarını SİLİN!
        // Aksi takdirde, arka plan görselinizin üzerine tekrar gri kareler çizilir.
            

    // ... (Oyuncuyu çizme kısmı zaten doğru, dokunmayın)
    if (playerImage.complete && playerImage.naturalWidth !== 0) {
        ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
    } else {
        ctx.fillStyle = 'blue';
        ctx.fillRect(player.x, player.y, player.width, player.height);
    }
}

        // Ana oyun döngüsü fonksiyonu
        function gameLoop() {
            if (!gameRunning) {
                return;
            }

            update(); // Oyun durumunu güncelle
            draw();   // Oyun alanını çiz

            requestAnimationFrame(gameLoop);
        }

        // =========== OYUN BAŞLANGICI ===========

        gameLoop();

        // =========== DİĞER FONKSİYONLAR / DEĞİŞKENLER BURAYA GELECEK ===========

    } else {
        console.error('Canvas 2D context alınamadı!');
    }
} else {
    console.error('ID "ednaCanvas" olan canvas elementi bulunamadı! HTML dosyasını kontrol edin.');
}
