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
  // English translations (optional; when absent, the Spanish original is shown with a pending-translation notice)
  titleEn?: string;
  subtitleEn?: string;
  sectionEn?: string;
  contentEn?: string;
  // Extra fields for Reconstrucción tabbed content
  narrativa?: string;
  ensayo?: string;
  poema?: string;
  cierre?: string;
  narrativaEn?: string;
  ensayoEn?: string;
  poemaEn?: string;
  cierreEn?: string;
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
    titleEn: "THE EXPERIMENT EXPLAINED TO MY MOTHER",
    contentEn: "My mother is eighty years old. She reads novels, not articles in *Nature*. When I explained this book to her, she told me: \"Son, it sounds interesting, but I don't understand anything about black holes.\"\n\nThis chapter is for her. And for you, if you don't understand anything about black holes either. Don't worry: you don't need to understand physics to understand this book. You only need three ideas, and you already know all three of them, even if you don't know they go by different names in physics.\n\n---\n\n## IDEA 1: THE BUBBLE\n\nYou have blown soap bubbles. Do you remember the exact moment a bubble closes? The soap stretches, curves, and suddenly you have a complete sphere: an inside and an outside that didn't exist before.\n\nThat is a horizon.\n\nNot a line on a map. A living boundary that separates the interior from the exterior. The bubble is not the soap—it is the organization. And what makes the bubble a bubble is not the air inside, but the skin that encloses it.\n\nIn physics, when a star dies and collapses in on itself, it creates something similar: a boundary where space closes in on itself. That boundary is called an \"event horizon.\" It is the point where light stops escaping. Not because there is a wall. Because the geometry itself bends.\n\nBut here is the important part: this book does not say there is a black hole inside your head. It says something more curious: that consciousness—what makes you *you*, the space where your thoughts happen—could have the same geometry as a horizon. A boundary that defines an interior. A bubble made not of soap, but of information.\n\n> **In physics this is called:** an event horizon.  \n> **In daily life it is like:** the skin of a bubble.\n\n---\n\n## IDEA 2: THE OCEAN AND THE WAVES\n\nThe ocean is not empty when there are no waves. It is full of water at rest. Waves are not water traveling from afar: they are the local water moving in a certain way. When a wave breaks on the beach, the water hasn't arrived from anywhere: it has been there the whole time, changing shape.\n\nIn physics, the \"void\" is not empty. It is full of a field—an \"ocean\" of possibility—from which particles emerge just as waves emerge from the water. Particles are not things traveling through the void: they are the void vibrating in a certain way.\n\nThis book calls that ocean the **reservoir**. It is the field from which consciousness would emerge and to which it would return. It is not a place. It is a condition. As water is to waves, the reservoir is to horizons.\n\nEastern traditions have been talking about this for centuries using other words. Taoism calls it Hun Dun: the chaos that is fullness, before distinction exists. Vedanta calls it Brahman: the consciousness underlying all form. These are not proofs of physics. They are different vocabularies for intuiting the same structure: that what seems separate—you, me, this table—emerges from something that is not separate at all.\n\n> **In physics this is called:** the quantum void.  \n> **In daily life it is like:** the ocean before the waves.\n\n---\n\n## IDEA 3: THE NET\n\nImagine a fishing net cast in the water. The net is not the individual knots: it is the shape they take when they are connected. If you cut a thread, the net is still a net, but it is a different net. If you cut too many threads, it stops being a net and becomes loose threads.\n\nConsciousness, according to a theory called IIT (Integrated Information Theory), is like this: it is not in any individual neuron, but in the way the neurons connect. The \"net\" of your brain, when it is sufficiently integrated, generates something that is not in any of its parts: a point of view. An \"inside.\"\n\nThat is what physics calls **Phi (Φ)**: a measure of how much a system is more than the sum of its parts. A thermostat has almost zero Phi. An awake brain has very high Phi. A brain under general anesthesia shows a drastic drop in Phi.\n\n> **In physics this is called:** Phi (Φ), integrated information.  \n> **In daily life it is like:** how much of a \"net\" a net is.\n\n---\n\n## HOW TO USE THIS BOOK\n\nYou do not need to remember the technical terms. When you see a word you don't understand, imagine the analogy:\n\n| Technical term | Imagine... |\n| --- | --- |\n| Event horizon | The skin of the bubble |\n| Reservoir | The ocean before the waves |\n| Phi (Φ) | How much of a \"net\" a net is |\n| Scrambling | Dropping ink in water: the information mixes but does not disappear |\n| Entanglement | Two guitar strings that, having been tuned together, vibrate in unison |\n| Phase transition | Water turning into ice: same molecule, different form |\n| Soft hair / imprint | The shape the wind left on the water before calming down |\n\nThe book is an experiment. This book is born from a simple suspicion: I realized that the most advanced brain science, the astrophysics that studies the end of stars, and ancient Taoist wisdom were describing a very similar boundary. Writing this has been my way of seeing what happens if we take that coincidence seriously and try to build a bridge between them.\n\nIf at any point you get lost, come back to this chapter. Remember: **bubble, ocean, net**. Everything else is just details.\n\n---\n\n> **If you only take away one idea:** Consciousness might function like a soap bubble emerging from an ocean. It is not that the ocean \"makes\" the bubble—the bubble is the ocean organized in a certain way. And what makes that bubble \"you\" is not in any water molecule, but in the shape the molecules take when they connect.",
    subtitleEn: "(Or: How to read this book without having studied physics)",
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
    titleEn: "PROLOGUE: THE EXPERIMENT",
    contentEn: "There are books that claim to discover the truth. Not this one.\n\nThis book is a game with rules. The main rule is this: **let's suppose that consciousness has the mathematical structure of a Hawking micro black hole**, and let's see where it takes us. Not because I believe this to be true. But because I found it curious that three things that have nothing to do with each other—Tononi's Integrated Information Theory, black hole thermodynamics, and the Tao Te Ching—point toward the same geometry when taken to their limits.\n\nI am not a physicist. I am not a neurologist. I am not a professional philosopher. I am someone who read some books by Penrose and Hawking, others by Laozi and Zhuangzi, and saw that both described something similar: a boundary that is not a thing but a limit, an interior that cannot communicate with the exterior without destroying itself, a void that is not empty. The question I asked myself was: what if it isn't just similar? What if it is the same structure seen from different scales?\n\nI don't know. This book does not prove it. What it does is **play consistently with the hypothesis** and see what happens when you cross it with psychology, medicine, child development, grief, addiction, love. Sometimes the hypothesis illuminates. Sometimes it breaks. When it breaks, we say so.\n\nThe book has three parts. The first: how a horizon emerges (birth), how it is maintained (life), how it dissolves (death). The second: what happens when two horizons share geometry (bond, love, loss). The third: what happens when the hypothesis encounters questions it cannot answer.\n\nEverything is provisional. Everything is a game. But there are games that, by the mere fact of playing them seriously, teach something that was unknown before starting.",
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
    titleEn: "THE HABIT OF WATER",
    contentEn: "The water began to recede without warning.\n\nThere was no warning, there was no drought. In Tarel, speaking was always too late: things happened first, then they stayed, and over time they became history.\n\nThe city floated on a brackish lagoon so ancient that no one remembered a beginning. Wooden houses, worn ropes, joints made with patience. Children learned the sway before the names of the streets; they knew how to return before they knew how to leave. Coming home was a verb: a repeated action, a small habit of the body.\n\nThe water was not a backdrop or a landscape. It was the habit itself.\n\nThat is why the change did not arrive as a lack, but as a strangeness. The oar touched bottom where before there was a meter. The boats woke up tilted, as if they had hesitated all night. The nets came back light; the gazes, heavy.\n\nI was an archivist. Or so my appointment said. In reality, I looked slowly at what did not yet ask for a name: minimal tides, births without ritual, deaths without announcement, stories the elders told to the wall when the world pretended not to listen.\n\nI noted the first strip of mud without urgency, like someone correcting an ancient map without yet knowing what city will remain on the other side of the correction.\n\n\"It wasn't there before,\" Kema said, pointing to the dark edge beneath her house. \"The water covered it. The water knows.\"\n\"Knows what?\"\n\"When to let go... and when to stay.\"\n\nI wrote it down, though I didn't know in what category to archive it.\n\nThe water receded without haste. It didn't tear away: it said goodbye. Rotted piers. Mooring rings embedded in mud. Marks of past levels that no one wanted to read as prophecy.\n\nIt was a guest who gathers their things while you sleep and leaves the room ready for someone who will not arrive.\n\nTwo stories lived in the archive. One said that Tarel had always floated. The other, that we fled toward the water after a war or after a thirst so old it no longer hurt. In both, the same word appeared, written with different strokes: **home**.\n\nMonths later, the delegation from the Continent arrived. Their ships were metallic. Their clothes did not learn to get wet. They walked slowly, as if the ground might break. They asked everything. They listened less than they spoke. They measured the lagoon in numbers. They spread out papers that the wind tried to read before they did.\n\nThey spoke figures without looking up. They said the level would drop further. They did not say for how long or at what cost.\n\nSomeone asked if the water would return. They said they didn't know, and they said it with the same voice one uses to say it won't rain.\n\n\"We will have to choose to stay or leave.\"\n\nNo one answered immediately. I took note of the phrase the way one takes note of the weather: too general to argue with and too precise to ignore.\n\nTarel divided without breaking. Some families dismantled their houses with a frightening efficiency. They burned dried algae. They promised to return. They promised to write. Not everyone looked back as they left.\n\nOthers stayed and learned the language of the mud: where to step without sinking, when to wait, what sound announces a break and which only exhaustion. Some stayed adjusting their stride, others kept retracing the same footprint.\n\nThe children walked. Some mourned the lost flotation. Others showed off new blisters like medals no one had given them.\n\nThe archive changed. It no longer kept only stories of the water, but of what remained when the water left.\n\nSeeds appeared beneath the silt, rusted tools, marks we didn't know whether to interpret as past or as future.\n\n---\n\n## [ILUSTRACIÓN: \"The water recedes\"]\n*Rotted piers emerging. Mooring rings in the mud. Marks of past levels like tree rings on the posts. Water as a guest gathering its things.*\n\n---\n\nI found an unsigned text, almost erased by the salt:\n\n> *\"The water sustains us as long as we remember that we also sustain it.\"*\n\nI dreamed of the emptied lagoon only once. It was not dead. It slept beneath layers of earth. It breathed slowly. Upon waking, my hands were closed as if they were still holding something.\n\nThe final message from the Council arrived. They recommended evacuation. They used a word that sounded exact and did not fit in the language of Tarel. We decided not to repeat it. Not because it was false, but because it didn't know where to dwell.\n\nThere was no rebellion or ceremony. There were small gestures: new ropes between platforms and solid ground, houses that tilted before accepting the weight, old songs sung more slowly to accompany footsteps where before there had been oars.\n\nI left hollows in the archive. There are changes that do not admit a complete record.\n\nOn the last day, I put my hands in the remaining lagoon. It was warm, murky, salty. I let it run through my fingers. I didn't say goodbye.\n\nThe water of Tarel returned at night. Without announcement. Without signs.\n\nIn the morning, the inhabitants found the shore where it had always been. The same mud. The same stones. The same line of salt on the low walls.\n\nNo one could say if the water had brought anything with it.\nNo one could say if it had left anything behind.\n\n---\n\n> **If you only take away one idea:** Tarel is not a decorative metaphor. It is the experiment in the form of a story: something emerges from the water, something lives on the water, something returns to the water. And between those three instants, there is a city that loved, remembered, lost, built. The fact that it is no longer locatable in the water does not erase that it was there.\n\n---",
    subtitleEn: "(A Tale of Tarel)",
    sectionEn: "PART ONE: THE CYCLE OF THE HORIZON",
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
    titleEn: "THE SWITCH TRAP",
    contentEn: "Txiki had a particular way of looking. Not the erratic gaze of an animal scanning for threats. Not the empty stare of an animal processing stimuli with no one behind it. It was something stiller: a sustained, directed attention that recognized. That stayed. That *was*.\n\nHe was a medium-sized mixed-breed dog, with short cinnamon-colored hair and a white patch on his chest that looked carelessly drawn. He had no pedigree and no special training. But when he looked at you, there was something in that gaze that you couldn't explain with reflex circuits. He wasn't \"programmed\" to look at you like that. There was no immediate reward, no command, no operant conditioning to justify that permanence. He was simply there, with you, in a shared present that needed no translation.\n\nFor decades, science called this projection. Animals were sophisticated biological machines, but machines nonetheless. Descartes wrote in the 17th century that animals lacked a rational soul: they were *bêtes-machines*, beast-machines, complex but empty. Consciousness was a switch: on or off, all or nothing, and the switch was reserved for humans. This position wasn't scientific in the modern sense: it was theological, philosophical, a way to justify the use of animals without burdening the conscience with guilt.\n\nBut machines don't look like that. Machines process. Txiki seemed to *witness*.\n\n---\n\n### The Spectrum\n\nThe question \"is this being conscious?\" is a linguistic trap. It assumes consciousness is binary: either you have it or you don't, like a wall switch. But there are things that don't work that way.\n\nWilliam James wrote in 1890 that consciousness is not a thing but a process, and that this process admits gradations. \"There is no metaphysical jump in nature,\" he said. Darwin would have found the idea that subjective experience appeared suddenly, without precedent, in a single species to be absurd. Evolution doesn't work with binary leaps: it works with gentle slopes, selective pressures accumulated over millions of years, small advantages that multiply. If consciousness had a switch, where would it be? In Homo erectus? In Australopithecus? In the fish that crawled out of the water? The question itself becomes ridiculous when exposed to the light of evolution.\n\n> **In physics this is called:** Phi (Φ) as a continuum; gradual phase transitions, not discontinuous ones.  \n> **In daily life it is like:** the transition from sleep to wakefulness: there is no exact instant when you \"wake up,\" but rather a slope of clarity that rises without you noticing every step.\n\nA thermostat processes information: input, processing, output. But there is no one doing the processing. There is no point of view. Splitting it in two doesn't produce two thermostats with half the experience. It produces two pieces of plastic and metal.\n\n> **In physics this is called:** Phi (Φ) close to zero.  \n> **In physics this is called:** a system without information integration.  \n> **In daily life it is like:** a switch that feels nothing when changing position. Or like a calculator: it processes, but nobody is home.\n\nThe worm *Caenorhabditis elegans* has 302 neurons and 7,000 synaptic connections, all mapped. It is the only complete nervous system that humanity has fully charted. With those 302 neurons, the worm seeks food, flees from heat, avoids toxins, and responds to damage with behaviors that in more complex animals we would call pain. It doesn't have a brain: it has a network of neurons distributed throughout its body. Is there experience there? Probably something—very small, very simple, so different from ours that we don't have words to describe it. But \"probably something\" is radically different from \"definitely nothing.\"\n\n> **In physics this is called:** low but non-zero Phi; a system with minimal integrated information.  \n> **In daily life it is like:** a candle in an empty room: the light is there, even if no one sees it. Or like a plant growing toward the light: it isn't conscious like you, but it isn't a blind mechanism either. There is something it is \"like to be\" that plant, even if we don't have access to it.\n\nThe bee, with a million neurons—a network the size of a fingernail—learns in flexible ways, recognizes individual human faces, communicates geographical information through symbolic dances that include corrections for the apparent movement of the sun, and shows negative cognitive biases under stress—what in humans we would call a mood. Bees that have experienced a conflict with a bee from another colony are more pessimistic in behavioral tests. That is not a metaphor: it is experimental data.\n\n> **In physics this is called:** medium-low Phi; a system with learning, memory, and flexibility.  \n> **In daily life it is like:** a three-year-old child: no longer just reflex, but not the complexity of an adult either. Someone is home, even if that someone is different from you.\n\nThe octopus, with 500 million neurons distributed across its tentacles, challenges our intuitions about where the mind lives. Two-thirds of its processing occurs outside its brain, allowing each tentacle to perform complex sensory and motor tasks autonomously. What does it feel like to be an octopus? We don't know. Perhaps the experience isn't unitary like ours—perhaps it's something more akin to a choir than a soloist, where every voice has something to say and none entirely dominates.\n\n> **In physics this is called:** distributed, non-centralized Phi.  \n> **In daily life it is like:** a choir where each voice sings its part without a conductor. Or like a jazz band improvising: no one is in charge, but there is coherence.\n\nThe dog—Txiki—shares with humans the basic neurological systems of emotional experience: the amygdala, the hippocampus, the entire limbic system. Neuroimaging studies show that a dog's brain responds to the scent of its human with the same activation of the caudate nucleus that humans experience with loved ones. It isn't similar: it is the same circuit, the same chemistry, the same architecture. The Cambridge Declaration on Consciousness (2012), signed by prominent neuroscientists, states that non-human mammals, birds, and many other animals possess the neurological substrates that generate conscious states. Not that they behave as if they were conscious. That they *are* conscious.\n\nThe question is no longer if. It is how much, what kind, and what it implies.\n\n---\n\n### Anesthesia as a Natural Experiment\n\nThere is an experiment we perform millions of times a day without thinking about its implications: general anesthesia.\n\nBefore anesthesia, the patient is awake, conscious, with memory, with fear, with hope. After the injection, something changes. It isn't that the brain stops working: neurons keep firing, the heart beats, the lungs breathe. But the integration unravels. The regions of the brain stop talking to each other. Consciousness doesn't \"turn off\" like a switch: it disintegrates like a house of cards when you remove the cards from the center.\n\nNeuroscientists can measure this. Under deep anesthesia, functional connectivity between the prefrontal cortex and the default mode network drops drastically. Information stops flowing in an integrated way. The patient isn't \"sleeping deeply\": they are in a state where consciousness, as an emergent property, has stopped emerging. And when the anesthesia is reversed, the integration returns. The castle rebuilds itself. The \"someone\" returns.\n\nThis suggests something important: consciousness is not a switch that turns on or off. It is a dial that can be turned down to zero, and then turned back up. There is no exact moment when it disappears, nor when it returns. There is a gray area—a blurry threshold—where the patient can hear without remembering, feel without knowing they feel, be partially present without being completely absent.\n\n> **In physics this is called:** loss of information integration; reversible phase transition.  \n> **In daily life it is like:** falling asleep on the couch watching a movie: there is a moment when the movie keeps playing but you are no longer \"there\" to watch it. And when you wake up, you don't know when you fell asleep.\n\n---\n\n### The Problem of Other Minds\n\nIf a dog has consciousness, what about a newborn baby? What about someone in a vegetative coma? What about a person in deep sleep, dreamless, with no narrative self?\n\nThe baby cannot speak. They cannot say \"I feel pain\" or \"I see colors.\" But their eyes follow the light, their body tenses in the cold, their heart rate changes with their mother's voice. Is that enough to infer experience? Most of us would take it for granted: of course the baby feels. But the inference is the same one we make with the dog: we observe behavior, we assume subjective experience. There is no direct access.\n\nThe vegetative coma is more disturbing. Some patients show brain activity that, in certain tests, suggests they can hear and process information. In isolated cases, patients in a vegetative state have answered questions using functional magnetic resonance imaging: imagining playing tennis to say \"yes,\" imagining walking through their house to say \"no.\" Their brain was working. But there was \"no one\" to speak, to move, to give external signals. Were they conscious? The answer seems to be: sometimes, partially, in a way that our instruments are only just beginning to detect.\n\n> **In physics this is called:** detection of minimally conscious states; neural correlates of consciousness.  \n> **In daily life it is like:** calling someone who doesn't pick up the phone: you don't know if they are asleep, busy, or simply don't want to talk. The absence of a signal is not a signal of absence.\n\n---\n\n### What Makes Something Conscious?\n\nA camera has more processing elements than many animal brains. A modern computer processes more information per second than the human brain by many metrics. And yet the intuition that someone is home in the human brain and not in the computer is persistent. Why?\n\nGiulio Tononi proposed that conscious systems don't just process information: they integrate it in a way that cannot be reduced to the sum of its parts. A camera divides its pixels into two halves: each half processes the same amount of information. You lose nothing, because there was never any integration. The brain, surgically divided—as in the famous split-brain patients with a severed corpus callosum—does not produce two people with half the experience. It produces something more disturbing: under certain conditions, two semi-independent processing systems inhabiting the same body, each with its own point of view.\n\nTononi formalized this with phi (Φ): the information a system generates as a whole, above and beyond what its parts would generate independently. Phi is low in a thermostat. It is high in an awake human brain. It is intermediate in a dog. It is strangely distributed in an octopus. And it drops drastically under anesthesia.\n\n| System | Phi (approx) | Experience? |\n| Thermostat | ~0 | No (limit case) |\n| C. elegans worm | Very low | Something, minimal |\n| Bee | Low-medium | Something more, flexible |\n| Octopus | Medium, distributed | Something different, choral |\n| Dog (Txiki) | Medium-high | Recognizable, emotional |\n| Awake human | Very high | The most complex we know |\n| Brain under anesthesia | Drastic drop | Where does the \"someone\" go? |\n\n> **In physics this is called:** Phi (Φ), integrated information; Integrated Information Theory (IIT).  \n> **In daily life it is like:** an orchestra. It isn't that each musician plays their part—it's that they all play together in a way that something emerges which no one plays alone. A recording of each musician separately is not the symphony. The symphony is in the relationships.\n\nBut IIT is not the only theory. Global Workspace Theory (Baars, Dehaene) proposes that consciousness emerges when information becomes globally available in the brain: it enters a \"workspace\" shared by multiple systems. It isn't that the information is more integrated: it's that it stops being private and becomes public to the rest of the brain. Attention is the spotlight that decides what enters the workspace. Consciousness is what happens inside.\n\nThese two theories—IIT and Global Workspace—are not incompatible. They might describe the same phenomenon from two angles: IIT from the structure of information, Global Workspace from the dynamics of its broadcasting. Neither is proven. Both generate testable predictions. And both suggest the same thing: consciousness is not a switch. It is a dial. And the dial has many positions.\n\n> **In physics this is called:** non-mutually exclusive rival theories; methodological pluralism.  \n> **In daily life it is like:** describing a city from a map and from the street: they are different descriptions of the same thing, and both are useful for different questions.\n\n---\n\n> **Note to Chapter 1**\n>\n> **What we do know:** Animal consciousness has ceased to be a scientific taboo. The Cambridge Declaration (2012) was a turning point. IIT is an active theory, not dogma. General anesthesia produces measurable changes in brain connectivity before local activity disappears. Non-human animals show neural correlates of emotional and cognitive experience.\n>\n> **What we don't know:** Where to draw the exact line. If a thermostat has Φ>0, does it have \"something\" of an experience? The question is open. Whether IIT and Global Workspace describe the same phenomenon or different phenomena. Whether consciousness can exist in non-biological systems.\n>\n> **Remaining questions:** Can a machine have a high enough Φ to be \"someone\"? Where is the threshold between \"processing\" and \"experiencing\"? Is the distributed consciousness of an octopus \"one\" experience or \"many\"? What happens in the gray area of anesthesia?\n>\n> **If you only take away one idea:** Consciousness is not a switch. It is a dial. And the dial has dim light where we previously believed there was total darkness. Txiki wasn't a machine looking at you. He was someone who was there. And if a dog can be there, the universe is more populated than Descartes believed.\n>\n> **Readings:** Tononi (2008), \"Consciousness as integrated information\"; Cambridge Declaration (2012); Baars (1988), Global Workspace Theory; Dehaene (2014), *Consciousness and the Brain*; Seth (2021), *Being You*.",
    sectionEn: "PART ONE: THE CYCLE OF THE HORIZON",
    illustration: {
      id: "il04",
      title: "La trampa del interruptor",
      description: "Un termostato roto (ON/OFF, vacío por dentro) junto a un dial analógico con luz gradual. Debajo, escala de seres: termostato (apagado), gusano (luz tenue), abeja (media), perro (cálida), humano (brillante)."
    }
  }
];
