// Tasbih presets and the adhkar sets (after prayer, morning, evening). Every Arabic text has transliteration and Spanish.

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

const KURSI = {
  ar: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
  tr: 'Allāhu lā ilāha illā huwal-ḥayyul-qayyūm, lā taʾkhudhuhū sinatun wa lā nawm, lahū mā fis-samāwāti wa mā fil-arḍ, man dhal-ladhī yashfaʿu ʿindahū illā bi-idhnih, yaʿlamu mā bayna aydīhim wa mā khalfahum, wa lā yuḥīṭūna bi-shayʾin min ʿilmihī illā bimā shāʾ, wasiʿa kursiyyuhus-samāwāti wal-arḍ, wa lā yaʾūduhū ḥifẓuhumā, wa huwal-ʿaliyyul-ʿaẓīm',
  es: 'Allah, no hay más dios que Él, el Viviente, el Sustentador. Ni la somnolencia ni el sueño Le afectan. Suyo es cuanto hay en los cielos y en la tierra. ¿Quién podrá interceder ante Él si no es con Su permiso? Conoce lo que tienen delante y lo que tienen detrás, y no abarcan nada de Su conocimiento salvo lo que Él quiere. Su Trono abarca los cielos y la tierra, y no Le fatiga preservarlos. Él es el Altísimo, el Inmenso. (Ayat al-Kursi, 2:255)',
};

const QULS = [
  { id: 'ikhlas', count: 3, src: 'Abu Dawud 5082; At-Tirmidhi 3575',
    ar: 'قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
    tr: 'Qul huwa Allāhu aḥad. Allāhuṣ-ṣamad. Lam yalid wa lam yūlad. Wa lam yakun lahū kufuwan aḥad.',
    es: 'Di: Él es Allah, Uno. Allah, el Eterno, de quien todos dependen. No engendra ni ha sido engendrado. Y nada es comparable a Él. (Al-Ijlás, 112)' },
  { id: 'falaq', count: 3, src: 'Abu Dawud 5082; At-Tirmidhi 3575',
    ar: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ',
    tr: 'Qul aʿūdhu bi-rabbil-falaq. Min sharri mā khalaq. Wa min sharri ghāsiqin idhā waqab. Wa min sharrin-naffāthāti fil-ʿuqad. Wa min sharri ḥāsidin idhā ḥasad.',
    es: 'Di: Me refugio en el Señor del alba, del mal de lo que ha creado, del mal de la oscuridad cuando se extiende, del mal de las que soplan en los nudos, y del mal del envidioso cuando envidia. (Al-Falaq, 113)' },
  { id: 'nas', count: 3, src: 'Abu Dawud 5082; At-Tirmidhi 3575',
    ar: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ ۝ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ',
    tr: 'Qul aʿūdhu bi-rabbin-nās. Malikin-nās. Ilāhin-nās. Min sharril-waswāsil-khannās. Alladhī yuwaswisu fī ṣudūrin-nās. Minal-jinnati wan-nās.',
    es: 'Di: Me refugio en el Señor de los hombres, el Rey de los hombres, el Dios de los hombres, del mal del susurrador que se esconde, que susurra en los pechos de los hombres, sea de los genios o de los hombres. (An-Nas, 114)' },
];

const SAYYID = {
  id: 'sayyid', count: 1, src: 'Al-Bujari 6306',
  ar: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
  tr: 'Allāhumma anta rabbī lā ilāha illā ant, khalaqtanī wa ana ʿabduk, wa ana ʿalā ʿahdika wa waʿdika mastaṭaʿt, aʿūdhu bika min sharri mā ṣanaʿt, abūʾu laka bi-niʿmatika ʿalayy, wa abūʾu laka bi-dhanbī faghfir lī, fa-innahu lā yaghfirudh-dhunūba illā ant',
  es: 'Oh Allah, Tú eres mi Señor, no hay más dios que Tú. Me creaste y soy Tu siervo, y me mantengo en Tu pacto y Tu promesa en lo que puedo. Me refugio en Ti del mal que he hecho. Reconozco Tus favores sobre mí y reconozco mi pecado, así que perdóname, pues nadie perdona los pecados excepto Tú. (Sayyid al-Istighfar)',
};

const BISMILLAH3 = {
  id: 'bismillah3', count: 3, src: 'Abu Dawud 5088',
  ar: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
  tr: 'Bismillāhil-ladhī lā yaḍurru maʿasmihī shayʾun fil-arḍi wa lā fis-samāʾ, wa huwas-samīʿul-ʿalīm',
  es: 'En el nombre de Allah, con cuyo nombre nada en la tierra ni en el cielo puede causar daño, y Él es el que todo lo oye y todo lo sabe.',
};

export const ADHKAR_SETS = {
  after: {
    label: 'Tras la oración',
    items: [
      { id: 'istighfar3', ar: 'أَسْتَغْفِرُ اللَّهَ', tr: 'Astaghfirullāh', es: 'Pido perdón a Allah.', count: 3, src: 'Muslim 591' },
      { id: 'salam', ar: 'اللَّهُمَّ أَنْتَ السَّلَامُ، وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ', tr: 'Allāhumma antas-salām, wa minkas-salām, tabārakta yā dhal-jalāli wal-ikrām', es: 'Oh Allah, Tú eres la Paz y de Ti viene la paz. Bendito seas, oh Poseedor de la majestad y la generosidad.', count: 1, src: 'Muslim 591' },
      { id: 'tasbih33', ar: 'سُبْحَانَ اللَّهِ', tr: 'SubḥānAllāh', es: 'Glorificado sea Allah.', count: 33, src: 'Muslim 597' },
      { id: 'tahmid33', ar: 'الْحَمْدُ لِلَّهِ', tr: 'Alḥamdulillāh', es: 'Alabado sea Allah.', count: 33, src: 'Muslim 597' },
      { id: 'takbir33', ar: 'اللَّهُ أَكْبَرُ', tr: 'Allāhu akbar', es: 'Allah es el más grande.', count: 33, src: 'Muslim 597' },
      { id: 'tahlil', ar: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ', tr: 'Lā ilāha illallāhu waḥdahu lā sharīka lah, lahul-mulku wa lahul-ḥamd, wa huwa ʿalā kulli shayʾin qadīr', es: 'No hay más dios que Allah, Único, sin asociado. Suyo es el reino y Suya la alabanza, y Él tiene poder sobre todas las cosas. (Completa el cien.)', count: 1, src: 'Muslim 597' },
      { id: 'kursi', ...KURSI, count: 1, src: 'An-Nasa’i (As-Sunan al-Kubra)' },
    ],
  },
  morning: {
    label: 'Mañana',
    items: [
      { id: 'kursi', ...KURSI, count: 1, src: 'Al-Hakim; An-Nasa’i (As-Sunan al-Kubra)' },
      ...QULS,
      { id: 'asbahna', ar: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ', tr: 'Allāhumma bika aṣbaḥnā, wa bika amsaynā, wa bika naḥyā, wa bika namūtu, wa ilaykan-nushūr', es: 'Oh Allah, por Ti amanecemos y por Ti anochecemos, por Ti vivimos y por Ti morimos, y a Ti es la resurrección.', count: 1, src: 'At-Tirmidhi 3391' },
      SAYYID,
      BISMILLAH3,
      { id: 'raditu', ar: 'رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ ﷺ نَبِيًّا', tr: 'Raḍītu billāhi rabbā, wa bil-islāmi dīnā, wa bi-Muḥammadin ṣallallāhu ʿalayhi wa sallama nabiyyā', es: 'Estoy satisfecho con Allah como Señor, con el islam como religión y con Muhammad ﷺ como profeta.', count: 3, src: 'Abu Dawud 5072' },
      { id: 'subhan100', ar: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', tr: 'SubḥānAllāhi wa biḥamdih', es: 'Glorificado sea Allah y alabado. Quien lo dice cien veces, se le borran sus faltas aunque sean como la espuma del mar.', count: 100, src: 'Muslim 2691; Al-Bujari 6405' },
    ],
  },
  evening: {
    label: 'Tarde',
    items: [
      { id: 'kursi', ...KURSI, count: 1, src: 'Al-Hakim; An-Nasa’i (As-Sunan al-Kubra)' },
      ...QULS,
      { id: 'amsayna', ar: 'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ', tr: 'Allāhumma bika amsaynā, wa bika aṣbaḥnā, wa bika naḥyā, wa bika namūtu, wa ilaykal-maṣīr', es: 'Oh Allah, por Ti anochecemos y por Ti amanecemos, por Ti vivimos y por Ti morimos, y a Ti es el destino final.', count: 1, src: 'At-Tirmidhi 3391' },
      SAYYID,
      BISMILLAH3,
      { id: 'kalimat', ar: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ', tr: 'Aʿūdhu bi-kalimātillāhit-tāmmāti min sharri mā khalaq', es: 'Me refugio en las palabras perfectas de Allah del mal de lo que ha creado.', count: 3, src: 'Muslim 2709' },
      { id: 'subhan100', ar: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', tr: 'SubḥānAllāhi wa biḥamdih', es: 'Glorificado sea Allah y alabado.', count: 100, src: 'Muslim 2692' },
    ],
  },
};
