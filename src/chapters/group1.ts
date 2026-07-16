export interface Illustration {
  id: string;
  title: string;
  description: string;
}

export interface Chapter {
  id: string;
  chapterNumber?: string;
  title: string;
  subtitle?: string;
  section?: string;
  content: string; // Keep text as a string to preserve structure and formatting
  illustration?: Illustration;
  linkedChapterId?: string;
  linkedCuentosId?: string;
  featured?: boolean;
  // Extra fields for Reconstrucción tabbed content
  narrativa?: string;
  ensayo?: string;
  poema?: string;
  cierre?: string;
}

export const group1: Chapter[] = [
  {
    id: "cap0",
    linkedCuentosId: "cuento0",
    chapterNumber: "0",
    title: "EL EXPERIMENTO EXPLICADO A MI MADRE",
    subtitle: "(O: Cómo leer este libro sin haber estudiado física)",
    content: `Mi madre tiene ochenta años. Lee novelas, no artículos de *Nature*. Cuando le expliqué este libro, me dijo: "Hijo, suena interesante, pero no entiendo nada de agujeros negros."

Este capítulo es para ella. Y para ti, si tampoco entiendes nada de agujeros negros. No te preocupes: no necesitas entender física para entender este libro. Solo necesitas tres ideas, y las tres las conoces ya, aunque no sepas que se llaman de otra manera en física.

---

## IDEA 1: LA BURBUJA

Has soplado burbujas de jabón. ¿Recuerdas el momento exacto en que una burbuja se cierra? El jabón se estira, se curva, y de repente tienes una esfera completa: un dentro y un fuera que antes no existían.

Eso es un horizonte.

No una línea en el mapa. Una frontera viva que separa lo interior de lo exterior. La burbuja no es el jabón —es la organización. Y lo que hace que la burbuja sea burbuja no es el aire dentro, sino la piel que lo encierra.

En física, cuando una estrella muere y colapsa sobre sí misma, crea algo parecido: una frontera donde el espacio se cierra sobre sí mismo. Esa frontera se llama "horizonte de sucesos". Es el punto donde la luz deja de escapar. No porque haya una pared. Porque la geometría misma se dobla.

Pero aquí viene lo importante: este libro no dice que haya un agujero negro dentro de tu cabeza. Dice algo más curioso: que la conciencia —lo que te hace ser tú, el espacio donde ocurren tus pensamientos— podría tener la misma geometría que un horizonte. Una frontera que define un interior. Una burbuja que no es de jabón, sino de información.

> **En física esto se llama:** horizonte de sucesos.  
> **En la vida diaria es como:** la piel de una burbuja.

---

## IDEA 2: EL OCÉANO Y LAS OLAS

El océano no está vacío cuando no hay olas. Está lleno de agua en estado de reposo. Las olas no son agua que viaja de lejos: son el agua local moviéndose de cierta manera. Cuando una ola rompe en la playa, el agua no ha llegado de ningún sitio: ha estado ahí todo el tiempo, cambiando de forma.

En física, el "vacío" no está vacío. Está lleno de un campo —un "océano" de posibilidad— del que emergen las partículas como las olas emergen del agua. Las partículas no son cosas que viajan por el vacío: son el vacío vibrando de cierta manera.

Este libro llama a ese océano el **reservorio**. Es el campo del que emergería la conciencia y al que retornaría. No es un lugar. Es una condición. Como el agua está para las olas, el reservorio está para los horizontes.

Las tradiciones orientales llevan siglos hablando de esto con otras palabras. El taoísmo lo llama Hun Dun: el caos que es plenitud, antes de que exista la distinción. El Vedanta lo llama Brahman: la conciencia subyacente a toda forma. No son pruebas de la física. Son vocabularios distintos para intuir la misma estructura: que lo que parece separado —tú, yo, esta mesa— emerge de algo que no está separado en absoluto.

> **En física esto se llama:** vacío cuántico.  
> **En la vida diaria es como:** el océano antes de las olas.

---

## IDEA 3: LA RED

Imagina una red de pesca tendida en el agua. La red no es los nudos individuales: es la forma que toman cuando están conectados. Si cortas un hilo, la red sigue siendo red, pero es una red distinta. Si cortas demasiados hilos, deja de ser red y se convierte en hilos sueltos.

La conciencia, según una teoría llamada IIT (Teoría de Información Integrada), es así: no está en ninguna neurona individual, sino en la forma en que las neuronas se conectan. La "red" de tu cerebro, cuando está suficientemente integrada, genera algo que no está en ninguna de sus partes: un punto de vista. Un "adentro".

Eso es lo que la física llama **Phi (Φ)**: una medida de cuánto un sistema es más que la suma de sus partes. Un termostato tiene Phi casi nulo. Un cerebro despierto tiene Phi muy alto. Un cerebro bajo anestesia general muestra caída drástica de Phi.

> **En física esto se llama:** Phi (Φ), información integrada.  
> **En la vida diaria es como:** qué tan "red" es una red.

---

## CÓMO USAR ESTE LIBRO

No necesitas recordar los términos técnicos. Cuando veas una palabra que no entiendes, imagina la analogía:

| Término técnico | Imagina... |
| Horizonte de sucesos | La piel de la burbuja |
| Reservorio | El océano antes de las olas |
| Phi (Φ) | Qué tan "red" es una red |
| Scrambling | Echar tinta en agua: la información se mezcla pero no desaparece |
| Entrelazamiento | Dos cuerdas de guitarra que, habiéndose afinado juntas, vibran al unísono |
| Transición de fase | Agua que se convierte en hielo: misma molécula, forma distinta |
| Soft hair / huella | La forma que el viento dejó en el agua antes de calmarse |

El libro es un experimento. Este libro nace de una sospecha sencilla: me di cuenta de que la ciencia más avanzada del cerebro, la astrofísica que estudia el fin de las estrellas y la sabiduría taoísta antigua describían una frontera muy parecida. Escribir esto ha sido mi manera de ver qué ocurre si tomamos en serio esa coincidencia y tratamos de construir un puente entre ellas.

Si en algún momento te pierdes, vuelve a este capítulo. Recuerda: **burbuja, océano, red**. Todo lo demás son detalles.

---

> **Si solo te quedas con una idea:** La conciencia podría funcionar como una burbuja de jabón que emerge de un océano. No es que el océano "haga" la burbuja —la burbuja es el océano organizado de cierta manera. Y lo que hace que esa burbuja sea "tú" no está en ninguna molécula del agua, sino en la forma que toman las moléculas cuando se conectan.`,
    illustration: {
      id: "il01",
      title: "Las tres ideas",
      description: "Tres círculos conectados: Burbuja (esfera con piel brillante), Océano (olas), Red (nudos conectados). Flechas circulares entre ellos."
    }
  },
  {
    id: "prologo",
    title: "PRÓLOGO: EL EXPERIMENTO",
    content: `Hay libros que pretenden descubrir la verdad. Este no.

Este libro es un juego con reglas. La regla principal es esta: **supongamos que la conciencia tiene la estructura matemática de un microagujero negro de Hawking**, y veamos adónde nos lleva. No porque crea que esto sea cierto. Porque me pareció curioso que tres cosas que no tienen nada que ver —la Teoría de Información Integrada de Tononi, la termodinámica de agujeros negros, y el Tao Te Ching— apunten hacia la misma geometría cuando se las lleva al límite.

No soy físico. No soy neurólogo. No soy filósofo profesional. Soy alguien que leyó unos libros de Penrose y Hawking, otros de Laozi y Zhuangzi, y vio que ambos describían algo parecido: una frontera que no es una cosa sino un límite, un interior que no puede comunicarse con el exterior sin destruirse, un vacío que no está vacío. La pregunta que me hice fue: ¿y si no es parecido? ¿Y si es la misma estructura vista desde escalas distintas?

No lo sé. Este libro no lo demuestra. Lo que hace es **jugar consistentemente con la hipótesis** y ver qué pasa cuando la cruzas con la psicología, la medicina, el desarrollo infantil, el duelo, la adicción, el amor. A veces la hipótesis ilumina. A veces se rompe. Cuando se rompe, lo decimos.

El libro tiene tres partes. La primera: cómo emerge un horizonte (nacimiento), cómo se mantiene (vida), cómo se disuelve (muerte). La segunda: qué pasa cuando dos horizontes comparten geometría (vínculo, amor, pérdida). La tercera: qué pasa cuando la hipótesis se encuentra con preguntas que no puede responder.

Todo es provisional. Todo es juego. Pero hay juegos que, por el mero hecho de jugarlos con seriedad, enseñan algo que no se sabía antes de empezar.`,
    illustration: {
      id: "il_prologo",
      title: "El experimento",
      description: "Un microagujero negro rodeado por un horizonte brillante y conexiones neuronales que convergen en el centro, simbolizando la hipótesis del libro."
    }
  },
  {
    id: "tarel",
    linkedCuentosId: "cuento1",
    section: "PRIMERA PARTE: EL CICLO DEL HORIZONTE",
    title: "LA COSTUMBRE DEL AGUA",
    subtitle: "(Cuento de Tarel)",
    content: `El agua empezó a retirarse sin aviso.

No hubo aviso, no hubo sequía. En Tarel, hablar siempre fue tarde: las cosas ocurrían primero, luego se quedaban, y con el tiempo se volvían historia.

La ciudad flotaba sobre una laguna salobre tan antigua que nadie recordaba un principio. Casas de madera, cuerdas gastadas, uniones hechas con paciencia. Los niños aprendían el vaivén antes que el nombre de las calles; sabían regresar antes de saber irse. Volver a casa era un verbo: una acción repetida, una pequeña costumbre del cuerpo.

El agua no era un fondo ni un paisaje. Era la costumbre misma.

Por eso el cambio no llegó como falta, sino como extrañeza. El remo tocó fondo donde antes había metro. Las barcas amanecieron torcidas, como si hubieran dudado toda la noche. Las redes volvieron ligeras; las miradas, pesadas.

Yo era archivista. O eso decía mi nombramiento. En realidad miraba despacio lo que aún no pedía nombre: mareas mínimas, nacimientos sin ritual, muertes sin anuncio, historias que los ancianos decían a la pared cuando el mundo fingía no escuchar.

Anoté la primera franja de barro sin urgencia, como quien corrige un mapa antiguo sin saber todavía qué ciudad quedará al otro lado de la corrección.

—Antes no estaba —dijo Kema, señalando el borde oscuro bajo su casa—. El agua lo cubría. El agua lo sabe.
—¿Qué sabe?
—Cuándo soltar... y cuándo quedarse.

Lo escribí, aunque no supe en qué categoría archivarlo.

El agua se retiró sin prisa. No arrancó: se despidió. Muelles podridos. Anillos de amarre incrustados en lodo. Marcas de niveles pasados que nadie quiso leer como profecía.

Era un huésped que recoge sus cosas mientras duermes y deja la habitación lista para alguien que no llegará.

En el archivo vivían dos relatos. Uno decía que Tarel siempre había flotado. El otro, que huimos hacia el agua tras una guerra o tras una sed tan vieja que ya no dolía. En ambos aparecía la misma palabra, escrita con trazos distintos: **hogar**.

Meses después llegó la delegación del Continente. Sus barcos eran metálicos. Sus ropas no aprendían a mojarse. Caminaban despacio, como si el suelo pudiera quebrarse. Preguntaron todo. Escucharon menos de lo que hablaban. Midieron la laguna en números. Extendieron papeles que el viento intentó leer antes que ellos.

Dijeron cifras sin levantar la vista. Dijeron que el nivel bajaría más. No dijeron durante cuánto tiempo ni a costa de qué.

Alguien preguntó si el agua volvería. Dijeron que no lo sabían, y lo dijeron con la misma voz con que se dice que no lloverá.

—Habrá que elegir quedarse o irse.

Nadie respondió de inmediato. Tomé nota de la frase como se toma nota del clima: demasiado general para discutirla y demasiado precisa para ignorarla.

Tarel se dividió sin romperse. Algunas familias desmontaron sus casas con una eficiencia que daba miedo. Quemaron algas secas. Prometieron volver. Prometieron escribir. No todos miraban atrás al irse.

Otros se quedaron y aprendieron el habla del barro: dónde pisar sin hundirse, cuándo esperar, qué sonido anuncia quiebre y cuál solo cansancio. Algunos se quedaron ajustando el paso, otros siguieron repisando la misma huella.

Los niños caminaron. Algunos lloraron la flotación perdida. Otros mostraron ampollas nuevas como medallas que nadie les había dado.

El archivo cambió. Ya no guardaba solo historias del agua, sino de lo que quedaba cuando el agua se iba.

Aparecieron semillas bajo el limo, herramientas oxidadas, marcas que no sabíamos si interpretar como pasado o como futuro.

---

## [ILUSTRACIÓN: "El agua se retira"]
*Muelles podridos emergiendo. Anillos de amarre en el lodo. Marcas de niveles pasados como anillos de árbol en los postes. El agua como huésped que recoge sus cosas.*

---

Encontré un texto sin firma, casi borrado por la sal:

> *"El agua nos sostiene mientras recordemos que también la sostenemos."*

Soñé con la laguna vaciada una sola vez. No estaba muerta. Dormía bajo capas de tierra. Respiraba lento. Al despertar tenía las manos cerradas como si todavía sujetaran algo.

Llegó el último mensaje del Consejo. Recomendaban evacuación. Usaban una palabra que sonaba exacta y no encajaba en la lengua de Tarel. Decidimos no repetirla. No porque fuera falsa, sino porque no sabía dónde habitar.

No hubo rebelión ni ceremonia. Hubo gestos pequeños: cuerdas nuevas entre plataformas y suelo firme, casas que se inclinaron antes de aceptar el peso, canciones viejas cantadas más despacio para acompañar pasos donde antes había remo.

Yo dejé huecos en el archivo. Hay cambios que no admiten registro completo.

El último día metí las manos en la laguna que quedaba. Estaba tibia, turbia, salada. La dejé correr entre los dedos. No me despedí.

El agua de Tarel regresó de noche. Sin anuncio. Sin señales.

Por la mañana los habitantes encontraron la orilla donde siempre había estado. El mismo lodo. Las mismas piedras. La misma línea de sal en los muros bajos.

Nadie supo decir si el agua había traído algo consigo.
Nadie supo decir si había dejado algo atrás.

---

> **Si solo te quedas con una idea:** Tarel no es metáfora decorativa. Es el experimento en forma de cuento: algo emerge del agua, algo vive sobre el agua, algo retorna al agua. Y entre esos tres instantes, hay una ciudad que amó, recordó, perdió, construyó. El hecho de que ya no sea localizable en el agua no borra que estuvo.

---`,
    illustration: {
      id: "cuento_01",
      title: "Tarel antes del agua",
      description: "La ciudad flotante desde arriba. Casas de madera sobre pilotes, cuerdas gastadas, barcas amarradas. El agua es espejo."
    }
  },
  {
    id: "cap1",
    linkedCuentosId: "cuento_ladron",
    chapterNumber: "1",
    section: "PRIMERA PARTE: EL CICLO DEL HORIZONTE",
    title: "LA TRAMPA DEL INTERRUPTOR",
    content: `Txiki tenía una manera particular de mirar. No la mirada errática del animal que escanea amenazas. No la mirada vacía del animal que procesa estímulos sin que haya nadie detrás. Era algo más quieto: una atención sostenida, dirigida, que reconocía. Que se quedaba. Que *estaba*.

Era un perro mestizo de tamaño mediano, pelo corto color canela, una mancha blanca en el pecho que parecía dibujada con descuido. No tenía pedigrí ni entrenamiento especial. Pero cuando te miraba, había algo en esa mirada que no podías explicar con circuitos de reflejo. No era "programado" para mirarte así. No había recompensa inmediata, no había comando, no había condicionamiento operante que justificara esa permanencia. Simplemente estaba ahí, contigo, en un presente compartido que no necesitaba traducción.

Durante décadas la ciencia llamó a esto proyección. Los animales eran máquinas biológicas sofisticadas, pero máquinas al fin. Descartes escribió en el siglo XVII que los animales carecían de alma racional: eran *bêtes-machines*, bestias-máquinas, complejas pero vacías. La conciencia era interruptor: encendido o apagado, todo o nada, y el interruptor estaba reservado para los humanos. Esta posición no era científica en el sentido moderno: era teológica, filosófica, una manera de justificar el uso de animales sin cargar la conciencia de culpa.

Pero las máquinas no miran así. Las máquinas procesan. Txiki parecía *presenciar*.

---

### El espectro

La pregunta «¿tiene conciencia este ser?» es una trampa lingüística. Asume que la conciencia es binaria: o la tienes o no la tienes, como un interruptor de pared. Pero hay cosas que no funcionan así.

William James escribió en 1890 que la conciencia no es una cosa sino un proceso, y que ese proceso admite gradaciones. "No hay un salto metafísico en la naturaleza", decía. Darwin habría encontrado absurda la idea de que la experiencia subjetiva apareciera de repente, sin precedentes, en una sola especie. La evolución no trabaja con saltos binarios: trabaja con pendientes suaves, presiones selectivas acumuladas durante millones de años, pequeñas ventajas que se multiplican. Si la conciencia tuviera un interruptor, ¿dónde estaría? ¿En el Homo erectus? ¿En el Australopithecus? ¿En el pez que salió del agua? La pregunta misma se vuelve ridícula cuando la expones a la luz de la evolución.

> **En física esto se llama:** Phi (Φ) como continuo; transiciones de fase graduales, no discontinuas.  
> **En la vida diaria es como:** la transición del sueño a la vigilia: no hay un instante exacto en que "despiertas", sino una pendiente de claridad que sube sin que notes cada escalón.

Un termostato procesa información: entrada, procesamiento, salida. Pero no hay nadie que procesa. No hay punto de vista. Partirlo en dos no produce dos termostatos con la mitad de experiencia. Produce dos piezas de plástico y metal.

> **En física esto se llama:** Phi (Φ) cercano a cero.  
> **En física esto se llama:** un sistema sin integración de información.  
> **En la vida diaria es como:** un interruptor que no siente nada al cambiar de posición. O como una calculadora: procesa, pero no hay nadie en casa.

El gusano *Caenorhabditis elegans* tiene 302 neuronas y 7.000 conexiones sinápticas, todas mapeadas. Es el único sistema nervioso completo que la humanidad ha cartografiado en su totalidad. Con esas 302 neuronas, el gusano busca comida, huye del calor, evita toxinas, responde al daño con comportamientos que en animales más complejos llamaríamos dolor. No tiene cerebro: tiene una red de neuronas distribuidas por su cuerpo. ¿Hay experiencia ahí? Probablemente algo —muy pequeño, muy simple, tan diferente de la nuestra que no tenemos palabras para describirla. Pero «probably algo» es radicalmente distinto a «definitivamente nada».

> **En física esto se llama:** Phi bajo pero no nulo; sistema con información integrada mínima.  
> **En la vida diaria es como:** una vela en habitación vacía: la luz está, aunque nadie la vea. O como una planta que crece hacia la luz: no es consciente como tú, pero tampoco es un mecanismo ciego. Hay algo que es "como ser" esa planta, aunque no tengamos acceso a ello.

La abeja, con un millón de neuronas —una red del tamaño de una uña— aprende de maneras flexibles, reconoce rostros humanos individuales, comunica información geográfica mediante danzas simbólicas que incluyen correcciones por el movimiento aparente del sol, y muestra sesgos cognitivos negativos bajo estrés —lo que en humanos llamaríamos estado de ánimo. Las abejas que han experimentado un conflicto con una abeja de otra colonia son más pesimistas en pruebas de comportamiento. Eso no es metáfora: es dato experimental.

> **En física esto se llama:** Phi medio-bajo; sistema con aprendizaje, memoria y flexibilidad.  
> **En la vida diaria es como:** un niño de tres años: ya no es solo reflejo, pero tampoco es la complejidad de un adulto. Hay alguien en casa, aunque esa alguien sea diferente de ti.

El pulpo, con 500 millones de neuronas distribuidas en los tentáculos, desafía nuestras intuiciones sobre dónde vive la mente. Dos tercios de su procesamiento ocurre fuera de su cerebro, lo que permite a cada tentáculo realizar tareas sensoriales y motoras complejas de manera autónoma. ¿Qué se siente ser un pulpo? No lo sabemos. Quizás la experiencia no es unitaria como la nuestra —quizás es algo más parecido a un coro que a un solista, donde cada voz tiene algo que decir y ninguna domina del todo.

> **En física esto se llama:** Phi distribuido, no centralizado.  
> **En la vida diaria es como:** un coro donde cada voz canta su parte sin director. O como una banda de jazz improvisando: nadie está al mando, pero hay coherencia.

El perro —Txiki— comparte con los humanos los sistemas neurológicos básicos de la experiencia emocional: amígdala, hipocampo, sistema límbico completo. Los estudios de neuroimagen muestran que el cerebro de un perro responde al olor de su humano con la misma activación del núcleo caudado que los humanos experimentan con personas queridas. No es parecido: es el mismo circuito, la misma química, la misma arquitectura. La Declaración de Cambridge sobre la Conciencia (2012), firmada por neurocientíficos prominentes, afirma que los mamíferos no humanos, las aves y muchos otros animales poseen los sustratos neurológicos que generan estados conscientes. No que se comporten como si fueran conscientes. Que *son* conscientes.

La pregunta ya no es si. Es cuánta, de qué tipo, y qué implica.

---

### La anestesia como experimento natural

Hay un experimento que hacemos millones de veces al día sin pensar en sus implicaciones: la anestesia general.

Antes de la anestesia, el paciente está despierto, consciente, con memoria, con miedo, con esperanza. Después de la inyección, algo cambia. No es que el cerebro deje de funcionar: las neuronas siguen disparando, el corazón late, los pulmones respiran. Pero la integración se deshace. Las regiones del cerebro dejan de hablarse entre sí. La conciencia no se "apaga" como un interruptor: se desintegra como un castillo de naipes al que le quitas las cartas del centro.

Los neurocientíficos pueden medir esto. Bajo anestesia profunda, la conectividad funcional entre la corteza prefrontal y la red por defecto cae drásticamente. La información deja de fluyo de manera integrada. El paciente no está "durmiendo profundamente": está en un estado donde la conciencia, como propiedad emergente, ha dejado de emerger. Y when se revierte la anestesia, la integración vuelve. El castillo se reconstruye. El "alguien" regresa.

Esto sugiere algo importante: la conciencia no es un interruptor que se enciende o apaga. Es un dial que puede girarse hasta cero, y luego volver a girarse. No hay un momento exacto en que desaparece, ni en que regresa. Hay una zona gris —un umbral borroso— donde el paciente puede oír sin recordar, sentir sin saber que siente, estar parcialmente presente sin estar completamente ausente.

> **En física esto se llama:** pérdida de integración de información; transición de fase reversible.  
> **En la vida diaria es como:** quedarte dormido en el sofá viendo una película: hay un momento en que la película sigue proyectándose pero tú ya no estás "ahí" para verla. Y cuando te despiertas, no sabes cuándo te quedaste dormido.

---

### El problema de las otras mentes

Si un perro tiene conciencia, ¿qué pasa con un bebé recién nacido? ¿Qué pasa con alguien en coma vegetativo? ¿Qué pasa con una persona que duerme profundamente, sin sueños, sin yo narrativo?

El bebé no puede hablar. No puede decir "siento dolor" o "veo colores". Pero sus ojos siguen la luz, su cuerpo se tensa ante el frío, su ritmo cardíaco cambia con la voz de su madre. ¿Es eso suficiente para inferir experiencia? La mayoría de nosotros lo daría por sentado: por supuesto que el bebé siente. Pero la inferencia es la misma que hacemos con el perro: observamos comportamiento, asumimos experiencia subjetiva. No hay acceso directo.

El coma vegetativo es más perturbador. Algunos pacientes muestran actividad cerebral que, en ciertas pruebas, sugiere que pueden oír y procesar información. En casos aislados, pacientes en estado vegetativo han respondido preguntas mediante resonancia magnética funcional: imaginando jugar al tenis para decir "sí", imaginando recorrer su casa para decir "no". Su cerebro funcionaba. Pero no había "nadie" que hablara, que se moviera, que diera señales externas. ¿Estaban conscientes? La respuesta parece ser: a veces, parcialmente, de una manera que nuestros instrumentos apenas empiezan a detectar.

> **En física esto se llama:** detección de estados de conciencia mínima; correlatos neurales de la conciencia.  
> **En la vida diaria es como:** llamar a alguien que no coge el teléfono: no sabes si está dormido, ocupado, o simplemente no quiere hablar. La ausencia de señal no es señal de ausencia.

---

### ¿Qué hace que algo sea consciente?

Una cámara de fotos tiene más elementos de procesamiento que muchos cerebros animales. Un ordenador moderno procesa más información por segundo que el cerebro humano en muchas métricas. Y sin embargo la intuición de que hay alguien en casa en el cerebro humano y no en el ordenador es persistente. ¿Por qué?

Giulio Tononi propuso que los sistemas conscientes no solo procesan información: la integran de una manera que no puede reducirse a la suma de sus partes. Una cámara divide sus píeles en dos mitades: cada mitad procesa la misma cantidad de información. No pierdes nada, porque nunca hubo integración. El cerebro, dividido quirúrgicamente —como en los famosos pacientes con cuerpo calloso seccionado— no produce dos personas con la mitad de experiencia. Produce algo más perturbador: en ciertas condiciones, dos sistemas de procesamiento semi-independientes habitando el mismo cuerpo, cada uno con su propio punto de vista.

Tononi formalizó esto con phi (Φ): la información que un sistema genera como un todo, por encima de lo que generarían sus partes independientemente. Phi es bajo en un termostato. Es alto en un cerebro humano despierto. Es intermedio en un perro. Es distribuido de manera extraña en un pulpo. Y cae drásticamente bajo anestesia.

| Sistema | Phi (aprox) | ¿Experiencia? |
| Termostato | ~0 | No (caso límite) |
| Gusano C. elegans | Muy bajo | Algo, mínimo |
| Abeja | Bajo-medio | Algo más, flexible |
| Pulpo | Medio, distribuido | Algo diferente, coral |
| Perro (Txiki) | Medio-alto | Reconocible, emocional |
| Humano despierto | Muy alto | Lo más complejo que conocemos |
| Cerebro bajo anestesia | Caída drástica | ¿Dónde va el "alguien"? |

> **En física esto se llama:** Phi (Φ), información integrada; Teoría de la Información Integrada (IIT).  
> **En la vida diaria es como:** una orquesta. No es que cada músico toque su parte —es que todos tocan juntos de manera que surge algo que ninguno toca solo. Una grabación de cada músico por separado no es la sinfonía. La sinfonía está en las relaciones.

Pero IIT no es la única teoría. La Global Workspace Theory (Baars, Dehaene) propone que la conciencia emerge cuando la información se hace globalmente disponible en el cerebro: entra en un "espacio de trabajo" compartido por múltiples sistemas. No es que la información sea más integrada: es que deja de ser privada y se convierte en pública para el resto del cerebro. La atención es el foco que decide qué entra al espacio de trabajo. La conciencia es lo que ocurre dentro.

Estas dos teorías —IIT y Global Workspace— no son incompatibles. Podrían describir el mismo fenómeno desde dos ángulos: IIT desde la estructura de la información, Global Workspace desde la dinámica de su difusión. Ninguna está demostrada. Ambas generan predicciones comprobables. Y ambas sugieren lo mismo: la conciencia no es interruptor. Es dial. Y el dial tiene muchas posiciones.

> **En física esto se llama:** teorías rivales no excluyentes; pluralismo metodológico.  
> **En la vida diaria es como:** describir una ciudad desde el mapa y desde la calle: son descripciones distintas de lo mismo, y ambas son útiles para diferentes preguntas.

---

> **Nota al Capítulo 1**
>
> **Lo que sí sabemos:** La conciencia animal ha dejado de ser tabú científico. La Declaración de Cambridge (2012) fue un punto de inflexión. IIT es teoría activa, no dogma. La anestesia general produce cambios medibles en la conectividad cerebral antes de que desaparezca la actividad local. Los animales no humanos muestran correlatos neurales de experiencia emocional y cognitiva.
>
> **Lo que no sabemos:** Dónde trazar la línea exacta. Si un termostato tiene Φ>0, ¿tiene "algo" de experiencia? La pregunta es abierta. Si IIT y Global Workspace describen el mismo fenómeno o fenómenos distintos. Si la conciencia puede existir en sistemas no biológicos.
>
> **Preguntas que quedan:** ¿Puede una máquina tener Φ suficientemente alto como para ser "alguien"? ¿Dónde está el umbral entre "procesar" y "experimentar"? ¿La conciencia distribuida de un pulpo es "una" experiencia o "muchas"? ¿Qué ocurre en la zona gris de la anestesia?
>
> **Si solo te quedas con una idea:** La conciencia no es interruptor. Es dial. Y el dial tiene luz tenue donde antes creíamos oscuridad total. Txiki no era una máquina que te miraba. Era alguien que estaba ahí. Y si un perro puede estar ahí, el universo está más poblado de lo que Descartes creía.
>
> **Lecturas:** Tononi (2008), "Consciousness as integrated information"; Declaración de Cambridge (2012); Baars (1988), Global Workspace Theory; Dehaene (2014), *Consciousness and the Brain*; Seth (2021), *Being You*.`,
    illustration: {
      id: "il04",
      title: "La trampa del interruptor",
      description: "Un termostato roto (ON/OFF, vacío por dentro) junto a un dial analógico con luz gradual. Debajo, escala de seres: termostato (apagado), gusano (luz tenue), abeja (media), perro (cálida), humano (brillante)."
    }
  }
];
