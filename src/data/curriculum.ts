import type { Lesson } from "../types";

export const lessons: Lesson[] = [
  {
    id: "meet-the-guitar", world: 1, order: 1, title: "Conoce tu guitarra", subtitle: "Partes, nombres y cuidado", icon: "🎸", durationMinutes: 10,
    objective: "Reconocer el instrumento, sus partes y las reglas básicas de cuidado.", skills: ["Cuidado", "Vocabulario"], visualGuide: "/illustrations/guitar-parts.svg",
    adultNote: "Comprueba que el puente esté firme, que no falten clavijas y que el tamaño de la guitarra corresponda al cuerpo de la niña (1/2, 3/4 o entera).",
    steps: [
      { title: "Explora sin tocar", instruction: "Busca el clavijero, la cejuela, el mástil, los trastes, la boca y el puente en la ilustración y en tu guitarra.", durationMinutes: 3, kind: "observe" },
      { title: "Nombra las cuerdas", instruction: "Desde la más gruesa a la más fina di: Mi, La, Re, Sol, Si y Mi.", durationMinutes: 2, kind: "listen", referenceFrequency: 82.41 },
      { title: "Cuenta los trastes", instruction: "Sigue el mástil con la mirada y cuenta los primeros cinco trastes desde la cejuela.", durationMinutes: 3, kind: "observe", safety: "No apoyes objetos duros sobre la tapa: se marca con facilidad." },
      { title: "Ritual de la funda", instruction: "Practica sacar y guardar la guitarra en el orden correcto, con ayuda adulta.", durationMinutes: 2, kind: "move" }
    ],
    quiz: { question: "¿Cuántas cuerdas tiene normalmente una guitarra?", options: ["Cuatro", "Seis", "Ocho"], answer: 1, explanation: "La guitarra tiene seis cuerdas: Mi, La, Re, Sol, Si y Mi." }, reward: "Exploradora del instrumento"
  },
  {
    id: "healthy-posture", world: 1, order: 2, title: "Postura saludable", subtitle: "Equilibrio antes que fuerza", icon: "🧍‍♀️", durationMinutes: 11,
    objective: "Sostener el instrumento con una postura equilibrada, respiración libre y sin dolor.", skills: ["Postura", "Relajación"], visualGuide: "/illustrations/posture.svg",
    adultNote: "La altura del banquillo o del apoyo depende del cuerpo de cada niña; una profesora debe comprobar el ajuste.",
    steps: [
      { title: "Silla estable", instruction: "Siéntate en el borde de una silla firme, con los dos pies apoyados en el suelo.", durationMinutes: 2, kind: "move" },
      { title: "Hombros tranquilos", instruction: "Inhala y exhala tres veces. Comprueba que ambos hombros permanezcan bajos.", durationMinutes: 2, kind: "reflect" },
      { title: "Apoya la guitarra", instruction: "Coloca la cintura de la guitarra sobre la pierna y acerca el instrumento al cuerpo sin encorvarte.", durationMinutes: 4, kind: "move", safety: "Detente ante dolor, hormigueo o tensión persistente." },
      { title: "Prueba de libertad", instruction: "Mueve los dedos, abre la boca y respira. El cuerpo debe seguir libre y la guitarra no debe caerse.", durationMinutes: 3, kind: "reflect" }
    ],
    quiz: { question: "¿Cuál es la señal de una postura saludable?", options: ["Respirar y moverse con libertad", "Encorvar la espalda para ver los trastes", "Levantar el hombro derecho"], answer: 0, explanation: "La postura debe permitir respirar y moverse sin tensión." }, reward: "Guardiana de la postura"
  },
  {
    id: "right-hand-shape", world: 1, order: 3, title: "La mano que pulsa", subtitle: "Pulgar, índice, medio y anular", icon: "✋", durationMinutes: 10,
    objective: "Formar una mano derecha redonda y flexible antes de pulsar las cuerdas.", skills: ["Mano derecha", "Motricidad"], visualGuide: "/illustrations/right-hand.svg",
    steps: [
      { title: "Nombres en letras", instruction: "Aprende los nombres clásicos: pulgar p, índice i, medio m y anular a.", durationMinutes: 3, kind: "observe" },
      { title: "Curva natural", instruction: "Deja caer el brazo y observa la curva que forman los dedos sin esfuerzo. Esa es la forma que se busca.", durationMinutes: 2, kind: "move" },
      { title: "Pulgar por delante", instruction: "Apoya el pulgar sobre una mesa formando una X con el índice, sin que se escondan uno debajo del otro.", durationMinutes: 2, kind: "move" },
      { title: "Dedos que respiran", instruction: "Abre y cierra ligeramente los dedos manteniendo la curva. Las uñas cortas de la mano izquierda ayudan.", durationMinutes: 3, kind: "play" }
    ],
    quiz: { question: "¿Qué letra nombra al dedo índice de la mano que pulsa?", options: ["p", "i", "a"], answer: 1, explanation: "Se usan p (pulgar), i (índice), m (medio) y a (anular)." }, reward: "Amiga de las cuatro letras"
  },
  {
    id: "guitar-care", world: 1, order: 4, title: "Cuida y guarda tu guitarra", subtitle: "Cuerdas, limpieza y funda", icon: "🧽", durationMinutes: 10,
    objective: "Cuidar el instrumento sin dañarlo y desarrollar hábitos responsables.", skills: ["Cuidado", "Autonomía"],
    adultNote: "El cambio de cuerdas y los ajustes de clavijero deben hacerlos una persona con experiencia; una cuerda tensada de más puede romperse.",
    steps: [
      { title: "Observa las clavijas", instruction: "Mira cómo la cuerda se enrolla en cada clavija. Un giro pequeño ya cambia mucho la afinación.", durationMinutes: 2, kind: "observe" },
      { title: "Giros seguros", instruction: "Con ayuda adulta, gira una clavija muy poco y escucha el cambio. Vuelve a dejarla como estaba.", durationMinutes: 3, kind: "move", safety: "Nunca tenses una cuerda de golpe: puede romperse y saltar." },
      { title: "Limpieza suave", instruction: "Pasa un paño seco por las cuerdas y la tapa al terminar de tocar.", durationMinutes: 2, kind: "move" },
      { title: "Guarda con cuidado", instruction: "Deja la guitarra en su funda o en un soporte, lejos del sol directo y de la calefacción.", durationMinutes: 3, kind: "move" }
    ],
    quiz: { question: "¿Dónde conviene guardar la guitarra?", options: ["En su funda, lejos del sol y del calor", "Apoyada en la pared del pasillo", "Sobre la cama"], answer: 0, explanation: "La madera se mueve con el calor y la humedad: la funda la protege." }, reward: "Protectora del instrumento"
  },
  {
    id: "open-strings", world: 2, order: 5, title: "Las seis voces", subtitle: "Mi, La, Re, Sol, Si y Mi", icon: "🎵", durationMinutes: 12,
    objective: "Reconocer visualmente y de oído las seis cuerdas al aire.", skills: ["Oído", "Cuerdas"],
    steps: [
      { title: "Voces graves", instruction: "Escucha la sexta cuerda (Mi) y la quinta (La). Describe si suenan oscuras, profundas o tranquilas.", durationMinutes: 3, kind: "listen", referenceFrequency: 82.41 },
      { title: "Voces centrales", instruction: "Escucha Re y Sol. Decide cuál es más aguda.", durationMinutes: 3, kind: "listen", referenceFrequency: 146.83 },
      { title: "Voces brillantes", instruction: "Escucha Si y la primera cuerda (Mi), la más fina y aguda.", durationMinutes: 2, kind: "listen", referenceFrequency: 329.63 },
      { title: "Orden y memoria", instruction: "Di Mi–La–Re–Sol–Si–Mi y luego al revés, sin mirar.", durationMinutes: 4, kind: "play" }
    ],
    quiz: { question: "¿Cuál es la cuerda más grave?", options: ["La sexta (Mi)", "La tercera (Sol)", "La primera (Mi)"], answer: 0, explanation: "La sexta es la más gruesa y grave; se llama Mi, igual que la primera, pero dos octavas más abajo." }, reward: "Detective de las cuerdas"
  },
  {
    id: "steady-pulse", world: 2, order: 6, title: "El pulso secreto", subtitle: "Camina, cuenta y aplaude", icon: "👏", durationMinutes: 11,
    objective: "Mantener un pulso regular y reconocer negra, blanca y silencio.", skills: ["Ritmo", "Coordinación"],
    steps: [
      { title: "Camina ocho", instruction: "Da ocho pasos iguales mientras cuentas del uno al ocho.", durationMinutes: 2, kind: "move" },
      { title: "Negras", instruction: "Aplaude una vez en cada pulso: uno, dos, tres, cuatro.", durationMinutes: 3, kind: "play" },
      { title: "Blancas", instruction: "Aplaude en uno y mantén las manos juntas hasta el siguiente uno.", durationMinutes: 3, kind: "play" },
      { title: "Silencio activo", instruction: "Cuenta cuatro pulsos y deja el tercero sin aplaudir, pero sigue sintiéndolo.", durationMinutes: 3, kind: "play" }
    ],
    quiz: { question: "¿Cuántos pulsos dura normalmente una blanca?", options: ["Uno", "Dos", "Tres"], answer: 1, explanation: "En este nivel, una blanca dura dos pulsos." }, reward: "Capitana del pulso"
  },
  {
    id: "first-plucking", world: 2, order: 7, title: "Primera pulsación", subtitle: "Música con el pulgar", icon: "👍", durationMinutes: 12,
    objective: "Pulsar cuerdas al aire con sonido claro y sin tensión.", skills: ["Pulsación", "Ritmo"],
    steps: [
      { title: "Apoyo estable", instruction: "Deja el antebrazo derecho descansando sobre el borde de la guitarra, sin apretar.", durationMinutes: 2, kind: "move" },
      { title: "La que vibra", instruction: "Pulsa la sexta cuerda con el pulgar y deja que termine de vibrar sin taparla.", durationMinutes: 3, kind: "play", referenceFrequency: 82.41 },
      { title: "Viaje por tres", instruction: "Toca Mi, La y Re lentamente, mirando qué cuerda eliges.", durationMinutes: 3, kind: "play", referenceFrequency: 110 },
      { title: "Eco", instruction: "Repite: La–La, pausa, La–La. Luego inventa un eco con Re.", durationMinutes: 4, kind: "play" }
    ],
    quiz: { question: "¿Con qué dedo se pulsan normalmente las cuerdas graves?", options: ["Con el pulgar (p)", "Con el meñique", "Con el anular (a)"], answer: 0, explanation: "El pulgar se ocupa de las cuerdas graves; los otros dedos, de las agudas." }, reward: "Inventora de la pulsación"
  },
  {
    id: "string-crossing", world: 2, order: 8, title: "Puentes entre cuerdas", subtitle: "Índice y medio se alternan", icon: "🌉", durationMinutes: 13,
    objective: "Alternar los dedos i y m en cuerdas al aire manteniendo un pulso estable.", skills: ["Pulsación", "Cambios de cuerda"],
    steps: [
      { title: "i–m en la primera", instruction: "Pulsa la primera cuerda alternando índice y medio ocho veces, muy lentamente.", durationMinutes: 3, kind: "play", referenceFrequency: 329.63 },
      { title: "i–m en la segunda", instruction: "Repite en la segunda cuerda sin mover todo el brazo.", durationMinutes: 3, kind: "play", referenceFrequency: 246.94 },
      { title: "Cambia de cuerda", instruction: "Alterna primera y segunda cuerda escuchando la diferencia de altura.", durationMinutes: 3, kind: "play" },
      { title: "Patrón de cuatro", instruction: "Toca 1.ª–1.ª–2.ª–2.ª durante cuatro vueltas con el metrónomo a 60 BPM.", durationMinutes: 4, kind: "play" }
    ],
    quiz: { question: "Al cambiar de cuerda, ¿qué conviene conservar?", options: ["El pulso", "La tensión", "La velocidad máxima"], answer: 0, explanation: "El cambio debe ocurrir sin perder el pulso ni tensar el cuerpo." }, reward: "Constructora de puentes"
  },
  {
    id: "rest-and-free-stroke", world: 3, order: 9, title: "Apoyando y tirando", subtitle: "Dos formas de pulsar", icon: "↔️", durationMinutes: 13,
    objective: "Distinguir la pulsación apoyando de la pulsación tirando y elegir cuál usar.", skills: ["Pulsación", "Sonido"],
    steps: [
      { title: "Apoyando", instruction: "Pulsa la primera cuerda y deja que el dedo se detenga apoyado en la cuerda vecina.", durationMinutes: 3, kind: "move", referenceFrequency: 329.63 },
      { title: "Tirando", instruction: "Pulsa de nuevo, pero esta vez el dedo pasa por encima sin tocar la cuerda siguiente.", durationMinutes: 3, kind: "move" },
      { title: "Compara", instruction: "Toca cuatro notas apoyando y cuatro tirando. ¿Cuál suena más redonda?", durationMinutes: 4, kind: "listen" },
      { title: "Espejo amable", instruction: "Mira en un espejo si la muñeca se mantiene tranquila. Corrige poco, no a la fuerza.", durationMinutes: 3, kind: "reflect", safety: "Detente si el hombro sube o aparece dolor." }
    ],
    quiz: { question: "En la pulsación apoyando, el dedo…", options: ["Se detiene en la cuerda siguiente", "Salta hacia arriba", "No toca la cuerda"], answer: 0, explanation: "Apoyando, el dedo descansa en la cuerda vecina y el sonido resulta más lleno." }, reward: "Piloto de la pulsación"
  },
  {
    id: "tone-and-contact", world: 3, order: 10, title: "Dónde pulsar", subtitle: "Encuentra un sonido cómodo", icon: "⚖️", durationMinutes: 14,
    objective: "Explorar cómo el punto de contacto y la fuerza modifican el sonido.", skills: ["Calidad sonora", "Control"],
    steps: [
      { title: "Cerca del puente", instruction: "Pulsa la primera cuerda junto al puente y escucha el sonido brillante y algo metálico.", durationMinutes: 3, kind: "listen" },
      { title: "Sobre la boca", instruction: "Pulsa encima de la boca y compara: el sonido es más dulce y redondo.", durationMinutes: 3, kind: "listen" },
      { title: "Demasiada fuerza", instruction: "Con supervisión, aumenta apenas la fuerza hasta notar el inicio de un sonido áspero; vuelve atrás.", durationMinutes: 4, kind: "listen", safety: "No tires de la cuerda con fuerza ni prolongues un sonido incómodo." },
      { title: "Describe", instruction: "Elige tres palabras para tu mejor sonido: claro, suave, brillante, cálido u otras.", durationMinutes: 4, kind: "reflect" }
    ],
    quiz: { question: "¿Qué ocurre al pulsar más cerca del puente?", options: ["El sonido se vuelve más brillante", "La guitarra se desafina", "La nota cambia de nombre"], answer: 0, explanation: "El punto de contacto cambia el color del sonido, no la altura de la nota." }, reward: "Científica del sonido"
  },
  {
    id: "left-hand-map", world: 3, order: 11, title: "Mapa de la mano izquierda", subtitle: "Pulgar detrás y dedos redondos", icon: "🖐️", durationMinutes: 12,
    objective: "Colocar la mano izquierda sin apretar el mástil.", skills: ["Mano izquierda", "Relajación"], visualGuide: "/illustrations/left-hand.svg",
    steps: [
      { title: "Mano de títere", instruction: "Deja caer la mano y observa la curva natural de los dedos.", durationMinutes: 2, kind: "observe" },
      { title: "Pulgar detrás", instruction: "Apoya el pulgar plano en la parte de atrás del mástil, más o menos frente al dedo medio.", durationMinutes: 3, kind: "move" },
      { title: "Túnel", instruction: "Conserva espacio entre la palma y el mástil; la mano no debe abrazarlo.", durationMinutes: 3, kind: "move" },
      { title: "Dedos 1–4", instruction: "Nombra índice 1, medio 2, anular 3 y meñique 4.", durationMinutes: 4, kind: "play" }
    ],
    quiz: { question: "¿Dónde se apoya el pulgar de la mano izquierda?", options: ["Detrás del mástil", "Sobre las cuerdas", "En la tapa"], answer: 0, explanation: "El pulgar va detrás del mástil y hace de apoyo, no de pinza que aprieta." }, reward: "Cartógrafa de la mano"
  },
  {
    id: "finger-press", world: 3, order: 12, title: "Dedos que pisan", subtitle: "Junto al traste, sin apretar", icon: "🛬", durationMinutes: 13,
    objective: "Pisar las cuerdas con sonido limpio y la menor fuerza posible.", skills: ["Mano izquierda", "Coordinación"],
    steps: [
      { title: "Aterrizaje en mesa", instruction: "Sobre una mesa, levanta y deja caer cada dedo curvo sin hundir la muñeca.", durationMinutes: 3, kind: "move" },
      { title: "Junto al traste", instruction: "Pisa la primera cuerda en el traste 1 justo detrás de la barra metálica y pulsa. Si zumba, acércate más al traste.", durationMinutes: 3, kind: "move" },
      { title: "Fuerza mínima", instruction: "Afloja poco a poco hasta que el sonido empiece a zumbar; vuelve al punto justo anterior.", durationMinutes: 3, kind: "listen" },
      { title: "Secuencia silenciosa", instruction: "Haz 0–1–2–3 y 3–2–1–0 en la primera cuerda cuatro veces, lentamente.", durationMinutes: 4, kind: "play" }
    ],
    quiz: { question: "¿Dónde debe apoyarse el dedo para que la nota suene limpia?", options: ["Justo detrás del traste", "Encima de la barra metálica", "En medio de dos trastes"], answer: 0, explanation: "Pisar junto al traste exige menos fuerza y evita el zumbido." }, reward: "Piloto de dedos"
  },
  {
    id: "notes-on-first-string", world: 4, order: 13, title: "Notas en la primera cuerda", subtitle: "Mi, Fa♯ y Sol", icon: "🌈", durationMinutes: 15,
    objective: "Tocar tres notas consecutivas en la primera cuerda.", skills: ["Afinación", "Digitación"],
    adultNote: "Comprueba que la guitarra esté afinada antes de empezar: una cuerda floja hace imposible reconocer la nota.",
    steps: [
      { title: "Mi = 0", instruction: "Toca la primera cuerda al aire y di: cero, Mi.", durationMinutes: 3, kind: "play", referenceFrequency: 329.63 },
      { title: "Fa♯ = 2", instruction: "Pisa el traste 2 con el dedo 2 y compara tu Fa♯ con la referencia.", durationMinutes: 4, kind: "play", referenceFrequency: 369.99 },
      { title: "Sol = 3", instruction: "Pisa el traste 3 con el dedo 3 y escucha si la nota suena estable.", durationMinutes: 4, kind: "play", referenceFrequency: 392 },
      { title: "Sube y baja", instruction: "Toca Mi–Fa♯–Sol y Sol–Fa♯–Mi lentamente, una nota por pulso.", durationMinutes: 4, kind: "play" }
    ],
    quiz: { question: "¿Qué nota da el traste 3 de la primera cuerda?", options: ["Fa♯", "Sol", "La"], answer: 1, explanation: "Primera cuerda: al aire Mi, traste 2 Fa♯ y traste 3 Sol." }, reward: "Escaladora de la primera"
  },
  {
    id: "notes-on-second-string", world: 4, order: 14, title: "Notas en la segunda cuerda", subtitle: "Si, Do y Re", icon: "🪜", durationMinutes: 15,
    objective: "Tocar tres notas consecutivas en la segunda cuerda.", skills: ["Afinación", "Digitación"],
    steps: [
      { title: "Si = 0", instruction: "Toca la segunda cuerda al aire y escucha su resonancia.", durationMinutes: 3, kind: "play", referenceFrequency: 246.94 },
      { title: "Do = 1", instruction: "Pisa el traste 1 con el dedo 1 y compáralo con la referencia.", durationMinutes: 4, kind: "play", referenceFrequency: 261.63 },
      { title: "Re = 3", instruction: "Pisa el traste 3 con el dedo 3, dejando el dedo 1 cerca de la cuerda.", durationMinutes: 4, kind: "play", referenceFrequency: 293.66 },
      { title: "Une las dos cuerdas", instruction: "Toca Si–Do–Re y sigue con Mi de la primera cuerda al aire.", durationMinutes: 4, kind: "play" }
    ],
    quiz: { question: "¿Qué nota da el traste 1 de la segunda cuerda?", options: ["Do", "Re", "Si"], answer: 0, explanation: "Segunda cuerda: al aire Si, traste 1 Do y traste 3 Re." }, reward: "Escaladora de la segunda"
  },
  {
    id: "g-major-scale", world: 4, order: 15, title: "Escala de Sol mayor", subtitle: "Ocho pasos musicales", icon: "🧗", durationMinutes: 16,
    objective: "Unir las notas de las cuerdas tercera, segunda y primera en una escala ascendente y descendente.", skills: ["Escala", "Cambio de cuerda"],
    steps: [
      { title: "Primer tramo", instruction: "En la tercera cuerda toca Sol (al aire) y La (traste 2).", durationMinutes: 4, kind: "play", referenceFrequency: 196 },
      { title: "Segundo tramo", instruction: "En la segunda cuerda toca Si (al aire), Do (traste 1) y Re (traste 3).", durationMinutes: 4, kind: "play", referenceFrequency: 246.94 },
      { title: "Tercer tramo", instruction: "En la primera cuerda toca Mi (al aire), Fa♯ (traste 2) y Sol (traste 3).", durationMinutes: 4, kind: "play", referenceFrequency: 329.63 },
      { title: "Sube y baja completa", instruction: "Une las ocho notas a 60 BPM y vuelve desde Sol agudo hasta Sol grave sin acelerar.", durationMinutes: 4, kind: "play" }
    ],
    quiz: { question: "¿Cuántas notas diferentes tiene una escala completa hasta repetir la inicial?", options: ["Cuatro", "Siete", "Doce"], answer: 1, explanation: "La escala de Sol mayor usa siete nombres de notas y repite Sol en la octava." }, reward: "Montañista de la escala"
  },
  {
    id: "first-chord", world: 4, order: 16, title: "Tu primer acorde", subtitle: "Mi menor con dos dedos", icon: "🧩", durationMinutes: 14,
    objective: "Formar y hacer sonar el acorde de Mi menor con todas las cuerdas limpias.", skills: ["Acordes", "Mano izquierda"], visualGuide: "/illustrations/chord-diagram.svg",
    adultNote: "Un acorde que zumba casi siempre es un dedo que toca la cuerda vecina, no falta de fuerza. Revisa la curva de los dedos antes de pedir más presión.",
    steps: [
      { title: "Lee el diagrama", instruction: "Observa el diagrama: las líneas verticales son cuerdas, las horizontales trastes y los puntos indican dónde pisar.", durationMinutes: 3, kind: "observe" },
      { title: "Coloca dos dedos", instruction: "Pisa el traste 2 de la quinta cuerda con el dedo 2 y el traste 2 de la cuarta con el dedo 3.", durationMinutes: 4, kind: "move" },
      { title: "Cuerda por cuerda", instruction: "Pulsa las seis cuerdas una a una. Si alguna zumba, redondea más el dedo que la roza.", durationMinutes: 4, kind: "listen" },
      { title: "Todas juntas", instruction: "Pasa el pulgar por las seis cuerdas de arriba abajo, lento y con calma.", durationMinutes: 3, kind: "play" }
    ],
    quiz: { question: "En un diagrama de acorde, ¿qué indican los puntos?", options: ["Dónde pisar", "Qué cuerda no tocar", "El nombre del acorde"], answer: 0, explanation: "Los puntos marcan la cuerda y el traste donde va cada dedo." }, reward: "Maestra del primer acorde"
  },
  {
    id: "music-reading-staff", world: 5, order: 17, title: "El pentagrama", subtitle: "Cinco líneas para contar historias", icon: "🎼", durationMinutes: 13,
    objective: "Reconocer pentagrama, clave de Sol, líneas y espacios.", skills: ["Lectura", "Teoría"], visualGuide: "/illustrations/staff.svg",
    steps: [
      { title: "Cinco líneas", instruction: "Cuenta las cinco líneas desde abajo hacia arriba.", durationMinutes: 3, kind: "observe" },
      { title: "Cuatro espacios", instruction: "Busca los cuatro espacios entre las líneas.", durationMinutes: 2, kind: "observe" },
      { title: "Clave de Sol", instruction: "Observa cómo la clave rodea la segunda línea, donde vive la nota Sol.", durationMinutes: 4, kind: "observe" },
      { title: "Dibujo musical", instruction: "Dibuja un pentagrama y una nota en línea y otra en espacio.", durationMinutes: 4, kind: "play" }
    ],
    quiz: { question: "¿Cuántas líneas tiene el pentagrama?", options: ["Cuatro", "Cinco", "Seis"], answer: 1, explanation: "El pentagrama musical está formado por cinco líneas." }, reward: "Lectora de mapas musicales"
  },
  {
    id: "read-first-strings", world: 5, order: 18, title: "Lee las notas de la 1.ª y la 2.ª", subtitle: "Del papel al instrumento", icon: "📖", durationMinutes: 15,
    objective: "Relacionar notas escritas con las cuerdas primera y segunda y sus trastes.", skills: ["Lectura", "Digitación"],
    steps: [
      { title: "Tarjetas de la primera", instruction: "Nombra Mi, Fa♯ y Sol en tres tarjetas o en la pantalla.", durationMinutes: 3, kind: "observe" },
      { title: "Tarjetas de la segunda", instruction: "Nombra Si, Do y Re.", durationMinutes: 3, kind: "observe" },
      { title: "Lee y toca", instruction: "Elige cuatro tarjetas al azar y tócalas lentamente.", durationMinutes: 5, kind: "play" },
      { title: "Crea un compás", instruction: "Ordena cuatro notas, toca tu creación y ponle un nombre.", durationMinutes: 4, kind: "play" }
    ],
    quiz: { question: "¿Qué conecta la lectura musical?", options: ["Símbolo, nombre y sonido", "Solo velocidad", "Solo memoria"], answer: 0, explanation: "Leer significa relacionar lo escrito con su nombre, su posición y su sonido." }, reward: "Traductora musical"
  },
  {
    id: "eighth-notes", world: 5, order: 19, title: "Corcheas en pareja", subtitle: "Dos sonidos dentro de un pulso", icon: "🎶", durationMinutes: 14,
    objective: "Sentir y tocar dos corcheas por pulso sin acelerar.", skills: ["Ritmo", "Corcheas"],
    steps: [
      { title: "Di ta-ka", instruction: "En cada pulso di ta-ka, manteniendo igual duración para ambas sílabas.", durationMinutes: 3, kind: "play" },
      { title: "Palmas", instruction: "Aplaude dos veces por pulso durante ocho pulsos.", durationMinutes: 3, kind: "play" },
      { title: "i–m sin parar", instruction: "Toca la primera cuerda al aire con i–m, dos notas por pulso a 60 BPM.", durationMinutes: 4, kind: "play", referenceFrequency: 329.63 },
      { title: "Combina", instruction: "Haz negra, dos corcheas, negra, silencio y repite.", durationMinutes: 4, kind: "play" }
    ],
    quiz: { question: "¿Cuántas corcheas caben en un pulso de negra?", options: ["Una", "Dos", "Cuatro"], answer: 1, explanation: "Dos corcheas comparten el tiempo de una negra." }, reward: "Corredora de corcheas"
  },
  {
    id: "tablature", world: 5, order: 20, title: "Leer tablatura", subtitle: "Seis líneas y números", icon: "🗺️", durationMinutes: 15,
    objective: "Interpretar una tablatura sencilla y relacionarla con el pentagrama.", skills: ["Tablatura", "Lectura"],
    steps: [
      { title: "Seis líneas", instruction: "En la tablatura cada línea es una cuerda. La de arriba es la primera, la más aguda.", durationMinutes: 3, kind: "observe" },
      { title: "Los números son trastes", instruction: "Un 0 significa cuerda al aire; un 3, pisar el traste 3 de esa cuerda.", durationMinutes: 4, kind: "observe" },
      { title: "Toca una línea", instruction: "Lee y toca: primera cuerda 0–2–3 y segunda cuerda 3–1–0.", durationMinutes: 4, kind: "play" },
      { title: "Escribe la tuya", instruction: "Escribe cuatro números en la primera cuerda y tócalos en orden.", durationMinutes: 4, kind: "play" }
    ],
    quiz: { question: "En una tablatura, ¿qué significa el número 0?", options: ["Cuerda al aire", "No tocar esa cuerda", "Traste diez"], answer: 0, explanation: "El 0 indica que la cuerda suena al aire, sin pisar." }, reward: "Navegante de la tablatura"
  },
  {
    id: "twinkle", world: 6, order: 21, title: "Estrellita", subtitle: "Una melodía por fragmentos", icon: "⭐", durationMinutes: 17,
    objective: "Interpretar la primera parte de Estrellita con ritmo estable.", skills: ["Repertorio", "Memoria"],
    steps: [
      { title: "Canta y marca", instruction: "Canta la melodía mientras marcas un pulso tranquilo.", durationMinutes: 3, kind: "listen" },
      { title: "Primer motivo", instruction: "Toca Sol–Sol–Re–Re–Mi–Mi–Re, muy lento.", durationMinutes: 5, kind: "play", referenceFrequency: 196 },
      { title: "Segundo motivo", instruction: "Toca Do–Do–Si–Si–La–La–Sol.", durationMinutes: 5, kind: "play", referenceFrequency: 261.63 },
      { title: "Une", instruction: "Une ambos motivos sin detenerte por errores pequeños.", durationMinutes: 4, kind: "play" }
    ],
    quiz: { question: "¿Qué ayuda al aprender una canción?", options: ["Dividirla en fragmentos", "Tocarla rápido de inmediato", "Evitar cantar"], answer: 0, explanation: "Los fragmentos pequeños permiten escuchar, corregir y memorizar." }, reward: "Primera estrella musical"
  },
  {
    id: "ode-to-joy", world: 6, order: 22, title: "Oda a la alegría", subtitle: "Una frase con dirección", icon: "😊", durationMinutes: 18,
    objective: "Preparar y tocar una frase sencilla con notas consecutivas.", skills: ["Repertorio", "Fraseo"],
    steps: [
      { title: "Canta primero", instruction: "Canta el inicio usando la sílaba la y siente dónde respira la frase.", durationMinutes: 3, kind: "listen" },
      { title: "Dedos silenciosos", instruction: "Practica la secuencia de la mano izquierda sin pulsar y sin apretar.", durationMinutes: 4, kind: "move" },
      { title: "Lento y claro", instruction: "Toca la frase a 60 BPM, corrigiendo solo un detalle cada vez.", durationMinutes: 5, kind: "play", referenceFrequency: 246.94 },
      { title: "Frase completa", instruction: "Toca fragmentos de dos compases con sonido tranquilo y únelos.", durationMinutes: 6, kind: "play" }
    ],
    quiz: { question: "Antes de aumentar la velocidad, la frase debe salir…", options: ["Clara y estable", "Cada vez distinta", "Con mucha fuerza"], answer: 0, explanation: "La velocidad llega después de controlar notas, ritmo y postura." }, reward: "Mensajera de la alegría"
  },
  {
    id: "chilean-rhythm", world: 6, order: 23, title: "Un aire chileno", subtitle: "Rasgueo, acento y creación", icon: "🇨🇱", durationMinutes: 17,
    objective: "Explorar un rasgueo inspirado en música chilena sin copiar repertorio protegido.", skills: ["Ritmo", "Creatividad"],
    steps: [
      { title: "Pulso de tres", instruction: "Cuenta 1–2–3 y acentúa suavemente el primer pulso.", durationMinutes: 3, kind: "play" },
      { title: "Mano suelta", instruction: "Rasguea al aire, sin pisar, con la mano relajada: abajo en 1, abajo–arriba en 2 y 3.", durationMinutes: 4, kind: "play" },
      { title: "Con Mi menor", instruction: "Repite el rasgueo con el acorde de Mi menor que aprendiste.", durationMinutes: 5, kind: "play" },
      { title: "Tu variación", instruction: "Crea un compás nuevo cambiando dónde va el acento y repítelo cuatro veces.", durationMinutes: 5, kind: "play" }
    ],
    quiz: { question: "¿Qué es un acento musical?", options: ["Un pulso destacado", "Una nota siempre aguda", "Tocar sin contar"], answer: 0, explanation: "El acento destaca un pulso o sonido dentro del patrón." }, reward: "Creadora de ritmos"
  },
  {
    id: "mini-recital", world: 6, order: 24, title: "Mi primer recital", subtitle: "Preparar, tocar y reflexionar", icon: "🏆", durationMinutes: 20,
    objective: "Preparar una interpretación breve y evaluar el progreso con amabilidad.", skills: ["Interpretación", "Autonomía"],
    steps: [
      { title: "Elige", instruction: "Escoge una canción o ejercicio que disfrutes y puedas tocar sin tensión.", durationMinutes: 3, kind: "reflect" },
      { title: "Plan de tres partes", instruction: "Practica inicio, parte difícil y final por separado.", durationMinutes: 6, kind: "play" },
      { title: "Ensayo completo", instruction: "Toca una vez sin detenerte por errores pequeños.", durationMinutes: 5, kind: "play" },
      { title: "Recital familiar", instruction: "Toca para alguien de confianza y nombra un logro y una próxima meta.", durationMinutes: 6, kind: "reflect" }
    ],
    quiz: { question: "Después de tocar, ¿qué reflexión ayuda más?", options: ["Reconocer un logro y una meta", "Compararse con profesionales", "Decir que todo salió mal"], answer: 0, explanation: "Una evaluación concreta y amable ayuda a continuar aprendiendo." }, reward: "Guitarrista aventurera"
  }
];

export const worlds = [
  { id: 1, title: "Conozco mi instrumento", subtitle: "Cuidado, postura y mano derecha", icon: "🏕️" },
  { id: 2, title: "Descubro el sonido", subtitle: "Cuerdas, pulso y pulsación", icon: "🌳" },
  { id: 3, title: "Construyo un buen sonido", subtitle: "Pulsación y mano izquierda", icon: "🌊" },
  { id: 4, title: "Mis primeras notas", subtitle: "Primera posición, escala y acorde", icon: "🏔️" },
  { id: 5, title: "Leo y organizo música", subtitle: "Pentagrama, ritmo y tablatura", icon: "📚" },
  { id: 6, title: "Comparto mi música", subtitle: "Canciones, creación y recital", icon: "🌟" }
];
