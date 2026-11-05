# Sakina · سكينة

Tu compañero diario para la práctica del islam: una app web instalable (PWA) que funciona sin conexión y guarda todo en tu móvil.

## Qué incluye

- **Hoy**: horarios de rezo calculados en el dispositivo para tu ubicación (GPS o búsqueda de ciudad), próxima oración con cuenta atrás, registro de las cinco oraciones (y si fue en congregación), racha y fecha hégira.
- **Calendario mensual**: navega mes a mes, ve qué días completaste y toca un día para marcar las oraciones que rezaste y si ayunaste.
- **Ayuno**: marca cada día como ayunado (Ramadán, voluntario, recuperación o promesa), sugerencias de días sunnah (lunes, jueves, días blancos, Arafat, Ashura) y contador de días de Ramadán por recuperar.
- **Perfil hombre / mujer**: para la mujer, seguimiento de la regla: pausa las oraciones esos días (sin romper la racha), los marca en el calendario, calcula duración media, ciclo y fecha prevista.
- **Qibla**: dirección y distancia a La Meca, con brújula en vivo.
- **Duas**: más de 70 súplicas del Corán y la Sunnah con árabe, transliteración, traducción y fuente. Búsqueda por necesidad con sinónimos («finanzas» encuentra deudas y sustento).
- **Dikr**: contador con vibración, secuencia 33·33·33 y adhkar de mañana, tarde y tras la oración, todos con transliteración y traducción completa.
- **Aprender**:
  - *Lecturas*: casi 90 textos de Corán, hadices, sira, profetas, sunnah y fundamentos.
  - *Asesor*: un asesor de IA (Claude Opus 5.5) para preguntas y dudas, que responde con el Corán, los hadices (colección y número) y las posiciones de las cuatro escuelas, apoyándose en el contenido de la app y, si lo activas, verificando en quran.com, sunnah.com y dorar.net. Usa tu propia clave de API de Anthropic, que se guarda solo en tu móvil.
  - *Empezar*: 15 lecciones para nuevos musulmanes, de la shahada a cómo rezar paso a paso y Al-Fatiha palabra por palabra.
  - *Árabe*: curso desde cero (alfabeto con sus formas, vocales, reglas de lectura y vocabulario), con audio y dos juegos de práctica.
  - *Mi guía*: obligaciones, derechos, lo prohibido y lo permitido según seas hombre o mujer, y un apartado de matrimonio: derechos de cada cónyuge, cómo trataba el Profeta ﷺ a sus esposas, modestia, y lo correcto y lo incorrecto. Todo con fuentes.
- **Sadaqa**: registro de donaciones en dinero y de buenas obras no monetarias (voluntariado, comida, ayuda, horas dedicadas…), totales, desglose por tipo, exportación CSV y calculadora de zakat.
- **Recordatorios**: notificaciones y exportación de 30 días de horarios a tu calendario (.ics) con alarma.
- **Ajustes**: 12 métodos de cálculo, Asr estándar o hanafi, ajuste por minutos, tema claro u oscuro, perfil y copia de seguridad.

## Instalar en el móvil

1. Abre la web de la app en el móvil.
2. **iPhone (Safari)**: Compartir → «Añadir a pantalla de inicio».  
   **Android (Chrome)**: menú ⋮ → «Instalar aplicación».

## Desarrollo

No hay paso de compilación: es HTML, CSS y módulos JavaScript.

```bash
python3 -m http.server 5179
```

Abre `http://localhost:5179`. Al publicar cambios, sube `VERSION` en `sw.js` para que los móviles reciban la nueva versión.

## Privacidad

Tus rezos, tu dikr y tus donaciones nunca salen del dispositivo. Las preguntas al Asesor se envían a Anthropic con tu clave. Aparte de eso, solo se hacen dos consultas a la red, y solo cuando tú las pides: la búsqueda de ciudades (Open-Meteo) y el nombre de tu ubicación al usar el GPS (BigDataCloud).

## Fuentes

Las traducciones del Corán son de su significado. Los hadices citan su colección y número. Ante cualquier duda práctica (zakat, qada, métodos de cálculo), consulta a un imam o a un sabio de confianza.
