/* RANKFORGE 9.2.0 — offline UI translations (German + five global languages) */
(() => {
  "use strict";

  const STORAGE_KEY = "rankforge-language-v9.2";
  const LANGUAGES = Object.freeze([
    { code: "de", label: "Deutsch", dir: "ltr" },
    { code: "en", label: "English", dir: "ltr" },
    { code: "zh", label: "中文", dir: "ltr" },
    { code: "hi", label: "हिन्दी", dir: "ltr" },
    { code: "es", label: "Español", dir: "ltr" },
    { code: "ar", label: "العربية", dir: "rtl" }
  ]);

  // Order: German, English, Mandarin Chinese, Hindi, Spanish, Arabic.
  const PHRASES = [
    ["Home", "Home", "首页", "होम", "Inicio", "الرئيسية"],
    ["Freunde", "Friends", "好友", "दोस्त", "Amigos", "الأصدقاء"],
    ["Ranks", "Ranks", "段位", "रैंक", "Rangos", "الرتب"],
    ["Profil", "Profile", "个人资料", "प्रोफ़ाइल", "Perfil", "الملف الشخصي"],
    ["Hauptnavigation", "Main navigation", "主导航", "मुख्य नेविगेशन", "Navegación principal", "التنقل الرئيسي"],
    ["Training starten", "Start workout", "开始训练", "वर्कआउट शुरू करें", "Iniciar entrenamiento", "بدء التمرين"],
    ["Startseite", "Home", "首页", "होम", "Inicio", "الرئيسية"],
    ["Bereit für das", "Ready for the", "准备迎接", "तैयार हैं", "¿Listo para el", "هل أنت مستعد لـ"],
    ["nächste Level?", "next level?", "下一个等级？", "अगले स्तर के लिए?", "siguiente nivel?", "المستوى التالي؟"],
    ["Mitteilungen", "Notifications", "通知", "सूचनाएँ", "Notificaciones", "الإشعارات"],
    ["DEIN GYM-RANK", "YOUR GYM RANK", "你的健身段位", "आपका जिम रैंक", "TU RANGO DE GIMNASIO", "رتبتك في النادي"],
    ["KÖRPERANSICHT", "BODY VIEW", "身体视图", "बॉडी व्यू", "VISTA CORPORAL", "عرض الجسم"],
    ["Dein Muskelstatus", "Your muscle status", "你的肌肉状态", "आपकी मांसपेशियों की स्थिति", "Tu estado muscular", "حالة عضلاتك"],
    ["Alle Muskeln", "All muscles", "全部肌肉", "सभी मांसपेशियाँ", "Todos los músculos", "كل العضلات"],
    ["Vorne", "Front", "正面", "सामने", "Frente", "الأمام"],
    ["Hinten", "Back", "背面", "पीछे", "Espalda", "الخلف"],
    ["VORNE", "FRONT", "正面", "सामने", "FRENTE", "الأمام"],
    ["HINTEN", "BACK", "背面", "पीछे", "ESPALDA", "الخلف"],
    ["KEINE AUSWAHL", "NO SELECTION", "未选择", "कोई चयन नहीं", "SIN SELECCIÓN", "لا يوجد تحديد"],
    ["Noch kein Rank", "No rank yet", "尚无段位", "अभी कोई रैंक नहीं", "Aún sin rango", "لا توجد رتبة بعد"],
    ["Keine Muskelgruppe ausgewählt", "No muscle group selected", "未选择肌群", "कोई मांसपेशी समूह नहीं चुना गया", "Ningún grupo muscular seleccionado", "لم يتم تحديد مجموعة عضلية"],
    ["Tippe einen Muskel an – oder lasse den Bodygraph neutral.", "Tap a muscle — or leave the bodygraph neutral.", "点击肌肉，或保持身体图中性。", "किसी मांसपेशी पर टैप करें — या बॉडीग्राफ को तटस्थ रहने दें।", "Toca un músculo o deja el gráfico corporal neutro.", "اضغط على عضلة أو اترك مخطط الجسم محايدًا."],
    ["Alle Muskelgruppen öffnen", "Open all muscle groups", "打开所有肌群", "सभी मांसपेशी समूह खोलें", "Abrir todos los grupos musculares", "فتح كل المجموعات العضلية"],
    ["Muskelauswahl aufheben", "Clear muscle selection", "清除肌肉选择", "मांसपेशी चयन हटाएँ", "Quitar selección muscular", "مسح تحديد العضلة"],
    ["HEUTIGES TRAINING", "TODAY'S WORKOUT", "今日训练", "आज का वर्कआउट", "ENTRENAMIENTO DE HOY", "تمرين اليوم"],
    ["Workout starten", "Start workout", "开始训练", "वर्कआउट शुरू करें", "Iniciar entrenamiento", "بدء التمرين"],
    ["Noch kein gespeichertes Workout", "No saved workout yet", "尚无已保存训练", "अभी कोई सेव वर्कआउट नहीं", "Aún no hay entrenamiento guardado", "لا يوجد تمرين محفوظ بعد"],
    ["Erstelle ein eigenes Workout oder starte spontan.", "Create your own workout or start one now.", "创建训练或立即开始。", "अपना वर्कआउट बनाएँ या अभी शुरू करें।", "Crea tu entrenamiento o empieza ahora.", "أنشئ تمرينك أو ابدأ الآن."],
    ["Training auswählen", "Choose workout", "选择训练", "वर्कआउट चुनें", "Elegir entrenamiento", "اختر تمرينًا"],
    ["SPONTAN TRAINIEREN", "QUICK WORKOUT", "快速训练", "क्विक वर्कआउट", "ENTRENAMIENTO RÁPIDO", "تمرين سريع"],
    ["Schnelles Workout starten", "Start a quick workout", "开始快速训练", "क्विक वर्कआउट शुरू करें", "Iniciar entrenamiento rápido", "ابدأ تمرينًا سريعًا"],
    ["Leer beginnen und Übungen während des Trainings auswählen.", "Start empty and choose exercises during the workout.", "空白开始，在训练中选择动作。", "खाली शुरू करें और वर्कआउट के दौरान व्यायाम चुनें।", "Empieza vacío y elige ejercicios durante el entrenamiento.", "ابدأ فارغًا واختر التمارين أثناء التمرين."],
    ["Diese Woche", "This week", "本周", "इस सप्ताह", "Esta semana", "هذا الأسبوع"],
    ["Trainings", "workouts", "次训练", "वर्कआउट", "entrenamientos", "تمارين"],
    ["Streak", "streak", "连续记录", "स्ट्रीक", "racha", "سلسلة"],
    ["DEINE TRAININGS-STREAK", "YOUR WORKOUT STREAK", "你的训练连续记录", "आपकी वर्कआउट स्ट्रीक", "TU RACHA DE ENTRENAMIENTO", "سلسلة تمارينك"],
    ["Dein erstes abgeschlossenes Training zündet die Flamme. Danach hält jeweils ein weiteres Training innerhalb von sieben Tagen deine Streak am Leben.", "Your first completed workout lights the flame. After that, one more workout within seven days keeps your streak alive.", "第一次完成训练会点燃火焰。之后，每七天内再完成一次训练即可延续连续记录。", "पहला पूरा वर्कआउट लौ जला देता है। उसके बाद सात दिनों के भीतर एक और वर्कआउट आपकी स्ट्रीक बनाए रखता है।", "Tu primer entrenamiento completado enciende la llama. Después, otro entrenamiento dentro de siete días mantiene viva la racha.", "أول تمرين مكتمل يشعل الشعلة. بعد ذلك يحافظ تمرين إضافي خلال سبعة أيام على السلسلة."],
    ["Noch keine Streak", "No streak yet", "尚无连续记录", "अभी कोई स्ट्रीक नहीं", "Aún no hay racha", "لا توجد سلسلة بعد"],
    ["Keine aktive Trainings-Streak", "No active workout streak", "没有活跃的训练连续记录", "कोई सक्रिय वर्कआउट स्ट्रीक नहीं", "No hay una racha de entrenamiento activa", "لا توجد سلسلة تمارين نشطة"],
    ["Heute trainieren, um die Streak zu halten", "Train today to keep your streak", "今天训练以保持连续记录", "स्ट्रीक बनाए रखने के लिए आज ट्रेन करें", "Entrena hoy para mantener la racha", "تمرّن اليوم للحفاظ على السلسلة"],
    ["Nächstes Training in", "Next workout in", "下次训练还剩", "अगला वर्कआउट", "Próximo entrenamiento en", "التمرين التالي خلال"],
    ["Tagen", "days", "天", "दिन में", "días", "أيام"],
    ["Das nächste abgeschlossene Training startet deine Streak", "Your next completed workout starts your streak", "下一次完成训练将开始连续记录", "अगला पूरा वर्कआउट आपकी स्ट्रीक शुरू करेगा", "Tu próximo entrenamiento completado inicia la racha", "التمرين المكتمل التالي يبدأ سلسلتك"],
    ["Der Zeitraum beginnt immer mit deinem letzten abgeschlossenen Training – nicht am Montag.", "The window always starts with your latest completed workout — not on Monday.", "时间窗口始终从最近一次完成训练开始，而不是从星期一开始。", "समय हमेशा आपके आखिरी पूरे वर्कआउट से शुरू होता है — सोमवार से नहीं।", "El plazo siempre empieza con tu último entrenamiento completado, no el lunes.", "تبدأ المهلة دائمًا من آخر تمرين مكتمل، وليس يوم الاثنين."],
    ["Nächstes Workout starten", "Start next workout", "开始下一次训练", "अगला वर्कआउट शुरू करें", "Iniciar el próximo entrenamiento", "ابدأ التمرين التالي"],
    ["WÖCHENTLICHES XP", "WEEKLY XP", "每周经验值", "साप्ताहिक XP", "XP SEMANAL", "نقاط الأسبوع"],
    ["NEUER PR", "NEW PR", "新个人纪录", "नया PR", "NUEVO PR", "رقم شخصي جديد"],
    ["Letztes Training", "Latest workout", "最近训练", "पिछला वर्कआउट", "Último entrenamiento", "آخر تمرين"],
    ["Alle", "All", "全部", "सभी", "Todos", "الكل"],
    ["Noch kein Training", "No workout yet", "尚无训练", "अभी कोई वर्कआउट नहीं", "Aún no hay entrenamiento", "لا يوجد تمرين بعد"],
    ["Starte jetzt dein erstes Training.", "Start your first workout now.", "立即开始第一次训练。", "अपना पहला वर्कआउट अभी शुरू करें।", "Empieza ahora tu primer entrenamiento.", "ابدأ أول تمرين الآن."],
    ["Weiter so", "Keep going", "继续保持", "ऐसे ही जारी रखें", "Sigue así", "استمر"],
    ["Noch kein persönlicher Rekord", "No personal record yet", "尚无个人纪录", "अभी कोई व्यक्तिगत रिकॉर्ड नहीं", "Aún no hay récord personal", "لا يوجد رقم شخصي بعد"],
    ["Dein Bodygraph", "Your bodygraph", "你的身体图", "आपका बॉडीग्राफ", "Tu gráfico corporal", "مخطط جسمك"],
    ["LIVE · VORNE & HINTEN", "LIVE · FRONT & BACK", "实时 · 正面与背面", "लाइव · सामने और पीछे", "EN VIVO · FRENTE Y ESPALDA", "مباشر · الأمام والخلف"],
    ["Muskelgruppe auswählen", "Select a muscle group", "选择肌群", "मांसपेशी समूह चुनें", "Selecciona un grupo muscular", "اختر مجموعة عضلية"],
    ["Keine Auswahl", "No selection", "未选择", "कोई चयन नहीं", "Sin selección", "لا يوجد تحديد"],
    ["Neutral", "Neutral", "中性", "तटस्थ", "Neutro", "محايد"],
    ["Abwählen", "Deselect", "取消选择", "चयन हटाएँ", "Deseleccionar", "إلغاء التحديد"],
    ["Details", "Details", "详情", "विवरण", "Detalles", "التفاصيل"],
    ["Dein Rank", "Your rank", "你的段位", "आपका रैंक", "Tu rango", "رتبتك"],
    ["Freunde", "Friends", "好友", "दोस्त", "Amigos", "الأصدقاء"],
    ["Gallery", "Gallery", "徽章馆", "गैलरी", "Galería", "المعرض"],
    ["Analyse", "Analysis", "分析", "विश्लेषण", "Análisis", "التحليل"],
    ["STRENGTH RANKING", "STRENGTH RANKING", "力量排名", "स्ट्रेंथ रैंकिंग", "CLASIFICACIÓN DE FUERZA", "تصنيف القوة"],
    ["YOUR RANK", "YOUR RANK", "你的段位", "आपका रैंक", "TU RANGO", "رتبتك"],
    ["HÖCHSTER RANK", "HIGHEST RANK", "最高段位", "सर्वोच्च रैंक", "RANGO MÁS ALTO", "أعلى رتبة"],
    ["Noch kein Lift", "No lift yet", "尚无举重记录", "अभी कोई लिफ्ट नहीं", "Aún no hay levantamiento", "لا توجد رفعة بعد"],
    ["Noch keine Exercise Ranks", "No exercise ranks yet", "尚无动作段位", "अभी कोई एक्सरसाइज़ रैंक नहीं", "Aún no hay rangos de ejercicio", "لا توجد رتب للتمارين بعد"],
    ["Schließe dein erstes Training ab. Deine besten Sets werden automatisch gerankt.", "Complete your first workout. Your best sets will be ranked automatically.", "完成第一次训练，最佳组会自动评级。", "अपना पहला वर्कआउट पूरा करें। आपके सर्वश्रेष्ठ सेट अपने आप रैंक होंगे।", "Completa tu primer entrenamiento. Tus mejores series se clasificarán automáticamente.", "أكمل تمرينك الأول وسيتم تصنيف أفضل مجموعاتك تلقائيًا."],
    ["Deine Abzeichen", "Your badges", "你的徽章", "आपके बैज", "Tus insignias", "شاراتك"],
    ["RANK COLLECTION", "RANK COLLECTION", "段位收藏", "रैंक संग्रह", "COLECCIÓN DE RANGOS", "مجموعة الرتب"],
    ["Aktueller Rank", "Current rank", "当前段位", "वर्तमान रैंक", "Rango actual", "الرتبة الحالية"],
    ["Freigeschaltet", "Unlocked", "已解锁", "अनलॉक", "Desbloqueado", "مفتوح"],
    ["Einstellungen", "Settings", "设置", "सेटिंग्स", "Ajustes", "الإعدادات"],
    ["Training", "Training", "训练", "ट्रेनिंग", "Entrenamiento", "التدريب"],
    ["Profil & Personalisierung", "Profile & personalization", "个人资料与个性化", "प्रोफ़ाइल और निजीकरण", "Perfil y personalización", "الملف والتخصيص"],
    ["Integrationen", "Integrations", "集成", "इंटीग्रेशन", "Integraciones", "التكاملات"],
    ["Daten & Hilfe", "Data & help", "数据与帮助", "डेटा और सहायता", "Datos y ayuda", "البيانات والمساعدة"],
    ["Gespeicherte Workouts", "Saved workouts", "已保存训练", "सेव किए गए वर्कआउट", "Entrenamientos guardados", "التمارين المحفوظة"],
    ["Sprache", "Language", "语言", "भाषा", "Idioma", "اللغة"],
    ["App-Sprache", "App language", "应用语言", "ऐप की भाषा", "Idioma de la app", "لغة التطبيق"],
    ["Die gesamte Oberfläche wird auf diesem Gerät umgestellt.", "The entire interface changes on this device.", "此设备上的整个界面都会切换。", "इस डिवाइस पर पूरा इंटरफ़ेस बदल जाएगा।", "Toda la interfaz cambiará en este dispositivo.", "ستتغير الواجهة بالكامل على هذا الجهاز."],
    ["Speichern", "Save", "保存", "सेव करें", "Guardar", "حفظ"],
    ["Abbrechen", "Cancel", "取消", "रद्द करें", "Cancelar", "إلغاء"],
    ["Weiter", "Continue", "继续", "आगे", "Continuar", "متابعة"],
    ["Zurück", "Back", "返回", "वापस", "Atrás", "رجوع"],
    ["RANKFORGE starten", "Start RANKFORGE", "启动 RANKFORGE", "RANKFORGE शुरू करें", "Iniciar RANKFORGE", "ابدأ RANKFORGE"],
    ["DEIN START", "YOUR START", "你的起点", "आपकी शुरुआत", "TU INICIO", "بدايتك"],
    ["Dein Training. Dein Rank.", "Your training. Your rank.", "你的训练，你的段位。", "आपकी ट्रेनिंग। आपका रैंक।", "Tu entrenamiento. Tu rango.", "تدريبك. رتبتك."],
    ["Nur eine kurze Frage nach der anderen.", "One short question at a time.", "每次只回答一个小问题。", "एक समय में सिर्फ़ एक छोटा सवाल।", "Una pregunta breve cada vez.", "سؤال قصير واحد في كل مرة."],
    ["Welche Sprache möchtest du verwenden?", "Which language would you like to use?", "你想使用哪种语言？", "आप कौन-सी भाषा इस्तेमाल करना चाहते हैं?", "¿Qué idioma quieres usar?", "ما اللغة التي تريد استخدامها؟"],
    ["Wie alt bist du?", "How old are you?", "你多大了？", "आपकी उम्र क्या है?", "¿Cuántos años tienes?", "كم عمرك؟"],
    ["Alter", "Age", "年龄", "उम्र", "Edad", "العمر"],
    ["Warum trainierst du?", "Why do you train?", "你为什么训练？", "आप ट्रेनिंग क्यों करते हैं?", "¿Por qué entrenas?", "لماذا تتمرن؟"],
    ["Muskelaufbau", "Build muscle", "增肌", "मांसपेशियाँ बनाना", "Ganar músculo", "بناء العضلات"],
    ["Stärker werden", "Get stronger", "增强力量", "मज़बूत बनना", "Ganar fuerza", "زيادة القوة"],
    ["Allgemeine Fitness", "General fitness", "综合健身", "सामान्य फिटनेस", "Fitness general", "لياقة عامة"],
    ["Kraft & Technik", "Strength & technique", "力量与技术", "ताकत और तकनीक", "Fuerza y técnica", "القوة والتقنية"],
    ["Wie hast du RANKFORGE entdeckt?", "How did you discover RANKFORGE?", "你是如何发现 RANKFORGE 的？", "आपको RANKFORGE कैसे मिला?", "¿Cómo descubriste RANKFORGE?", "كيف تعرفت على RANKFORGE؟"],
    ["Social Media", "Social media", "社交媒体", "सोशल मीडिया", "Redes sociales", "وسائل التواصل"],
    ["Freunde oder Familie", "Friends or family", "朋友或家人", "दोस्त या परिवार", "Amigos o familia", "الأصدقاء أو العائلة"],
    ["App Store oder Google Play", "App Store or Google Play", "App Store 或 Google Play", "App Store या Google Play", "App Store o Google Play", "App Store أو Google Play"],
    ["Google oder Websuche", "Google or web search", "Google 或网页搜索", "Google या वेब सर्च", "Google o búsqueda web", "Google أو بحث الويب"],
    ["Gym oder Trainer", "Gym or coach", "健身房或教练", "जिम या ट्रेनर", "Gimnasio o entrenador", "النادي أو المدرب"],
    ["Sonstiges", "Other", "其他", "अन्य", "Otro", "أخرى"],
    ["Welcher Körper soll deinen Bodygraph zeigen?", "Which body should your bodygraph show?", "你的身体图应显示哪种体型？", "आपके बॉडीग्राफ में कौन-सा शरीर दिखे?", "¿Qué cuerpo debe mostrar tu gráfico corporal?", "أي جسم تريد عرضه في مخططك؟"],
    ["Frau", "Woman", "女性", "महिला", "Mujer", "امرأة"],
    ["Mann", "Man", "男性", "पुरुष", "Hombre", "رجل"],
    ["Wie viel wiegst du?", "How much do you weigh?", "你的体重是多少？", "आपका वज़न कितना है?", "¿Cuánto pesas?", "كم وزنك؟"],
    ["Körpergewicht", "Body weight", "体重", "शरीर का वज़न", "Peso corporal", "وزن الجسم"],
    ["Einheit", "Unit", "单位", "इकाई", "Unidad", "الوحدة"],
    ["Wie viel Trainingserfahrung hast du?", "How much training experience do you have?", "你有多少训练经验？", "आपको ट्रेनिंग का कितना अनुभव है?", "¿Cuánta experiencia tienes entrenando?", "ما مقدار خبرتك في التدريب؟"],
    ["Einsteiger", "Beginner", "初学者", "शुरुआती", "Principiante", "مبتدئ"],
    ["Fortgeschritten", "Intermediate", "进阶", "मध्यम", "Intermedio", "متوسط"],
    ["Erfahren", "Experienced", "有经验", "अनुभवी", "Experimentado", "متقدم"],
    ["Wie oft möchtest du pro Woche trainieren?", "How often would you like to train each week?", "你每周想训练几次？", "आप हर सप्ताह कितनी बार ट्रेनिंग करना चाहते हैं?", "¿Cuántas veces quieres entrenar por semana?", "كم مرة تريد أن تتمرن أسبوعيًا؟"],
    ["An welchen Tagen trainierst du meistens?", "Which days do you usually train?", "你通常在哪些天训练？", "आप आमतौर पर किन दिनों में ट्रेनिंग करते हैं?", "¿Qué días sueles entrenar?", "في أي أيام تتمرن عادة؟"],
    ["Montag", "Monday", "星期一", "सोमवार", "Lunes", "الاثنين"],
    ["Dienstag", "Tuesday", "星期二", "मंगलवार", "Martes", "الثلاثاء"],
    ["Mittwoch", "Wednesday", "星期三", "बुधवार", "Miércoles", "الأربعاء"],
    ["Donnerstag", "Thursday", "星期四", "गुरुवार", "Jueves", "الخميس"],
    ["Freitag", "Friday", "星期五", "शुक्रवार", "Viernes", "الجمعة"],
    ["Samstag", "Saturday", "星期六", "शनिवार", "Sábado", "السبت"],
    ["Sonntag", "Sunday", "星期日", "रविवार", "Domingo", "الأحد"],
    ["Bitte wähle mindestens einen Trainingstag.", "Please choose at least one training day.", "请至少选择一个训练日。", "कृपया कम से कम एक ट्रेनिंग दिन चुनें।", "Elige al menos un día de entrenamiento.", "اختر يوم تدريب واحدًا على الأقل."],
    ["Profil eingerichtet", "Profile set up", "个人资料已设置", "प्रोफ़ाइल तैयार है", "Perfil configurado", "تم إعداد الملف"],
    ["Deine Antworten bleiben lokal auf diesem Gerät.", "Your answers stay locally on this device.", "你的回答仅保存在此设备上。", "आपके जवाब इसी डिवाइस पर स्थानीय रूप से रहते हैं।", "Tus respuestas permanecen en este dispositivo.", "تبقى إجاباتك محليًا على هذا الجهاز."],
    ["Neu in dieser Version", "New in this version", "此版本新增", "इस संस्करण में नया", "Novedades de esta versión", "الجديد في هذا الإصدار"],
    ["Verstanden", "Got it", "知道了", "समझ गया", "Entendido", "فهمت"],
    ["Sicherheit & Backup", "Security & backup", "安全与备份", "सुरक्षा और बैकअप", "Seguridad y copia", "الأمان والنسخ الاحتياطي"],
    ["Darstellung", "Appearance", "外观", "दिखावट", "Apariencia", "المظهر"],
    ["Dunkel", "Dark", "深色", "डार्क", "Oscuro", "داكن"],
    ["Hell", "Light", "浅色", "लाइट", "Claro", "فاتح"],
    ["Systemeinstellung", "System setting", "系统设置", "सिस्टम सेटिंग", "Ajuste del sistema", "إعداد النظام"],
    ["Aktualisieren", "Refresh", "刷新", "रीफ़्रेश", "Actualizar", "تحديث"],
    ["Freund hinzufügen", "Add friend", "添加好友", "दोस्त जोड़ें", "Añadir amigo", "إضافة صديق"],
    ["Workout importieren", "Import workout", "导入训练", "वर्कआउट आयात करें", "Importar entrenamiento", "استيراد تمرين"],
    ["Suchen", "Search", "搜索", "खोजें", "Buscar", "بحث"],
    ["Löschen", "Delete", "删除", "हटाएँ", "Eliminar", "حذف"],
    ["Bearbeiten", "Edit", "编辑", "संपादित करें", "Editar", "تعديل"],
    ["Pausentimer", "Rest timer", "休息计时器", "रेस्ट टाइमर", "Temporizador de descanso", "مؤقت الراحة"],
    ["Pausentimer ändern", "Change rest timer", "更改休息计时器", "रेस्ट टाइमर बदलें", "Cambiar temporizador", "تغيير مؤقت الراحة"],
    ["Timer verwenden?", "Use a timer?", "使用计时器？", "टाइमर इस्तेमाल करें?", "¿Usar temporizador?", "هل تريد استخدام المؤقت؟"],
    ["Du entscheidest bei jedem Workout neu.", "Choose again for every workout.", "每次训练都可重新选择。", "हर वर्कआउट के लिए फिर चुनें।", "Elige de nuevo en cada entrenamiento.", "اختر من جديد في كل تمرين."],
    ["Ja, Pausentimer verwenden", "Yes, use rest timer", "是，使用休息计时器", "हाँ, रेस्ट टाइमर इस्तेमाल करें", "Sí, usar temporizador", "نعم، استخدم مؤقت الراحة"],
    ["Nein, ohne Timer trainieren", "No, train without timer", "否，不使用计时器训练", "नहीं, बिना टाइमर ट्रेन करें", "No, entrenar sin temporizador", "لا، تمرّن بدون مؤقت"],
    ["Ist der Timer aus, startet nach einem Satz keine Pause.", "When the timer is off, no countdown starts after a set.", "关闭计时器后，完成一组不会开始倒计时。", "टाइमर बंद होने पर सेट के बाद काउंटडाउन शुरू नहीं होगा।", "Con el temporizador apagado no empieza una cuenta atrás tras una serie.", "عند إيقاف المؤقت لن يبدأ العد التنازلي بعد المجموعة."],
    ["Automatischer Start", "Automatic start", "自动开始", "अपने आप शुरू", "Inicio automático", "بدء تلقائي"],
    ["Nach jedem abgehakten Satz beginnt die gewählte Pause.", "The selected rest starts after every completed set.", "每完成一组就开始所选休息时间。", "हर पूरे सेट के बाद चुना गया विश्राम शुरू होता है।", "El descanso elegido empieza tras cada serie completada.", "تبدأ الراحة المحددة بعد كل مجموعة مكتملة."],
    ["Training ohne Pausentimer", "Workout without rest timer", "不使用休息计时器训练", "बिना रेस्ट टाइमर वर्कआउट", "Entrenamiento sin temporizador", "تمرين بدون مؤقت راحة"],
    ["Alle Übungen und Ranks funktionieren weiter. Es läuft nur kein Countdown.", "All exercises and ranks still work; only the countdown is disabled.", "所有动作和段位照常工作，只是不运行倒计时。", "सभी एक्सरसाइज़ और रैंक काम करते रहेंगे; केवल काउंटडाउन बंद रहेगा।", "Todos los ejercicios y rangos siguen funcionando; solo se desactiva la cuenta atrás.", "تستمر جميع التمارين والرتب بالعمل؛ يتوقف العد التنازلي فقط."],
    ["Workout ohne Timer starten", "Start workout without timer", "开始无计时器训练", "बिना टाइमर वर्कआउट शुरू करें", "Iniciar sin temporizador", "ابدأ التمرين بدون مؤقت"],
    ["Timer ausschalten", "Turn timer off", "关闭计时器", "टाइमर बंद करें", "Desactivar temporizador", "أوقف المؤقت"],
    ["Timer übernehmen", "Apply timer", "应用计时器", "टाइमर लागू करें", "Aplicar temporizador", "اعتماد المؤقت"],
    ["TIMER AUS", "TIMER OFF", "计时器关闭", "टाइमर बंद", "TEMPORIZADOR APAGADO", "المؤقت متوقف"],
    ["Workout ohne Pausentimer", "Workout without rest timer", "不使用休息计时器训练", "बिना रेस्ट टाइमर वर्कआउट", "Entrenamiento sin temporizador", "تمرين بدون مؤقت راحة"],
    ["Timer aus", "Timer off", "计时器关闭", "टाइमर बंद", "Temporizador apagado", "المؤقت متوقف"],
    ["AUSFÜHRUNG & GEWICHT", "EXECUTION & WEIGHT", "动作与重量", "निष्पादन और वजन", "EJECUCIÓN Y PESO", "الأداء والوزن"],
    ["Beidseitig", "Bilateral", "双侧", "दोनों तरफ", "Bilateral", "ثنائي الجانب"],
    ["Einseitig", "Unilateral", "单侧", "एक तरफ", "Unilateral", "أحادي الجانب"],
    ["Eingegebenes Gesamtgewicht", "Entered total weight", "输入总重量", "दर्ज कुल वजन", "Peso total introducido", "الوزن الإجمالي المُدخل"],
    ["Gewicht pro Seite", "Weight per side", "每侧重量", "हर तरफ का वजन", "Peso por lado", "الوزن لكل جانب"],
    ["Einseitiges Gewicht wird nicht mehr künstlich verdoppelt. So entstehen keine unrealistischen Schulter-Ranks.", "Unilateral weight is no longer artificially doubled, preventing unrealistic shoulder ranks.", "单侧重量不再被人为翻倍，从而避免不真实的肩部段位。", "एकतरफा वजन अब कृत्रिम रूप से दोगुना नहीं होगा, जिससे अवास्तविक शोल्डर रैंक नहीं बनेंगे।", "El peso unilateral ya no se duplica artificialmente, evitando rangos de hombro irreales.", "لن تتم مضاعفة الوزن الأحادي اصطناعياً، مما يمنع رتب الكتف غير الواقعية."],
    ["Schließen", "Close", "关闭", "बंद करें", "Cerrar", "إغلاق"]
  ];

  const indexByLanguage = Object.fromEntries(LANGUAGES.map((item, index) => [item.code, index]));
  const dictionaries = Object.fromEntries(LANGUAGES.map((language, index) => [language.code, new Map(PHRASES.map(row => [row[0], row[index] || row[1] || row[0]]))]));

  function readLanguage() {
    let saved = "de";
    try { saved = localStorage.getItem(STORAGE_KEY) || "de"; } catch {}
    return indexByLanguage[saved] === undefined ? "de" : saved;
  }

  let current = readLanguage();

  function t(value, language = current) {
    const text = String(value ?? "");
    return dictionaries[language]?.get(text) || text;
  }

  function dynamic(text, language) {
    const byLanguage = {
      en: [
        [/^(\d+) Ranks aktiv$/, "$1 active ranks"],
        [/^(\d+) Tage Streak$/, "$1-day streak"],
        [/^(\d+)er Streak · noch (\d+) Tage$/, "$1-workout streak · $2 days left"],
        [/^(\d+)er Streak · heute trainieren$/, "$1-workout streak · train today"],
        [/^(\d+)er Trainings-Streak, noch (\d+) Tage bis zum nächsten Training$/, "$1-workout streak, $2 days until the next workout"],
        [/^(\d+) Athleten$/, "$1 athletes"],
        [/^(\d+) GSR benötigt$/, "$1 GSR required"],
        [/^(\d+) von (\d+) Bereichen aktiv · Erneut antippen zum Abwählen$/, "$1 of $2 areas active · Tap again to deselect"]
      ],
      zh: [
        [/^(\d+) Ranks aktiv$/, "$1 个段位已激活"],
        [/^(\d+) Tage Streak$/, "连续 $1 天"],
        [/^(\d+)er Streak · noch (\d+) Tage$/, "连续 $1 次训练 · 剩余 $2 天"],
        [/^(\d+)er Streak · heute trainieren$/, "连续 $1 次训练 · 今天训练"],
        [/^(\d+)er Trainings-Streak, noch (\d+) Tage bis zum nächsten Training$/, "连续 $1 次训练，距下次训练还有 $2 天"],
        [/^(\d+) Athleten$/, "$1 名运动员"],
        [/^(\d+) GSR benötigt$/, "需要 $1 GSR"],
        [/^(\d+) von (\d+) Bereichen aktiv · Erneut antippen zum Abwählen$/, "$2 个区域中 $1 个已激活 · 再次点击取消选择"]
      ],
      hi: [
        [/^(\d+) Ranks aktiv$/, "$1 रैंक सक्रिय"],
        [/^(\d+) Tage Streak$/, "$1 दिन की स्ट्रीक"],
        [/^(\d+)er Streak · noch (\d+) Tage$/, "$1 वर्कआउट स्ट्रीक · $2 दिन बाकी"],
        [/^(\d+)er Streak · heute trainieren$/, "$1 वर्कआउट स्ट्रीक · आज ट्रेन करें"],
        [/^(\d+)er Trainings-Streak, noch (\d+) Tage bis zum nächsten Training$/, "$1 वर्कआउट स्ट्रीक, अगले वर्कआउट तक $2 दिन"],
        [/^(\d+) Athleten$/, "$1 एथलीट"],
        [/^(\d+) GSR benötigt$/, "$1 GSR आवश्यक"],
        [/^(\d+) von (\d+) Bereichen aktiv · Erneut antippen zum Abwählen$/, "$2 में से $1 क्षेत्र सक्रिय · चयन हटाने के लिए फिर टैप करें"]
      ],
      es: [
        [/^(\d+) Ranks aktiv$/, "$1 rangos activos"],
        [/^(\d+) Tage Streak$/, "Racha de $1 días"],
        [/^(\d+)er Streak · noch (\d+) Tage$/, "Racha de $1 entrenamientos · quedan $2 días"],
        [/^(\d+)er Streak · heute trainieren$/, "Racha de $1 entrenamientos · entrena hoy"],
        [/^(\d+)er Trainings-Streak, noch (\d+) Tage bis zum nächsten Training$/, "Racha de $1 entrenamientos, $2 días para el próximo"],
        [/^(\d+) Athleten$/, "$1 atletas"],
        [/^(\d+) GSR benötigt$/, "Se necesitan $1 GSR"],
        [/^(\d+) von (\d+) Bereichen aktiv · Erneut antippen zum Abwählen$/, "$1 de $2 zonas activas · Toca de nuevo para deseleccionar"]
      ],
      ar: [
        [/^(\d+) Ranks aktiv$/, "$1 رتب نشطة"],
        [/^(\d+) Tage Streak$/, "سلسلة $1 أيام"],
        [/^(\d+)er Streak · noch (\d+) Tage$/, "سلسلة $1 تمارين · بقي $2 أيام"],
        [/^(\d+)er Streak · heute trainieren$/, "سلسلة $1 تمارين · تمرّن اليوم"],
        [/^(\d+)er Trainings-Streak, noch (\d+) Tage bis zum nächsten Training$/, "سلسلة $1 تمارين، $2 أيام حتى التمرين التالي"],
        [/^(\d+) Athleten$/, "$1 رياضيين"],
        [/^(\d+) GSR benötigt$/, "مطلوب $1 GSR"],
        [/^(\d+) von (\d+) Bereichen aktiv · Erneut antippen zum Abwählen$/, "$1 من $2 مناطق نشطة · اضغط مجددًا لإلغاء التحديد"]
      ]
    };
    let output = text;
    for (const [expression, replacement] of byLanguage[language] || []) {
      if (expression.test(output)) return output.replace(expression, replacement);
    }
    return output;
  }

  function translateTextNode(node, language) {
    const raw = node.nodeValue || "";
    const trimmed = raw.trim();
    if (!trimmed) return;
    const translated = dynamic(t(trimmed, language), language);
    if (translated === trimmed) return;
    const leading = raw.match(/^\s*/)?.[0] || "";
    const trailing = raw.match(/\s*$/)?.[0] || "";
    node.nodeValue = `${leading}${translated}${trailing}`;
  }

  function translateRoot(root = document.getElementById("app")) {
    const language = current;
    const config = LANGUAGES[indexByLanguage[language]];
    document.documentElement.lang = language === "zh" ? "zh-CN" : language;
    document.documentElement.dir = config.dir;
    document.documentElement.dataset.language = language;
    if (!root || language === "de") return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent || parent.closest("script,style,[data-rf920-no-translate]") || parent.matches("option")) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => translateTextNode(node, language));
    root.querySelectorAll("[aria-label],[placeholder],[title]").forEach(element => {
      for (const attribute of ["aria-label", "placeholder", "title"]) {
        if (!element.hasAttribute(attribute)) continue;
        const original = element.getAttribute(attribute) || "";
        const translated = dynamic(t(original, language), language);
        if (translated !== original) element.setAttribute(attribute, translated);
      }
    });
  }

  function optionsMarkup(selected = current) {
    return LANGUAGES.map(language => `<option value="${language.code}" ${language.code === selected ? "selected" : ""}>${language.label}</option>`).join("");
  }

  function ensureQuickPicker() {
    const root = document.getElementById("app");
    if (!root) return;
    const gate = root.querySelector(".rf75-auth,.v7-gate,.rf920-onboarding");
    let picker = document.querySelector(".rf920-language-quick");
    if (!gate) {
      picker?.remove();
      return;
    }
    if (!picker) {
      picker = document.createElement("label");
      picker.className = "rf920-language-quick";
      picker.setAttribute("data-rf920-no-translate", "");
      picker.innerHTML = `<span aria-hidden="true">🌐</span><select data-rf920-language aria-label="Sprache">${optionsMarkup()}</select>`;
      document.body.append(picker);
    } else {
      const select = picker.querySelector("select");
      if (select && select.value !== current) select.value = current;
    }
  }

  function apply() {
    ensureQuickPicker();
    translateRoot();
  }

  function setLanguage(language, { rerender = true } = {}) {
    if (indexByLanguage[language] === undefined) language = "de";
    current = language;
    try { localStorage.setItem(STORAGE_KEY, language); } catch {}
    document.dispatchEvent(new CustomEvent("rankforge:language", { detail: { language } }));
    if (rerender && window.RANKFORGE_APP?.render) window.RANKFORGE_APP.render();
    queueMicrotask(apply);
    return current;
  }

  let queued = false;
  const observer = new MutationObserver(() => {
    if (queued) return;
    queued = true;
    queueMicrotask(() => { queued = false; apply(); });
  });
  const start = () => {
    observer.observe(document.getElementById("app") || document.body, { childList: true, subtree: true });
    apply();
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();

  document.addEventListener("change", event => {
    const select = event.target?.closest?.("[data-rf920-language]");
    if (!select) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    setLanguage(select.value);
  }, true);

  window.RANKFORGE_I18N = Object.freeze({
    version: "9.2.0",
    languages: LANGUAGES,
    get language() { return current; },
    t,
    setLanguage,
    translateRoot,
    optionsMarkup
  });
})();
/* end-rankforge-i18n-v920 */
