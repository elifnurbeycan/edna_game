// HTML dosyasındaki canvas elementini DOĞRU ID'si olan 'ednaCanvas' ile yakala
const canvas = document.getElementById('ednaCanvas');

// Canvas bulunduysa devam et
if (canvas) {
    // Canvas üzerinde 2D çizim yapmak için context objesini al
    const ctx = canvas.getContext('2d');

    if (ctx) {
        console.log('Canvas ve 2D context başarıyla alındı! Oyun başlatılıyor...');

        // =========== OYUN OBJELERİ / DEĞİŞKENLERİ ===========
        const tileSize = 40; // Her bir blok/karenin piksel boyutu

        let player = {
            x: 0, // Başlangıç konumu initializeCharacterPositionsForCurrentLevel() tarafından ayarlanacak
            y: 0, // Başlangıç konumu initializeCharacterPositionsForCurrentLevel() tarafından ayarlanacak
            width: 40,  // Karakter görseline göre 40 piksel genişlik
            height: 70, // Karakter görseline göre 70 piksel yükseklik
            speed: 3,
            dy: 0,
            gravity: 0.5,
            jumpPower: -10,
            isOnGround: false
        };

        let player2 = {
            x: 0, // Başlangıç konumu initializeCharacterPositionsForCurrentLevel() tarafından ayarlanacak
            y: 0, // Başlangıç konumu initializeCharacterPositionsForCurrentLevel() tarafından ayarlanacak
            width: 40, // Player 1 ile aynı boyutta
            height: 70, // Player 1 ile aynı boyutta
            speed: 3,
            dy: 0,
            gravity: 0.5,
            jumpPower: -10,
            isOnGround: false
        };

        // Hangi karakterin aktif olduğunu tutan değişken
        let activePlayer = player; // Başlangıçta ana karakter aktif

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

        // Çıkış Kapısı objesi (cikis_kapi.png: 40x80)
        let exitDoor = {
            x: 0, // draw() fonksiyonunda level dizisinden alınacak
            y: 0, // draw() fonksiyonunda level dizisinden alınacak
            width: 40, // Genişliği 40 piksel
            height: 80, // Yüksekliği 80 piksel (red_door ile aynı)
        };

        // =========== SEVİYE YAPISI ===========

        // Tüm seviyeleri içeren dizi
        const allLevels = [
            // Seviye 1 (index 0)
            [
                "####################", // Satır 0 - Üst duvar/tavan
                "####################", // Satır 1 - Üst duvar/tavan devamı
                "##         #########", // Satır 2 - Çıkış Kapısı (X)
                "##          D     X#", // Satır 3 - Kapı (D)
                "#           d      #", // Satır 4
                "#        ###########", // Satır 5
                "#        ###########", // Satır 6
                "#     ##############", // Satır 7
                "#     #######      #", // Satır 8 - P, Q ve Aralarında Fences (F/G de kullanabilirsiniz)
                "#### P      F  Q  B#", // Satır 9 - Buton (B)
                "####        F    ###", // Satır 10
                "####################"  // Satır 11 - En alt zemin/duvar
            ],
            // Seviye 2 (index 1) - Örnek bir seviye 2 düzeni, kendi tasarımınızı buraya çizebilirsiniz
            [
                "####################",
                "######         #####",
                "######         #####",
                "######  ###  #######",
                "#       ###  #######",
                "#       ###  #######",
                "#       ###  #######",
                "#       ###  #     #", // Buton
                "#     #####  #     #", // Kapı üstü
                "#     #####    #####", // Kapı altı ve Çıkış Kapısı
                "####  #####    #####",
                "####################"
            ]
        ];

        let currentLevelIndex = 0;
        let level = []; // Bu, mevcut seviyenin harita verilerini tutacak

        // Seviyenin toplam piksel boyutları
        const levelWidth = allLevels[0][0].length * tileSize;  // 20 * 40 = 800
        const levelHeight = allLevels[0].length * tileSize;    // 12 * 40 = 480

        canvas.width = levelWidth;
        canvas.height = levelHeight;

        // Karakterlerin başlangıç konumlarını mevcut level dizisinden al
        // ve level dizisindeki 'P' ve 'Q' karakterlerini boşlukla değiştir
        function initializeCharacterPositionsForCurrentLevel() {
            let playerFound = false;
            let player2Found = false;

            // Mevcut seviye verisinin değiştirilebilir bir kopyasını oluştur
            let tempLevelRows = allLevels[currentLevelIndex].map(row => row.split('')); // currentLevelIndex'ten al

            for (let row = 0; row < tempLevelRows.length; row++) {
                for (let col = 0; col < tempLevelRows[row].length; col++) {
                    const tileChar = tempLevelRows[row][col];
                    const x = col * tileSize;
                    const y = row * tileSize; // Tile'ın üst sol köşesinin y koordinatı

                    if (tileChar === 'P' && !playerFound) {
                        player.x = x;
                        player.y = y - player.height + tileSize - 1; // Karakteri tile'ın üzerine 1 piksel yukarıda yerleştir
                        player.dy = 0; // Hızı sıfırla
                        player.isOnGround = false;
                        playerFound = true;
                        tempLevelRows[row][col] = ' '; // Başlangıç noktasını boşluk yap
                    } else if (tileChar === 'Q' && !player2Found) {
                        player2.x = x;
                        player2.y = y - player2.height + tileSize - 1; // Karakteri tile'ın üzerine 1 piksel yukarıda yerleştir
                        player2.dy = 0; // Hızı sıfırla
                        player2.isOnGround = false;
                        player2Found = true;
                        tempLevelRows[row][col] = ' '; // Başlangıç noktasını boşluk yap
                    }
                }
            }
            // Global 'level' dizisini işlenmiş haliyle güncelle (P/Q kaldırıldı)
            level = tempLevelRows.map(row => row.join(''));

            // Eğer P veya Q yeni seviyede bulunamazsa, onları varsayılan güvenli bir yere yerleştir
            if (!playerFound) {
                player.x = 4 * tileSize;
                player.y = (9 * tileSize) - 70 - 1; // 'P' bulunamazsa varsayılan geri dönüş
                player.dy = 0;
                player.isOnGround = false;
            }
            if (!player2Found) {
                player2.x = 10 * tileSize;
                player2.y = (5 * tileSize) - 70 - 1; // 'Q' bulunamazsa varsayılan geri dönüş
                player2.dy = 0;
                player2.isOnGround = false;
            }
            activePlayer = player; // Seviye değişiminde kontrolü her zaman player 1'e geri ver
        }

        // Bir sonraki seviyeye geçiş fonksiyonu
        function transitionToNextLevel() {
            currentLevelIndex++;
            if (currentLevelIndex >= allLevels.length) {
                currentLevelIndex = 0; // Tüm seviyeler tamamlandıysa başa dön
                console.log("Tüm seviyeler tamamlandı, başa dönülüyor!");
            }
            // Yeni seviyenin harita verilerini 'level' değişkenine derinlemesine kopyala
            // böylece P/Q karakterleri kaldırılabilir
            level = allLevels[currentLevelIndex].map(row => row);
            console.log(`Seviye ${currentLevelIndex + 1}'e geçildi!`);
            initializeCharacterPositionsForCurrentLevel(); // Yeni seviye için karakter konumlarını başlat
            // Kapının ve butonun durumunu sıfırla (yeni seviyede kapalı ve basılı değil)
            door.isOpen = false;
            button.isPressed = false;
        }


        // =========== GÖRSEL KAYNAKLARI YÜKLEME ===========
        const playerImage = new Image();
        playerImage.src = 'resimler/ana_karakter.png';
        playerImage.onload = () => console.log('Ana karakter piksel görseli başarıyla yüklendi!');
        playerImage.onerror = () => console.error('Ana karakter piksel görseli yüklenemedi! Dosya yolunu veya adını kontrol edin: ' + playerImage.src);

        const player2Image = new Image();
        player2Image.src = 'resimler/yan_karakter.png';
        player2Image.onload = () => console.log('İkinci karakter piksel görseli başarıyla yüklendi!');
        player2Image.onerror = () => console.error('İkinci karakter piksel görseli yüklenemedi! Dosya yolunu veya adını kontrol edin: ' + player2Image.src);

        const backgroundImage = new Image(); // Seviye 1 arka plan görseli
        backgroundImage.src = 'resimler/seviye1.png';
        backgroundImage.onload = () => console.log('Seviye 1 arka plan görseli başarıyla yüklendi!');
        backgroundImage.onerror = () => console.error('Seviye 1 arka plan görseli yüklenemedi! Dosya yolunu veya adını kontrol edin: ' + backgroundImage.src);

        const seviye2Image = new Image(); // Seviye 2 arka plan görseli
        seviye2Image.src = 'resimler/seviye2.png';
        seviye2Image.onload = () => console.log('Seviye 2 arka plan görseli başarıyla yüklendi!');
        seviye2Image.onerror = () => console.error('Seviye 2 arka plan görseli yüklenemedi! Dosya yolunu veya adını kontrol edin: ' + seviye2Image.src);


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

        const exitDoorImage = new Image(); // Yeni çıkış kapısı görseli
        exitDoorImage.src = 'resimler/cikis_kapi.png';
        exitDoorImage.onload = () => console.log('Çıkış kapısı görseli başarıyla yüklendi!');
        exitDoorImage.onerror = () => console.error('Çıkış kapısı görseli yüklenemedi! Dosya yolunu veya adını kontrol edin: ' + exitDoorImage.src);

        const grayFenceImage = new Image(); // Yeni parmaklık görseli 1
        grayFenceImage.src = 'resimler/gray_fence.png';
        grayFenceImage.onload = () => console.log('Gri parmaklık görseli başarıyla yüklendi!');
        grayFenceImage.onerror = () => console.error('Gri parmaklık görseli yüklenemedi! Dosya yolunu veya adını kontrol edin: ' + grayFenceImage.src);

        const grayFence2Image = new Image(); // Yeni parmaklık görseli 2
        grayFence2Image.src = 'resimler/gray_fence2.png';
        grayFence2Image.onload = () => console.log('Gri parmaklık 2 görseli başarıyla yüklendi!');
        grayFence2Image.onerror = () => console.error('Gri parmaklık 2 görseli yüklenemedi! Dosya yolunu veya adını kontrol edin: ' + grayFence2Image.src);


        // =========== KLAVYE GİRDİ YÖNETİMİ ===========
        let pressedKeys = {};
        let lastZPressTime = 0; // 'Z' tuşuna en son basıldığı zamanı tutar
        const zCooldown = 200; // 'Z' tuşu için milisaniye cinsinden bekleme süresi

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

        // İki karakter arasında doğrudan görüş hattı olup olmadığını kontrol eder (yatay veya dikey)
        function checkLineOfSight(char1, char2) {
            // Karakterlerin dikey aralıkları (Y koordinatları) çakışıyor mu kontrol et
            if (char1.y < char2.y + char2.height && char1.y + char1.height > char2.y) {
                // Yatay görüş hattı kontrolü
                // Karakterler arasındaki sütunları kontrol et
                const startColToCheck = Math.floor(Math.min(char1.x, char2.x) / tileSize) + 1;
                const endColToCheck = Math.floor(Math.max(char1.x, char2.x) / tileSize);

                // Kesişen dikey aralıktaki satırları kontrol et
                const overlapYMin = Math.max(char1.y, char2.y);
                const overlapYMax = Math.min(char1.y + char1.height, char2.y + char2.height);
                const rowStartForOverlap = Math.floor(overlapYMin / tileSize);
                const rowEndForOverlap = Math.ceil(overlapYMax / tileSize);

                for (let row = rowStartForOverlap; row < rowEndForOverlap; row++) {
                    for (let col = startColToCheck; col <= endColToCheck; col++) {
                        // Tile'ın seviye sınırları içinde olduğundan emin ol
                        if (row >= 0 && row < level.length && col >= 0 && col < level[row].length) {
                            const tileType = level[row][col];
                            // Eğer katı bir blok (duvar, kapalı kapı) varsa, görüş hattı engellenmiştir
                            // Parmaklıklar ('F', 'G') görüş hattını ENGELLEMEZ.
                            if (tileType === '#' || (tileType === 'D' && !door.isOpen)) {
                                return false; // Engel bulundu
                            }
                        }
                    }
                }
                return true; // Yatay görüş hattı açık
            }

            // Karakterlerin yatay aralıkları (X koordinatları) çakışıyor mu kontrol et
            if (char1.x < char2.x + char2.width && char1.x + char1.width > char2.x) {
                // Dikey görüş hattı kontrolü
                // Karakterler arasındaki satırları kontrol et
                const startRowToCheck = Math.floor(Math.min(char1.y, char2.y) / tileSize) + 1;
                const endRowToCheck = Math.floor(Math.max(char1.y, char2.y) / tileSize);

                // Kesişen yatay aralıktaki sütunları kontrol et
                const overlapXMin = Math.max(char1.x, char2.x);
                const overlapXMax = Math.min(char1.x + char1.width, char2.x + char2.width);
                const colStartForOverlap = Math.floor(overlapXMin / tileSize);
                const colEndForOverlap = Math.ceil(overlapXMax / tileSize);

                for (let col = colStartForOverlap; col < colEndForOverlap; col++) {
                    for (let row = startRowToCheck; row <= endRowToCheck; row++) {
                        // Tile'ın seviye sınırları içinde olduğundan emin ol
                        if (row >= 0 && row < level.length && col >= 0 && col < level[row].length) {
                            const tileType = level[row][col];
                            // Eğer katı bir blok (duvar, kapalı kapı) varsa, görüş hattı engellenmiştir
                            // Parmaklıklar ('F', 'G') görüş hattını ENGELLEMEZ.
                            if (tileType === '#' || (tileType === 'D' && !door.isOpen)) {
                                return false; // Engel bulundu
                            }
                        }
                    }
                }
                return true; // Dikey görüş hattı açık
            }

            // Eğer ne yatay ne de dikey çakışma yoksa (veya çok uzaktalarsa), görüş hattı yok demektir.
            return false;
        }


        // =========== OYUN DÖNGÜSÜ TANIMLARI ===========

        let gameRunning = true;

        // Karakterlerin fizik ve çarpışma güncellemelerini ayrı bir fonksiyonda topla
        function updateCharacterPhysics(char) {
            let prevCharX = char.x;
            let prevCharY = char.y;

            // Dikey hareket (yerçekimi)
            char.isOnGround = false;
            char.dy += char.gravity;
            char.y += char.dy;

            // Dikey çarpışma kontrolü
            for (let row = 0; row < level.length; row++) {
                for (let col = 0; col < level[row].length; col++) {
                    const tileType = level[row][col];
                    // Duvarlar, kapalı kapı ve parmaklıklar dikey hareketi engeller
                    if (tileType === '#' || (tileType === 'D' && !door.isOpen) || tileType === 'F' || tileType === 'G') {
                        const block = { x: col * tileSize, y: row * tileSize, width: tileSize, height: tileSize };
                        if (checkCollision(char, block)) {
                            if (prevCharY + char.height <= block.y) {
                                char.y = block.y - char.height;
                                char.dy = 0;
                                char.isOnGround = true;
                            } else if (prevCharY >= block.y + block.height) {
                                char.y = block.y + block.height;
                                char.dy = 0;
                            }
                        }
                    }
                }
            }

            // Canvas Sınırları
            if (char.y + char.height > canvas.height) {
                char.y = canvas.height - char.height;
                char.dy = 0;
                char.isOnGround = true;
            }
            // Üst sınır kontrolü
            if (char.y < 0) {
                char.y = 0;
                char.dy = 0; // Yukarı hareketini durdur ve yerçekimiyle düşmesini sağla
            }
            if (char.x < 0) {
                char.x = 0;
            }
            if (char.x + char.width > canvas.width) {
                char.x = canvas.width - char.width;
            }
        }


        // Oyunun durumunu güncelleyen fonksiyon
        function update() {
            // Aktif oyuncunun hareketini kontrol et
            let currentPlayer = activePlayer;
            let otherPlayer = (activePlayer === player) ? player2 : player;

            // Sadece aktif oyuncunun yatay hareketini al
            let prevCurrentPlayerX = currentPlayer.x;
            if (pressedKeys['ArrowLeft']) {
                currentPlayer.x -= currentPlayer.speed;
            }
            if (pressedKeys['ArrowRight']) {
                currentPlayer.x += currentPlayer.speed;
            }

            // Aktif oyuncunun yatay çarpışma kontrolü
            for (let row = 0; row < level.length; row++) {
                for (let col = 0; col < level[row].length; col++) {
                    const tileType = level[row][col];
                    // Duvarlar, kapalı kapı ve parmaklıklar yatay hareketi engeller
                    if (tileType === '#' || (tileType === 'D' && !door.isOpen) || tileType === 'F' || tileType === 'G') {
                        const block = { x: col * tileSize, y: row * tileSize, width: tileSize, height: tileSize };
                        if (checkCollision(currentPlayer, block)) {
                            currentPlayer.x = prevCurrentPlayerX;
                        }
                    }
                }
            }

            // Aktif oyuncunun zıplaması
            if (pressedKeys['ArrowUp'] && currentPlayer.isOnGround) {
                currentPlayer.dy = currentPlayer.jumpPower;
                currentPlayer.isOnGround = false;
            }

            // Her iki karakterin de fizik ve çarpışma güncellemelerini uygula
            updateCharacterPhysics(player);
            updateCharacterPhysics(player2);


            // --- Buton Etkileşimi ---
            const actualButtonRect = {
                x: button.x,
                y: button.y + tileSize - buttonNormalImage.naturalHeight,
                width: button.width,
                height: buttonNormalImage.naturalHeight
            };

            // Hem Player 1 hem de Player 2 butona basabilir
            if (checkCollision(player, actualButtonRect) || checkCollision(player2, actualButtonRect)) {
                button.isPressed = true;
                door.isOpen = true;
            } else {
                button.isPressed = false;
                door.isOpen = false;
            }

            // --- Karakter Değiştirme Mantığı ---
            const currentTime = Date.now();
            if (pressedKeys['KeyZ'] && (currentTime - lastZPressTime > zCooldown)) {
                // Sadece aktif olmayan karakter ile aktif karakter arasında görüş hattı varsa değiş
                if (checkLineOfSight(activePlayer, otherPlayer)) {
                    activePlayer = otherPlayer; // Aktif karakteri değiştir

                    // Kontrol değiştiğinde karakterlerin dikey hızlarını sıfırla
                    // ve isOnGround durumunu false yap ki yerçekimi tekrar etki etsin.
                    player.dy = 0;
                    player.isOnGround = false;
                    player2.dy = 0;
                    player2.isOnGround = false;

                    console.log("Karakter kontrolü değiştirildi!");
                } else {
                    console.log("Karakter değiştirme engellendi: Arada engel var veya doğrudan görüş hattı yok.");
                }
                lastZPressTime = currentTime; // Cooldown'u güncelle
            }

            // --- Çıkış Kapısı Kontrolü (Ana Karakter İçin) ---
            // Sadece ana karakter (player) çıkış kapısına değdiğinde seviye geçişini tetikle
            if (checkCollision(player, exitDoor)) {
                console.log("Ana karakter çıkış kapısına değdi!");
                transitionToNextLevel(); // Seviye geçişini tetikle
            }
        } // update() fonksiyonunun kapanış parantezi


        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Mevcut seviye indexine göre doğru arka planı çiz
            let currentBackgroundImage;
            if (currentLevelIndex === 0) {
                currentBackgroundImage = backgroundImage; // seviye1.png
            } else if (currentLevelIndex === 1) {
                currentBackgroundImage = seviye2Image; // seviye2.png
            }
            // Daha fazla seviyeniz olursa buraya else if ekleyebilirsiniz

            if (currentBackgroundImage && currentBackgroundImage.complete && currentBackgroundImage.naturalWidth !== 0) {
                ctx.drawImage(currentBackgroundImage, 0, 0, canvas.width, canvas.height);
            } else {
                ctx.fillStyle = '#87CEEB'; // Görsel yüklenmezse varsayılan gökyüzü rengi
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }


            for (let row = 0; row < level.length; row++) {
                for (let col = 0; col < level[row].length; col++) {
                    const tileType = level[row][col];
                    const x = col * tileSize;
                    const y = row * tileSize;

                    // Kapı çizimi (red_door)
                    if (tileType === 'D') {
                        door.x = x;
                        door.y = y;

                        if (door.isOpen) {
                            if (doorOpenImage.complete && doorOpenImage.naturalWidth !== 0) {
                                ctx.drawImage(doorOpenImage, x, y, doorOpenImage.naturalWidth, doorOpenImage.naturalHeight);
                            } else {
                                ctx.fillStyle = 'green';
                                ctx.fillRect(x, y + tileSize - 5, tileSize, 5);
                            }
                        } else {
                            if (doorClosedImage.complete && doorClosedImage.naturalWidth !== 0) {
                                ctx.drawImage(doorClosedImage, x, y, door.width, door.height);
                            } else {
                                ctx.fillStyle = 'darkred';
                                ctx.fillRect(x, y, tileSize, tileSize * 2);
                            }
                        }
                    }
                    // Kapının alt bloğu (görselin devamı, çarpışma yok)
                    else if (tileType === 'd') {
                        // Bu bloğa herhangi bir çizim yapmayız, sadece D bloğu kapının tamamını çizer.
                    }
                    // Buton çizimi
                    else if (tileType === 'B') {
                        button.x = x;
                        button.y = y;

                        if (button.isPressed) {
                            if (buttonPressedImage.complete && buttonPressedImage.naturalWidth !== 0) {
                                ctx.drawImage(buttonPressedImage, x, y + tileSize - buttonPressedImage.naturalHeight, buttonPressedImage.naturalWidth, buttonPressedImage.naturalHeight);
                            } else {
                                ctx.fillStyle = 'lightgray';
                                ctx.fillRect(x, y + tileSize - 3, tileSize, 3);
                            }
                        } else {
                            if (buttonNormalImage.complete && buttonNormalImage.naturalWidth !== 0) {
                                ctx.drawImage(buttonNormalImage, x, y + tileSize - buttonNormalImage.naturalHeight, buttonNormalImage.naturalWidth, buttonNormalImage.naturalHeight);
                            } else {
                                ctx.fillStyle = 'gray';
                                ctx.fillRect(x, y + tileSize - 15, tileSize, 15);
                            }
                        }
                    }
                    // Çıkış Kapısı çizimi
                    else if (tileType === 'X') {
                        exitDoor.x = x; // Çıkış kapısının konumunu güncelle
                        exitDoor.y = y; // Çıkış kapısının konumunu güncelle
                        if (exitDoorImage.complete && exitDoorImage.naturalWidth !== 0) {
                            ctx.drawImage(exitDoorImage, x, y, exitDoor.width, exitDoor.height);
                        } else {
                            ctx.fillStyle = 'orange'; // Yedek renk
                            ctx.fillRect(x, y, exitDoor.width, exitDoor.height);
                        }
                    }
                    // Yeni parmaklık çizimi 1
                    else if (tileType === 'F') {
                        if (grayFenceImage.complete && grayFenceImage.naturalWidth !== 0) {
                            ctx.drawImage(grayFenceImage, x, y, tileSize, tileSize);
                        } else {
                            ctx.fillStyle = 'darkgray'; // Yedek renk
                            ctx.fillRect(x, y, tileSize, tileSize);
                        }
                    }
                    // Yeni parmaklık çizimi 2
                    else if (tileType === 'G') {
                        if (grayFence2Image.complete && grayFence2Image.naturalWidth !== 0) {
                            ctx.drawImage(grayFence2Image, x, y, tileSize, tileSize);
                        } else {
                            ctx.fillStyle = 'lightgray'; // Yedek renk
                            ctx.fillRect(x, y, tileSize, tileSize);
                        }
                    }
                    // 'P' ve 'Q' karakterleri başlangıçta boşlukla değiştirildiği için burada çizilmeyecekler.
                }
            }

            // Oyuncuları çizme kısmı
            if (playerImage.complete && playerImage.naturalWidth !== 0) {
                ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
            } else {
                ctx.fillStyle = 'blue';
                ctx.fillRect(player.x, player.y, player.width, player.height);
            }

            if (player2Image.complete && player2Image.naturalWidth !== 0) {
                ctx.drawImage(player2Image, player2.x, player2.y, player2.width, player2.height);
            } else {
                ctx.fillStyle = 'purple'; // Player 2 için yedek renk
                ctx.fillRect(player2.x, player2.y, player2.width, player2.height);
            }

            // Aktif oyuncunun etrafına çerçeve çiz
            ctx.strokeStyle = 'yellow'; // Çerçeve rengi
            ctx.lineWidth = 3; // Çerçeve kalınlığı
            if (activePlayer === player) {
                ctx.strokeRect(player.x, player.y, player.width, player.height);
            } else {
                ctx.strokeRect(player2.x, player2.y, player2.width, player2.height);
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
        // İlk seviyeyi yükle ve karakter konumlarını başlat
        level = allLevels[currentLevelIndex].map(row => row);
        initializeCharacterPositionsForCurrentLevel();

        gameLoop();

        // =========== DİĞER FONKSİYONLAR / DEĞİŞKENLER BURAYA GELECEK ===========

    } else {
        console.error('Canvas 2D context alınamadı!');
    }
} else {
    console.error('ID "ednaCanvas" olan canvas elementi bulunamadı! HTML dosyasını kontrol edin.');
}
