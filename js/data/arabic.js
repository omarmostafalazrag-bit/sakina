// "Árabe desde cero": alphabet, vowels, reading rules and vocabulary, for Spanish speakers.

// join: false for the six letters that never join to the next one
export const LETTERS = [
  { ch: 'ا', name: 'Alif', tr: 'ā', sound: 'Alarga la «a». También sirve de apoyo para la hamza.', join: false, ex: { ar: 'أَب', tr: 'ab', es: 'padre' } },
  { ch: 'ب', name: 'Ba', tr: 'b', sound: 'Como la «b» de «barco».', join: true, ex: { ar: 'بَاب', tr: 'bāb', es: 'puerta' } },
  { ch: 'ت', name: 'Ta', tr: 't', sound: 'Como la «t» de «taza».', join: true, ex: { ar: 'تَمْر', tr: 'tamr', es: 'dátiles' } },
  { ch: 'ث', name: 'Tha', tr: 'th', sound: 'Como la «z» de «zapato» en España.', join: true, ex: { ar: 'ثَلَاثَة', tr: 'thalātha', es: 'tres' } },
  { ch: 'ج', name: 'Yim', tr: 'y / j', sound: 'Entre la «y» de «yo» y la «j» inglesa de «jeans».', join: true, ex: { ar: 'جَمِيل', tr: 'jamīl', es: 'bonito' } },
  { ch: 'ح', name: 'Ha', tr: 'ḥ', sound: 'Una «h» aspirada y fuerte, como empañar un cristal con el aliento.', join: true, ex: { ar: 'حُبّ', tr: 'ḥubb', es: 'amor' } },
  { ch: 'خ', name: 'Jaa', tr: 'kh', sound: 'Como la «j» española de «jamón».', join: true, ex: { ar: 'خُبْز', tr: 'khubz', es: 'pan' } },
  { ch: 'د', name: 'Dal', tr: 'd', sound: 'Como la «d» de «dedo».', join: false, ex: { ar: 'دِين', tr: 'dīn', es: 'religión' } },
  { ch: 'ذ', name: 'Dhal', tr: 'dh', sound: 'Como la «d» suave de «nada».', join: false, ex: { ar: 'ذِكْر', tr: 'dhikr', es: 'recuerdo (de Allah)' } },
  { ch: 'ر', name: 'Ra', tr: 'r', sound: 'Como la «r» de «pero», o vibrante como en «perro».', join: false, ex: { ar: 'رَبّ', tr: 'rabb', es: 'Señor' } },
  { ch: 'ز', name: 'Zay', tr: 'z', sound: 'Una «s» con zumbido, como la «z» inglesa de «zoo».', join: false, ex: { ar: 'زَكَاة', tr: 'zakāh', es: 'zakat, limosna' } },
  { ch: 'س', name: 'Sin', tr: 's', sound: 'Como la «s» de «sol».', join: true, ex: { ar: 'سَلَام', tr: 'salām', es: 'paz' } },
  { ch: 'ش', name: 'Shin', tr: 'sh', sound: 'Como «sh» al pedir silencio.', join: true, ex: { ar: 'شَمْس', tr: 'shams', es: 'sol' } },
  { ch: 'ص', name: 'Sad', tr: 'ṣ', sound: 'Una «s» enfática: se dice con la lengua más atrás y la boca más hueca.', join: true, ex: { ar: 'صَلَاة', tr: 'ṣalāh', es: 'oración' } },
  { ch: 'ض', name: 'Dad', tr: 'ḍ', sound: 'Una «d» enfática y grave. Es tan propia del árabe que al idioma se le llama «la lengua de la dad».', join: true, ex: { ar: 'ضَوْء', tr: 'ḍawʾ', es: 'luz' } },
  { ch: 'ط', name: 'Ta', tr: 'ṭ', sound: 'Una «t» enfática, grave.', join: true, ex: { ar: 'طَعَام', tr: 'ṭaʿām', es: 'comida' } },
  { ch: 'ظ', name: 'Za', tr: 'ẓ', sound: 'Una «dh» enfática, grave.', join: true, ex: { ar: 'ظُهْر', tr: 'ẓuhr', es: 'mediodía' } },
  { ch: 'ع', name: 'Ayn', tr: 'ʿ', sound: 'Sonido de garganta sin equivalente en español: aprieta la garganta como al tragar y di «a».', join: true, ex: { ar: 'عِلْم', tr: 'ʿilm', es: 'conocimiento' } },
  { ch: 'غ', name: 'Ghayn', tr: 'gh', sound: 'Como la «r» francesa, o una «g» gargarizada.', join: true, ex: { ar: 'غَفُور', tr: 'ghafūr', es: 'el que perdona' } },
  { ch: 'ف', name: 'Fa', tr: 'f', sound: 'Como la «f» de «faro».', join: true, ex: { ar: 'فَجْر', tr: 'fajr', es: 'alba' } },
  { ch: 'ق', name: 'Qaf', tr: 'q', sound: 'Una «k» pronunciada muy al fondo de la garganta.', join: true, ex: { ar: 'قُرْآن', tr: 'qurʾān', es: 'Corán' } },
  { ch: 'ك', name: 'Kaf', tr: 'k', sound: 'Como la «k» de «kilo».', join: true, ex: { ar: 'كِتَاب', tr: 'kitāb', es: 'libro' } },
  { ch: 'ل', name: 'Lam', tr: 'l', sound: 'Como la «l» de «luna».', join: true, ex: { ar: 'لَيْل', tr: 'layl', es: 'noche' } },
  { ch: 'م', name: 'Mim', tr: 'm', sound: 'Como la «m» de «mamá».', join: true, ex: { ar: 'مَاء', tr: 'māʾ', es: 'agua' } },
  { ch: 'ن', name: 'Nun', tr: 'n', sound: 'Como la «n» de «nube».', join: true, ex: { ar: 'نُور', tr: 'nūr', es: 'luz' } },
  { ch: 'ه', name: 'Ha', tr: 'h', sound: 'Una «h» suave y aspirada, como la «h» inglesa de «house».', join: true, ex: { ar: 'هُدَى', tr: 'hudā', es: 'guía' } },
  { ch: 'و', name: 'Waw', tr: 'w / ū', sound: 'Como la «u» de «huevo»; también alarga la «u».', join: false, ex: { ar: 'وَلَد', tr: 'walad', es: 'niño' } },
  { ch: 'ي', name: 'Ya', tr: 'y / ī', sound: 'Como la «y» de «yate»; también alarga la «i».', join: true, ex: { ar: 'يَد', tr: 'yad', es: 'mano' } },
];

// Contextual forms with zero-width joiners so the font draws them correctly.
const ZWJ = '‍';
export function forms(l) {
  return l.join
    ? { aislada: l.ch, inicial: l.ch + ZWJ, media: ZWJ + l.ch + ZWJ, final: ZWJ + l.ch }
    : { aislada: l.ch, inicial: l.ch, media: ZWJ + l.ch, final: ZWJ + l.ch };
}

export const LESSONS_AR = [
  { id: 'intro', title: 'Cómo funciona la escritura árabe', blocks: [
    { p: 'El árabe se escribe y se lee de derecha a izquierda. Tiene 28 letras, todas consonantes; las vocales cortas son pequeños signos encima o debajo.' },
    { p: 'No hay mayúsculas, pero las letras cambian un poco de forma según vayan al principio, en medio o al final de la palabra, porque se unen entre sí como en la letra cursiva.' },
    { tip: 'Buena noticia: muchos sonidos ya los tienes en español (b, t, j, d, r, s, f, k, l, m, n). Solo unos pocos son nuevos.' },
  ] },
  { id: 'alfabeto', title: 'El alfabeto', letters: true, blocks: [
    { p: 'Toca cada letra para ver sus formas, cómo suena y una palabra de ejemplo. Fíjate en que varias letras comparten forma y solo cambian los puntos:' },
    { ar: 'ب ت ث ۔ ج ح خ ۔ د ذ ۔ ر ز ۔ س ش ۔ ص ض ۔ ط ظ ۔ ع غ', tr: 'ba ta tha · yim ha jaa · dal dhal · ra zay · sin shin · sad dad · ta za · ayn ghayn', es: 'Familias de letras: misma forma, distintos puntos.' },
  ] },
  { id: 'formas', title: 'Letras que no se unen', blocks: [
    { p: 'Seis letras se unen a la anterior pero nunca a la siguiente. Después de ellas, la palabra «se corta» y la siguiente letra empieza de nuevo:' },
    { ar: 'ا   د   ذ   ر   ز   و', tr: 'alif, dal, dhal, ra, zay, waw', es: 'Las seis letras que no se unen a la izquierda.' },
    { ar: 'دَرَسَ', tr: 'darasa', es: 'estudió: la د y la ر no se unen a la letra siguiente.' },
    { ar: 'وَرْد', tr: 'ward', es: 'rosas: ninguna de sus letras se une a la siguiente.' },
  ] },
  { id: 'vocales', title: 'Las vocales cortas', blocks: [
    { p: 'Son tres signos pequeños. Se escriben en el Corán y en los textos para aprender, y casi nunca en los periódicos.' },
    { ar: 'بَ', tr: 'ba — fatḥa: una rayita encima = «a»', es: 'Fatha: suena «a».' },
    { ar: 'بِ', tr: 'bi — kasra: una rayita debajo = «i»', es: 'Kasra: suena «i».' },
    { ar: 'بُ', tr: 'bu — ḍamma: un pequeño waw encima = «u»', es: 'Damma: suena «u».' },
    { ar: 'كَتَبَ', tr: 'kataba', es: 'escribió' },
    { ar: 'سَمِعَ', tr: 'samiʿa', es: 'oyó' },
  ] },
  { id: 'largas', title: 'Las vocales largas', blocks: [
    { p: 'Se alargan con tres letras: alif para la «a», waw para la «u» y ya para la «i». Se pronuncian el doble de largas.' },
    { ar: 'بَا', tr: 'bā', es: 'fatha + alif = «aa»' },
    { ar: 'بُو', tr: 'bū', es: 'damma + waw = «uu»' },
    { ar: 'بِي', tr: 'bī', es: 'kasra + ya = «ii»' },
    { ar: 'نُور', tr: 'nūr', es: 'luz' },
    { ar: 'كِتَاب', tr: 'kitāb', es: 'libro' },
    { tip: 'En la transliteración las vocales largas llevan una rayita: ā, ī, ū. Respetar la longitud cambia el significado.' },
  ] },
  { id: 'sukun', title: 'Sukun y shadda', blocks: [
    { p: 'El sukun (un circulito ْ) indica que la consonante no lleva vocal. La shadda (ّ, como una «w» pequeña) duplica la consonante.' },
    { ar: 'بِنْت', tr: 'bint', es: 'hija: la ن lleva sukun.' },
    { ar: 'رَبّ', tr: 'rabb', es: 'Señor: la ب lleva shadda y se pronuncia doble.' },
    { ar: 'مُحَمَّد', tr: 'Muḥammad', es: 'Muhammad: la م central se duplica.' },
    { ar: 'اللَّه', tr: 'Allāh', es: 'Allah: la ل lleva shadda.' },
  ] },
  { id: 'tanwin', title: 'El tanwin: la «n» final', blocks: [
    { p: 'Cuando la vocal final aparece duplicada, se añade un sonido «n». Marca que la palabra es indefinida («un», «una»).' },
    { ar: 'كِتَابٌ', tr: 'kitābun', es: 'un libro (doble damma = «un»)' },
    { ar: 'كِتَابًا', tr: 'kitāban', es: 'un libro (doble fatha = «an», suele llevar un alif)' },
    { ar: 'كِتَابٍ', tr: 'kitābin', es: 'un libro (doble kasra = «in»)' },
  ] },
  { id: 'al', title: 'El artículo «al-»: letras solares y lunares', blocks: [
    { p: 'El artículo «el / la» es ال (al-). Delante de las letras lunares la «l» se pronuncia; delante de las solares, la «l» desaparece y la letra siguiente se duplica.' },
    { ar: 'الْقَمَر', tr: 'al-qamar', es: 'la luna: letra lunar, se oye la «l».' },
    { ar: 'الشَّمْس', tr: 'ash-shams', es: 'el sol: letra solar, la «l» no suena.' },
    { ar: 'الرَّحْمَن', tr: 'ar-raḥmān', es: 'el Compasivo: la ر es solar.' },
    { tip: 'Letras solares: ت ث د ذ ر ز س ش ص ض ط ظ ل ن. El resto son lunares.' },
  ] },
  { id: 'especiales', title: 'Ta marbuta, alif maqsura y hamza', blocks: [
    { ar: 'ة', tr: 'ta marbuta', es: 'Una «t» al final de palabras casi siempre femeninas. Se pronuncia «a» al final de frase: صَلَاة (ṣalāh, oración).' },
    { ar: 'ى', tr: 'alif maqsura', es: 'Parece una ya sin puntos y suena «a» larga al final: هُدَى (hudā, guía).' },
    { ar: 'ء', tr: 'hamza', es: 'Un pequeño golpe de voz, como la pausa en «uh-oh». Puede ir sola o sobre alif, waw o ya: أَ إِ ؤ ئ.' },
  ] },
  { id: 'leer', title: 'Lee tus primeras palabras', blocks: [
    { p: 'Intenta leerlas antes de mirar la transliteración:' },
    { ar: 'بَيْت', tr: 'bayt', es: 'casa' },
    { ar: 'قَلْب', tr: 'qalb', es: 'corazón' },
    { ar: 'مَسْجِد', tr: 'masjid', es: 'mezquita' },
    { ar: 'إِسْلَام', tr: 'islām', es: 'islam, entrega' },
    { ar: 'مُسْلِم', tr: 'muslim', es: 'musulmán' },
    { ar: 'رَسُول', tr: 'rasūl', es: 'mensajero' },
    { ar: 'جَنَّة', tr: 'janna', es: 'paraíso, jardín' },
    { ar: 'رَحْمَة', tr: 'raḥma', es: 'misericordia' },
  ] },
  { id: 'oracion', title: 'Vocabulario de la oración', blocks: [
    { ar: 'وُضُوء', tr: 'wuḍūʾ', es: 'ablución' },
    { ar: 'قِبْلَة', tr: 'qibla', es: 'dirección de la Kaaba' },
    { ar: 'رَكْعَة', tr: 'rakʿa', es: 'ciclo de la oración' },
    { ar: 'رُكُوع', tr: 'rukūʿ', es: 'inclinación' },
    { ar: 'سُجُود', tr: 'sujūd', es: 'postración' },
    { ar: 'أَذَان', tr: 'adhān', es: 'llamada a la oración' },
    { ar: 'إِمَام', tr: 'imām', es: 'quien dirige la oración' },
    { ar: 'سُورَة', tr: 'sūra', es: 'capítulo del Corán' },
    { ar: 'آيَة', tr: 'āya', es: 'versículo; también «señal»' },
    { ar: 'دُعَاء', tr: 'duʿāʾ', es: 'súplica' },
  ] },
  { id: 'numeros', title: 'Números del 1 al 10', blocks: [
    { p: 'Los números arábigos que usamos vienen de los árabes; en Oriente se escriben así:' },
    { ar: '١ وَاحِد', tr: 'wāḥid', es: 'uno' },
    { ar: '٢ اثْنَان', tr: 'ithnān', es: 'dos' },
    { ar: '٣ ثَلَاثَة', tr: 'thalātha', es: 'tres' },
    { ar: '٤ أَرْبَعَة', tr: 'arbaʿa', es: 'cuatro' },
    { ar: '٥ خَمْسَة', tr: 'khamsa', es: 'cinco' },
    { ar: '٦ سِتَّة', tr: 'sitta', es: 'seis' },
    { ar: '٧ سَبْعَة', tr: 'sabʿa', es: 'siete' },
    { ar: '٨ ثَمَانِيَة', tr: 'thamāniya', es: 'ocho' },
    { ar: '٩ تِسْعَة', tr: 'tisʿa', es: 'nueve' },
    { ar: '١٠ عَشَرَة', tr: 'ʿashara', es: 'diez' },
  ] },
  { id: 'familia-ar', title: 'La familia y lo cotidiano', blocks: [
    { ar: 'أُمّ', tr: 'umm', es: 'madre' },
    { ar: 'أَب', tr: 'ab', es: 'padre' },
    { ar: 'أَخ', tr: 'akh', es: 'hermano' },
    { ar: 'أُخْت', tr: 'ukht', es: 'hermana' },
    { ar: 'صَدِيق', tr: 'ṣadīq', es: 'amigo' },
    { ar: 'يَوْم', tr: 'yawm', es: 'día' },
    { ar: 'شُكْرًا', tr: 'shukran', es: 'gracias' },
    { ar: 'نَعَم', tr: 'naʿam', es: 'sí' },
    { ar: 'لَا', tr: 'lā', es: 'no' },
    { ar: 'كَيْفَ حَالُكَ؟', tr: 'kayfa ḥāluk?', es: '¿cómo estás?' },
  ] },
];

// Vocabulary for the quiz (drawn from the lessons)
export const VOCAB = LESSONS_AR.flatMap((l) => (l.blocks || []).filter((b) => b.ar && b.es && !b.p && b.es.length < 34 && !/[=:]/.test(b.es)).map((b) => ({ ar: b.ar.replace(/^[١-٩٠]+ /, ''), tr: b.tr, es: b.es.replace(/[.]$/, '') })));
