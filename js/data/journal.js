// Daily journal with an Islamic frame: gratitude (shukr), self-accounting (muhasaba), intention (niyya) and dua.

export const JOURNAL_INTRO = {
  ar: 'لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ',
  tr: 'La-in shakartum la-azīdannakum',
  es: 'Si sois agradecidos, os daré más. (Corán 14:7)',
};

export const MOODS = [
  { id: 1, label: 'Muy difícil' },
  { id: 2, label: 'Difícil' },
  { id: 3, label: 'Normal' },
  { id: 4, label: 'Bien' },
  { id: 5, label: 'Con mucha paz' },
];

export const SECTIONS = [
  { id: 'gratitude', title: 'Alhamdulillah por…', hint: 'Tres bendiciones de hoy, grandes o pequeñas.', ref: '«Y si contarais las bendiciones de Allah, no podríais enumerarlas» (Corán 14:34).', multi: 3 },
  { id: 'good', title: 'Lo que hice bien hoy', hint: 'Una oración a tiempo, un favor, una palabra amable… Reconócelo y da gracias a Allah por ello.', ref: '«Quien se alegra por su buena obra y se entristece por su mala obra, ese es un creyente» (At-Tirmidhi 2165).' },
  { id: 'fail', title: 'En qué fallé', hint: 'Sin castigarte: solo para pedir perdón y aprender.', ref: 'Umar ibn al-Jattab dijo: «Pedíos cuentas a vosotros mismos antes de que se os pidan cuentas» (At-Tirmidhi, tras el hadiz 2459).' },
  { id: 'improve', title: 'Mañana quiero…', hint: 'Una sola cosa concreta y pequeña.', ref: '«Las obras más amadas por Allah son las más constantes, aunque sean pocas» (Al-Bujari 6464).' },
  { id: 'dua', title: 'Lo que le pido hoy a Allah', hint: 'Tu dua de hoy, con tus palabras.', ref: '«Vuestro Señor ha dicho: Invocadme y os responderé» (Corán 40:60).' },
  { id: 'free', title: 'Notas libres', hint: 'Lo que quieras guardar de este día: algo que aprendiste, una aleya que te tocó, cómo te sentiste.', ref: '' },
];

// One reflection prompt per day, each tied to a verse or hadith
export const PROMPTS = [
  { q: '¿Qué bendición has dado por sentada hoy?', ref: 'Corán 14:34' },
  { q: '¿A quién podrías perdonar esta semana?', ref: 'Corán 24:22: «¿No os gustaría que Allah os perdonara?»' },
  { q: '¿Qué te ha preocupado hoy, y qué parte está en manos de Allah?', ref: 'Corán 65:3: «Quien confía en Allah, Él le basta»' },
  { q: '¿Cómo has tratado hoy a tu familia?', ref: 'At-Tirmidhi 3895: «Los mejores de vosotros son los mejores con sus familias»' },
  { q: '¿Qué has aprendido hoy de tu religión?', ref: 'Corán 20:114: «Señor, aumenta mi conocimiento»' },
  { q: '¿Hubo un momento en que te sentiste cerca de Allah?', ref: 'Corán 2:186: «Estoy cerca»' },
  { q: '¿Qué palabra tuya hoy habría sido mejor callar?', ref: 'Al-Bujari 6018: «Que diga el bien o que calle»' },
  { q: '¿A quién has ayudado hoy, o a quién podrías ayudar mañana?', ref: 'Muslim 2699: «Allah ayuda al siervo mientras el siervo ayuda a su hermano»' },
  { q: '¿Qué dificultad de hoy podría esconder un bien?', ref: 'Corán 2:216: «Puede que detestéis algo que es un bien para vosotros»' },
  { q: '¿Cuál de tus oraciones de hoy fue la más presente, y por qué?', ref: 'Corán 23:1-2: «Prosperan los creyentes, que en su oración son humildes»' },
  { q: '¿Qué hábito te está alejando de Allah?', ref: 'Corán 13:11' },
  { q: '¿De qué te sientes orgulloso hoy, sin arrogancia?', ref: 'Muslim 91: «Allah es bello y ama la belleza»' },
  { q: '¿Qué aleya o hadiz te gustaría vivir mañana?', ref: 'Corán 38:29: «Un Libro bendito para que mediten sus aleyas»' },
  { q: '¿Has sido paciente hoy? ¿Dónde te costó más?', ref: 'Corán 2:153: «Allah está con los pacientes»' },
];
