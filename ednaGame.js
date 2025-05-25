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

        // Karakter şablonu (varsayılan ana karakter boyutları için)
        function createCharacter(x, y) {
            return {
                x: x,
                y: y,
                width: 40,
                height: 70, // Varsayılan karakter yüksekliği (ana karakter için)
                speed: 3,
                dy: 0,
                gravity: 0.5,
                jumpPower: -10,
                isOnGround: false
            };
        }

        let player; // Ana karakter
        let allPlayableCharacters = []; // Tüm oynanabilir karakterleri tutan dizi

        let activePlayer; // Şu anda kontrol edilen karakter objesi

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
                "#                  #", // Satır 4
                "#        ###########", // Satır 5
                "#        ###########", // Satır 6
                "#     ##############", // Satır 7
                "#     #######      #", // Satır 8 - P, Q ve Aralarında Fences (F/G de kullanabilirsiniz)
                "#### P      F  Q  B#", // Satır 9 - Buton (B)
                "####        F    ###", // Satır 10
                "####################"  // Satır 11 - En alt zemin/duvar
            ],
            // Seviye 2 (index 1) - Örnek bir seviye 2 düzeni, kendi tasarımınızı buraya çizebilirsiniz
            // Buraya birden fazla 'Q' ekleyerek test edebilirsiniz.
            [
                "####################",
                "####Q          #####",
                "####           #####",
                "######         #####",
                "#         #   B#####",
                "#       ###  #######",
                "#       ###  #######",
                "#       ###  #    X#", 
                "#Q    #####  #     #", 
                "#    P#####  D #####", 
                "####  #####    #####",
                "####################"
            ],
            // Seviye 3 (index 2) - Buraya kendi seviye tasarımınızı çizin
            [
                "####################",
                "###            D  X#",
                "#Q                 #",
                "#           ########",
                "###   #       ######",
                "#      ##       #####",
                "#  #    ###       Q#",
                "#####              #",
                "#####       ########",
                "#######           P#",
                "#######   B        #",
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
            allPlayableCharacters = []; // Her seviye başında karakterleri sıfırla
            player = null; // Ana karakteri sıfırla

            // Mevcut seviye verisinin değiştirilebilir bir kopyasını oluştur
            let tempLevelRows = allLevels[currentLevelIndex].map(row => row.split(''));

            for (let row = 0; row < tempLevelRows.length; row++) {
                for (let col = 0; col < tempLevelRows[row].length; col++) {
                    const tileChar = tempLevelRows[row][col];
                    const x = col * tileSize;
                    const y = row * tileSize; // Tile'ın üst sol köşesinin y koordinatı

                    if (tileChar === 'P') {
                        const newPlayer = createCharacter(x, y - createCharacter().height + tileSize - 1);
                        allPlayableCharacters.push(newPlayer);
                        player = newPlayer; // Ana karakter referansını ata
                        tempLevelRows[row][col] = ' '; // Başlangıç noktasını boşluk yap
                    } else if (tileChar === 'Q') {
                        // Yan karakter için özel boyutlar
                        const newSideCharacter = createCharacter(x, y); // Varsayılan y ile oluştur
                        newSideCharacter.width = 40; // Ördek genişliği
                        newSideCharacter.height = 50; // Ördek yüksekliği
                        // Yüksekliğe göre y konumunu ayarla
                        newSideCharacter.y = y - newSideCharacter.height + tileSize - 1;
                        allPlayableCharacters.push(newSideCharacter);
                        tempLevelRows[row][col] = ' '; // Başlangıç noktasını boşluk yap
                    }
                }
            }
            // Global 'level' dizisini işlenmiş haliyle güncelle (P/Q kaldırıldı)
            level = tempLevelRows.map(row => row.join(''));

            // Eğer ana karakter bulunamazsa varsayılan bir konum ata
            if (!player) {
                player = createCharacter(4 * tileSize, (9 * tileSize) - 70 - 1);
                allPlayableCharacters.unshift(player); // Listenin başına ekle
                console.warn("Ana karakter (P) seviyede bulunamadı, varsayılan konuma yerleştirildi.");
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
            level = allLevels[currentLevelIndex].map(row => row);
            console.log(`Seviye ${currentLevelIndex + 1}'e geçildi!`);
            initializeCharacterPositionsForCurrentLevel(); // Yeni seviye için karakter konumlarını başlat
            // Kapının ve butonun durumunu sıfırla (yeni seviyede kapalı ve basılı değil)
            door.isOpen = false;
            button.isPressed = false;
        }


        // =========== GÖRSEL VE SES KAYNAKLARI YÜKLEME ===========
        const playerImage = new Image();
        playerImage.src = 'resimler/ana_karakter.png';
        playerImage.onload = () => console.log('Ana karakter piksel görseli başarıyla yüklendi!');
        playerImage.onerror = () => console.error('Ana karakter piksel görseli yüklenemedi! Dosya yolunu veya adını kontrol edin: ' + playerImage.src);

        const sideCharacterImage = new Image(); // Tüm yan karakterler için tek görsel
        sideCharacterImage.src = 'resimler/ordek.png';
        sideCharacterImage.onload = () => console.log('Yan karakter piksel görseli başarıyla yüklendi!');
        sideCharacterImage.onerror = () => console.error('Yan karakter piksel görseli yüklenemedi! Dosya yolunu veya adını kontrol edin: ' + sideCharacterImage.src);

        const backgroundImage = new Image(); // Seviye 1 arka plan görseli
        backgroundImage.src = 'resimler/seviye1.png';
        backgroundImage.onload = () => console.log('Seviye 1 arka plan görseli başarıyla yüklendi!');
        backgroundImage.onerror = () => console.error('Seviye 1 arka plan görseli yüklenemedi! Dosya yolunu veya adını kontrol edin: ' + backgroundImage.src);

        const seviye2Image = new Image(); // Seviye 2 arka plan görseli
        seviye2Image.src = 'resimler/seviye2.png';
        seviye2Image.onload = () => console.log('Seviye 2 arka plan görseli başarıyla yüklendi!');
        seviye2Image.onerror = () => console.error('Seviye 2 arka plan görseli yüklenemedi! Dosya yolunu veya adını kontrol edin: ' + seviye2Image.src);

        const seviye3Image = new Image(); // Seviye 3 arka plan görseli <-- YENİ EKLENDİ!
        seviye3Image.src = 'resimler/seviye3.png';
        seviye3Image.onload = () => console.log('Seviye 3 arka plan görseli başarıyla yüklendi!');
        seviye3Image.onerror = () => console.error('Seviye 3 arka plan görseli yüklenemedi! Dosya yolunu veya adını kontrol edin: ' + seviye3Image.src);

        const startScreenImage = new Image(); // Giriş ekranı görseli
        startScreenImage.src = 'resimler/giris_ekrani.png';
        startScreenImage.onload = () => console.log('Giriş ekranı görseli başarıyla yüklendi!');
        startScreenImage.onerror = () => console.error('Giriş ekranı görseli yüklenemedi! Dosya yolunu veya adını kontrol edin: ' + startScreenImage.src);

        const howToPlayImage = new Image(); // Nasıl oynanır ekranı görseli
        howToPlayImage.src = 'resimler/nasil_oynanir.png';
        howToPlayImage.onload = () => console.log('Nasıl oynanır ekranı görseli başarıyla yüklendi!');
        howToPlayImage.onerror = () => console.error('Nasıl oynanır ekranı görseli yüklenemedi! Dosya yolunu veya adını kontrol edin: ' + howToPlayImage.src);

        const menuImage = new Image(); // Menü ekranı görseli
        menuImage.src = 'resimler/menu.png';
        menuImage.onload = () => console.log('Menü ekranı görseli başarıyla yüklendi!');
        menuImage.onerror = () => console.error('Menü ekranı görseli yüklenemedi! Dosya yolunu veya adını kontrol edin: ' + menuImage.src);


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

        // Arka plan müziği objesi
        const backgroundMusic = new Audio();
        backgroundMusic.src = 'muzikler/oyunmuzik.mp3';
        backgroundMusic.loop = true; // Müziğin sürekli döngüde çalmasını sağlar
        backgroundMusic.volume = 0.3; // Ses seviyesini ayarlayın (0.0 ile 1.0 arası)

        // Müzik yüklendiğinde konsola bilgi yazdır
        backgroundMusic.oncanplaythrough = () => {
            console.log('Arka plan müziği başarıyla yüklendi ve çalmaya hazır!');
        };
        backgroundMusic.onerror = (e) => {
            console.error('Arka plan müziği yüklenemedi! Dosya yolunu veya adını kontrol edin: ' + backgroundMusic.src, e);
        };

        // Yürüme sesi efekti
        const walkingSound = new Audio();
        walkingSound.src = 'muzikler/walkingsound.mp3';
        walkingSound.loop = true; // Yürüme sesi sürekli çalmalı (karakter yürüdüğü sürece)
        walkingSound.volume = 0.5; // Ses seviyesini ayarlayın

        walkingSound.oncanplaythrough = () => {
            console.log('Yürüme sesi başarıyla yüklendi ve çalmaya hazır!');
        };
        walkingSound.onerror = (e) => {
            console.error('Yürüme sesi yüklenemedi! Dosya yolunu veya adını kontrol edin: ' + walkingSound.src, e);
        };

        // Zıplama sesi efekti
        const jumpSound = new Audio();
        jumpSound.src = 'muzikler/jump.mp3'; // Zıplama sesi dosyanızın yolu
        jumpSound.volume = 0.7; // Ses seviyesini ayarlayın (döngüye almayın, her zıplamada bir kez çalmalı)

        jumpSound.oncanplaythrough = () => {
            console.log('Zıplama sesi başarıyla yüklendi ve çalmaya hazır!');
        };
        jumpSound.onerror = (e) => {
            console.error('Zıplama sesi yüklenemedi! Dosya yolunu veya adını kontrol edin: ' + jumpSound.src, e);
        };


        // =========== KLAVYE GİRDİ YÖNETİMİ ===========
        let pressedKeys = {};
        let lastZPressTime = 0; // 'Z' tuşuna en son basıldığı zamanı tutar
        const zCooldown = 200; // 'Z' tuşu için milisaniye cinsinden bekleme süresi

        // Oyunun başlangıç durumu
        let gameState = 'startScreen'; // 'startScreen', 'howToPlayScreen', 'playing', 'pauseMenu'

        window.addEventListener('keydown', (e) => {
            pressedKeys[e.code] = true;

            if (e.code === 'Enter') {
                if (gameState === 'startScreen') {
                    gameState = 'howToPlayScreen';
                    console.log("Giriş ekranından Nasıl Oynanır ekranına geçildi.");
                } else if (gameState === 'howToPlayScreen') {
                    gameState = 'playing';
                    // Oyun başladığında ilk seviyeyi yükle ve karakter konumlarını başlat
                    currentLevelIndex = 0; // Her zaman ilk seviyeden başla
                    level = allLevels[currentLevelIndex].map(row => row);
                    initializeCharacterPositionsForCurrentLevel();
                    console.log("Oyun başladı, Seviye 1 yüklendi!");

                    // MÜZİĞİ BURADA BAŞLAT
                    backgroundMusic.play()
                        .then(() => {
                            console.log("Müzik başarıyla çalmaya başladı.");
                        })
                        .catch(error => {
                            console.error("Müzik çalma hatası (kullanıcı etkileşimi gerekebilir veya dosya hatası):", error);
                        });
                }
            } else if (e.code === 'Escape') {
                if (gameState === 'playing') {
                    gameState = 'pauseMenu';
                    backgroundMusic.pause(); // Oyunu duraklattığında müziği de durdur
                    walkingSound.pause(); // Yürüme sesini durdur
                    walkingSound.currentTime = 0; // Yürüme sesini sıfırla
                    console.log("Oyun duraklatıldı, Menü açıldı.");
                } else if (gameState === 'pauseMenu') {
                    gameState = 'playing'; // Esc ile menüden oyuna dön
                    backgroundMusic.play()
                        .then(() => {
                            console.log("Müzik devam ettirildi.");
                        })
                        .catch(error => {
                            console.error("Müzik çalma hatası (devam etmede):", error);
                        });
                    console.log("Menü kapatıldı, Oyuna devam ediliyor.");
                }
            } else if (e.code === 'Digit1' && gameState === 'pauseMenu') {
                // Menüde 1'e basılırsa oyuna devam et
                gameState = 'playing';
                backgroundMusic.play()
                    .then(() => {
                        console.log("Müzik devam ettirildi (menüden).");
                    })
                    .catch(error => {
                        console.error("Müzik çalma hatası (devam etmede):", error);
                    });
                console.log("Oyuna devam ediliyor.");
            } else if (e.code === 'Digit2' && gameState === 'pauseMenu') {
                // Menüde 2'ye basılırsa seviyeyi baştan başlat
                gameState = 'playing';
                // Mevcut seviyeyi baştan başlat
                level = allLevels[currentLevelIndex].map(row => row); // Harita verisini sıfırla
                initializeCharacterPositionsForCurrentLevel(); // Karakter konumlarını sıfırla
                door.isOpen = false; // Kapıyı sıfırla
                button.isPressed = false; // Butonu sıfırla
                backgroundMusic.currentTime = 0; // Müziği baştan başlat
                backgroundMusic.play()
                    .then(() => {
                        console.log("Müzik baştan başlatıldı (seviye yeniden başlatma).");
                    })
                    .catch(error => {
                        console.error("Müzik çalma hatası (seviye yeniden başlatmada):", error);
                    });
                walkingSound.pause(); // Yürüme sesini durdur
                walkingSound.currentTime = 0; // Yürüme sesini sıfırla
                console.log(`Seviye ${currentLevelIndex + 1} baştan başlatıldı.`);
            }
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

        // Bir tile'ın (row, col) bir karakterin bounding box'ı tarafından işgal edilip edilmediğini kontrol eder.
        function isTileOccupiedByChar(tileRow, tileCol, character) {
            const charLeftPixel = character.x;
            const charRightPixel = character.x + character.width;
            const charTopPixel = character.y;
            const charBottomPixel = character.y + character.height;

            const tileLeftPixel = tileCol * tileSize;
            const tileRightPixel = (tileCol + 1) * tileSize;
            const tileTopPixel = tileRow * tileSize;
            const tileBottomPixel = (tileRow + 1) * tileSize;

            // Karakterin bounding box'ı ile tile'ın bounding box'ı çakışıyor mu?
            return charLeftPixel < tileRightPixel && charRightPixel > tileLeftPixel &&
                   charTopPixel < tileBottomPixel && charBottomPixel > tileTopPixel;
        }

        // İki karakter arasında doğrudan görüş hattı olup olmadığını kontrol eder (çapraz dahil)
        function checkLineOfSight(char1, char2) {
            // Eğer char1 veya char2 yoksa, görüş hattı kontrolü yapılamaz.
            if (!char1 || !char2) {
                return false;
            }

            // Karakterlerin merkez noktalarını al
            const x1 = char1.x + char1.width / 2;
            const y1 = char1.y + char1.height / 2;
            const x2 = char2.x + char2.width / 2;
            const y2 = char2.y + char2.height / 2;

            // Bresenham'ın çizgi algoritmasına benzer bir yaklaşımla aradaki tüm tile'ları kontrol et
            let dx = Math.abs(x2 - x1);
            let dy = Math.abs(y2 - y1);
            let sx = (x1 < x2) ? 1 : -1;
            let sy = (y1 < y2) ? 1 : -1;
            let err = dx - dy;

            let currentX = x1;
            let currentY = y1;

            while (true) {
                let col = Math.floor(currentX / tileSize);
                let row = Math.floor(currentY / tileSize);

                // Tile'ın seviye sınırları içinde olduğundan emin ol
                if (row < 0 || row >= level.length || col < 0 || col >= level[row].length) {
                    return false; // Çizgi seviye dışına çıktı, görüş hattı yok say
                }

                const tileType = level[row][col];

                // Eğer mevcut tile, karakterlerden herhangi birinin bounding box'ı tarafından işgal ediliyorsa,
                // bu tile'ı bir engel olarak sayma.
                if (isTileOccupiedByChar(row, col, char1) || isTileOccupiedByChar(row, col, char2)) {
                    // Karakterin kendi vücudunun bir parçası, engel değil.
                }
                // Aksi takdirde, eğer tile katı bir engel (duvar veya kapalı kapı) ise, görüş hattı engellenmiştir.
                else if (tileType === '#' || (tileType === 'D' && !door.isOpen)) {
                    return false; // Engel bulundu
                }

                // Hedef tile'a ulaşıldıysa döngüyü kır
                if (Math.floor(currentX / tileSize) === Math.floor(x2 / tileSize) && Math.floor(currentY / tileSize) === Math.floor(y2 / tileSize)) {
                    break;
                }

                let e2 = 2 * err;
                if (e2 > -dy) {
                    err -= dy;
                    currentX += sx;
                }
                if (e2 < dx) {
                    err += dx;
                    currentY += sy;
                }
            }
            return true; // Engel bulunamadı, görüş hattı açık
        }


        // =========== OYUN DÖNGÜSÜ TANIMLARI ===========

        let gameRunning = true;

        // Karakterlerin fizik ve çarpışma güncellemelerini ayrı bir fonksiyonda topla
        function updateCharacterPhysics(char) {
            let prevCharY = char.y;

            // Dikey hareket (yerçekimi)
            char.isOnGround = false;
            char.dy += char.gravity;
            char.y += char.dy;

            // --- Karakter-on-Karakter Çarpışması (Dikey) ---
            for (let i = 0; i < allPlayableCharacters.length; i++) {
                const otherChar = allPlayableCharacters[i];
                if (char === otherChar) continue; // Kendisiyle çarpışmayı kontrol etme

                // Eğer 'char' düşüyorsa ve 'otherChar' ile çarpışıyorsa
                if (char.dy > 0 && checkCollision(char, otherChar)) {
                    // Eğer karakterin önceki alt kenarı, diğer karakterin üst kenarında veya üstündeyse (yani üzerine düşüyorsa)
                    if (prevCharY + char.height <= otherChar.y) {
                        char.y = otherChar.y - char.height; // Diğer karakterin üzerine yerleştir
                        char.dy = 0;
                        char.isOnGround = true;
                    }
                    // Eğer düşerken diğer karakterin altından çarpıyorsa (örneğin zıplayarak)
                    else if (prevCharY >= otherChar.y + otherChar.height) {
                        char.y = otherChar.y + otherChar.height; // Diğer karakterin altından sektir
                        char.dy = 0;
                    }
                }
            }


            // Dikey çarpışma kontrolü (tile'lar ile)
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

            // Sadece aktif oyuncunun yatay hareketini al
            let prevCurrentPlayerX = currentPlayer.x;
            let isMovingHorizontally = false; // Yatay hareket kontrolü için yeni değişken

            if (pressedKeys['ArrowLeft']) {
                currentPlayer.x -= currentPlayer.speed;
                isMovingHorizontally = true;
            }
            if (pressedKeys['ArrowRight']) {
                currentPlayer.x += currentPlayer.speed;
                isMovingHorizontally = true;
            }

            // Yürüme sesini kontrol et
            if (isMovingHorizontally && currentPlayer.isOnGround && walkingSound.paused) {
                walkingSound.play().catch(error => {
                    console.error("Yürüme sesi çalma hatası:", error);
                });
            } else if ((!isMovingHorizontally || !currentPlayer.isOnGround) && !walkingSound.paused) {
                walkingSound.pause();
                walkingSound.currentTime = 0; // Ses dosyasını baştan başlat
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
                walkingSound.pause(); // Zıplayınca yürüme sesini durdur
                walkingSound.currentTime = 0;

                // Zıplama sesini çal
                jumpSound.currentTime = 0; // Sesin baştan başlamasını sağla
                jumpSound.play().catch(error => {
                    console.error("Zıplama sesi çalma hatası:", error);
                });
            }

            // Her karakterin fizik ve çarpışma güncellemelerini uygula
            for (let i = 0; i < allPlayableCharacters.length; i++) {
                updateCharacterPhysics(allPlayableCharacters[i]);
            }


            // --- Buton Etkileşimi ---
            const actualButtonRect = {
                x: button.x,
                y: button.y + tileSize - buttonNormalImage.naturalHeight,
                width: button.width,
                height: buttonNormalImage.naturalHeight
            };

            // Tüm oynanabilir karakterler butona basabilir
            let anyCharOnButton = false;
            for (let i = 0; i < allPlayableCharacters.length; i++) {
                if (checkCollision(allPlayableCharacters[i], actualButtonRect)) {
                    anyCharOnButton = true;
                    break;
                }
            }
            button.isPressed = anyCharOnButton;
            door.isOpen = anyCharOnButton;


            // --- Karakter Değiştirme Mantığı (Z tuşu ile) ---
            const currentTime = Date.now();
            if (pressedKeys['KeyZ'] && (currentTime - lastZPressTime > zCooldown)) {
                if (activePlayer === player) {
                    // Ana karakterden yan karaktere geçiş yapmaya çalış
                    let currentIndex = allPlayableCharacters.indexOf(player);
                    let foundNextSideChar = null;

                    // Mevcut karakterden sonraki yan karakterleri ara
                    for (let i = currentIndex + 1; i < allPlayableCharacters.length; i++) {
                        const char = allPlayableCharacters[i];
                        if (char !== player && checkLineOfSight(player, char)) {
                            foundNextSideChar = char;
                            break;
                        }
                    }

                    // Eğer sonraki bulunamazsa, baştan itibaren ara (ana karakteri atla)
                    if (!foundNextSideChar) {
                        for (let i = 0; i < currentIndex; i++) {
                            const char = allPlayableCharacters[i];
                            if (char !== player && checkLineOfSight(player, char)) {
                                foundNextSideChar = char;
                                break;
                            }
                        }
                    }

                    if (foundNextSideChar) {
                        activePlayer = foundNextSideChar;
                        console.log("Karakter kontrolü Yan Karakter'e değiştirildi!");
                    } else {
                        console.log("Karakter değiştirme engellendi: Yan karakter bulunamadı veya görüş hattı yok.");
                    }
                } else {
                    // Yan karakterden ana karaktere geri dön
                    activePlayer = player;
                    console.log("Karakter kontrolü Ana Karakter'e değiştirildi!");
                }

                // Kontrol değiştiğinde karakterlerin dikey hızlarını sıfırla
                for (let i = 0; i < allPlayableCharacters.length; i++) {
                    allPlayableCharacters[i].dy = 0;
                    allPlayableCharacters[i].isOnGround = false;
                }
                walkingSound.pause(); // Karakter değişince yürüme sesini durdur
                walkingSound.currentTime = 0;
                lastZPressTime = currentTime; // Cooldown'u güncelle
            }

            // --- Otomatik Kontrol Geri Dönüşü (Yan Karakter Görüş Alanından Çıkarsa) ---
            // Eğer aktif karakter ana karakter değilse (yani bir yan karakterse)
            if (activePlayer !== player) {
                // Ve ana karakterle görüş hattı yoksa
                if (!checkLineOfSight(player, activePlayer)) {
                    activePlayer = player;
                    console.log("Yan karakter görüş alanından çıktı, kontrol Ana Karakter'e geri döndürüldü!");
                    // Geri dönüşte de fizik sıfırlanabilir, karakterin havada kalmaması için
                    for (let i = 0; i < allPlayableCharacters.length; i++) {
                        allPlayableCharacters[i].dy = 0;
                        allPlayableCharacters[i].isOnGround = false;
                    }
                    walkingSound.pause(); // Kontrol değişince yürüme sesini durdur
                    walkingSound.currentTime = 0;
                }
            }

            // --- Çıkış Kapısı Kontrolü (Ana Karakter İçin) ---
            // Sadece ana karakter (player) çıkış kapısına değdiğinde seviye geçişini tetikle
            if (checkCollision(player, exitDoor)) {
                console.log("Ana karakter çıkış kapısına değdi!");
                transitionToNextLevel(); // Seviye geçişini tetikle
                walkingSound.pause(); // Seviye değişince yürüme sesini durdur
                walkingSound.currentTime = 0;
            }
        } // update() fonksiyonunun kapanış parantezi


        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (gameState === 'startScreen') {
                // Giriş ekranını çiz
                if (startScreenImage.complete && startScreenImage.naturalWidth !== 0) {
                    ctx.drawImage(startScreenImage, 0, 0, canvas.width, canvas.height);
                } else {
                    // Eğer görsel yüklenmezse varsayılan bir arka plan ve yazı göster
                    ctx.fillStyle = 'black';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.fillStyle = 'white';
                    ctx.font = '30px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText('Oyuna Başlamak İçin Enter\'a Basın', canvas.width / 2, canvas.height / 2);
                }
            } else if (gameState === 'howToPlayScreen') {
                // Nasıl oynanır ekranını çiz
                if (howToPlayImage.complete && howToPlayImage.naturalWidth !== 0) {
                    ctx.drawImage(howToPlayImage, 0, 0, canvas.width, canvas.height);
                } else {
                    ctx.fillStyle = 'darkblue';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.fillStyle = 'white';
                    ctx.font = '30px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText('Nasıl Oynanır?', canvas.width / 2, canvas.height / 2 - 40);
                    ctx.font = '20px Arial';
                    ctx.fillText('Ok tuşları ile hareket et, Yukarı ok ile zıpla.', canvas.width / 2, canvas.height / 2);
                    ctx.fillText('Z tuşu ile karakter değiştir.', canvas.width / 2, canvas.height / 2 + 30);
                    ctx.fillText('Oyuna başlamak için Enter\'a basın.', canvas.width / 2, canvas.height / 2 + 60);
                }
            }
            else if (gameState === 'playing') {
                // Mevcut seviye indexine göre doğru arka planı çiz
                let currentBackgroundImage;
                if (currentLevelIndex === 0) {
                    currentBackgroundImage = backgroundImage; // seviye1.png
                } else if (currentLevelIndex === 1) {
                    currentBackgroundImage = seviye2Image; // seviye2.png
                } else if (currentLevelIndex === 2) { // <-- YENİ EKLENDİ!
                    currentBackgroundImage = seviye3Image; // seviye3.png
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
                for (let i = 0; i < allPlayableCharacters.length; i++) {
                    const char = allPlayableCharacters[i];
                    let charImage;
                    if (char === player) {
                        charImage = playerImage;
                    } else { // Diğer tüm karakterler (Q'lar) yan karakter görselini kullanır
                        charImage = sideCharacterImage;
                    }

                    if (charImage.complete && charImage.naturalWidth !== 0) {
                        ctx.drawImage(charImage, char.x, char.y, char.width, char.height);
                    } else {
                        ctx.fillStyle = (char === player) ? 'blue' : 'purple'; // Yedek renk
                        ctx.fillRect(char.x, char.y, char.width, char.height);
                    }
                }


                // Aktif oyuncunun etrafına çerçeve çiz
                ctx.strokeStyle = 'yellow'; // Çerçeve rengi
                ctx.lineWidth = 3; // Çerçeve kalınlığı
                if (activePlayer) { // activePlayer'ın null olmadığından emin ol
                    ctx.strokeRect(activePlayer.x, activePlayer.y, activePlayer.width, activePlayer.height);
                }
            } else if (gameState === 'pauseMenu') {
                // Menü ekranını çiz
                if (menuImage.complete && menuImage.naturalWidth !== 0) {
                    ctx.drawImage(menuImage, 0, 0, canvas.width, canvas.height);
                } else {
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'; // Yarı saydam siyah arka plan
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.fillStyle = 'white';
                    ctx.font = '40px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText('OYUN DURAKLATILDI', canvas.width / 2, canvas.height / 2 - 60);
                    ctx.font = '25px Arial';
                    ctx.fillText('1 - Devam Et', canvas.width / 2, canvas.height / 2);
                    ctx.fillText('2 - Seviyeyi Baştan Başlat', canvas.width / 2, canvas.height / 2 + 40);
                }
            }
        }

        // Ana oyun döngüsü fonksiyonu
        function gameLoop() {
            if (!gameRunning) {
                return;
            }

            // Duruma göre farklı fonksiyonları çağır
            if (gameState === 'playing') {
                update(); // Sadece 'playing' durumunda güncelleme yap
            }
            draw(); // Her durumda çizim yap

            requestAnimationFrame(gameLoop);
        }

        // =========== OYUN BAŞLANGICI ===========
        // Oyun döngüsü başlamadan önce karakterleri başlatma işlemini kaldırıldı.
        // Bu işlem artık 'Enter' tuşuna basıldığında gerçekleşecek.
        gameLoop();

        // =========== DİĞER FONKSİYONLAR / DEĞİŞKENLER BURAYA GELECEK ===========

    } else {
        console.error('Canvas 2D context alınamadı!');
    }
} else {
    console.error('ID "ednaCanvas" olan canvas elementi bulunamadı! HTML dosyasını kontrol edin.');
}
