// Tasbih presets and the adhkar sets (after prayer, morning, evening).

export const TASBIH = [
  { id: 'subhanallah', ar: 'سُبْحَانَ اللَّهِ', tr: 'SubḥānAllāh', es: 'Glorificado sea Allah', target: 33 },
  { id: 'alhamdulillah', ar: 'الْحَمْدُ لِلَّهِ', tr: 'Alḥamdulillāh', es: 'Alabado sea Allah', target: 33 },
  { id: 'allahuakbar', ar: 'اللَّهُ أَكْبَرُ', tr: 'Allāhu akbar', es: 'Allah es el más grande', target: 33 },
  { id: 'astaghfirullah', ar: 'أَسْتَغْفِرُ اللَّهَ', tr: 'Astaghfirullāh', es: 'Pido perdón a Allah', target: 100 },
  { id: 'lailaha', ar: 'لَا إِلَٰهَ إِلَّا اللَّهُ', tr: 'Lā ilāha illallāh', es: 'No hay más dios que Allah', target: 100 },
  { id: 'subhanallahi-wabihamdihi', ar: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', tr: 'SubḥānAllāhi wa biḥamdih', es: 'Glorificado sea Allah y alabado', target: 100 },
  { id: 'salawat', ar: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ', tr: 'Allāhumma ṣalli ʿalā Muḥammad', es: 'Oh Allah, bendice a Muhammad', target: 100 },
  { id: 'hawqala', ar: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', tr: 'Lā ḥawla wa lā quwwata illā billāh', es: 'No hay poder ni fuerza sino en Allah', target: 33 },
];

// The classic sequence after each obligatory prayer: 33 + 33 + 33 (Muslim 597)
export const AFTER_PRAYER_SEQUENCE = ['subhanallah', 'alhamdulillah', 'allahuakbar'];

const AYAT_KURSI = 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ';

const QULS = [
  { id: 'ikhlas', ar: 'قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ', es: 'Al-Ijlás (sura 112): Di: Él es Allah, Uno. Allah, el Eterno. No engendra ni ha sido engendrado, y nada es comparable a Él.', count: 3, src: 'Abu Dawud 5082; At-Tirmidhi 3575' },
  { id: 'falaq', ar: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ', es: 'Al-Falaq (sura 113): refugio en el Señor del alba del mal de lo creado, de la noche, de la brujería y del envidioso.', count: 3, src: 'Abu Dawud 5082; At-Tirmidhi 3575' },
  { id: 'nas', ar: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ ۝ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ', es: 'An-Nas (sura 114): refugio en el Señor, Rey y Dios de los hombres, del susurrador que se esconde, de entre los genios y los hombres.', count: 3, src: 'Abu Dawud 5082; At-Tirmidhi 3575' },
];

export const ADHKAR_SETS = {
  after: {
    label: 'Tras la oración',
    items: [
      { id: 'istighfar3', ar: 'أَسْتَغْفِرُ اللَّهَ', es: 'Pido perdón a Allah (3 veces).', count: 3, src: 'Muslim 591' },
      { id: 'salam', ar: 'اللَّهُمَّ أَنْتَ السَّلَامُ، وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ', es: 'Oh Allah, Tú eres la Paz y de Ti viene la paz. Bendito seas, oh Poseedor de la majestad y la generosidad.', count: 1, src: 'Muslim 591' },
      { id: 'tasbih33', ar: 'سُبْحَانَ اللَّهِ', es: 'Glorificado sea Allah.', count: 33, src: 'Muslim 597' },
      { id: 'tahmid33', ar: 'الْحَمْدُ لِلَّهِ', es: 'Alabado sea Allah.', count: 33, src: 'Muslim 597' },
      { id: 'takbir33', ar: 'اللَّهُ أَكْبَرُ', es: 'Allah es el más grande.', count: 33, src: 'Muslim 597' },
      { id: 'tahlil', ar: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ', es: 'No hay más dios que Allah, Único, sin asociado. Suyo es el reino y Suya la alabanza, y Él tiene poder sobre todas las cosas. (Completa el cien.)', count: 1, src: 'Muslim 597' },
      { id: 'kursi', ar: AYAT_KURSI, es: 'Ayat al-Kursi (2:255). A quien la recita tras cada oración obligatoria solo le separa del Paraíso la muerte.', count: 1, src: 'An-Nasa’i (As-Sunan al-Kubra)' },
    ],
  },
  morning: {
    label: 'Mañana',
    items: [
      { id: 'kursi', ar: AYAT_KURSI, es: 'Ayat al-Kursi (2:255): protección hasta la tarde.', count: 1, src: 'Al-Hakim; An-Nasa’i (As-Sunan al-Kubra)' },
      ...QULS,
      { id: 'asbahna', ar: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ', es: 'Oh Allah, por Ti amanecemos y por Ti anochecemos, por Ti vivimos y por Ti morimos, y a Ti es la resurrección.', count: 1, src: 'At-Tirmidhi 3391' },
      { id: 'sayyid', ar: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ', es: 'Sayyid al-Istighfar: la mejor forma de pedir perdón.', count: 1, src: 'Al-Bujari 6306' },
      { id: 'bismillah3', ar: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ', es: 'En el nombre de Allah, con cuyo nombre nada en la tierra ni en el cielo causa daño.', count: 3, src: 'Abu Dawud 5088' },
      { id: 'raditu', ar: 'رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ ﷺ نَبِيًّا', es: 'Estoy satisfecho con Allah como Señor, con el islam como religión y con Muhammad ﷺ como profeta.', count: 3, src: 'Abu Dawud 5072' },
      { id: 'subhan100', ar: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', es: 'Glorificado sea Allah y alabado. Quien lo dice cien veces, se le borran sus faltas aunque sean como la espuma del mar.', count: 100, src: 'Muslim 2691; Al-Bujari 6405' },
    ],
  },
  evening: {
    label: 'Tarde',
    items: [
      { id: 'kursi', ar: AYAT_KURSI, es: 'Ayat al-Kursi (2:255): protección hasta la mañana.', count: 1, src: 'Al-Hakim; An-Nasa’i (As-Sunan al-Kubra)' },
      ...QULS,
      { id: 'amsayna', ar: 'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ', es: 'Oh Allah, por Ti anochecemos y por Ti amanecemos, por Ti vivimos y por Ti morimos, y a Ti es el destino final.', count: 1, src: 'At-Tirmidhi 3391' },
      { id: 'sayyid', ar: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ', es: 'Sayyid al-Istighfar: la mejor forma de pedir perdón.', count: 1, src: 'Al-Bujari 6306' },
      { id: 'bismillah3', ar: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ', es: 'En el nombre de Allah, con cuyo nombre nada en la tierra ni en el cielo causa daño.', count: 3, src: 'Abu Dawud 5088' },
      { id: 'kalimat', ar: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ', es: 'Me refugio en las palabras perfectas de Allah del mal de lo que ha creado.', count: 3, src: 'Muslim 2709' },
      { id: 'subhan100', ar: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', es: 'Glorificado sea Allah y alabado.', count: 100, src: 'Muslim 2692' },
    ],
  },
};
