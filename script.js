// متغيرات اللعبة
        let gameState = {
            playerScore: 0,
            computerScore: 0,
            totalGames: 0,
            difficulty: 'easy',
            playerHistory: [],
            gameHistory: []
        };

        // خيارات اللعبة
        const choices = {
            rock: { emoji: '🪨', name: 'حجر', beats: 'scissors' },
            paper: { emoji: '📄', name: 'ورقة', beats: 'rock' },
            scissors: { emoji: '✂️', name: 'مقص', beats: 'paper' }
        };

        const results = {
            win: { text: 'انتصار مذهل! 🎉', class: 'win' },
            lose: { text: 'الذكاء الاصطناعي تفوق عليك! 🤖', class: 'lose' },
            draw: { text: 'تعادل تكتيكي! 🤝', class: 'draw' }
        };

        // خوارزميات الذكاء الاصطناعي حسب الصعوبة
        const aiStrategies = {
            easy: () => {
                // عشوائي تماماً
                const choiceKeys = Object.keys(choices);
                return choiceKeys[Math.floor(Math.random() * choiceKeys.length)];
            },
            
            medium: () => {
                // يحلل آخر 3 حركات للاعب
                if (gameState.playerHistory.length < 3) {
                    return aiStrategies.easy();
                }
                
                const recent = gameState.playerHistory.slice(-3);
                const counts = { rock: 0, paper: 0, scissors: 0 };
                recent.forEach(choice => counts[choice]++);
                
                // يتوقع الحركة الأكثر تكراراً ويختار المضاد لها
                const predicted = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
                const counter = Object.keys(choices).find(choice => choices[choice].beats === predicted);
                
                // 70% ذكي، 30% عشوائي
                return Math.random() < 0.7 ? counter : aiStrategies.easy();
            },
            
            hard: () => {
                // تحليل متقدم للأنماط
                if (gameState.playerHistory.length < 5) {
                    return aiStrategies.medium();
                }
                
                const history = gameState.playerHistory;
                const patterns = {};
                
                // تحليل الأنماط المتتالية
                for (let i = 2; i < history.length; i++) {
                    const pattern = history[i-2] + history[i-1];
                    if (!patterns[pattern]) patterns[pattern] = {};
                    if (!patterns[pattern][history[i]]) patterns[pattern][history[i]] = 0;
                    patterns[pattern][history[i]]++;
                }
                
                // التنبؤ بناءً على آخر حركتين
                const lastTwo = history.slice(-2).join('');
                if (patterns[lastTwo]) {
                    const predicted = Object.keys(patterns[lastTwo]).reduce((a, b) => 
                        patterns[lastTwo][a] > patterns[lastTwo][b] ? a : b
                    );
                    const counter = Object.keys(choices).find(choice => choices[choice].beats === predicted);
                    
                    // 85% ذكي، 15% عشوائي للإبقاء على التشويق
                    return Math.random() < 0.85 ? counter : aiStrategies.easy();
                }
                
                return aiStrategies.medium();
            }
        };

        // تعيين مستوى الصعوبة
        function setDifficulty(level) {
            gameState.difficulty = level;
            
            // تحديث الأزرار
            document.querySelectorAll('.difficulty-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            document.querySelector(`.difficulty-btn.${level}`).classList.add('active');
            
            // تحديث النص
            const difficultyNames = {
                easy: 'سهل - الذكاء الاصطناعي يلعب عشوائياً',
                medium: 'متوسط - يحلل آخر 3 حركات',
                hard: 'صعب - يتعلم من أنماط لعبك!'
            };
            
            updateResult(`تم اختيار مستوى: ${difficultyNames[level]} 🎯`);
        }

        // تشغيل اللعبة
        function playGame(playerChoice) {
            // إضافة حركة اللاعب للتاريخ
            gameState.playerHistory.push(playerChoice);
            if (gameState.playerHistory.length > 20) {
                gameState.playerHistory.shift(); // الاحتفاظ بآخر 20 حركة فقط
            }

            // تفعيل تأثير التفكير للذكاء الاصطناعي
            const aiThinking = document.getElementById('aiThinking');
            aiThinking.style.display = 'block';
            
            // تفعيل البطاقات
            document.getElementById('playerCard').classList.add('active');
            document.getElementById('computerCard').classList.add('active');

            // تأخير لإضافة التشويق
            setTimeout(() => {
                const computerChoice = aiStrategies[gameState.difficulty]();
                const result = determineWinner(playerChoice, computerChoice);
                
                updateDisplay(playerChoice, computerChoice, result);
                updateStats(result);
                addToHistory(playerChoice, computerChoice, result);
                
                aiThinking.style.display = 'none';
                
                // إزالة تفعيل البطاقات
                setTimeout(() => {
                    document.getElementById('playerCard').classList.remove('active');
                    document.getElementById('computerCard').classList.remove('active');
                }, 1000);
                
            }, 1500);
        }

        // تحديد الفائز
        function determineWinner(playerChoice, computerChoice) {
            if (playerChoice === computerChoice) return 'draw';
            return choices[playerChoice].beats === computerChoice ? 'win' : 'lose';
        }

        // تحديث العرض
        function updateDisplay(playerChoice, computerChoice, result) {
            // تحديث الاختيارات
            const playerChoiceEl = document.getElementById('playerChoice');
            const computerChoiceEl = document.getElementById('computerChoice');
            
            playerChoiceEl.textContent = choices[playerChoice].emoji;
            computerChoiceEl.textContent = choices[computerChoice].emoji;
            
            // إضافة الأنيميشن
            playerChoiceEl.classList.add('choice-animation');
            computerChoiceEl.classList.add('choice-animation');
            
            setTimeout(() => {
                playerChoiceEl.classList.remove('choice-animation');
                computerChoiceEl.classList.remove('choice-animation');
            }, 800);

            // تحديث النتيجة
            updateResult(results[result].text, results[result].class);
        }

        // تحديث النتيجة
        function updateResult(text, className = '') {
            const resultEl = document.getElementById('result');
            resultEl.textContent = text;
            resultEl.className = `result-text ${className}`;
        }

        // تحديث الإحصائيات
        function updateStats(result) {
            gameState.totalGames++;
            
            if (result === 'win') {
                gameState.playerScore++;
            } else if (result === 'lose') {
                gameState.computerScore++;
            }

            // تحديث العرض
            document.getElementById('playerScore').textContent = gameState.playerScore;
            document.getElementById('computerScore').textContent = gameState.computerScore;
            document.getElementById('totalGames').textContent = gameState.totalGames;
            
            // حساب معدل الفوز
            const winRate = gameState.totalGames > 0 ? 
                Math.round((gameState.playerScore / gameState.totalGames) * 100) : 0;
            document.getElementById('winRate').textContent = winRate + '%';
        }

        // إضافة للتاريخ
        function addToHistory(playerChoice, computerChoice, result) {
            const historyItem = {
                player: choices[playerChoice].name,
                computer: choices[computerChoice].name,
                result: result,
                timestamp: new Date().toLocaleTimeString('ar-SA')
            };
            
            gameState.gameHistory.unshift(historyItem);
            if (gameState.gameHistory.length > 10) {
                gameState.gameHistory.pop();
            }
            
            updateHistoryDisplay();
        }

        // تحديث عرض التاريخ
        function updateHistoryDisplay() {
            const historyList = document.getElementById('historyList');
            historyList.innerHTML = '';
            
            gameState.gameHistory.forEach((game, index) => {
                const historyItem = document.createElement('div');
                historyItem.className = 'history-item';
                
                const resultEmoji = {
                    win: '🎉',
                    lose: '😢',
                    draw: '🤝'
                };
                
                const resultText = {
                    win: 'فوز',
                    lose: 'خسارة',
                    draw: 'تعادل'
                };
                
                historyItem.innerHTML = `
                    <span>${game.timestamp}</span>
                    <span>${game.player} ضد ${game.computer}</span>
                    <span>${resultEmoji[game.result]} ${resultText[game.result]}</span>
                `;
                
                historyList.appendChild(historyItem);
            });
        }

        // عرض/إخفاء التاريخ
        function toggleHistory() {
            const historySection = document.getElementById('historySection');
            historySection.style.display = historySection.style.display === 'none' ? 'block' : 'none';
        }

        // إعادة تعيين اللعبة
        function resetGame() {
            // تأكيد من المستخدم
            if (gameState.totalGames > 0) {
                if (!confirm('هل أنت متأكد من إعادة تعيين جميع الإحصائيات؟')) {
                    return;
                }
            }
            
            // إعادة تعيين البيانات
            gameState = {
                playerScore: 0,
                computerScore: 0,
                totalGames: 0,
                difficulty: 'easy',
                playerHistory: [],
                gameHistory: []
            };
            
            // إعادة تعيين العرض
            document.getElementById('playerScore').textContent = '0';
            document.getElementById('computerScore').textContent = '0';
            document.getElementById('totalGames').textContent = '0';
            document.getElementById('winRate').textContent = '0%';
            document.getElementById('playerChoice').textContent = '❓';
            document.getElementById('computerChoice').textContent = '❓';
            updateResult('تم إعادة التعيين! اختر صعوبة المعركة ثم ابدأ! 🎯');
            
            // إعادة تعيين الصعوبة
            document.querySelectorAll('.difficulty-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            document.querySelector('.difficulty-btn.easy').classList.add('active');
            
            // إخفاء التاريخ وإعادة تعيينه
            document.getElementById('historySection').style.display = 'none';
            document.getElementById('historyList').innerHTML = '';
        }

        // أحداث لوحة المفاتيح
        document.addEventListener('keydown', function(event) {
            switch(event.key.toLowerCase()) {
                case '1':
                case 'r':
                    playGame('rock');
                    break;
                case '2':
                case 'p':
                    playGame('paper');
                    break;
                case '3':
                case 's':
                    playGame('scissors');
                    break;
                case ' ':
                    event.preventDefault();
                    resetGame();
                    break;
                case 'h':
                    toggleHistory();
                    break;
                case 'e':
                    setDifficulty('easy');
                    break;
                case 'm':
                    setDifficulty('medium');
                    break;
                case 'd':
                    setDifficulty('hard');
                    break;
            }
        });

        // تأثيرات إضافية للأزرار
        document.querySelectorAll('.choice-btn').forEach(btn => {
            btn.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-8px) scale(1.05)';
            });
            
            btn.addEventListener('mouseleave', function() {
                this.style.transform = '';
            });
            
            btn.addEventListener('click', function() {
                // تأثير الضغط
                this.style.transform = 'translateY(-4px) scale(0.98)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
            });
        });

        // رسائل ترحيب وتحفيز
        const motivationalMessages = {
            win: [
                'إستراتيجية رائعة! 🧠',
                'أنت تتحسن! 📈',
                'ضربة موفقة! ⭐',
                'الذكاء ينتصر! 🎯'
            ],
            lose: [
                'لا تستسلم! 💪',
                'التالية لك! 🎯',
                'تعلم من الأخطاء! 📚',
                'كل خسارة درس! 🎓'
            ],
            draw: [
                'متطابقان في التفكير! 🤝',
                'عقول متوازنة! ⚖️',
                'تفكير متزامن! 🔄',
                'توافق تام! ✨'
            ]
        };

        // تحديث الرسائل التحفيزية
        function getMotivationalMessage(result) {
            const messages = motivationalMessages[result];
            return messages[Math.floor(Math.random() * messages.length)];
        }

        // تحديث النتيجة مع رسالة تحفيزية
        function updateDisplayWithMotivation(playerChoice, computerChoice, result) {
            updateDisplay(playerChoice, computerChoice, result);
            
            // إضافة رسالة تحفيزية بعد ثانيتين
            setTimeout(() => {
                const motivationalMsg = getMotivationalMessage(result);
                updateResult(motivationalMsg);
            }, 2000);
        }

        // تحديث دالة playGame لاستخدام الرسائل التحفيزية
        function playGameWithMotivation(playerChoice) {
            gameState.playerHistory.push(playerChoice);
            if (gameState.playerHistory.length > 20) {
                gameState.playerHistory.shift();
            }

            const aiThinking = document.getElementById('aiThinking');
            aiThinking.style.display = 'block';
            
            document.getElementById('playerCard').classList.add('active');
            document.getElementById('computerCard').classList.add('active');

            setTimeout(() => {
                const computerChoice = aiStrategies[gameState.difficulty]();
                const result = determineWinner(playerChoice, computerChoice);
                
                updateDisplayWithMotivation(playerChoice, computerChoice, result);
                updateStats(result);
                addToHistory(playerChoice, computerChoice, result);
                
                aiThinking.style.display = 'none';
                
                setTimeout(() => {
                    document.getElementById('playerCard').classList.remove('active');
                    document.getElementById('computerCard').classList.remove('active');
                }, 1000);
                
            }, 1500);
        }

        // استبدال دالة playGame الأصلية
        function playGame(choice) {
            playGameWithMotivation(choice);
        }

        // رسالة ترحيب عند تحميل الصفحة
        window.addEventListener('load', function() {
            updateResult('🎯 مرحباً بك في معركة العقول! اختر مستوى الصعوبة وابدأ التحدي!');
            
            // تأثير دخول للصفحة
            document.querySelector('.game-wrapper').style.opacity = '0';
            document.querySelector('.game-wrapper').style.transform = 'translateY(50px)';
            
            setTimeout(() => {
                document.querySelector('.game-wrapper').style.transition = 'all 0.8s ease-out';
                document.querySelector('.game-wrapper').style.opacity = '1';
                document.querySelector('.game-wrapper').style.transform = 'translateY(0)';
            }, 100);
        });

        // تلميحات الاختصارات
        const keyboardHints = {
            '1 أو R': 'حجر 🪨',
            '2 أو P': 'ورقة 📄', 
            '3 أو S': 'مقص ✂️',
            'مسطرة المسافة': 'إعادة تعيين 🔄',
            'H': 'التاريخ 📈',
            'E': 'سهل 🟢',
            'M': 'متوسط 🟡',
            'D': 'صعب 🔴'
        };

        // عرض التلميحات عند النقر على أي مكان فارغ
        document.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            let hintsText = 'اختصارات لوحة المفاتيح:\n\n';
            Object.entries(keyboardHints).forEach(([key, action]) => {
                hintsText += `${key}: ${action}\n`;
            });
            alert(hintsText);
        });