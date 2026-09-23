/* RANKFORGE 10.2 — triathlon expansion originating from the 9.7 line */
((AppClass) => {
  "use strict";

  const VERSION = "10.2";
  const BUILD = "1020-r1";
  const SCHEMA = 29;
  const STATE_VERSION = 1;
  const SPORT_KEYS = ["swim", "run", "bike"];

  const COPY = Object.freeze({
    de: {
      nav: "Sport", kicker: "SPORTARTEN", title: "Dein Training hat vier Bereiche.",
      intro: "Muskelaufbau, Schwimmen, Laufen und Radfahren sind getrennte Unterkategorien mit eigenem Fortschritt.",
      swim: "Schwimmen", run: "Laufen", bike: "Radfahren", add: "Einheit eintragen",
      current: "AKTUELLER RANG", next: "bis", best: "Bestwert", volume: "Distanz · 28 Tage",
      sessions: "Einheiten · 28 Tage", coach: "NÄCHSTE EINHEIT", ladder: "Alle neun Sport-Ränge",
      history: "Letzte Einheiten", empty: "Noch keine Einheit in dieser Disziplin.",
      animalNote: "Die Abzeichen zeigen neun sportbezogene Leistungsstufen. Die Rangpunkte sind eine Schätzung aus deiner Leistung und Regelmäßigkeit.",
      distance: "Distanz", duration: "Dauer", minutes: "Minuten", seconds: "Sekunden", date: "Datum",
      effort: "Belastung", save: "Einheit speichern", delete: "Einheit löschen", sourceGarmin: "Garmin Swim Lab",
      sourceManual: "Manuell", score: "Disziplin-Score", reached: "Erreicht", locked: "Noch gesperrt",
      noNext: "Höchster Sport-Rang erreicht", combined: "TRIATHLON-STATUS", open: "Triathlon öffnen",
      saved: "Einheit gespeichert", removed: "Einheit entfernt", invalid: "Bitte Distanz und Dauer vollständig eingeben.",
      rankUp: "Neuer Sport-Rang", formHint: "Distanz und Zeit bestimmen den Leistungswert; Regelmäßigkeit gibt einen kleinen Bonus.",
      garminHint: "Garmin-Aktivitäten können verbunden oder als Datei importiert werden.",
      openGarmin: "Garmin öffnen", rank: "Rang", strength: "Muskelaufbau", allSports: "Alle Sportarten",
      categories: "VIER TRAININGSBEREICHE", categoryHint: "Jeder Bereich besitzt eine eigene Oberfläche und Auswertung.",
      openCategory: "Bereich öffnen", garminConnect: "Garmin verbinden", garminSync: "Jetzt synchronisieren",
      garminImport: "Garmin-Datei importieren", garminReady: "Garmin-Schnittstelle vorbereitet",
      garminUnavailable: "Für die direkte Verbindung fehlt noch die Garmin-Freigabe. Dateiimport funktioniert sofort.",
      garminConnected: "Garmin verbunden", garminDisconnected: "Noch nicht verbunden", importDone: "Garmin-Aktivitäten importiert"
    },
    en: {
      nav: "Sports", kicker: "SPORTS", title: "Your training has four areas.",
      intro: "Strength, swimming, running and cycling are separate categories with their own progress.",
      swim: "Swimming", run: "Running", bike: "Cycling", add: "Log activity",
      current: "CURRENT RANK", next: "to", best: "Best effort", volume: "Distance · 28 days",
      sessions: "Sessions · 28 days", coach: "NEXT SESSION", ladder: "All nine animal ranks",
      history: "Recent activities", empty: "No activity in this discipline yet.",
      animalNote: "Animals are motivational performance tiers. Your pace is not equated with an animal's real speed.",
      distance: "Distance", duration: "Duration", minutes: "Minutes", seconds: "Seconds", date: "Date",
      effort: "Effort", save: "Save activity", delete: "Delete activity", sourceGarmin: "Garmin Swim Lab",
      sourceManual: "Manual", score: "Discipline score", reached: "Reached", locked: "Locked",
      noNext: "Highest animal rank reached", combined: "TRIATHLON STATUS", open: "Open triathlon",
      saved: "Activity saved", removed: "Activity removed", invalid: "Enter a valid distance and duration.",
      rankUp: "New animal rank", formHint: "Distance and time shape the performance score; consistency adds a small bonus.",
      garminHint: "Garmin activities can be connected or imported from a file.",
      openGarmin: "Open Garmin", rank: "Rank", strength: "Strength", allSports: "All sports",
      categories: "FOUR TRAINING AREAS", categoryHint: "Each area has its own surface and performance view.",
      openCategory: "Open area", garminConnect: "Connect Garmin", garminSync: "Sync now",
      garminImport: "Import Garmin file", garminReady: "Garmin interface ready",
      garminUnavailable: "Garmin approval is still required for direct connection. File import works now.",
      garminConnected: "Garmin connected", garminDisconnected: "Not connected", importDone: "Garmin activities imported"
    },
    zh: {
      nav: "运动", kicker: "运动领域", title: "你的训练分为四个领域。", intro: "力量训练、游泳、跑步和骑行是四个独立的进步领域。",
      swim: "游泳", run: "跑步", bike: "骑行", add: "记录训练", current: "当前等级", next: "距离", best: "最佳表现",
      volume: "28 天距离", sessions: "28 天训练", coach: "下一次训练", ladder: "九个动物等级", history: "最近训练",
      empty: "此项目还没有训练。", animalNote: "动物代表激励等级，并不表示人类速度等于动物真实速度。", distance: "距离",
      duration: "用时", minutes: "分钟", seconds: "秒", date: "日期", effort: "强度", save: "保存训练", delete: "删除训练",
      sourceGarmin: "Garmin 游泳实验室", sourceManual: "手动", score: "项目积分", reached: "已达成", locked: "未解锁",
      noNext: "已达到最高动物等级", combined: "铁人三项状态", open: "打开铁人三项", saved: "训练已保存", removed: "训练已删除",
      invalid: "请输入有效的距离和时间。", rankUp: "新动物等级", formHint: "距离与时间决定表现分，规律训练会获得小额加成。",
      garminHint: "可连接 Garmin 活动或从文件导入。", openGarmin: "打开 Garmin", rank: "等级", strength: "力量训练", allSports: "所有运动",
      categories: "四个训练领域", categoryHint: "每个领域都有自己的界面和评估。", openCategory: "打开领域",
      garminConnect: "连接 Garmin", garminSync: "立即同步", garminImport: "导入 Garmin 文件", garminReady: "Garmin 接口已准备",
      garminUnavailable: "直接连接仍需 Garmin 审批。文件导入现在即可使用。", garminConnected: "Garmin 已连接", garminDisconnected: "尚未连接", importDone: "项 Garmin 活动已导入"
    },
    hi: {
      nav: "खेल", kicker: "खेल क्षेत्र", title: "आपके प्रशिक्षण के चार क्षेत्र हैं।", intro: "मांसपेशी निर्माण, तैराकी, दौड़ और साइकिल अलग-अलग प्रगति क्षेत्र हैं।",
      swim: "तैराकी", run: "दौड़", bike: "साइकिल", add: "सेशन जोड़ें", current: "मौजूदा रैंक", next: "तक", best: "सर्वश्रेष्ठ",
      volume: "दूरी · 28 दिन", sessions: "सेशन · 28 दिन", coach: "अगला सेशन", ladder: "नौ पशु रैंक", history: "हाल के सेशन",
      empty: "इस खेल में अभी कोई सेशन नहीं है।", animalNote: "पशु प्रेरक स्तर हैं; आपकी गति को वास्तविक पशु गति के बराबर नहीं माना जाता।",
      distance: "दूरी", duration: "समय", minutes: "मिनट", seconds: "सेकंड", date: "तारीख", effort: "मेहनत", save: "सेशन सेव करें",
      delete: "सेशन हटाएँ", sourceGarmin: "Garmin Swim Lab", sourceManual: "मैनुअल", score: "खेल स्कोर", reached: "हासिल", locked: "लॉक",
      noNext: "सबसे ऊँचा पशु रैंक हासिल", combined: "ट्रायथलॉन स्थिति", open: "ट्रायथलॉन खोलें", saved: "सेशन सेव हुआ",
      removed: "सेशन हटाया गया", invalid: "सही दूरी और समय दर्ज करें।", rankUp: "नया पशु रैंक",
      formHint: "दूरी और समय प्रदर्शन तय करते हैं; नियमितता छोटा बोनस देती है।", garminHint: "मौजूदा Garmin तैराकी सेशन अपने आप तैराकी रैंक में जुड़ते हैं।",
      openGarmin: "Garmin खोलें", rank: "रैंक", strength: "मांसपेशी निर्माण", allSports: "सभी खेल",
      categories: "चार प्रशिक्षण क्षेत्र", categoryHint: "हर क्षेत्र की अपनी स्क्रीन और मूल्यांकन है।", openCategory: "क्षेत्र खोलें",
      garminConnect: "Garmin जोड़ें", garminSync: "अभी सिंक करें", garminImport: "Garmin फ़ाइल आयात करें", garminReady: "Garmin इंटरफ़ेस तैयार है",
      garminUnavailable: "सीधे कनेक्शन के लिए Garmin की मंज़ूरी बाकी है। फ़ाइल आयात अभी काम करता है।", garminConnected: "Garmin जुड़ा है", garminDisconnected: "अभी जुड़ा नहीं", importDone: "Garmin गतिविधियाँ आयात हुईं"
    },
    es: {
      nav: "Deportes", kicker: "ÁREAS DEPORTIVAS", title: "Tu entrenamiento tiene cuatro áreas.", intro: "Musculación, natación, carrera y ciclismo son categorías separadas con progreso propio.",
      swim: "Natación", run: "Carrera", bike: "Ciclismo", add: "Registrar sesión", current: "RANGO ACTUAL", next: "hasta",
      best: "Mejor marca", volume: "Distancia · 28 días", sessions: "Sesiones · 28 días", coach: "PRÓXIMA SESIÓN",
      ladder: "Los nueve rangos animales", history: "Sesiones recientes", empty: "Aún no hay sesiones en esta disciplina.",
      animalNote: "Los animales son niveles motivadores; tu ritmo no se equipara a la velocidad real del animal.", distance: "Distancia",
      duration: "Duración", minutes: "Minutos", seconds: "Segundos", date: "Fecha", effort: "Esfuerzo", save: "Guardar sesión",
      delete: "Eliminar sesión", sourceGarmin: "Garmin Swim Lab", sourceManual: "Manual", score: "Puntuación", reached: "Logrado",
      locked: "Bloqueado", noNext: "Rango animal máximo alcanzado", combined: "ESTADO TRIATLÓN", open: "Abrir triatlón",
      saved: "Sesión guardada", removed: "Sesión eliminada", invalid: "Introduce una distancia y duración válidas.", rankUp: "Nuevo rango animal",
      formHint: "Distancia y tiempo forman la puntuación; la constancia añade un pequeño bonus.", garminHint: "Las sesiones Garmin de natación cuentan automáticamente.",
      openGarmin: "Abrir Garmin", rank: "Rango", strength: "Musculación", allSports: "Todos los deportes",
      categories: "CUATRO ÁREAS DE ENTRENAMIENTO", categoryHint: "Cada área tiene su propia interfaz y evaluación.", openCategory: "Abrir área",
      garminConnect: "Conectar Garmin", garminSync: "Sincronizar ahora", garminImport: "Importar archivo Garmin", garminReady: "Interfaz Garmin preparada",
      garminUnavailable: "La conexión directa aún requiere la aprobación de Garmin. La importación de archivos ya funciona.", garminConnected: "Garmin conectado", garminDisconnected: "Aún sin conectar", importDone: "actividades Garmin importadas"
    },
    ar: {
      nav: "الرياضات", kicker: "مجالات الرياضة", title: "لتدريبك أربعة مجالات.", intro: "بناء العضلات والسباحة والجري وركوب الدراجة فئات منفصلة لكل منها تقدمها الخاص.",
      swim: "السباحة", run: "الجري", bike: "الدراجة", add: "سجّل حصة", current: "الرتبة الحالية", next: "حتى", best: "أفضل أداء",
      volume: "المسافة · 28 يوماً", sessions: "الحصص · 28 يوماً", coach: "الحصة التالية", ladder: "الرتب الحيوانية التسع",
      history: "أحدث الحصص", empty: "لا توجد حصة في هذه الرياضة بعد.", animalNote: "الحيوانات مستويات تحفيزية ولا تعني أن سرعتك تساوي سرعة الحيوان الحقيقية.",
      distance: "المسافة", duration: "المدة", minutes: "دقائق", seconds: "ثوانٍ", date: "التاريخ", effort: "الجهد", save: "حفظ الحصة",
      delete: "حذف الحصة", sourceGarmin: "مختبر Garmin للسباحة", sourceManual: "يدوي", score: "نقاط الرياضة", reached: "محقق",
      locked: "مغلق", noNext: "تم بلوغ أعلى رتبة حيوانية", combined: "حالة الترايثلون", open: "فتح الترايثلون",
      saved: "تم حفظ الحصة", removed: "تم حذف الحصة", invalid: "أدخل مسافة ومدة صحيحتين.", rankUp: "رتبة حيوانية جديدة",
      formHint: "تحدد المسافة والوقت نقاط الأداء، ويضيف الانتظام مكافأة صغيرة.", garminHint: "تُحتسب حصص Garmin الموجودة تلقائياً ضمن رتبة السباحة.",
      openGarmin: "فتح Garmin", rank: "الرتبة", strength: "بناء العضلات", allSports: "كل الرياضات",
      categories: "أربعة مجالات تدريب", categoryHint: "لكل مجال واجهته وتقييمه الخاص.", openCategory: "فتح المجال",
      garminConnect: "ربط Garmin", garminSync: "المزامنة الآن", garminImport: "استيراد ملف Garmin", garminReady: "واجهة Garmin جاهزة",
      garminUnavailable: "لا يزال الاتصال المباشر يحتاج إلى موافقة Garmin. استيراد الملفات يعمل الآن.", garminConnected: "Garmin متصل", garminDisconnected: "غير متصل بعد", importDone: "تم استيراد أنشطة Garmin"
    }
  });

  const ANIMALS = Object.freeze({
    swim: [
      ["🫧", "Seepferdchen", "Seahorse", "海马", "समुद्री घोड़ा", "Caballito de mar", "فرس البحر"],
      ["🪼", "Qualle", "Jellyfish", "水母", "जेलीफ़िश", "Medusa", "قنديل البحر"],
      ["🦦", "Seeotter", "Sea otter", "海獭", "समुद्री ऊदबिलाव", "Nutria marina", "قضاعة البحر"],
      ["🐢", "Meeresschildkröte", "Sea turtle", "海龟", "समुद्री कछुआ", "Tortuga marina", "سلحفاة بحرية"],
      ["🐧", "Pinguin", "Penguin", "企鹅", "पेंगुइन", "Pingüino", "بطريق"],
      ["🐬", "Delfin", "Dolphin", "海豚", "डॉल्फ़िन", "Delfín", "دلفين"],
      ["🐋", "Orca", "Orca", "虎鲸", "ऑर्का", "Orca", "حوت قاتل"],
      ["🐟", "Marlin", "Marlin", "枪鱼", "मार्लिन", "Marlín", "مارلن"],
      ["🐠", "Segelfisch", "Sailfish", "旗鱼", "सेलफ़िश", "Pez vela", "سمكة شراعية"]
    ],
    run: [
      ["🐢", "Schildkröte", "Tortoise", "陆龟", "कछुआ", "Tortuga", "سلحفاة"],
      ["🐨", "Koala", "Koala", "考拉", "कोआला", "Koala", "كوالا"],
      ["🦡", "Dachs", "Badger", "獾", "बिज्जू", "Tejón", "غرير"],
      ["🐗", "Wildschwein", "Wild boar", "野猪", "जंगली सूअर", "Jabalí", "خنزير بري"],
      ["🐺", "Wolf", "Wolf", "狼", "भेड़िया", "Lobo", "ذئب"],
      ["🐎", "Pferd", "Horse", "马", "घोड़ा", "Caballo", "حصان"],
      ["🦁", "Löwe", "Lion", "狮子", "शेर", "León", "أسد"],
      ["🦌", "Gabelbock", "Pronghorn", "叉角羚", "प्रॉन्गहॉर्न", "Berrendo", "ظبي أمريكي"],
      ["🐆", "Gepard", "Cheetah", "猎豹", "चीता", "Guepardo", "فهد" ]
    ],
    bike: [
      ["🦋", "Schmetterling", "Butterfly", "蝴蝶", "तितली", "Mariposa", "فراشة"],
      ["🐝", "Hummel", "Bumblebee", "熊蜂", "भौंरा", "Abejorro", "نحلة طنانة"],
      ["🐦", "Spatz", "Sparrow", "麻雀", "गौरैया", "Gorrión", "عصفور"],
      ["🦉", "Eule", "Owl", "猫头鹰", "उल्लू", "Búho", "بومة"],
      ["🕊️", "Möwe", "Gull", "海鸥", "समुद्री चिड़िया", "Gaviota", "نورس"],
      ["🐦‍⬛", "Rabe", "Raven", "渡鸦", "काला कौआ", "Cuervo", "غراب"],
      ["🌊", "Albatros", "Albatross", "信天翁", "अल्बाट्रॉस", "Albatros", "قطرس"],
      ["🦅", "Steinadler", "Golden eagle", "金雕", "सुनहरा बाज", "Águila real", "عقاب ذهبي"],
      ["🪽", "Wanderfalke", "Peregrine falcon", "游隼", "शाहीन बाज", "Halcón peregrino", "صقر الشاهين"]
    ]
  });

  const SPORT = Object.freeze({
    swim: { color: "#32c7ff", color2: "#005cff", distanceUnit: "m", inputUnit: "m", minDistance: 25, qualifyDistance: 200, baseDistance: 400, eliteDistance: 5000, speedFloor: .45, speedElite: 1.85, planDistances: [600, 800, 1000, 1200, 1500, 1800, 2200, 2800, 3500] },
    run: { color: "#64df74", color2: "#e0a126", distanceUnit: "km", inputUnit: "km", minDistance: .25, qualifyDistance: 1, baseDistance: 1, eliteDistance: 21.1, speedFloor: 5, speedElite: 22, planDistances: [2, 3, 4, 5, 6, 8, 10, 13, 16] },
    bike: { color: "#b788ff", color2: "#ffbd3f", distanceUnit: "km", inputUnit: "km", minDistance: 1, qualifyDistance: 5, baseDistance: 5, eliteDistance: 100, speedFloor: 12, speedElite: 45, planDistances: [10, 15, 20, 30, 40, 55, 70, 90, 120] }
  });

  // Product calibration for comparable in-app progress across the two body
  // profiles supported by RankForge. It adjusts the measured pace before it
  // enters the shared 0–899 ladder; distance and consistency stay unchanged.
  // These are balancing factors, not medical or competition classifications.
  const PROFILE_SPEED_FACTORS = Object.freeze({
    male: Object.freeze({ swim: 1, run: 1, bike: 1 }),
    female: Object.freeze({ swim: 1.08, run: 1.10, bike: 1.11 }),
    unspecified: Object.freeze({ swim: 1, run: 1, bike: 1 })
  });

  const languageIndex = Object.freeze({ de: 1, en: 2, zh: 3, hi: 4, es: 5, ar: 6 });
  const lang = () => window.RANKFORGE_I18N?.language || "de";
  const copy = key => (COPY[lang()] || COPY.de)[key] || COPY.de[key] || key;
  function rankBadge(sport, index = 0) {
    return window.EVORANK_ART_X51?.badge(sport, index) || ANIMALS[sport]?.[index]?.[0] || "•";
  }

  const animalName = entry => entry[languageIndex[lang()] || 1] || entry[1];
  const finite = value => Number.isFinite(Number(value)) ? Number(value) : 0;
  const between = (value, min, max) => Math.min(max, Math.max(min, finite(value)));
  const dayMs = 86400000;

  function normalizeBodyProfile(value, fallback = "unspecified") {
    const normalized = String(value || "").trim().toLowerCase();
    if (["female", "weiblich", "frau", "f"].includes(normalized)) return "female";
    if (["male", "männlich", "maennlich", "mann", "m"].includes(normalized)) return "male";
    return fallback;
  }

  function appBodyProfile(app) {
    return normalizeBodyProfile(app?.state?.profile?.bodyProfile || app?.state?.profile?.sex, "unspecified");
  }

  const CATEGORY_META = Object.freeze({
    strength: { color: "#ef725f", color2: "#b54736", icon: "dumbbell" },
    swim: { color: SPORT.swim.color, color2: SPORT.swim.color2, icon: "waves" },
    run: { color: SPORT.run.color, color2: SPORT.run.color2, icon: "footprints" },
    bike: { color: SPORT.bike.color, color2: SPORT.bike.color2, icon: "bike" }
  });
  const CATEGORY_KEYS = Object.freeze(["strength", ...SPORT_KEYS]);

  const CATEGORY_TEXT = Object.freeze({
    de: {
      strength: ["Muskelaufbau", "Workouts, Bodygraph und dein Gym-Rank"],
      swim: ["Schwimmen", "Wasser-Ränge, Pace und Schwimmpläne"],
      run: ["Laufen", "Landtier-Ränge, Pace und Lauftraining"],
      bike: ["Radfahren", "Lufttier-Ränge, Tempo und Ausfahrten"],
      swimIntro: "Im Wasser zählen Pace, Distanz und Regelmäßigkeit. Dein Sport-Rang entwickelt sich nur in dieser Unterkategorie.",
      runIntro: "Beim Laufen zählen Tempo, Distanz und Regelmäßigkeit. Landtiere markieren deinen eigenen Fortschritt.",
      bikeIntro: "Beim Radfahren zählen Geschwindigkeit, Distanz und Regelmäßigkeit. Lufttiere bilden deine Rangstufen."
    },
    en: {
      strength: ["Strength", "Workouts, bodygraph and your gym rank"],
      swim: ["Swimming", "Water ranks, pace and swim plans"],
      run: ["Running", "Land-animal ranks, pace and run training"],
      bike: ["Cycling", "Air-animal ranks, speed and rides"],
      swimIntro: "Swimming uses pace, distance and consistency. This animal rank belongs only to the swimming category.",
      runIntro: "Running uses speed, distance and consistency. Land animals mark your personal progress.",
      bikeIntro: "Cycling uses speed, distance and consistency. Air animals form your rank ladder."
    },
    zh: {
      strength: ["力量训练", "训练、身体图和健身等级"], swim: ["游泳", "水生动物等级、配速和游泳计划"],
      run: ["跑步", "陆地动物等级、配速和跑步训练"], bike: ["骑行", "飞行动物等级、速度和骑行训练"],
      swimIntro: "游泳依据配速、距离和规律性。这个动物等级只属于游泳领域。",
      runIntro: "跑步依据速度、距离和规律性。陆地动物标记你的个人进步。",
      bikeIntro: "骑行依据速度、距离和规律性。飞行动物组成你的等级阶梯。"
    },
    hi: {
      strength: ["मांसपेशी निर्माण", "वर्कआउट, बॉडीग्राफ और आपका जिम रैंक"], swim: ["तैराकी", "जल-जीव रैंक, गति और तैराकी योजनाएँ"],
      run: ["दौड़", "स्थल-जीव रैंक, गति और रन प्रशिक्षण"], bike: ["साइकिल", "उड़ने वाले जीवों के रैंक, रफ़्तार और राइड"],
      swimIntro: "तैराकी में गति, दूरी और नियमितता गिनी जाती है। यह पशु रैंक केवल तैराकी क्षेत्र का है।",
      runIntro: "दौड़ में गति, दूरी और नियमितता गिनी जाती है। स्थल-जीव आपकी व्यक्तिगत प्रगति दिखाते हैं।",
      bikeIntro: "साइकिल में रफ़्तार, दूरी और नियमितता गिनी जाती है। उड़ने वाले जीव रैंक सीढ़ी बनाते हैं।"
    },
    es: {
      strength: ["Musculación", "Entrenos, bodygraph y rango de gimnasio"], swim: ["Natación", "Rangos acuáticos, ritmo y planes de natación"],
      run: ["Carrera", "Rangos terrestres, ritmo y entrenamiento"], bike: ["Ciclismo", "Rangos aéreos, velocidad y salidas"],
      swimIntro: "En natación cuentan el ritmo, la distancia y la constancia. Este rango animal pertenece solo a esta área.",
      runIntro: "En carrera cuentan la velocidad, la distancia y la constancia. Los animales terrestres marcan tu progreso.",
      bikeIntro: "En ciclismo cuentan la velocidad, la distancia y la constancia. Los animales aéreos forman tu escala de rangos."
    },
    ar: {
      strength: ["بناء العضلات", "التمارين ومخطط الجسم ورتبة النادي"], swim: ["السباحة", "رتب مائية ووتيرة وخطط سباحة"],
      run: ["الجري", "رتب برية ووتيرة وتدريب الجري"], bike: ["ركوب الدراجة", "رتب جوية وسرعة وجولات"],
      swimIntro: "تعتمد السباحة على الوتيرة والمسافة والانتظام. رتبة الحيوان هذه تخص مجال السباحة فقط.",
      runIntro: "يعتمد الجري على السرعة والمسافة والانتظام. تمثل الحيوانات البرية تقدمك الشخصي.",
      bikeIntro: "يعتمد ركوب الدراجة على السرعة والمسافة والانتظام. تكوّن الحيوانات الجوية سلم الرتب."
    }
  });

  function categoryText(key) {
    const dictionary = CATEGORY_TEXT[lang()] || CATEGORY_TEXT.de;
    return dictionary[key] || CATEGORY_TEXT.de[key];
  }

  function pictogram(name, size = 24) {
    const paths = {
      waves: '<path d="M2 6c1.5 0 1.5 1 3 1s1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1"/><path d="M2 12c1.5 0 1.5 1 3 1s1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1"/><path d="M2 18c1.5 0 1.5 1 3 1s1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1"/>',
      footprints: '<path d="M4 15.5c0-2.5 1.3-4.5 3-4.5s3 2 3 4.5V17a3 3 0 0 1-6 0Z"/><path d="M14 7c0-2.2 1.3-4 3-4s3 1.8 3 4v1.5a3 3 0 0 1-6 0Z"/><path d="M6 8 5 5M9 8l1-3M16 14l-1 3M19 14l1 3"/>',
      bike: '<circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="m5.5 17.5 4-8h4l5 8M9.5 9.5l4 8M8 17.5h5.5M13.5 9.5 16 6h2M8 6h3"/>'
    };
    if (name === "dumbbell") return icon("dumbbell", size);
    return `<svg class="icon rf970-pictogram" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.waves}</svg>`;
  }

  function categoryIcon(category, size = 24) {
    return pictogram(CATEGORY_META[category]?.icon || "waves", size);
  }

  const garminConfig = () => window.RANKFORGE_GARMIN_CONNECT || {};

  function safeSameOriginUrl(value) {
    if (!value || typeof location === "undefined") return null;
    try {
      const url = new URL(String(value), location.origin);
      return url.origin === location.origin ? url : null;
    } catch { return null; }
  }

  function ensure(app) {
    if (!app?.state) return;
    app.state.triathlon ||= { version: STATE_VERSION, activeSport: "swim", activities: [] };
    const state = app.state.triathlon;
    state.version = STATE_VERSION;
    state.activeSport = SPORT_KEYS.includes(state.activeSport) ? state.activeSport : "swim";
    state.activities = Array.isArray(state.activities) ? state.activities.filter(item => SPORT_KEYS.includes(item?.sport)).slice(-750) : [];
    app.ui ||= {};
    app.ui.rf970Sport = SPORT_KEYS.includes(app.ui.rf970Sport) ? app.ui.rf970Sport : state.activeSport;
    app.state.garmin ||= { activities: [], nextPlan: null, lastImportAt: "" };
    app.state.garmin.connection ||= { status: "disconnected", lastSyncAt: "", lastCheckedAt: "" };
    if (!app.ui.rf970HashHandled && typeof location !== "undefined" && ["#triathlon", "#sports"].includes(location.hash.toLowerCase())) {
      app.ui.view = "sports";
      app.ui.rf970HashHandled = true;
    }
    app.state.appVersion = VERSION;
    app.state.schemaVersion = Math.max(SCHEMA, finite(app.state.schemaVersion));
  }

  function normalizedActivity(item, sport, source = "manual") {
    if (!SPORT_KEYS.includes(sport)) return null;
    const distanceMeters = finite(item.distanceMeters || (sport === "swim" ? item.distance : finite(item.distanceKm || item.distance) * 1000));
    const durationSeconds = finite(item.durationSeconds || item.duration || finite(item.durationMinutes) * 60);
    if (!(distanceMeters > 0 && durationSeconds > 0)) return null;
    const parsedDate = new Date(item.date || item.startedAt || item.timestamp || Date.now());
    if (Number.isNaN(parsedDate.getTime())) return null;
    return {
      id: String(item.id || `${source}-${sport}-${Date.now()}`),
      sport,
      date: parsedDate.toISOString(),
      distanceMeters,
      durationSeconds,
      effort: between(item.effort || item.rpe || 0, 0, 10),
      bodyProfile: normalizeBodyProfile(item.bodyProfile || item.sex, "unspecified"),
      ...window.EVORANK_ENDURANCE_X48?.fields(item),
      source
    };
  }

  function activities(app, sport) {
    ensure(app);
    const result = app.state.triathlon.activities.map(item => normalizedActivity(item, item.sport, item.source || "manual")).filter(Boolean).filter(item => item.sport === sport);
    if (sport === "swim") {
      for (const item of app.state.garmin?.activities || []) {
        const normalized = normalizedActivity({ ...item, id: `garmin-${item.id}` }, "swim", "garmin");
        if (normalized) result.push(normalized);
      }
    }
    return [...new Map(result.map(item => [item.id, item])).values()].sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  function garminSport(item, fallback = "") {
    const raw = String(item?.sport || item?.sportType || item?.activityType?.typeKey || item?.activityType?.parentTypeId || item?.type || item?.name || "").toLowerCase();
    if (/swim|pool|open.?water/.test(raw)) return "swim";
    if (/run|jog|trail/.test(raw)) return "run";
    if (/bike|bik|cycl|ride|velo/.test(raw)) return "bike";
    return SPORT_KEYS.includes(fallback) ? fallback : "";
  }

  function garminCandidates(payload) {
    if (Array.isArray(payload)) return payload;
    if (!payload || typeof payload !== "object") return [];
    for (const key of ["activities", "activityList", "data", "results", "summaries"]) {
      if (Array.isArray(payload[key])) return payload[key];
    }
    return [payload];
  }

  function parseGarminActivities(payload, fallbackSport = "") {
    return garminCandidates(payload).map((item, index) => {
      const sport = garminSport(item, fallbackSport);
      if (!sport) return null;
      const summary = item.summary || item.summaryDTO || item.activitySummary || {};
      const distanceMeters = finite(item.distanceMeters || item.distance || summary.distanceMeters || summary.distance);
      let durationSeconds = finite(item.durationSeconds || item.elapsedDuration || item.movingDuration || item.duration || summary.durationSeconds || summary.duration);
      if (durationSeconds > 604800) durationSeconds /= 1000;
      const date = item.date || item.startTime || item.startTimeLocal || item.startTimeGMT || item.startedAt || item.timestamp || summary.startTime;
      const id = item.id || item.activityId || item.activityUUID || summary.id || `${sport}-${date || "activity"}-${index}`;
      return normalizedActivity({
        id: `garmin-${sport}-${id}`,
        distanceMeters,
        durationSeconds,
        date,
        effort: item.effort || item.rpe || 0,
        ...window.EVORANK_ENDURANCE_X48?.fields({...summary,...item})
      }, sport, "garmin");
    }).filter(Boolean);
  }

  function xmlValue(node, name) {
    return node?.getElementsByTagNameNS?.("*", name)?.[0]?.textContent?.trim?.() || "";
  }

  function haversineMeters(a, b) {
    const radians = value => value * Math.PI / 180;
    const dLat = radians(b.lat - a.lat);
    const dLon = radians(b.lon - a.lon);
    const lat1 = radians(a.lat);
    const lat2 = radians(b.lat);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    return 12742000 * Math.asin(Math.min(1, Math.sqrt(h)));
  }

  function parseGarminXml(text, fallbackSport = "") {
    if (typeof DOMParser === "undefined") return [];
    const documentNode = new DOMParser().parseFromString(text, "application/xml");
    if (documentNode.querySelector?.("parsererror")) return [];
    const tcx = [...documentNode.getElementsByTagNameNS("*", "Activity")];
    if (tcx.length) return tcx.map((node, index) => {
      const sport = garminSport({ sport: node.getAttribute("Sport") }, fallbackSport);
      return normalizedActivity({
        id: `garmin-${sport || fallbackSport}-tcx-${xmlValue(node, "Id") || index}`,
        distanceMeters: finite(xmlValue(node, "DistanceMeters")),
        durationSeconds: finite(xmlValue(node, "TotalTimeSeconds")),
        date: xmlValue(node, "Id"),
        effort: 0
      }, sport || fallbackSport, "garmin");
    }).filter(Boolean);

    const points = [...documentNode.getElementsByTagNameNS("*", "trkpt")].map(node => ({
      lat: finite(node.getAttribute("lat")),
      lon: finite(node.getAttribute("lon")),
      time: Date.parse(xmlValue(node, "time"))
    })).filter(point => Number.isFinite(point.lat) && Number.isFinite(point.lon));
    if (points.length < 2 || !SPORT_KEYS.includes(fallbackSport)) return [];
    const distanceMeters = points.slice(1).reduce((sum, point, index) => sum + haversineMeters(points[index], point), 0);
    const durationSeconds = Math.max(1, (points.at(-1).time - points[0].time) / 1000);
    return [normalizedActivity({ id: `garmin-${fallbackSport}-gpx-${points[0].time || Date.now()}`, distanceMeters, durationSeconds, date: points[0].time }, fallbackSport, "garmin")].filter(Boolean);
  }

  async function parseGarminFile(file, fallbackSport) {
    const text = await file.text();
    const lower = String(file.name || "").toLowerCase();
    if (lower.endsWith(".json") || /^[\s\r\n]*[\[{]/.test(text)) return parseGarminActivities(JSON.parse(text), fallbackSport);
    return parseGarminXml(text, fallbackSport);
  }

  function storeGarminActivities(app, imported) {
    ensure(app);
    const bodyProfile = appBodyProfile(app);
    imported = imported.map(item => ({ ...item, bodyProfile:normalizeBodyProfile(item.bodyProfile, bodyProfile) }));
    const swims = imported.filter(item => item.sport === "swim");
    const endurance = imported.filter(item => item.sport !== "swim");
    if (swims.length) {
      const map = new Map((app.state.garmin.activities || []).map(item => [String(item.id), item]));
      for (const item of swims) map.set(String(item.id), { ...item, source: "Garmin Connect" });
      app.state.garmin.activities = [...map.values()].slice(-250);
      app.state.garmin.lastImportAt = new Date().toISOString();
    }
    if (endurance.length) {
      const map = new Map(app.state.triathlon.activities.map(item => [String(item.id), item]));
      for (const item of endurance) map.set(String(item.id), item);
      app.state.triathlon.activities = [...map.values()].slice(-750);
    }
    return swims.length + endurance.length;
  }

  async function refreshGarminConnection(app) {
    const endpoint = safeSameOriginUrl(garminConfig().statusPath);
    if (!endpoint || typeof fetch !== "function") return false;
    const expectedKey=app.accountKey,expectedEmail=window.RANKFORGE_ACCOUNT?.status?.().email;
    try {
      const token = await window.RANKFORGE_ACCOUNT?.getAccessToken?.();
      if (!token) return false;
      const response = await fetch(endpoint, {
        credentials: "same-origin",
        headers: { accept: "application/json", authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error(`garmin-status-${response.status}`);
      const data = await response.json();
      if(app.accountKey!==expectedKey||window.RANKFORGE_ACCOUNT?.status?.().email!==expectedEmail||(window.RANKFORGE_APP&&window.RANKFORGE_APP!==app))return false;
      app.state.garmin.connection.status = data.connected === true ? "connected" : "disconnected";
      app.state.garmin.connection.lastCheckedAt = new Date().toISOString();
      app.state.garmin.connection.accountLabel = String(data.accountLabel || "");
      app.scheduleSave?.();
      return data.connected === true;
    } catch (error) {
      console.warn("Garmin status", error);
      return false;
    }
  }

  async function syncGarmin(app) {
    const endpoint = safeSameOriginUrl(garminConfig().syncPath);
    if (!endpoint || typeof fetch !== "function") throw new Error("garmin-sync-unavailable");
    const token = await window.RANKFORGE_ACCOUNT?.getAccessToken?.();
    if (!token) throw new Error("garmin-sign-in-required");
    const response = await fetch(endpoint, {
      method: "POST",
      credentials: "same-origin",
      headers: { accept: "application/json", authorization: `Bearer ${token}` }
    });
    if (!response.ok) throw new Error(`garmin-sync-${response.status}`);
    const data = await response.json();
    const imported = parseGarminActivities(data.activities || data, "");
    const count = storeGarminActivities(app, imported);
    app.state.garmin.connection.status = "connected";
    app.state.garmin.connection.lastSyncAt = new Date().toISOString();
    app.scheduleSave?.();
    return count;
  }

  function activitySpeed(item) {
    const hours = item.durationSeconds / 3600;
    return item.sport === "swim" ? item.distanceMeters / item.durationSeconds : (item.distanceMeters / 1000) / hours;
  }

  function activityPerformance(item, fallbackProfile = "unspecified", now = new Date()) {
    if(window.EVORANK_ENDURANCE_X48)return window.EVORANK_ENDURANCE_X48.performance(item,fallbackProfile,SPORT[item.sport],now).score;
    const config = SPORT[item.sport];
    const distance = item.sport === "swim" ? item.distanceMeters : item.distanceMeters / 1000;
    const storedProfile = normalizeBodyProfile(item.bodyProfile || item.sex, "unspecified");
    const bodyProfile = storedProfile === "unspecified" ? normalizeBodyProfile(fallbackProfile) : storedProfile;
    const speed = activitySpeed(item) * (PROFILE_SPEED_FACTORS[bodyProfile]?.[item.sport] || 1);
    const speedScore = between((speed - config.speedFloor) / (config.speedElite - config.speedFloor), 0, 1);
    const distanceScore = Math.sqrt(between((distance - config.baseDistance) / (config.eliteDistance - config.baseDistance), 0, 1));
    const qualifier = between(distance / config.qualifyDistance, .25, 1);
    return Math.round(800 * (.72 * speedScore + .28 * distanceScore) * qualifier);
  }

  function sportMetrics(app, sport, now = new Date()) {
    const list = activities(app, sport).filter(item=>new Date(item.date).getTime()<=now.getTime());
    const bodyProfile = appBodyProfile(app);
    const cutoff = now.getTime() - 28 * dayMs;
    const recent = list.filter(item => new Date(item.date).getTime() >= cutoff);
    const scoreItem = item => activityPerformance(item, app.state.profile || bodyProfile, now);
    const best = list.reduce((winner, item) => !winner || scoreItem(item) > scoreItem(winner) ? item : winner, null);
    const bestPoints = best ? scoreItem(best) : 0;
    const uniqueDays = new Set(recent.map(item => item.date.slice(0, 10))).size;
    const consistency = Math.min(99, uniqueDays * 13);
    const score = Math.min(899, Math.round(bestPoints + consistency));
    const index = Math.min(8, Math.floor(score / 100));
    const totalMeters = recent.reduce((sum, item) => sum + item.distanceMeters, 0);
    const comparison=best?window.EVORANK_ENDURANCE_X48?.performance(best,app.state.profile,SPORT[sport],now):null;
    return { list, recent, best, score, index, consistency, totalMeters, bodyProfile, comparison, current: ANIMALS[sport][index], next: ANIMALS[sport][index + 1] || null };
  }

  function clock(seconds) {
    const total = Math.max(0, Math.round(finite(seconds)));
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor(total % 3600 / 60);
    const rest = total % 60;
    return hours ? `${hours}:${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}` : `${minutes}:${String(rest).padStart(2, "0")}`;
  }

  function performanceLabel(item) {
    if (!item) return "—";
    if (item.sport === "swim") return `${clock(item.durationSeconds / item.distanceMeters * 100)} / 100 m`;
    if (item.sport === "run") return `${clock(item.durationSeconds / (item.distanceMeters / 1000))} / km`;
    return `${activitySpeed(item).toFixed(1)} km/h`;
  }

  function distanceLabel(meters, sport, decimals = 1) {
    if (sport === "swim") return `${Math.round(meters).toLocaleString(lang())} m`;
    return `${(meters / 1000).toLocaleString(lang(), { maximumFractionDigits: decimals })} km`;
  }

  function shortDate(value) {
    try { return new Intl.DateTimeFormat(lang(), { day: "2-digit", month: "short", year: "2-digit" }).format(new Date(value)); }
    catch { return String(value || "").slice(0, 10); }
  }

  function sportIcon(sport, size = 20) {
    return categoryIcon(sport, size);
  }

  function coachPlan(metrics, sport) {
    const config = SPORT[sport];
    const target = config.planDistances[metrics.index];
    const latest = metrics.list[0];
    const recovery = latest?.effort >= 8;
    const intensity = recovery ? .78 : metrics.list.length ? .9 : .72;
    const baseSpeed = metrics.best ? activitySpeed(metrics.best) : sport === "swim" ? .7 : sport === "run" ? 8 : 18;
    const seconds = sport === "swim" ? target / Math.max(.35, baseSpeed * intensity) : target / Math.max(2, baseSpeed * intensity) * 3600;
    const names = sport === "swim"
      ? ["Technik & Wasserlage", "Ruhige Bahnen", "Pace finden", "Lange Züge", "Ausdauerblock", "Schwellen-Intervalle", "Tempo halten", "Race-Pace", "Segelfisch-Challenge"]
      : sport === "run"
        ? ["Run & Walk", "Lockerer Dauerlauf", "Rhythmuslauf", "Steady Run", "Fahrtspiel", "Tempolauf", "Langer Lauf", "Race-Pace", "Gepard-Challenge"]
        : ["Locker rollen", "Trittfrequenz", "Grundlage", "Ruhige Kilometer", "Tempoabschnitte", "Sweet Spot", "Lange Ausfahrt", "Race-Pace", "Falken-Challenge"];
    const detail = recovery
      ? (lang() === "de" ? "Die letzte Belastung war hoch. Heute bewusst locker und technisch sauber bleiben." : "Your latest effort was high. Keep this session controlled and technically clean.")
      : (lang() === "de" ? "Der Vorschlag wächst mit deinem Sport-Rang und bleibt etwas unter deinem besten Tempo." : "This session grows with your animal rank and stays just below your best pace.");
    return { name: names[metrics.index], target, seconds, detail, recovery };
  }

  function strengthLabel(app) {
    const rank = app.metrics?.rank || {};
    return String(rank.title || rank.name || rank.key || "Gym-Rank").replace(/^./, value => value.toUpperCase());
  }

  function categoryCard(app, category) {
    const meta = CATEGORY_META[category];
    const text = categoryText(category);
    const metrics = category === "strength" ? null : sportMetrics(app, category);
    const status = category === "strength"
      ? strengthLabel(app)
      : `${animalName(metrics.current)} · ${metrics.score} / 899`;
    return `<button class="rf970-category rf970-category--${category}" data-action="rf970-category" data-category="${category}" style="--category:${meta.color};--category-2:${meta.color2}"><span class="rf970-category__icon">${categoryIcon(category, 28)}</span><div><small>${escapeHtml(copy("openCategory"))}</small><h2>${escapeHtml(text[0])}</h2><p>${escapeHtml(text[1])}</p><strong>${escapeHtml(status)}</strong></div><i>${icon("chevronRight", 19)}</i></button>`;
  }

  function renderSportsHub(app) {
    ensure(app);
    return `<div class="screen rf970-sports-hub"><section class="rf970-hub-title"><small>${escapeHtml(copy("categories"))}</small><h1>${escapeHtml(copy("title"))}</h1><p>${escapeHtml(copy("categoryHint"))}</p></section><section class="rf970-category-grid">${CATEGORY_KEYS.map(category => categoryCard(app, category)).join("")}</section><section class="rf970-hub-note">${icon("info", 16)}<span>${escapeHtml(copy("animalNote"))}</span></section></div>`;
  }

  function renderHomeCard(app) {
    return `<button class="rf970-home-card" data-action="navigate" data-view="sports"><span class="rf970-home-card__mark">${categoryIcon("strength", 16)}${categoryIcon("swim", 16)}${categoryIcon("run", 16)}${categoryIcon("bike", 16)}</span><div><small>${escapeHtml(copy("categories"))}</small><strong>${escapeHtml(copy("strength"))} · ${escapeHtml(copy("swim"))} · ${escapeHtml(copy("run"))} · ${escapeHtml(copy("bike"))}</strong><em>${escapeHtml(copy("categoryHint"))}</em></div>${icon("chevronRight", 18)}</button>`;
  }

  function garminCount(app, sport) {
    return activities(app, sport).filter(item => item.source === "garmin").length;
  }

  function renderGarminCard(app, sport) {
    const connection = app.state.garmin.connection || {};
    const connected = connection.status === "connected";
    const count = garminCount(app, sport);
    const status = connected ? copy("garminConnected") : garminConfig().connectPath ? copy("garminDisconnected") : copy("garminReady");
    return `<section class="rf970-garmin-card"><span>${categoryIcon(sport, 22)}</span><div><small>GARMIN CONNECT</small><strong>${escapeHtml(status)}</strong><p>${count ? `${count} ${escapeHtml(copy("sessions").split(" · ")[0].toLowerCase())} · ${escapeHtml(copy(sport))}` : escapeHtml(copy("garminHint"))}</p></div><button class="button button--secondary" data-action="rf970-open-garmin">${icon("refresh", 15)} ${escapeHtml(copy("openGarmin"))}</button></section>`;
  }

  function renderTriathlon(app) {
    ensure(app);
    const sport = app.ui.rf970Sport;
    const config = SPORT[sport];
    const metrics = sportMetrics(app, sport);
    const plan = coachPlan(metrics, sport);
    const progress = metrics.index === 8 ? 100 : metrics.score % 100;
    const nextLabel = metrics.next ? `${100 - progress} ${copy("next")} ${animalName(metrics.next)}` : copy("noNext");
    const history = metrics.list.slice(0, 8);
    const distance = sport === "swim" ? `${Math.round(plan.target).toLocaleString(lang())} m` : `${plan.target.toLocaleString(lang())} km`;
    const ladder = ANIMALS[sport].map((entry, index) => `<article class="rf970-rank ${index < metrics.index ? "is-reached" : index === metrics.index ? "is-current" : "is-locked"}" style="--rank-step:${index}"><span>${rankBadge(sport, index)}</span><div><small>${copy("rank")} ${index + 1}</small><strong>${escapeHtml(animalName(entry))}</strong><em>${index < metrics.index ? copy("reached") : index === metrics.index ? copy("current") : copy("locked")}</em></div>${index <= metrics.index ? icon("check", 16) : icon("lock", 15)}</article>`).join("");
    const historyHtml = history.length ? history.map(item => `<article class="rf970-history-row"><span>${sportIcon(sport, 17)}</span><div><strong>${distanceLabel(item.distanceMeters, sport)} · ${clock(item.durationSeconds)}</strong><small>${shortDate(item.date)} · ${performanceLabel(item)} · ${({gps:"GPS",pool:"Bahnenzähler",timer:"Timer"})[item.source] || (item.source === "garmin" ? copy("sourceGarmin") : copy("sourceManual"))}</small></div>${item.source === "garmin" ? "" : `<button data-action="rf970-delete" data-activity-id="${escapeAttr(item.id)}" aria-label="${escapeAttr(copy("delete"))}">${icon("trash", 15)}</button>`}</article>`).join("") : `<div class="rf970-empty"><span>${rankBadge(sport, metrics.index)}</span><strong>${escapeHtml(copy("empty"))}</strong><button class="button button--primary" data-action="rf970-add">${escapeHtml(copy("add"))}</button></div>`;

    const category = categoryText(sport);
    return `<div class="screen rf970-screen rf970-screen--${sport}" style="--sport:${config.color};--sport-2:${config.color2}">
      <section class="rf970-detail-nav"><button data-action="rf970-sports-home">${icon("chevronLeft", 16)} ${escapeHtml(copy("allSports"))}</button><span>${categoryIcon(sport, 17)} ${escapeHtml(category[0])}</span></section>
      <section class="rf970-title"><span class="rf970-title__icon">${categoryIcon(sport, 30)}</span><div><small>${escapeHtml(copy("kicker"))} · ${escapeHtml(category[0].toUpperCase())}</small><h1>${escapeHtml(category[0])}</h1><p>${escapeHtml(categoryText(`${sport}Intro`))}</p></div><button class="circle-button" data-action="rf970-add" aria-label="${escapeAttr(copy("add"))}">${icon("plus", 20)}</button></section>
      <section class="rf970-hero"><div class="rf970-animal"><span>${rankBadge(sport, metrics.index)}</span><i></i></div><div class="rf970-hero__copy"><small>${escapeHtml(copy("current"))} · ${escapeHtml(copy(sport))}</small><h2>${escapeHtml(animalName(metrics.current))}</h2><p>${metrics.score} / 899 ${escapeHtml(copy("score"))}</p><div class="rf970-progress"><i style="width:${progress}%"></i></div><em>${escapeHtml(nextLabel)}</em></div><button class="button button--primary" data-action="rf970-add">${icon("plus", 16)} ${escapeHtml(copy("add"))}</button></section>
      <section class="rf970-metrics"><article><small>${escapeHtml(copy("best"))}</small><strong>${performanceLabel(metrics.best)}</strong><span>${metrics.best ? distanceLabel(metrics.best.distanceMeters, sport) : "—"}</span></article><article><small>${escapeHtml(copy("volume"))}</small><strong>${distanceLabel(metrics.totalMeters, sport)}</strong><span>${metrics.recent.length} ${escapeHtml(copy("sessions").split(" · ")[0].toLowerCase())}</span></article><article><small>${escapeHtml(copy("sessions"))}</small><strong>${metrics.recent.length}</strong><span>+${metrics.consistency} ${escapeHtml(copy("score"))}</span></article></section>
      ${renderGarminCard(app, sport)}
      <section class="rf970-coach"><header><span>${sportIcon(sport, 21)}</span><div><small>${escapeHtml(copy("coach"))}</small><h2>${escapeHtml(plan.name)}</h2></div><strong>${distance}</strong></header><details class="rfx47-plan-details"><summary>${lang() === "de" ? "Trainingsempfehlung anzeigen" : "Show training suggestion"}</summary><div class="rf970-coach__meta"><span>${icon("timer", 15)} ${clock(plan.seconds)}</span><span>${icon("activity", 15)} ${metrics.best ? performanceLabel(metrics.best) : escapeHtml(copy("rank")) + " 1"}</span></div><p>${escapeHtml(plan.detail)}</p></details>${sport === "swim" ? `<button class="button button--secondary button--wide" data-action="rf82-open-garmin">${icon("activity", 16)} ${lang() === "de" ? "Schwimmplan analysieren" : "Analyse swim plan"}</button>` : ""}</section>
      <section class="rf970-section"><div class="section-heading"><h2>${escapeHtml(copy("ladder"))}</h2><span>1–9</span></div><div class="rf970-ladder">${ladder}</div><p class="rf970-note">${icon("info", 15)} ${escapeHtml(copy("animalNote"))}</p></section>
      <section class="rf970-section"><div class="section-heading"><h2>${escapeHtml(copy("history"))}</h2><button data-action="rf970-add">${escapeHtml(copy("add"))} ${icon("plus", 15)}</button></div><div class="rf970-history">${historyHtml}</div></section>
    </div>`;
  }

  function renderActivityModal(app) {
    ensure(app);
    const sport = app.ui.rf970Sport;
    const config = SPORT[sport];
    const today = new Date().toISOString().slice(0, 10);
    const distanceStep = sport === "swim" ? 25 : .1;
    const distanceValue = sport === "swim" ? 1000 : sport === "run" ? 5 : 25;
    const effortHint = lang() === "de" ? "1 = locker · 10 = maximal" : "1 = easy · 10 = maximal";
    return `${app.modalHeader(copy("kicker"), `${copy(sport)} · ${copy("add")}`)}<form class="modal-form rf970-form" data-form="rf970-activity"><div class="modal-scroll"><div class="rf970-form__animal"><span>${rankBadge(sport, sportMetrics(app, sport).index)}</span><div><strong>${escapeHtml(animalName(sportMetrics(app, sport).current))}</strong><small>${escapeHtml(copy("formHint"))}</small></div></div><div class="v7-field-grid"><label class="modal-field"><span>${escapeHtml(copy("distance"))} (${config.inputUnit})</span><input name="distance" type="number" inputmode="decimal" min="${config.minDistance}" step="${distanceStep}" value="${distanceValue}" required autofocus></label><label class="modal-field"><span>${escapeHtml(copy("date"))}</span><input name="date" type="date" value="${today}" max="${today}" required></label></div><div class="v7-field-grid"><label class="modal-field"><span>${escapeHtml(copy("minutes"))}</span><input name="minutes" type="number" inputmode="numeric" min="0" max="1440" value="${sport === "swim" ? 30 : sport === "run" ? 32 : 70}" required></label><label class="modal-field"><span>${escapeHtml(copy("seconds"))}</span><input name="seconds" type="number" inputmode="numeric" min="0" max="59" value="0" required></label></div><label class="modal-field"><span>${escapeHtml(copy("effort"))} · RPE 1–10</span><input name="effort" type="range" min="1" max="10" value="6"><small>${escapeHtml(effortHint)}</small></label>${sport === "bike" ? window.EVORANK_ENDURANCE_X48.input(app) : ""}${sport === "swim" ? `<p class="rf970-form__hint">${icon("info", 15)} ${escapeHtml(copy("garminHint"))}</p>` : ""}</div><footer class="modal-footer"><button class="button button--secondary" type="button" data-action="close-modal">${escapeHtml(window.RANKFORGE_I18N?.t("Abbrechen") || "Abbrechen")}</button><button class="button button--primary" type="submit">${escapeHtml(copy("save"))}</button></footer></form>`;
  }

  function renderGarminModal(app) {
    ensure(app);
    const sport = app.ui.rf970Sport;
    const connection = app.state.garmin.connection || {};
    const connected = connection.status === "connected";
    const configured = Boolean(safeSameOriginUrl(garminConfig().connectPath));
    const status = connected ? copy("garminConnected") : copy("garminDisconnected");
    const detail = configured
      ? (lang() === "de" ? "Die sichere Anmeldung läuft über den EvoRank-Server. Zugangsdaten oder Garmin-Tokens werden niemals in der App gespeichert." : "Secure sign-in runs through the EvoRank server. Credentials and Garmin tokens are never stored in the app.")
      : copy("garminUnavailable");
    const syncLabel = connected ? copy("garminSync") : copy("garminConnect");
    return `${app.modalHeader("GARMIN CONNECT", copy(sport))}<div class="modal-scroll rf970-garmin-modal"><section class="rf970-garmin-status ${connected ? "is-connected" : ""}"><span>${icon(connected ? "check" : "cloud", 22)}</span><div><small>${escapeHtml(status)}</small><strong>${connected && connection.accountLabel ? escapeHtml(connection.accountLabel) : "Garmin Connect"}</strong><p>${escapeHtml(detail)}</p></div></section><button class="button button--primary button--wide" data-action="${connected ? "rf970-garmin-sync" : "rf970-garmin-connect"}">${icon(connected ? "refresh" : "cloud", 17)} ${escapeHtml(syncLabel)}</button><div class="rf970-garmin-divider"><span>${lang() === "de" ? "ODER LOKAL" : "OR LOCAL"}</span></div><label class="button button--secondary button--wide">${icon("upload", 17)} ${escapeHtml(copy("garminImport"))}<input hidden type="file" accept="application/json,.json,application/xml,text/xml,.tcx,.gpx" data-action="rf970-garmin-file"></label><p class="rf970-garmin-privacy">${icon("shield", 15)} ${lang() === "de" ? "JSON-, TCX- und GPX-Dateien werden nur auf diesem Gerät verarbeitet. Die gewählte Sportart dient als Zuordnung, wenn die Datei keinen Typ enthält." : "JSON, TCX and GPX files are processed only on this device. The current sport is used when the file has no type."}</p>${sport === "swim" ? `<button class="button button--secondary button--wide" data-action="rf82-open-garmin">${icon("activity", 16)} Garmin Swim Lab</button>` : ""}</div>`;
  }

  const proto = AppClass.prototype;
  const previous = {
    renderHome: proto.renderHome,
    renderBottomNav: proto.renderBottomNav,
    renderModal: proto.renderModal,
    handleClick: proto.handleClick,
    handleChange: proto.handleChange,
    handleSubmit: proto.handleSubmit,
    render: proto.render,
    init: proto.init
  };

  proto.renderHome = function(...args) {
    ensure(this);
    if (this.ui.view === "sports") return renderSportsHub(this);
    if (this.ui.view === "triathlon") return renderTriathlon(this);
    let html = previous.renderHome.apply(this, args);
    html = html.replace(/<button class="rf83-swim-home-card"[\s\S]*?<\/button>/, "");
    const card = renderHomeCard(this);
    const marker = '<section class="week-section">';
    if (html.includes(marker)) html = html.replace(marker, `${card}${marker}`);
    else html += card;
    return html;
  };

  proto.renderBottomNav = function(...args) {
    let html = previous.renderBottomNav.apply(this, args);
    const current = ["sports", "triathlon"].includes(this.ui.view) ? " is-active" : "";
    const item = `<button class="nav-item rf970-nav${current}" data-action="navigate" data-view="sports">${icon("layout", 22)}<span>${escapeHtml(copy("nav"))}</span></button>`;
    const rankButton = /<button class="nav-item [^"]*" data-action="navigate" data-view="ranks"/;
    if (rankButton.test(html)) html = html.replace(rankButton, match => `${item}${match}`);
    else html = html.replace("</nav>", `${item}</nav>`);
    return html;
  };

  proto.renderModal = function(...args) {
    if (this.ui.modal?.type === "rf970-activity") return `<div class="modal-backdrop" data-action="close-modal"><section class="modal modal--sheet" role="dialog" aria-modal="true">${renderActivityModal(this)}</section></div>`;
    if (this.ui.modal?.type === "rf970-garmin") return `<div class="modal-backdrop" data-action="close-modal"><section class="modal modal--sheet" role="dialog" aria-modal="true">${renderGarminModal(this)}</section></div>`;
    return previous.renderModal.apply(this, args);
  };

  proto.handleClick = async function(event) {
    const element = event.target?.closest?.("[data-action]");
    const action = element?.dataset?.action;
    if (action === "rf970-category") {
      event.preventDefault();
      const category = String(element.dataset.category || "strength");
      ensure(this);
      if (category === "strength") {
        this.ui.view = "home";
      } else if (SPORT_KEYS.includes(category)) {
        this.ui.rf970Sport = category;
        this.state.triathlon.activeSport = category;
        this.ui.view = "triathlon";
      }
      this.scheduleSave?.();
      window.scrollTo?.({ top: 0, behavior: "smooth" });
      this.render();
      return;
    }
    if (action === "rf970-sports-home") {
      event.preventDefault();
      this.ui.view = "sports";
      window.scrollTo?.({ top: 0, behavior: "smooth" });
      this.render();
      return;
    }
    if (action === "rf970-sport") {
      event.preventDefault();
      const sport = SPORT_KEYS.includes(element.dataset.sport) ? element.dataset.sport : "swim";
      ensure(this);
      this.ui.rf970Sport = sport;
      this.state.triathlon.activeSport = sport;
      this.scheduleSave?.();
      this.render();
      return;
    }
    if (action === "rf970-add") {
      event.preventDefault();
      ensure(this);
      this.openModal("rf970-activity");
      return;
    }
    if (action === "rf970-open-garmin") {
      event.preventDefault();
      ensure(this);
      this.openModal("rf970-garmin");
      return;
    }
    if (action === "rf970-garmin-connect") {
      event.preventDefault();
      const endpoint = safeSameOriginUrl(garminConfig().connectPath);
      if (!endpoint) {
        this.showToast(copy("garminUnavailable"));
        return;
      }
      endpoint.searchParams.set("return_to", `${location.pathname}${location.search}#sports`);
      location.assign(endpoint.toString());
      return;
    }
    if (action === "rf970-garmin-sync") {
      event.preventDefault();
      try {
        const count = await syncGarmin(this);
        this.render();
        this.showToast(`${count} ${copy("importDone")}`);
      } catch (error) {
        console.warn("Garmin sync", error);
        this.showToast(copy("garminUnavailable"));
      }
      return;
    }
    if (action === "rf970-delete") {
      event.preventDefault();
      ensure(this);
      this.state.triathlon.activities = this.state.triathlon.activities.filter(item => String(item.id) !== String(element.dataset.activityId));
      this.scheduleSave?.();
      this.render();
      this.showToast(copy("removed"));
      return;
    }
    return previous.handleClick.call(this, event);
  };

  proto.handleChange = async function(event) {
    if (event.target?.dataset?.action === "rf970-garmin-file") {
      const file = event.target.files?.[0];
      if (!file) return;
      ensure(this);
      try {
        const imported = await parseGarminFile(file, this.ui.rf970Sport);
        if (!imported.length) throw new Error("no-garmin-activities");
        const count = storeGarminActivities(this, imported);
        this.ui.modal = null;
        this.scheduleSave?.();
        this.render();
        this.showToast(`${count} ${copy("importDone")}`);
      } catch (error) {
        console.warn("Garmin file", error);
        this.showToast(lang() === "de" ? "Keine passende Garmin-Aktivität gefunden" : "No matching Garmin activity found");
      } finally {
        event.target.value = "";
      }
      return;
    }
    return previous.handleChange?.call(this, event);
  };

  proto.handleSubmit = async function(event) {
    const form = event.target?.closest?.("form[data-form]");
    if (form?.dataset?.form === "rf970-activity") {
      event.preventDefault();
      ensure(this);
      const data = new FormData(form);
      const sport = this.ui.rf970Sport;
      const config = SPORT[sport];
      const distanceInput = finite(data.get("distance"));
      const durationSeconds = Math.round(finite(data.get("minutes")) * 60 + finite(data.get("seconds")));
      if (!(distanceInput >= config.minDistance && durationSeconds > 0)) {
        this.showToast(copy("invalid"));
        return;
      }
      const before = sportMetrics(this, sport).index;
      this.state.triathlon.activities.push({
        id: `tri-${sport}-${Date.now()}`,
        sport,
        date: new Date(`${String(data.get("date") || new Date().toISOString().slice(0, 10))}T12:00:00`).toISOString(),
        distanceMeters: sport === "swim" ? Math.round(distanceInput) : Math.round(distanceInput * 1000),
        durationSeconds,
        effort: between(data.get("effort"), 1, 10),
        bodyProfile: appBodyProfile(this),
        ...(sport==="bike"?window.EVORANK_ENDURANCE_X48.powerFields(data.get("enduranceBodyweightKg"),data.get("averagePowerWatts")):window.EVORANK_ENDURANCE_X48.fields({bodyweightKg:this.state.profile?.bodyweightKg})),
        source: "manual"
      });
      this.state.triathlon.activities = this.state.triathlon.activities.slice(-750);
      const after = sportMetrics(this, sport).index;
      this.ui.modal = null;
      this.scheduleSave?.();
      this.render();
      this.showToast(after > before ? `${copy("rankUp")}: ${animalName(ANIMALS[sport][after])}` : copy("saved"));
      return;
    }
    return previous.handleSubmit.call(this, event);
  };

  proto.render = function(...args) {
    ensure(this);
    return previous.render.apply(this, args);
  };

  proto.init = async function(...args) {
    const result = await previous.init.apply(this, args);
    ensure(this);
    // Online provider status must not block opening local workouts.
    refreshGarminConnection(this).catch(() => {});
    this.scheduleSave?.();
    this.render();
    return result;
  };

  window.RANKFORGE970 = Object.freeze({
    version: VERSION,
    build: BUILD,
    stateVersion: STATE_VERSION,
    sports: SPORT_KEYS,
    categories: CATEGORY_KEYS,
    animals: ANIMALS,
    rankBadge,
    profileSpeedFactors: PROFILE_SPEED_FACTORS,
    normalizeBodyProfile,
    ensure,
    activityPerformance,
    performanceDetails: (item, profile, now) => window.EVORANK_ENDURANCE_X48.performance(item, profile, SPORT[item?.sport], now),
    parseGarminActivities,
    storeGarminActivities,
    sportMetrics: (sport, app = window.RANKFORGE_APP, now) => sportMetrics(app, sport, now)
  });
})(LiftoffApp);
/* end-rankforge-v970-triathlon */
