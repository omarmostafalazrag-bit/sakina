# Sakina · سكينة

Tu compañero diario para la práctica del islam: una app web instalable (PWA) que funciona sin conexión y guarda todo en tu móvil.

## Qué incluye

- **Hoy**: horarios de rezo calculados en el dispositivo para tu ubicación (GPS o búsqueda de ciudad), próxima oración con cuenta atrás, registro de las cinco oraciones (y si fue en congregación), racha de días, porcentaje del mes y mapa de las últimas cinco semanas. Fecha hégira.
- **Qibla**: dirección y distancia a La Meca, con brújula en vivo en móviles que lo permiten.
- **Duas**: unas 40 súplicas del Corán y la Sunnah con árabe, transliteración, traducción y fuente. Búsqueda por necesidad con sinónimos («finanzas» encuentra las de deudas y sustento), categorías y guardadas.
- **Dikr**: contador (tasbih) con anillo de progreso y vibración, la secuencia de 33·33·33 tras la oración, y los adhkar de la mañana, la tarde y después de rezar con su progreso del día.
- **Aprender**: un feed con Corán, hadices, la sira, historias de los profetas, sunnah práctica y fundamentos. Lectura del día, filtros, guardar y compartir.
- **Sadaqa**: registro de donaciones (cantidad, moneda, tipo, destinatario, nota), totales del mes y del año, desglose por tipo, exportación a CSV y calculadora orientativa de zakat.
- **Recordatorios**: notificaciones de rezo y exportación de 30 días de horarios a tu calendario (.ics) con alarma, que es la opción fiable en iPhone.
- **Ajustes**: 12 métodos de cálculo (Liga Mundial Musulmana, Egipto, Habous, Umm al-Qura, ISNA, Diyanet…), Asr estándar o hanafi, ajuste fino por minutos, tema claro u oscuro, formato de 12 horas, corrección de la fecha hégira, y copia de seguridad para exportar e importar.

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

Tus rezos, tu dikr y tus donaciones nunca salen del dispositivo. Solo se hacen dos consultas a la red, y solo cuando tú las pides: la búsqueda de ciudades (Open-Meteo) y el nombre de tu ubicación al usar el GPS (BigDataCloud).

## Fuentes

Las traducciones del Corán son de su significado. Los hadices citan su colección y número. Ante cualquier duda práctica (zakat, qada, métodos de cálculo), consulta a un imam o a un sabio de confianza.
