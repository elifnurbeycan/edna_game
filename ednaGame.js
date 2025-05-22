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
            x: 50, // Karakterin yatay (X) başlangıç pozisyonu
            y: (8 * 40) - 70 - 5, // Karakterin dikey (Y) başlangıç pozisyonu (8. satırın zemini üzerine, 5 piksel yukarıda)
            width: 40,  // Karakter görseline göre 40 piksel genişlik
            height: 70, // Karakter görseline göre 70 piksel yükseklik
            speed: 3,
            dy: 0,
            gravity: 0.5,
            jumpPower: -10,
            isOnGround: false
        };

        // Kapı objesi (red_door.png: 40x80)
        let door = {
            x: 0, // draw() fonksiyonunda level dizisinden alınacak
            y: 0, // draw() fonksiyonunda level dizisinden alınacak
            width: 40, // Genişliği 40 piksel
            height: 80, // Yüksekliği 80 piksel (iki tileSize bloğu)
            isOpen: false // Kapının başlangıç durumu: Kapalı
        };

        // Buton objesi (red_button.png: 40x15, red_button_pressed: 40x3)
        let button = {
            x: 0, // draw() fonksiyonunda level dizisinden alınacak
            y: 0, // draw() fonksiyonunda level dizisinden alınacak
            width: 40, // Genişliği 40 piksel
            height: 15, // Normal butonun yüksekliği 15 piksel (çarpışma için kullanılacak)
            isPressed: false // Butonun başlangıç durumu: Basılmamış
        };

        // =========== SEVİYE YAPISI ===========
        const tileSize = 40; // Her bir blok/karenin piksel boyutu

        // Bu level dizisi, yüklediğiniz 800x480 piksel boyutundaki seviye1.png görseliniz ve
        // sizin belirttiğiniz yerleşimlere göre güncellenmiştir.
        // Her '#' bir katı bloğu (zemin/duvar), her ' ' bir boş alanı temsil eder.
        // 'D' kapının üst bloğu, 'd' kapının alt bloğu (görsel devamı)
        // 'B' butonun konumu
        const level = [
            "####################", // Satır 0 - Üst duvar/tavan
            "####################", // Satır 1 - Üst duvar/tavan devamı
            "##         #########", // Satır 2
            "##          D      #", // Satır 3 - Kapı (D) yeni konumunda
            "#           d      #", // Satır 4 - Kapının alt bloğu (d) yeni konumunda
            "#        ###########", // Satır 5 - Orta-üst platformun üst kısmı
            "#        ###########", // Satır 6 - Orta-üst platformun alt kısmı
            "#     ##############", // Satır 7 - Görseldeki büyük orta zemin bloğu
            "#     #######      #", // Satır 8 - Büyük orta zemin bloğunun devamı
            "####              B#", // Satır 9 - Buton (B) yeni konumunda
            "####             ###", // Satır 10 - Görseldeki sol alt platform
            "####################"  // Satır 11 - En alt zemin/duvar
        ];

        // Seviyenin toplam piksel boyutları
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

        const doorClosedImage = new Image();
        doorClosedImage.src = 'resimler/red_door.png';
        doorClosedImage.onload = () => console.log('Kapalı kapı görseli başarıyla yüklendi!');
        doorClosedImage.onerror = () => console.error('Kapalı kapı görseli yüklenemedi! Dosya yolunu veya adını kontrol edin: ' + doorClosedImage.src);

        const doorOpenImage = new Image();
        doorOpenImage.src = 'resimler/red_door_opened.png';
        doorOpenImage.onload = () => console.log('Açık kapı görseli başarıyla yüklendi!');
        doorOpenImage.onerror = () => console.error('Açık kapı görseli yüklenemedi! Dosya yolunu veya adını kontrol edin: ' + doorOpenImage.src);

        const buttonNormalImage = new Image();
        buttonNormalImage.src = 'resimler/red_button.png';
        buttonNormalImage.onload = () => console.log('Normal buton görseli başarıyla yüklendi!');
        buttonNormalImage.onerror = () => console.error('Normal buton görseli yüklenemedi! Dosya yolunu veya adını kontrol edin: ' + buttonNormalImage.src);

        const buttonPressedImage = new Image();
        buttonPressedImage.src = 'resimler/red_button_pressed.png';
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
                    const tileType = level[row][col];
                    // Kapının üst bloğu 'D' ve normal katı blok '#' ile çarpışma kontrolü
                    // Kapı kapalıysa 'D' ile çarpış, 'd' (kapının altı) ile çarpışma yok
                    if (tileType === '#' || (tileType === 'D' && !door.isOpen)) {
                        const block = {
                            x: col * tileSize,
                            y: row * tileSize,
                            width: tileSize,
                            height: tileSize
                        };

                        if (checkCollision(player, block)) {
                            player.x = prevPlayerX;
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
                    const tileType = level[row][col];
                    // Kapının üst bloğu 'D' ve normal katı blok '#' ile çarpışma kontrolü
                    // Kapı kapalıysa 'D' ile çarpış, 'd' (kapının altı) ile çarpışma yok
                    if (tileType === '#' || (tileType === 'D' && !door.isOpen)) {
                        const block = {
                            x: col * tileSize,
                            y: row * tileSize,
                            width: tileSize,
                            height: tileSize
                        };

                        if (checkCollision(player, block)) {
                            // Eğer yukarıdan aşağıya doğru çarpışıyorsak (yani oyuncu bloğun üzerine düşüyorsa)
                            if (prevPlayerY + player.height <= block.y) {
                                player.y = block.y - player.height; // Oyuncuyu bloğun tam üzerine sabitle
                                player.dy = 0; // Dikey hızı sıfırla
                                player.isOnGround = true; // Yerde olduğunu işaretle
                            }
                            // Eğer aşağıdan yukarıya doğru çarpışıyorsak (yani oyuncu bloğun altına vuruyorsa)
                            else if (prevPlayerY >= block.y + block.height) {
                                player.y = block.y + block.height; // Oyuncuyu bloğun altına sabitle
                                player.dy = 0; // Dikey hızı sıfırla
                            }
                        }
                    }
                }
            }

            // --- Zıplama ---
            if (pressedKeys['ArrowUp'] && player.isOnGround) {
                player.dy = player.jumpPower;
                player.isOnGround = false;
            }

            // --- Buton Etkileşimi (Güncellenmiş Mantık: 'E' tuşu olmadan) ---
            const actualButtonRect = {
                x: button.x,
                y: button.y + tileSize - buttonNormalImage.naturalHeight, // Buton görselinin gerçek y konumu
                width: button.width,
                height: buttonNormalImage.naturalHeight // Butonun normal yüksekliği
            };

            if (checkCollision(player, actualButtonRect)) { // Oyuncu buton ile çarpışıyorsa
                button.isPressed = true; // Buton basılı hale gelsin
                door.isOpen = true;      // Kapı açılsın
                // console.log("Oyuncu butona geldi, buton basıldı, kapı açıldı!"); // Hata ayıklama için
            } else { // Oyuncu buton ile çarpışmıyorsa (üzerinden çekildiyse)
                button.isPressed = false; // Buton normal haline dönsün
                door.isOpen = false;      // Kapı kapansın
                // console.log("Oyuncu butondan ayrıldı, buton normal, kapı kapandı."); // Hata ayıklama için
            }

            // --- Canvas Sınırları ---
            if (player.y + player.height > canvas.height) {
                player.y = canvas.height - player.height;
                player.dy = 0;
                player.isOnGround = true;
            }
            if (player.x < 0) {
                player.x = 0;
            }
            if (player.x + player.width > canvas.width) {
                player.x = canvas.width - player.width;
            }
        } // update() fonksiyonunun kapanış parantezi


        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (backgroundImage.complete && backgroundImage.naturalWidth !== 0) {
                ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
            } else {
                ctx.fillStyle = '#87CEEB';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            for (let row = 0; row < level.length; row++) {
                for (let col = 0; col < level[row].length; col++) {
                    const tileType = level[row][col];
                    const x = col * tileSize;
                    const y = row * tileSize;

                    // Kapı çizimi
                    if (tileType === 'D') {
                        // Kapının konumunu burada güncelle.
                        // Yüksekliği 80 olduğu için, çizim y koordinatını üst bloğun y'sinden başlatırız.
                        door.x = x;
                        door.y = y; // D (üst blok) konumunu al

                        if (door.isOpen) {
                            if (doorOpenImage.complete && doorOpenImage.naturalWidth !== 0) {
                                // Açık kapı 40x5 olduğu için, kapının üst bloğunun y'sinden (x,y) itibaren çiziyoruz
                                // Bu, kapının açıldığında ince bir boşluk gibi görünmesini sağlar.
                                ctx.drawImage(doorOpenImage, x, y, doorOpenImage.naturalWidth, doorOpenImage.naturalHeight);
                            } else {
                                ctx.fillStyle = 'green'; // Yedek renk
                                ctx.fillRect(x, y + tileSize - 5, tileSize, 5); // Açık kapı için ince bir çizgi
                            }
                        } else {
                            if (doorClosedImage.complete && doorClosedImage.naturalWidth !== 0) {
                                // Kapalı kapı 40x80 olduğu için, D bloğunun y'sinden başlayarak 80 yüksekliğinde çizilir
                                ctx.drawImage(doorClosedImage, x, y, door.width, door.height);
                            } else {
                                ctx.fillStyle = 'darkred';
                                ctx.fillRect(x, y, tileSize, tileSize * 2); // Yedek renk için iki blok doldur
                            }
                        }
                    }
                    // Kapının alt bloğu (görselin devamı, çarpışma yok)
                    else if (tileType === 'd') {
                        // Bu bloğa herhangi bir çizim yapmayız, sadece D bloğu kapının tamamını çizer.
                        // Amaç, level dizisinde kapının kapladığı alanı işaretlemek.
                    }
                    // Buton çizimi
                    else if (tileType === 'B') {
                        // Butonun konumunu burada güncelle.
                        // Buton görseli daha küçük olduğu için 40x40'lık kutunun altına yaslayarak çizelim.
                        button.x = x;
                        button.y = y;

                        if (button.isPressed) {
                            if (buttonPressedImage.complete && buttonPressedImage.naturalWidth !== 0) {
                                // Basılı buton 40x3. 40x40'lık bloğun altına yaslayalım.
                                ctx.drawImage(buttonPressedImage, x, y + tileSize - buttonPressedImage.naturalHeight, buttonPressedImage.naturalWidth, buttonPressedImage.naturalHeight);
                            } else {
                                ctx.fillStyle = 'lightgray'; // Yedek renk
                                ctx.fillRect(x, y + tileSize - 3, tileSize, 3); // Basılı buton için ince bir çizgi
                            }
                        } else {
                            if (buttonNormalImage.complete && buttonNormalImage.naturalWidth !== 0) {
                                // Normal buton 40x15. 40x40'lık bloğun altına yaslayalım.
                                ctx.drawImage(buttonNormalImage, x, y + tileSize - buttonNormalImage.naturalHeight, buttonNormalImage.naturalWidth, buttonNormalImage.naturalHeight);
                            } else {
                                ctx.fillStyle = 'gray'; // Yedek renk
                                ctx.fillRect(x, y + tileSize - 15, tileSize, 15); // Normal buton için
                            }
                        }
                    }
                    // Diğer tile tipleri (örn: '#') için çizim yapmıyoruz, arka plan görseli kullanılıyor.
                }
            }

            // Oyuncuyu çizme kısmı
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

