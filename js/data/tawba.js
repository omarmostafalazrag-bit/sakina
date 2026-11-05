// Tawba (repentance): how to repent, what to do after specific sins, how to continue, and hope.
// Blocks use the same format as the lessons: { p } { tip } { steps } { ar, tr, es }.

export const TAWBA_INTRO = {
  ar: 'قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ ۚ إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا',
  tr: 'Qul yā ʿibādiyal-ladhīna asrafū ʿalā anfusihim lā taqnaṭū min raḥmatillāh, innallāha yaghfirudh-dhunūba jamīʿā',
  es: 'Di: ¡Oh, siervos Míos que os habéis excedido contra vosotros mismos! No desesperéis de la misericordia de Allah. Allah perdona todos los pecados. (Corán 39:53)',
};

export const TAWBA_GROUPS = [
  { id: 'como', label: 'Cómo arrepentirse' },
  { id: 'casos', label: 'Qué hacer según el pecado' },
  { id: 'despues', label: 'A partir de ahora' },
  { id: 'animo', label: 'Ánimo' },
];

export const TAWBA = [
  // ---------------- Cómo ----------------
  { group: 'como', id: 'que-es', title: 'Qué es la tawba', blocks: [
    { p: 'Tawba significa «volver»: volver a Allah después de haberse alejado. No es solo decir «perdón»: es un cambio del corazón que se nota en los actos.' },
    { p: 'Todos pecamos. «Todo hijo de Adán comete errores, y los mejores de los que cometen errores son los que se arrepienten» (At-Tirmidhi 2499). El problema no es caer, sino quedarse en el suelo.' },
    { tip: 'Allah se alegra más por la tawba de Su siervo que un hombre que, perdido en el desierto, encuentra su camello con su comida y su agua después de haberlo dado por perdido (Muslim 2747).' },
  ] },
  { group: 'como', id: 'condiciones', title: 'Las condiciones de una tawba válida', blocks: [
    { p: 'Los sabios, como An-Nawawi en Riyad as-Salihin, explican que la tawba sincera tiene estas condiciones:' },
    { steps: [
      'Dejar el pecado ahora mismo. No se puede arrepentir de algo que se sigue haciendo.',
      'Sentir remordimiento de verdad. «El remordimiento es arrepentimiento» (Ibn Mayah 4252).',
      'Tener la firme intención de no volver. Si después recaes, la tawba anterior no se anula: te arrepientes de nuevo.',
      'Si el pecado afectó a otra persona, devolver su derecho: lo robado, la deuda, o pedirle perdón.',
      'Hacerla por Allah, no por vergüenza ante la gente ni por miedo a perder algo.',
      'Hacerla a tiempo: antes de la muerte y antes de que el sol salga por el oeste (Muslim 2703; At-Tirmidhi 3537).',
    ] },
  ] },
  { group: 'como', id: 'pasos', title: 'Cómo hacerlo, paso a paso', blocks: [
    { steps: [
      'Haz el wudu con calma.',
      'Reza dos rakaat con la intención de arrepentirte (salat at-tawba).',
      'Después, pide perdón a Allah con tus palabras, en tu idioma, nombrando lo que hiciste. Él ya lo sabe; decirlo te ayuda a ti.',
      'Repite la mejor petición de perdón, Sayyid al-Istighfar (está en Duas y en Dikr).',
      'Haz una buena obra justo después: una sadaqa, un favor, una oración voluntaria.',
    ] },
    { p: 'El hadiz de Abu Bakr: «No hay nadie que cometa un pecado, se purifique bien, rece dos rakaat y pida perdón a Allah, sin que Allah le perdone». Después recitó 3:135.' },
    { ar: 'رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ', tr: 'Rabbighfir lī wa tub ʿalayya innaka antat-tawwābur-raḥīm', es: 'Señor mío, perdóname y acepta mi arrepentimiento; Tú eres el que acepta el arrepentimiento, el Misericordioso. (Abu Dawud 1516)' },
    { ar: 'أَسْتَغْفِرُ اللَّهَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيَّ الْقَيُّومَ وَأَتُوبُ إِلَيْهِ', tr: 'Astaghfirullāhal-ladhī lā ilāha illā huwal-ḥayyul-qayyūmu wa atūbu ilayh', es: 'Pido perdón a Allah, no hay más dios que Él, el Viviente, el Sustentador, y me vuelvo a Él. (Abu Dawud 1517; At-Tirmidhi 3577)' },
    { tip: 'Fuentes: Abu Dawud 1521; At-Tirmidhi 406. «Las buenas obras borran las malas» (Corán 11:114).' },
  ] },
  { group: 'como', id: 'secreto', title: 'No lo cuentes: Allah te ha cubierto', blocks: [
    { p: 'No hace falta confesar tus pecados a nadie: ni al imam, ni a la familia, ni en público. La tawba es entre tú y Allah.' },
    { p: '«Toda mi comunidad será perdonada excepto los que hacen público (su pecado)»: el que peca de noche, Allah lo cubre, y por la mañana lo cuenta él mismo (Al-Bujari 6069).' },
    { tip: 'Si necesitas consejo, puedes preguntar a un sabio sin dar detalles que te expongan: «¿qué debe hacer alguien que ha hecho…?».' },
  ] },

  // ---------------- Casos ----------------
  { group: 'casos', id: 'oracion', title: 'Si dejaste de rezar', blocks: [
    { p: 'Lo primero es empezar hoy con las cinco oraciones. Ese es el paso más importante.' },
    { p: 'Sobre las oraciones perdidas, la mayoría de los sabios (las cuatro escuelas) dicen que se recuperan (qada). Algunos, como Ibn Taymiyya, opinan que quien las dejó a propósito durante años no puede recuperarlas y que debe arrepentirse y multiplicar las voluntarias.' },
    { steps: ['Calcula aproximadamente cuántas oraciones dejaste.', 'Recupera un poco cada día: por ejemplo, una oración perdida junto a cada oración del día, o un día completo cada día.', 'Si mueres antes de terminar con la intención sincera, Allah conoce tu esfuerzo.'] },
    { tip: 'No dejes que una deuda grande te impida empezar. Hoy reza las cinco; mañana, añade una de recuperación.' },
  ] },
  { group: 'casos', id: 'ayuno', title: 'Si no ayunaste en Ramadán', blocks: [
    { steps: [
      'Por enfermedad, viaje, regla o embarazo: recupera los días antes del siguiente Ramadán (Corán 2:184). Puedes llevar la cuenta en Hoy › Ayuno.',
      'Sin excusa: arrepiéntete y recupera esos días.',
      'Si rompiste el ayuno a propósito con relaciones íntimas, además de recuperar el día hay una expiación (kaffara): ayunar dos meses seguidos o, si no puedes, alimentar a 60 pobres (Al-Bujari 1936).',
      'Si eres mayor o tienes una enfermedad crónica que te impide ayunar, das la fidya: alimentar a un pobre por cada día (Corán 2:184).',
    ] },
  ] },
  { group: 'casos', id: 'derechos', title: 'Si quitaste algo a alguien', blocks: [
    { p: 'Los pecados contra las personas no se perdonan solo con la tawba: hay que devolver su derecho. El Profeta ﷺ advirtió que el Día del Juicio se pagará con buenas obras lo que no se haya devuelto aquí (Al-Bujari 2449).' },
    { steps: [
      'Robo, fraude o deuda: devuelve lo que tomaste. Puedes hacerlo sin decir quién eres, por transferencia o a través de otra persona.',
      'Si la persona ha muerto: entrégalo a sus herederos.',
      'Si no sabes quién es o no puedes encontrarla: da su valor en sadaqa en su nombre.',
      'Si no puedes pagarlo todo ahora: empieza poco a poco y pide a Allah que te facilite el resto.',
    ] },
  ] },
  { group: 'casos', id: 'guiba', title: 'Si hablaste mal de alguien (guiba o calumnia)', blocks: [
    { steps: [
      'Arrepiéntete ante Allah y deja de hacerlo.',
      'Si la persona se enteró o le causaste daño, pídele perdón.',
      'Si no lo sabe y contárselo le haría más daño, muchos sabios recomiendan no decírselo: habla bien de ella donde hablaste mal y pide a Allah por ella.',
      'Si la calumnia la perjudicó, corrige lo que dijiste ante quienes lo oyeron.',
    ] },
    { tip: 'Corán 49:12 compara la guiba con comer la carne del hermano muerto.' },
  ] },
  { group: 'casos', id: 'alcohol', title: 'Alcohol, drogas o juego', blocks: [
    { steps: [
      'Deshazte de lo que tengas en casa hoy.',
      'Aléjate de los lugares y de las personas con los que lo hacías.',
      'Busca ayuda profesional si hay adicción: es una enfermedad y tratarla no es falta de fe. En España puedes pedirla en tu centro de salud.',
      'En el juego, si debes dinero a alguien, págalo; las ganancias del juego no se quedan: se dan en sadaqa sin esperar recompensa.',
    ] },
    { tip: '«Allah no cambia lo que hay en un pueblo hasta que ellos cambian lo que hay en sí mismos» (Corán 13:11).' },
  ] },
  { group: 'casos', id: 'zina', title: 'Relaciones fuera del matrimonio', blocks: [
    { p: 'Es un pecado grave, y aun así Allah lo perdona con una tawba sincera: el Corán lo menciona junto con el shirk y el asesinato, y dice que a quien se arrepiente, cree y obra bien, Allah le cambia sus malas obras por buenas (Corán 25:68-70).' },
    { steps: [
      'Corta la relación prohibida y todo lo que lleve a ella: mensajes, citas, estar a solas.',
      'No lo cuentes a nadie: Allah te ha cubierto (Al-Bujari 6069).',
      'Si quieres casarte con esa persona, hazlo de forma lícita después de arrepentiros; consulta a un imam por los detalles.',
      'Si hay un embarazo o una consecuencia para otra persona, asume tu responsabilidad.',
      'Si te sientes atraído y puedes, cásate; si no, ayuna (Al-Bujari 5066).',
    ] },
  ] },
  { group: 'casos', id: 'pantalla', title: 'Pornografía y malos hábitos con el móvil', blocks: [
    { steps: [
      'Instala un filtro o bloqueador y deja que otra persona ponga la contraseña.',
      'Identifica cuándo caes (de noche, solo, aburrido) y cambia ese momento: deja el móvil fuera del dormitorio.',
      'Baja la mirada también en la pantalla (Corán 24:30).',
      'Ayuna los lunes y jueves, haz deporte y llena el tiempo con algo útil.',
      'Usa el contador «Mi compromiso» de esta sección para ver tus días firme.',
    ] },
    { tip: 'Si recaes, no te digas «ya no tengo remedio»: es justo lo que el Shaytán quiere. Haz wudu, reza dos rakaat y vuelve a empezar.' },
  ] },
  { group: 'casos', id: 'shirk', title: 'Shirk, magia o adivinos', blocks: [
    { p: 'Si pediste ayuda a otro que Allah, llevaste amuletos o fuiste a un adivino creyéndole, renueva tu fe: repite la shahada con convicción, arrepiéntete y deshazte de lo que tengas (amuletos, objetos de magia).' },
    { ar: 'أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا رَسُولُ اللَّهِ', tr: 'Ash-hadu an lā ilāha illallāh, wa ash-hadu anna Muḥammadan rasūlullāh', es: 'Atestiguo que no hay más dios que Allah, y atestiguo que Muhammad es el Mensajero de Allah.' },
    { tip: 'Con la tawba, Allah perdona incluso el shirk (Corán 39:53, 25:70). Para protegerte, recita Ayat al-Kursi y las tres Quls por la mañana y por la tarde.' },
  ] },
  { group: 'casos', id: 'riba', title: 'Intereses (riba)', blocks: [
    { steps: [
      'Deja de firmar nuevos préstamos con interés y busca alternativas (banca islámica, ahorro, préstamos sin interés).',
      'Si cobraste intereses, quédate con tu capital: «tendréis vuestro capital» (Corán 2:279). El interés recibido se da a causas generales sin intención de recompensa.',
      'Si ya tienes una hipoteca o préstamo, consulta a un sabio sobre tu caso concreto para salir de él de la forma menos dañina.',
    ] },
  ] },
  { group: 'casos', id: 'juramento', title: 'Mentiras y juramentos rotos', blocks: [
    { p: 'Arrepiéntete de la mentira y, si perjudicó a alguien, corrígela. Si juraste por Allah hacer o no hacer algo y lo incumpliste, hay una expiación (kaffarat al-yamin):' },
    { steps: ['Alimentar o vestir a diez pobres;', 'o, si no puedes, ayunar tres días.'] },
    { tip: 'Fuente: Corán 5:89.' },
  ] },
  { group: 'casos', id: 'padres', title: 'Si trataste mal a tus padres', blocks: [
    { steps: [
      'Si viven: pídeles perdón, trátales con especial cariño y ayúdales.',
      'Si han muerto: pide por ellos, da sadaqa en su nombre, cumple sus promesas y mantén la relación con sus amigos y familia (Muslim 1631; Muslim 2552).',
    ] },
    { ar: 'رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا', tr: 'Rabbir-ḥamhumā kamā rabbayānī ṣaghīrā', es: 'Señor mío, ten misericordia de ellos como ellos me criaron cuando era pequeño. (Corán 17:24)' },
  ] },

  // ---------------- Después ----------------
  { group: 'despues', id: 'recaer', title: 'Si vuelves a caer', blocks: [
    { p: 'En un hadiz qudsi, un siervo peca y dice «Señor, perdóname», y Allah dice: «Mi siervo ha sabido que tiene un Señor que perdona». Vuelve a pecar y a pedir perdón, una y otra vez, y Allah sigue perdonándole (Al-Bujari 7507; Muslim 2758).' },
    { p: 'Esto no es permiso para pecar: es la prueba de que la puerta nunca se cierra mientras vuelvas con sinceridad.' },
    { tip: 'La desesperanza es una trampa: el Shaytán primero te empuja al pecado y luego te dice que ya no hay arreglo. No le creas.' },
  ] },
  { group: 'despues', id: 'habitos', title: 'Cómo actuar a partir de ahora', blocks: [
    { steps: [
      'Protege tus cinco oraciones: «la oración aparta de la indecencia y de lo reprobable» (Corán 29:45).',
      'Cambia de ambiente: el que se junta con el vendedor de perfume sale oliendo bien, y el que se junta con el herrero sale oliendo a humo (Al-Bujari 2101).',
      'Corta los caminos que llevan al pecado antes de llegar a él (Corán 17:32: «no os acerquéis»).',
      'Sustituye el hábito: el tiempo vacío se llena con algo bueno (deporte, estudio, voluntariado, familia).',
      'Haz dikr cada día, aunque sean diez minutos: «con el recuerdo de Allah se tranquilizan los corazones» (13:28).',
      'Ayuna de vez en cuando: el ayuno es un escudo (Al-Bujari 1894).',
      'Aprende tu religión poco a poco: el conocimiento protege.',
      'Pide constancia: «Yā muqallibal-qulūb, thabbit qalbī ʿalā dīnik».',
      'Busca ayuda profesional si hay adicción, ansiedad o depresión. Cuidar la mente también es una amana.',
    ] },
  ] },
  { group: 'despues', id: 'pequeno', title: 'Poco pero constante', blocks: [
    { p: 'No intentes cambiarlo todo en una semana. Las obras más amadas por Allah son las constantes, aunque sean pocas (Al-Bujari 6464).' },
    { p: 'Elige un solo hábito bueno para empezar (por ejemplo, rezar Fajr a su hora) y otro malo para dejar. Cuando estén firmes, añade el siguiente.' },
  ] },

  // ---------------- Ánimo ----------------
  { group: 'animo', id: 'nube', title: 'Aunque tus pecados llegaran a las nubes', blocks: [
    { p: 'Allah dice en un hadiz qudsi: «¡Hijo de Adán! Mientras Me llames y esperes en Mí, te perdonaré lo que haya en ti, y no Me importa. ¡Hijo de Adán! Aunque tus pecados llegaran a las nubes del cielo y Me pidieras perdón, te perdonaría».' },
    { tip: 'At-Tirmidhi 3540.' },
  ] },
  { group: 'animo', id: 'cien', title: 'El hombre que mató a cien', blocks: [
    { p: 'Un hombre había matado a noventa y nueve personas. Preguntó a un monje si tenía perdón; el monje dijo que no, y lo mató también. Luego preguntó a un sabio, que le dijo: «¿Quién se interpone entre ti y el arrepentimiento? Ve a tal tierra, donde hay gente que adora a Allah».' },
    { p: 'Murió a mitad de camino. Los ángeles de la misericordia y los del castigo discutieron por él; midieron la distancia y estaba un poco más cerca de la tierra buena. Allah le perdonó (Al-Bujari 3470; Muslim 2766).' },
    { tip: 'Si a él, que estaba en camino, se le perdonó, ¿cómo no va a recibirte Allah a ti?' },
  ] },
  { group: 'animo', id: 'cambiadas', title: 'Tus malas obras, convertidas en buenas', blocks: [
    { ar: 'إِلَّا مَن تَابَ وَآمَنَ وَعَمِلَ عَمَلًا صَالِحًا فَأُولَٰئِكَ يُبَدِّلُ اللَّهُ سَيِّئَاتِهِمْ حَسَنَاتٍ', tr: 'Illā man tāba wa āmana wa ʿamila ʿamalan ṣāliḥan fa-ulāʾika yubaddilullāhu sayyiʾātihim ḥasanāt', es: 'Excepto quien se arrepienta, crea y obre con rectitud: a esos Allah les cambiará sus malas obras por buenas. (Corán 25:70)' },
    { p: '«Quien se arrepiente del pecado es como quien no tiene pecado» (Ibn Mayah 4250).' },
  ] },
  { group: 'animo', id: 'misericordia', title: 'Su misericordia es más grande', blocks: [
    { p: 'Cuando Allah creó la creación, escribió junto a Él: «Mi misericordia prevalece sobre Mi ira» (Al-Bujari 7404).' },
    { p: 'Él se llama At-Tawwāb (el que acepta el arrepentimiento una y otra vez), Al-Ghafūr (el que perdona mucho), Al-ʿAfuww (el que borra) y Ar-Raḥīm (el Misericordioso).' },
    { ar: 'اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي', tr: 'Allāhumma innaka ʿafuwwun tuḥibbul-ʿafwa faʿfu ʿannī', es: 'Oh Allah, Tú eres Quien todo lo perdona y amas perdonar, así que perdóname. (At-Tirmidhi 3513)' },
  ] },
  { group: 'animo', id: 'ama', title: 'Allah ama a los que vuelven', blocks: [
    { ar: 'إِنَّ اللَّهَ يُحِبُّ التَّوَّابِينَ وَيُحِبُّ الْمُتَطَهِّرِينَ', tr: 'Innallāha yuḥibbut-tawwābīna wa yuḥibbul-mutaṭahhirīn', es: 'Ciertamente, Allah ama a los que se vuelven a Él arrepentidos y ama a los que se purifican. (Corán 2:222)' },
    { p: 'No dice que los tolera: dice que los ama. Tu arrepentimiento de hoy es algo que Allah ama.' },
  ] },
];

export const RELAPSE_MESSAGES = [
  'No pasa nada por volver a empezar. Allah ama a los que se vuelven a Él (2:222). Haz wudu y reza dos rakaat.',
  'Caer no te define; volver sí. «Los mejores de los que cometen errores son los que se arrepienten.»',
  'El contador vuelve a cero, tu esfuerzo no. Allah no pierde la recompensa de quien hace el bien (9:120).',
];
