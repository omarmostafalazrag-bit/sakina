// "Mi guía": obligations, rights, prohibitions and permissions, adapted to the user's gender.
// `for`: 'all' | 'm' | 'f'. Where the schools of law differ, the text says so.

export const GUIDE_SECTIONS = [
  { id: 'obligaciones', label: 'Obligaciones', intro: 'Lo que Allah pide a todo musulmán adulto y con capacidad. Cumplirlo es adoración y se recompensa.' },
  { id: 'derechos', label: 'Derechos', intro: 'El islam establece derechos que nadie puede quitarte, y derechos que tú debes respetar en los demás.' },
  { id: 'prohibido', label: 'Prohibido', intro: 'Lo haram: lo que Allah ha prohibido para protegerte a ti y a la sociedad. Si caes en algo, la puerta del arrepentimiento siempre está abierta.' },
  { id: 'permitido', label: 'Permitido', intro: 'La regla general es que todo es lícito salvo lo que una prueba clara prohíbe. La lista de lo halal es mucho más larga que la de lo haram.' },
];

export const GUIDE = [
  // ---------------- Obligaciones ----------------
  { sec: 'obligaciones', for: 'all', title: 'Las cinco oraciones diarias', text: 'Rezar Fajr, Dhuhr, Asr, Maghrib e Isha en su tiempo. Es lo primero por lo que se pedirán cuentas.', src: 'Corán 4:103; At-Tirmidhi 413' },
  { sec: 'obligaciones', for: 'all', title: 'El ayuno de Ramadán', text: 'Desde el alba hasta la puesta del sol, si estás sano y no de viaje. Quien no puede por enfermedad o viaje recupera los días después.', src: 'Corán 2:183-185' },
  { sec: 'obligaciones', for: 'all', title: 'El zakat', text: 'El 2,5 % de los ahorros que superan el nisab tras un año lunar. Es un derecho de los pobres sobre tu riqueza.', src: 'Corán 9:60, 9:103' },
  { sec: 'obligaciones', for: 'all', title: 'La peregrinación (Hajj)', text: 'Una vez en la vida, si tienes la salud y los medios para ello.', src: 'Corán 3:97' },
  { sec: 'obligaciones', for: 'all', title: 'La pureza ritual', text: 'Tener wudu para rezar y hacer el ghusl (baño completo) cuando es obligatorio: tras las relaciones íntimas o una eyaculación, y en la mujer tras la regla y el posparto.', src: 'Corán 5:6' },
  { sec: 'obligaciones', for: 'all', title: 'Aprender lo básico de tu religión', text: 'Saber lo necesario para practicar bien: tu fe, cómo rezar, ayunar y lo halal y lo haram de tu día a día.', src: 'Ibn Mayah 224' },
  { sec: 'obligaciones', for: 'all', title: 'Honrar a los padres', text: 'Tratarles con bondad, ayudarles y no decirles ni «uf», aunque no sean musulmanes. Solo no se les obedece en lo que sea desobedecer a Allah.', src: 'Corán 17:23-24, 31:15' },
  { sec: 'obligaciones', for: 'all', title: 'Cumplir la palabra y los contratos', text: 'Cumplir promesas, pagar deudas, devolver lo que se te confía y ser honesto en el trabajo y el comercio.', src: 'Corán 5:1, 17:34; Al-Bujari 33' },
  { sec: 'obligaciones', for: 'all', title: 'Mantener los lazos familiares', text: 'No romper la relación con los familiares, aunque ellos la rompan contigo.', src: 'Corán 4:1; Al-Bujari 5991' },
  { sec: 'obligaciones', for: 'all', title: 'Vestir con pudor', text: 'Cubrir la awra (las partes que deben taparse) ante quien no es tu cónyuge, y bajar la mirada.', src: 'Corán 24:30-31' },
  { sec: 'obligaciones', for: 'm', title: 'La oración del viernes (Yumuaa)', text: 'Para el hombre adulto que no está de viaje ni enfermo es obligatorio asistir al sermón y la oración del viernes en la mezquita; sustituye a Dhuhr.', src: 'Corán 62:9; Abu Dawud 1067' },
  { sec: 'obligaciones', for: 'm', title: 'Mantener a la familia (nafaqa)', text: 'El marido debe pagar la vivienda, la comida y la ropa de su esposa e hijos según sus posibilidades, aunque ella tenga dinero propio.', src: 'Corán 2:233, 4:34, 65:7' },
  { sec: 'obligaciones', for: 'm', title: 'Dar la dote (mahr)', text: 'Al casarse, el hombre entrega a su esposa una dote que pasa a ser solo de ella.', src: 'Corán 4:4' },
  { sec: 'obligaciones', for: 'm', title: 'Tratar bien a la esposa', text: '«Los mejores de vosotros son los mejores con sus familias, y yo soy el mejor de vosotros con mi familia.» El Profeta ﷺ ayudaba en las tareas de casa.', src: 'At-Tirmidhi 3895; Al-Bujari 676' },
  { sec: 'obligaciones', for: 'm', title: 'Tu awra', text: 'El hombre cubre como mínimo desde el ombligo hasta las rodillas, también en la oración (donde además se recomienda cubrir los hombros).', src: 'Abu Dawud 496; Al-Bujari 359' },
  { sec: 'obligaciones', for: 'f', title: 'Cubrirte ante hombres no mahram (hijab)', text: 'La mayoría de los sabios entienden que la mujer cubre todo el cuerpo salvo la cara y las manos ante hombres con los que podría casarse, con ropa holgada que no transparente. Algunos piden también cubrir la cara.', src: 'Corán 24:31, 33:59' },
  { sec: 'obligaciones', for: 'f', title: 'El ghusl tras la regla y el posparto', text: 'Cuando termina el sangrado haces el ghusl y vuelves a rezar. Si termina antes de que acabe el tiempo de una oración, se reza esa oración.', src: 'Corán 2:222' },
  { sec: 'obligaciones', for: 'f', title: 'Recuperar los días de ayuno', text: 'Los días de Ramadán que no ayunaste por la regla o el posparto se recuperan después. Las oraciones de esos días no se recuperan.', src: 'Muslim 335' },
  { sec: 'obligaciones', for: 'f', title: 'Buen trato al esposo', text: 'El matrimonio es de derechos mutuos: cada cónyuge tiene derechos equivalentes a sus obligaciones, con bondad.', src: 'Corán 2:228, 30:21' },

  // ---------------- Derechos ----------------
  { sec: 'derechos', for: 'all', title: 'Vida, bienes y honor sagrados', text: 'Tu sangre, tu dinero y tu dignidad son inviolables. Nadie puede dañarlos sin derecho.', src: 'Muslim 1218' },
  { sec: 'derechos', for: 'all', title: 'Justicia', text: 'Tienes derecho a ser tratado con justicia, también por quien no te aprecia. Y debes ser justo tú también.', src: 'Corán 4:135, 5:8' },
  { sec: 'derechos', for: 'all', title: 'Libertad de conciencia', text: 'No hay coacción en la religión: la fe tiene que ser sincera.', src: 'Corán 2:256' },
  { sec: 'derechos', for: 'all', title: 'Derechos del musulmán sobre otro musulmán', text: 'Que le devuelvas el saludo, le visites si enferma, acompañes su funeral, aceptes su invitación y respondas a su estornudo.', src: 'Al-Bujari 1240; Muslim 2162' },
  { sec: 'derechos', for: 'all', title: 'Derechos del vecino', text: 'Yibril insistió tanto en el vecino que el Profeta ﷺ pensó que llegaría a heredar. No molestarle y ayudarle.', src: 'Al-Bujari 6014' },
  { sec: 'derechos', for: 'all', title: 'Derecho a la educación', text: 'Buscar el conocimiento es un deber y un derecho de cada musulmán, hombre o mujer.', src: 'Ibn Mayah 224' },
  { sec: 'derechos', for: 'm', title: 'En el matrimonio', text: 'Que tu esposa te trate con bondad y respeto y no deje entrar en casa a quien tú no quieras; derechos que se equilibran con los de ella.', src: 'Corán 2:228; Muslim 1218' },
  { sec: 'derechos', for: 'm', title: 'Respeto de los hijos', text: 'Que tus hijos te honren y te cuiden en la vejez, como tú les criaste.', src: 'Corán 17:23-24' },
  { sec: 'derechos', for: 'f', title: 'Elegir con quién te casas', text: 'No se te puede casar sin tu consentimiento. Un matrimonio forzado puede anularse.', src: 'Al-Bujari 5136, 5138' },
  { sec: 'derechos', for: 'f', title: 'Tu dote (mahr)', text: 'Es tuya y de nadie más: ni tu padre ni tu marido pueden tomarla sin tu permiso.', src: 'Corán 4:4' },
  { sec: 'derechos', for: 'f', title: 'Manutención', text: 'Tu marido debe pagar tu vivienda, comida y ropa. Tu dinero y tus ingresos son tuyos y no estás obligada a gastarlos en casa.', src: 'Corán 4:34, 65:6-7' },
  { sec: 'derechos', for: 'f', title: 'Herencia y propiedad', text: 'Heredas, posees, compras y vendes en tu propio nombre. Jadiya, la primera esposa del Profeta ﷺ, era una comerciante independiente.', src: 'Corán 4:7, 4:11, 4:32' },
  { sec: 'derechos', for: 'f', title: 'Buen trato', text: '«Tratadlas con bondad»: el maltrato está prohibido. Si el matrimonio no funciona, puedes pedir la separación (jul).', src: 'Corán 4:19; Al-Bujari 5273' },
  { sec: 'derechos', for: 'f', title: 'Ir a la mezquita', text: '«No impidáis a las siervas de Allah ir a las mezquitas de Allah.»', src: 'Al-Bujari 900; Muslim 442' },
  { sec: 'derechos', for: 'f', title: 'Honor como madre', text: 'Preguntaron al Profeta ﷺ quién merece más el buen trato: «Tu madre», tres veces, y después «tu padre».', src: 'Al-Bujari 5971' },

  // ---------------- Prohibido ----------------
  { sec: 'prohibido', for: 'all', title: 'Asociar algo a Allah (shirk)', text: 'Adorar a otro junto a Allah, o pedir a los muertos, a los amuletos o a la adivinación lo que solo Allah da.', src: 'Corán 4:48, 31:13' },
  { sec: 'prohibido', for: 'all', title: 'Alcohol, drogas y juegos de azar', text: 'Todo lo que embriaga está prohibido, poco o mucho. También las apuestas y la lotería.', src: 'Corán 5:90; Muslim 2003' },
  { sec: 'prohibido', for: 'all', title: 'Cerdo, sangre y animales muertos', text: 'Y lo sacrificado en nombre de otro que Allah. En caso de necesidad extrema se permite lo justo para sobrevivir.', src: 'Corán 2:173, 5:3' },
  { sec: 'prohibido', for: 'all', title: 'La usura (riba)', text: 'Cobrar o pagar intereses en préstamos. Es de los pecados más graves en el Corán.', src: 'Corán 2:275-279' },
  { sec: 'prohibido', for: 'all', title: 'Relaciones fuera del matrimonio', text: '«No os acerquéis a la fornicación»: incluye lo que lleva a ella, como la intimidad a solas con alguien con quien podrías casarte.', src: 'Corán 17:32; Al-Bujari 5233' },
  { sec: 'prohibido', for: 'all', title: 'Mentir, la murmuración y la calumnia', text: 'Hablar de alguien a sus espaldas lo que no le gustaría (guiba), sembrar cizaña o acusar sin pruebas.', src: 'Corán 49:11-12; Muslim 2589' },
  { sec: 'prohibido', for: 'all', title: 'Robar, engañar y no pagar', text: 'Tomar lo ajeno, hacer trampas en el comercio o retrasar el sueldo del trabajador.', src: 'Corán 83:1-3; Ibn Mayah 2443' },
  { sec: 'prohibido', for: 'all', title: 'Hacerte daño a ti mismo', text: 'Tu cuerpo es un depósito. Quitarse la vida es un pecado grave; si lo estás pensando, busca ayuda hoy mismo.', src: 'Corán 4:29, 2:195' },
  { sec: 'prohibido', for: 'all', title: 'La magia y la adivinación', text: 'Practicarla o acudir a adivinos y creer lo que dicen.', src: 'Corán 2:102; Muslim 2230' },
  { sec: 'prohibido', for: 'all', title: 'Maltratar a los padres', text: 'La desobediencia y el maltrato a los padres está entre los pecados mayores.', src: 'Al-Bujari 5976' },
  { sec: 'prohibido', for: 'm', title: 'Oro y seda para el hombre', text: 'Llevar joyas de oro o ropa de seda natural está prohibido al hombre y permitido a la mujer.', src: 'Abu Dawud 4057; An-Nasa’i 5144' },
  { sec: 'prohibido', for: 'm', title: 'Imitar a las mujeres', text: 'En la ropa y la apariencia propias de ellas.', src: 'Al-Bujari 5885' },
  { sec: 'prohibido', for: 'm', title: 'Las relaciones durante la regla', text: 'Está prohibido el coito con la esposa durante la regla y el posparto; el resto del afecto está permitido.', src: 'Corán 2:222; Muslim 302' },
  { sec: 'prohibido', for: 'f', title: 'Rezar y ayunar durante la regla', text: 'No rezas ni ayunas durante la regla o el posparto, y tampoco hay relaciones íntimas ni tawaf alrededor de la Kaaba. Es una exención de Allah, no un castigo.', src: 'Corán 2:222; Al-Bujari 304' },
  { sec: 'prohibido', for: 'f', title: 'Imitar a los hombres', text: 'En la ropa y la apariencia propias de ellos.', src: 'Al-Bujari 5885' },
  { sec: 'prohibido', for: 'f', title: 'Casarte con un no musulmán', text: 'La musulmana se casa con un musulmán; la mayoría de los sabios coincide en esto.', src: 'Corán 60:10, 2:221' },

  // ---------------- Permitido ----------------
  { sec: 'permitido', for: 'all', title: 'Todo lo bueno', text: 'Comer, beber, vestir bien y disfrutar de lo lícito sin derrochar: «¿Quién ha prohibido la belleza que Allah ha sacado para Sus siervos?».', src: 'Corán 7:31-32' },
  { sec: 'permitido', for: 'all', title: 'Lo que viene del mar', text: 'La pesca y los alimentos del mar, según la mayoría (los hanafíes solo aceptan el pescado).', src: 'Corán 5:96' },
  { sec: 'permitido', for: 'all', title: 'La comida de la Gente del Libro', text: 'La carne sacrificada por judíos y cristianos es lícita según el Corán; los sabios discuten si la carne industrial actual cumple las condiciones. Ante la duda, busca halal.', src: 'Corán 5:5' },
  { sec: 'permitido', for: 'all', title: 'Trabajar y comerciar', text: 'Ganarse la vida de forma honesta es adoración. «Allah ha permitido el comercio y ha prohibido la usura.»', src: 'Corán 2:275; Al-Bujari 2072' },
  { sec: 'permitido', for: 'all', title: 'Deporte y diversión sana', text: 'El Profeta ﷺ hizo carreras con Aisha y animaba a nadar, montar y practicar el tiro.', src: 'Abu Dawud 2578' },
  { sec: 'permitido', for: 'all', title: 'Facilidades cuando lo necesitas', text: 'Acortar y juntar oraciones de viaje, rezar sentado si no puedes estar de pie, tayammum (purificación con tierra) si no hay agua o te hace daño.', src: 'Corán 4:43, 4:101; Al-Bujari 1117' },
  { sec: 'permitido', for: 'all', title: 'El matrimonio y la intimidad', text: 'El matrimonio es una sunnah, y la intimidad entre esposos es incluso recompensada.', src: 'Corán 30:21; Muslim 1006' },
  { sec: 'permitido', for: 'm', title: 'Un anillo de plata', text: 'El Profeta ﷺ llevaba un anillo de plata.', src: 'Al-Bujari 5866' },
  { sec: 'permitido', for: 'm', title: 'Casarte con una mujer de la Gente del Libro', text: 'El Corán permite al musulmán casarse con una judía o cristiana casta, aunque muchos sabios lo desaconsejan hoy por la educación de los hijos.', src: 'Corán 5:5' },
  { sec: 'permitido', for: 'f', title: 'Oro, seda y adornos', text: 'Te están permitidos. Ante tu marido y tu familia cercana (mahram) puedes mostrar tu adorno.', src: 'An-Nasa’i 5144; Corán 24:31' },
  { sec: 'permitido', for: 'f', title: 'Durante la regla', text: 'Puedes hacer dikr, duas, escuchar el Corán, aprender y dar sadaqa. Sobre recitar el Corán de memoria los sabios difieren: los malikíes lo permiten; otras escuelas no.', src: 'Al-Bujari 305' },
  { sec: 'permitido', for: 'f', title: 'Trabajar, estudiar y tener negocio propio', text: 'Con respeto a las normas de pudor y a tus obligaciones familiares. Tus ingresos son tuyos.', src: 'Corán 4:32' },
  { sec: 'permitido', for: 'f', title: 'No ayunar si estás embarazada o das el pecho', text: 'Si temes por ti o por el bebé, puedes no ayunar y recuperar después (algunas escuelas piden además fidya).', src: 'Abu Dawud 2408; At-Tirmidhi 715' },
];

export const GUIDE_NOTE = 'Esta guía resume posiciones mayoritarias con su fuente. En temas donde las escuelas difieren o en tu caso personal, consulta a un imam o a un sabio de confianza.';

export const PERIOD_INFO = [
  'La regla (hayd) y el sangrado del posparto (nifas) eximen de la oración y del ayuno. Las oraciones no se recuperan; los días de ayuno de Ramadán sí.',
  'Cuando termina el sangrado haces el ghusl: intención, lavar todo el cuerpo con agua y que llegue a la raíz del cabello.',
  'La duración máxima de la regla depende de la escuela: 10 días para los hanafíes y 15 para malikíes, shafiíes y hanbalíes. Un sangrado que pasa ese límite se trata como istihada: rezas haciendo wudu para cada oración.',
  'Durante la regla puedes hacer dikr, duas y escuchar el Corán, y seguir aprendiendo. Tu recompensa por lo que solías hacer continúa.',
];
