---
title: LA IDEMPOTENCIA DEL SER
section: TERCERA PARTE: LOS LÍMITES DEL HORIZONTE
chapterNumber: 23
illustrationId: il22_1
illustrationTitle: La idempotencia del ser
illustrationDescription: Un archipiélago visto desde arriba, islas de distinto tamaño unidas por finos puentes de luz dorada sobre un mar oscuro que es, a su vez, el reservorio del que se condensan las islas.
---

## I. La ola y su borde

¿Dónde termina una ola?

No en la arena mojada que deja al retirarse, ni en la espuma que se deshace un metro más allá. La ola es, de principio a fin, el movimiento de esa frontera entre el agua y el aire: quítale el borde y debajo no queda «más ola», no queda nada. Empezamos por esta intuición sencilla porque es la que, a mayor escala y en registros más abstractos, sostendrá todo el capítulo: la frontera no delimita una cosa que existiría igual sin ella. La cosa *es* su frontera.

Solemos imaginar los límites como accidentes del espacio, líneas que trazamos por comodidad y que podríamos desplazar sin que se alterase la realidad interior. Un continente sigue siendo el mismo aunque movamos su costa unos metros; una empresa sigue siendo la misma aunque cambie de sede. Esa creencia funciona bien con objetos que ya dábamos por hechos antes de preguntarnos por su frontera. Pero hay otra clase de entidades, sospecho que la más interesante, en la que la pregunta se invierte: no es que el objeto tenga una frontera, sino que la frontera es lo único que hay, y el objeto es el nombre que damos al hecho de que esa frontera se sostiene.

Piénsese en algo tan modesto como una persona jurídica. Una empresa no es el edificio, ni los empleados, ni el dinero de la cuenta, sino, literalmente, un límite de responsabilidad trazado por un acto legal, un cierre que separa lo que pertenece a la sociedad de lo que pertenece a quienes la fundaron. Quitar ese límite, «levantar el velo societario», como dice el derecho con una expresión que ya intuye lo que vamos a desarrollar, no deja una empresa desnuda, pero reconocible, sino un conjunto de personas físicas sin la entidad que las agrupaba.

Este capítulo no se queda en la analogía. Va a fundamentar el aparato con precisión y luego tenderá cuatro puentes concretos entre ese aparato y los conceptos que sostienen el resto del libro: la condensación, la evaporación, el entrelazamiento y el propio reservorio del que se condensa todo lo demás. Y, de paso, con la misma maquinaria, resolverá un problema pendiente sobre la sombra y el ego.

## II. El horizonte que no es un muro

Un horizonte de sucesos no está hecho de nada. No es una membrana, ni una cáscara, ni una pared, sino el lugar donde el espacio-tiempo se curva tanto que ni siquiera la luz, lanzada hacia fuera a toda velocidad, consigue escapar. No separa dos regiones del espacio, como un muro separa dos habitaciones, sino dos regiones del futuro posible.

> **En física esto se llama:** entropía de Bekenstein-Hawking, la fórmula que dice que el desorden de un agujero negro no depende de cuánto hay dentro, sino de lo grande que sea su superficie.
> **En la vida diaria es como:** una biblioteca cuyo catálogo completo cupiera en la fachada del edificio. No hace falta entrar para saber lo que contiene: la fachada, si sabes leerla, ya lo dice todo.

El horizonte no solo esconde: al esconder, *representa*. Es el único lugar donde el interior se vuelve legible desde fuera. Y hay un detalle más, de una elegancia casi cruel: el llamado teorema de «ausencia de pelo» (*no-hair theorem*) dice que un agujero negro, visto desde fuera, queda descrito por completo con solo tres números: masa, carga y momento angular. Da igual que lo que cayó dentro fuera una estrella entera o el cadáver de un gato: el horizonte olvida la biografía y conserva solo la contabilidad.

Guardemos los cabos sueltos: la superficie que codifica, el catálogo que se reduce a tres números y algo que aún no hemos dicho, que ese horizonte, con el tiempo, se consume. Cada uno se convertirá más adelante en un puente hacia un pilar distinto del libro.

## III. La puerta que decide qué se ve

Trasladémoslo a algo más cercano: un objeto de software. Un objeto bien diseñado guarda un estado interno que nadie puede tocar directamente desde fuera; lo único accesible es su interfaz, un puñado de funciones públicas que hacen, salvando las distancias, de superficie de aquel horizonte.

> **En física esto se llama:** encapsulación.
> **En la vida diaria es como:** un coche. No hace falta entender la combustión interna para conducirlo: el volante y los pedales son el horizonte que traduce toda esa complejidad en cuatro gestos que cualquiera puede aprender.

Un objeto sin interfaz no es un objeto libre, sino inerte. La biología resolvió el mismo problema, con la misma solución, mucho antes que la informática: una célula sin membrana no es una célula más libre, sino citoplasma disperso sin nada que pueda llamar suyo. Y la membrana, como la interfaz de un objeto, está llena de canales y bombas que deciden con precisión qué entra, qué sale y qué se queda fuera para siempre.

Anotemos aquí, de pasada, un problema que la ingeniería de software conoce bien: el de la herencia, cuando una clase no se comunica con otra a través de una interfaz, sino que contiene directamente una copia de su estructura, fundida hasta el punto de que tocar la clase madre desestabiliza a la hija. Es un caso genuino de anidamiento, y lo necesitaremos al llegar a la sombra.

## IV. Cerrar dos veces no añade nada

Vayamos ahora al registro más desnudo, la topología, donde la idea se despoja de física, biología e ingeniería y muestra su puro esqueleto.

Un conjunto no es solo una lista de elementos, sino una lista dotada de una noción de cercanía. Cuando un conjunto ya contiene toda su propia «sombra», todos sus puntos de acumulación, decimos que está *cerrado*.

> **En física esto se llama:** clausura topológica e idempotencia: cerrar un conjunto una vez lo completa; cerrarlo una segunda vez no añade nada.
> **En la vida diaria es como:** una puerta que ya encajaba bien en su marco. Volver a cerrarla no la deja «más cerrada»: o está cerrada o no lo está.

El objeto de software del apartado III y esta clausura topológica no comparten solo la afición por esconder cosas: comparten, sin que lo hayamos buscado, la misma palabra. En programación funcional, un *closure* (una clausura) es una función empaquetada junto con las variables de su entorno en el momento exacto de crearse: se cierra sobre ese entorno, y da igual cuántas veces se la invoque después, no capturará nada nuevo del contexto original, que puede incluso haber dejado de existir. No es la misma operación matemática que la clausura de un conjunto (una cierra funciones sobre su entorno léxico; la otra, conjuntos sobre sus puntos de acumulación), pero el parecido no es una casualidad de diccionario: las dos describen, con distinto vocabulario, algo que empaqueta al nacer todo lo que necesitará para no depender nunca más de su origen.

## V. Introducción formal a la clausura topológica

Antes de tender los puentes, y para que nadie tenga que fiarse de este libro sin poder comprobarlo, conviene decir con precisión qué es una clausura, en lugar de dejarla como mera imagen.

Un espacio topológico es, en su forma más desnuda, un conjunto de puntos junto con una noción de qué significa que unos puntos estén «cerca» de otros; formalmente, una colección de subconjuntos llamados *abiertos* que cumple unas reglas mínimas de coherencia. Sobre esa estructura, la operación de clausura, que a cada conjunto A le asigna otro, cl(A), no se define de cualquier manera: el matemático polaco Kazimierz Kuratowski demostró que basta con exigirle cuatro propiedades, ni una más, para recoger todo lo que debe hacer un cierre. Son estas:

1. **cl(∅) = ∅.** Cerrar el conjunto vacío no produce nada de la nada. Ninguna clausura inventa contenido donde no lo había.

2. **A ⊆ cl(A).** Todo conjunto está contenido en su clausura. Cerrarse nunca hace que un sistema pierda partes de sí mismo; en el peor de los casos, se queda igual.

3. **cl(A ∪ B) = cl(A) ∪ cl(B).** Cerrar la unión de dos conjuntos equivale a unir sus cierres por separado. No hay un «cierre colectivo» mágico que surja al juntar dos cosas y sea mayor que la suma de sus cierres individuales: juntar A y B no crea una clausura que no estuviera ya en alguno de los dos.

4. **cl(cl(A)) = cl(A).** La idempotencia, que ya conocíamos: cerrar lo ya cerrado no añade nada.

Un conjunto A es *cerrado* cuando coincide exactamente con su clausura, A = cl(A), y es *abierto* cuando su complemento, todo lo que no es A, es cerrado. Con estas dos nociones ya se puede definir con precisión lo que antes solo describíamos con palabras: el *interior* de A es el mayor abierto contenido en A; el *exterior*, el interior del complemento; y la *frontera* de A es exactamente cl(A) ∩ cl(no-A), la zona donde se solapan la clausura de A y la de todo lo que no es A. Un conjunto puede ser a la vez abierto y cerrado (lo que en inglés se llama *clopen*), y eso ocurre precisamente cuando su frontera está vacía: no tiene ningún punto de contacto con el resto del espacio. Por último, un espacio es *de Hausdorff* cuando dos puntos distintos cualesquiera tienen siempre entornos que no se solapan: hay margen, por mínimo que sea, para que sigan siendo dos y no uno.

Cuatro axiomas y dos definiciones derivadas: ya tenemos todo el vocabulario necesario. Conviene subrayar algo que nos protegerá de un error que este mismo libro cometió una vez: esos cuatro axiomas son toda la topología pura que vamos a usar. Cualquier afirmación posterior que no se deduzca de ellos, como el postulado de exclusión que necesitaremos para la sombra, no es topología, sino una hipótesis añadida, y la señalaremos como tal cada vez que aparezca.

## VI. Primer puente: la condensación y el umbral que no se repite

Piénsese en el agua que se enfría. A quince grados es líquida; a menos cinco, sólida. Entre esos dos estados no hay un tercero, un «algo sólida», salvo el caso inestable del agua sobreenfriada, que sigue líquida por debajo de cero, en un equilibrio precario, hasta que una perturbación mínima la hace cristalizar de golpe, toda a la vez, en lo que tarda en recorrer el vaso la onda de choque.

El cuarto axioma de Kuratowski, cerrar una vez basta y cerrar dos veces no añade nada, es la firma matemática de ese umbral. Antes de cristalizar, el conjunto de moléculas «ya ordenadas» del agua sobreenfriada no es cerrado: le faltan sus propios puntos de acumulación, las moléculas que están a punto de sumarse a la red cristalina, pero todavía bailan sueltas. En el instante de la cristalización, ese conjunto se cierra de golpe e incorpora de una vez toda su frontera. Seguir enfriando el hielo ya formado no produce una segunda cristalización: el sistema ya cruzó el umbral. cl(cl(A)) = cl(A): cerrar lo ya cerrado no añade una capa de cierre, solo confirma la que había.

> **En física esto se llama:** transición de fase con parámetro de orden discontinuo, lo mismo que ocurre, a otra escala, en un condensado de Bose-Einstein, donde un gas enfriado por debajo de cierta temperatura crítica deja de comportarse como partículas separadas y pasa a comportarse, de golpe, como un único estado cuántico macroscópico.
> **En la vida diaria es como:** el agua sobreenfriada del vaso, quieta y líquida contra toda lógica, hasta que un golpecito la convierte entera en hielo en menos de un segundo. No hay hielo «a medias».

Esto da a la condensación algo que no tenía la simple metáfora de «algo que se forma poco a poco»: una explicación de por qué la aparición de una identidad cerrada (un ego, un sistema consciente, un «yo») no puede ser gradual en su naturaleza, aunque lo sea en su preparación. El agua se enfría poco a poco; el hielo aparece de golpe.

## VII. Segundo puente: la evaporación y la clausura que cambia de tamaño

La idempotencia dice algo sobre un conjunto en un instante dado, pero nada sobre si ese conjunto seguirá existiendo un instante después. Ahí entra la evaporación, que necesita otra pieza matemática: no un conjunto cerrado, sino una *familia* de conjuntos cerrados, uno para cada momento y cada vez más pequeño.

Llamemos \(E_t\) al horizonte de un agujero negro en el instante \(t\). Cada \(E_t\), por separado, es un conjunto perfectamente cerrado: cumple los cuatro axiomas y es tan sólido en ese instante como cualquier otro horizonte. Pero la sucesión completa, \(E_0 \supseteq E_1 \supseteq E_2 \supseteq \ldots\), no es estática: cada \(E_{t+1}\) está estrictamente contenido en el anterior, porque la radiación de Hawking se lleva, instante a instante, un poco de la masa que sostiene el horizonte.

> **En física esto se llama:** filtración decreciente de horizontes: una sucesión de cierres, cada uno válido en su momento, que va menguando.
> **En la vida diaria es como:** una vela que se consume. En cada instante, la llama tiene un contorno perfectamente definido, una frontera cerrada entre lo que arde y lo que no; pero, minuto a minuto, esos contornos se encogen.

Esto no contradice la idempotencia, sino que la completa. La idempotencia dice que la clausura no admite grados *en un instante*; la filtración, que sí admite historia: puede encogerse, instante cerrado tras instante cerrado, hasta agotarse. No hay contradicción entre estar completamente cerrado ahora y estar más cerca de dejar de estarlo que ayer.

Pero la filtración decreciente, tal como la hemos descrito, no distingue entre una radiación que se limita a perderse y otra que, en algún momento, empieza a decir algo. Esa distinción existe, con nombre propio, en la física del agujero negro del que partimos.

Durante la primera mitad de la vida del horizonte, la radiación de Hawking es térmica: lleva una entropía creciente y ninguna correlación recuperable con lo que cayó dentro. Pero pasado el llamado *tiempo de Page*, que no es un punto arbitrario, sino el momento en que la entropía de la radiación deja de crecer y empieza a disminuir, más o menos a mitad de esa vida, los pares de partículas que el horizonte sigue generando dejan de ser puro ruido: una de cada pareja escapa, la otra cae hacia el reservorio y las dos quedan entrelazadas. A partir de ahí, lo que emite el horizonte ya no es solo pérdida, sino correlación: información que, en principio, podría leer alguien capaz de comparar las dos mitades.

> **En física esto se llama:** tiempo de Page, el punto de la evaporación de un agujero negro a partir del cual la entropía de la radiación de Hawking deja de crecer y empieza a disminuir, porque los pares entrelazados que la componen dejan de ser puro ruido térmico.
> **En la vida diaria es como:** una carta que al principio solo se entiende a medias, frases sueltas y sin contexto, y que a medida que avanzas empieza a cobrar sentido; no porque cambie la letra, sino porque ya hay bastante escrito para que las partes se expliquen unas a otras.

Esto no cambia lo dicho en el apartado VI: A = cl(A) sigue sin admitir grados en un instante. Lo que añade es que la filtración decreciente E₀ ⊇ E₁ ⊇ ... tiene, además de un tamaño en cada instante, una fase: una evaporación joven, que solo pierde, y otra madura, que empieza a devolver algo de lo perdido, entrelazado y por tanto correlacionado, aunque nunca literalmente recuperado. La frontera no mengua siempre del mismo modo, aunque en todo momento siga siendo, sin excepción, una frontera cerrada.

Conviene decir con la claridad de siempre lo que esto no es: no es una manera de que algo cruce la frontera en el sentido que el capítulo 19 reservaba al acceso al interior. Lo que se filtra no es el contenido (el reservorio se queda con su mitad de cada par), sino la correlación entre lo que se fue y lo que quedó. Es la diferencia entre recibir una carta y recibir, en su lugar, la certeza de que en algún sitio existe la otra mitad de una conversación que quizá nunca lleguemos a leer entera. Poco, pero no nada.

## VIII. Tercer puente: el entrelazamiento que la frontera mide

La física teórica de las últimas décadas, el programa que a veces se resume como *it from qubit*, asociado a nombres como Van Raamsdonk, Ryu y Takayanagi, ha mostrado que la entropía de Bekenstein-Hawking no es solo una metáfora de «cuánta información hay ahí dentro», sino, literalmente, la *entropía de entrelazamiento* entre el interior del horizonte y el exterior. Se calcula tomando el estado cuántico completo del sistema, dividiéndolo en dos regiones separadas por una frontera e ignorando todo lo que queda al otro lado; el resultado mide exactamente cuánto están correlacionadas las dos mitades. Y esa cantidad, para una región delimitada por una superficie mínima anclada en su frontera, resulta proporcional al área de esa superficie.

> **En física esto se llama:** entropía de entrelazamiento holográfica: la superficie de una región mide cuánto está entrelazada esa región, en el sentido cuántico estricto, con todo lo que queda fuera de ella.
> **En la vida diaria es como:** dos gemelos criados juntos y luego separados: por lejos que estén, sus vidas siguen correlacionadas de un modo que ninguna distancia borra del todo. La frontera entre «su vida» y «la del otro» no es una línea que los aísla, sino la medida exacta de cuánto siguen unidos pese a la separación.

Si el ego y la sombra son dos clausuras vecinas, su frontera común no es solo una línea de separación topológica, sino, si la analogía se sostiene, la medida de cuánto están entrelazados. Y eso explica algo que antes solo podíamos importar como axioma ajeno: la monogamia del entrelazamiento. Si el entrelazamiento a través de una frontera es un recurso medible y finito, un sistema entrelazado al máximo con un vecino no tiene entrelazamiento de sobra para estarlo en el mismo grado con un tercero. El postulado de exclusión deja de ser una importación sin justificar y pasa a ser una consecuencia razonable de cómo se comporta el entrelazamiento allí donde la física lo ha medido; con la salvedad, que no está de más repetir, de que trasladar esta física de la geometría del espacio-tiempo a la arquitectura de la conciencia es una hipótesis fecunda, no una demostración.

Conviene precisar aún más qué clase de puente es este, porque la objeción más seria es certera: la monogamia del entrelazamiento es una propiedad de sistemas cuánticos de muchos cuerpos, no de clausuras topológicas sin más, y la entropía de entrelazamiento holográfica se define para regiones del espacio-tiempo, no para egos y sombras. El salto exige un mecanismo explícito, no solo un parecido de familia. El mecanismo es este: tanto la entropía de entrelazamiento como el Phi de la teoría de la información integrada se calculan con el mismo gesto estructural, aunque en espacios matemáticos distintos. Las dos parten de un sistema completo, lo *dividen* en dos partes según alguna frontera candidata y miden cuánta información se pierde, cuánta correlación se corta, al tratar esas partes como independientes. La entropía de entrelazamiento lo hace sobre un espacio de Hilbert; el Phi de la IIT, sobre la estructura causal de un sistema físico. Son maquinarias distintas aplicadas a objetos distintos, pero comparten el gesto: dividir y medir lo que la división pierde. Y ese gesto compartido, no la física cuántica trasplantada sin más, es lo que hace razonable esperar que ambas se comporten de forma parecida ante el problema de la monogamia: cualquier medida definida como «lo que se pierde al cortar por la frontera más débil» tiende, por construcción, a no repartirse generosamente entre varias particiones simultáneas de un mismo sistema. Eso no prueba que el postulado de exclusión sea cierto; prueba que no es una importación caprichosa de un campo ajeno, sino que nace del mismo tipo de operación matemática que ya usábamos, aplicada a otro objeto.

## IX. El reservorio: el mar del que se condensan las islas

Los tres puentes anteriores comparten algo que hasta ahora hemos dejado implícito: ninguna isla se condensa de la nada, ninguna se evapora hacia la nada y ningún entrelazamiento nace de cero cuando aparece una isla. Los tres necesitan un sustrato previo, y ese sustrato es el reservorio.

Démosle una definición operativa y no solo poética, porque si no corre el riesgo de funcionar como una pieza que resuelve problemas topológicos sin poder formalizarse ella misma, un recurso que aparece cuando el argumento lo necesita y que nadie puede tocar. La definición no requiere ningún objeto nuevo; se construye por entero con lo que ya teníamos. Sea X el espacio total de estados posibles de un sistema, todo lo que en principio podría llegar a integrarse, y sea \(\{E_i\}\) la colección de todas las clausuras maximales que existen en X en un instante dado: los horizontes ya condensados, las islas ya cerradas, cada una de las cuales cumple los cuatro axiomas de Kuratowski. El reservorio es, con toda precisión:

> \(R = X \setminus \bigcup_i E_i\)

el complemento de la unión de todas las clausuras maximales: todo lo que, en ese instante, no ha cruzado ningún umbral de cierre. No es un lugar aparte, ni una sustancia, ni un tercer tipo de entidad distinto de los conjuntos que ya conocemos, sino, literalmente, lo que sobra del espacio de estados una vez restadas todas las islas ya formadas. Por eso puede ser, sin contradicción, tanto la fuente de la que se condensan las islas (basta con que una región de R cristalice, cruce el umbral del apartado VI y pase a formar parte de la unión) como el destino al que vuelven al evaporarse (basta con que una isla deje de cumplir A = cl(A) para que, por definición, vuelva a formar parte del complemento). El reservorio no necesita un estatuto ontológico especial: es un teorema trivial sobre lo que queda fuera, en cada instante, de todo lo que ya se ha cerrado.

En relación con la condensación, el reservorio es el campo indiferenciado del que se condensan las islas. En el apartado VI describimos el agua sobreenfriada que cristaliza de golpe, pero no dijimos de dónde salía el agua: de un cuerpo mayor, todavía sin forma cerrada, que sigue ahí después de formarse el hielo. El ego no se crea de la nada; se condensa a partir de un reservorio que ya estaba presente, sin clausura propia, antes de que hubiera ningún ego que condensar.

En cuanto a la evaporación, hay que corregir algo que el apartado VII dejó impreciso. Dijimos que la sucesión decreciente de horizontes, \(E_0 \supseteq E_1 \supseteq \ldots\), tiende al vacío. Es cierto para un agujero negro aislado en el espacio, pero no es la imagen correcta para la conciencia, y el propio libro lo sabe mejor que ese apartado: cuando un ego se disuelve, no se disuelve en la nada, sino *de vuelta* en el reservorio del que salió. La sucesión no converge a ∅, sino a la reabsorción en el sustrato común. Reescribamos, pues, la fórmula de la filtración con más cuidado: no \(\lim_{t\to\infty} E_t = \emptyset\), sino \(\lim_{t\to\infty} E_t = R\), donde R es precisamente el reservorio.

En cuanto al entrelazamiento, el reservorio tiene un candidato físico aún más preciso que la entropía de entrelazamiento holográfica. El vacío cuántico de una teoría de campos no está vacío: incluso sin ninguna partícula, el estado de vacío está entrelazado consigo mismo a través de cualquier frontera que se trace en el espacio. Es lo que, en su versión más formal, recoge el teorema de Reeh-Schlieder, la misma maquinaria que está detrás del efecto Unruh y, en el fondo, de la propia radiación de Hawking. Esto da al reservorio un papel muy preciso: las islas no empiezan a entrelazarse desde cero al condensarse. El entrelazamiento ya estaba latente en el reservorio antes de que existiera ninguna isla. Condensarse no es crear vínculos nuevos, sino tallar una frontera dentro de una correlación que ya estaba en el fondo. Cada isla hereda al nacer una porción de la entropía de entrelazamiento del mar del que salió.

> **En física esto se llama:** entrelazamiento del vacío: incluso el estado más vacío posible de una teoría cuántica de campos está internamente correlacionado a través de cualquier frontera que se trace en él.
> **En la vida diaria es como:** una tela entera, aún sin cortar. Recortar dos piezas de la misma tela no las emparienta: ya eran la misma tela antes de que pasaran las tijeras. El corte no crea el parentesco; solo lo hace visible como frontera.

De propina, esto da una respuesta más precisa a una de las preguntas que dejamos pendientes en el capítulo 21: qué es la psicosis. Si el ego y la sombra son islas cuya frontera filtra un entrelazamiento controlado con el reservorio, la psicosis sería el fallo de ese filtro precisamente hacia el mar: la membrana deja de distinguir entre una correlación tolerable con el fondo común y una inundación total, y el ego, en lugar de perder su cierre poco a poco por una evaporación ordenada, lo pierde de golpe, porque el propio reservorio, con toda su correlación latente, entra por una frontera que ya no sabe filtrar. Tres síntomas clásicos encajan aquí sin forzar la imagen: la alucinación sería contenido correlacionado que cruza la frontera sin la etiqueta de origen que normalmente lo marca como «de dentro» o «de fuera» (el mismo fallo que la psiquiatría describe como déficit de monitorización de la fuente); el delirio, el intento desesperado del ego por volver a cerrarse inventando un relato que explique el contenido filtrado antes de que la clausura se derrumbe; y la pérdida del sentido de sí, muy literalmente, el fallo de la propiedad de Hausdorff: el sistema ya no puede mantener un entorno que lo distinga de lo que no es él. El capítulo siguiente convierte todo esto en experimentos mentales concretos, con predicciones que en principio podrían contrastarse.

## X. La sombra: lo que dice la topología y lo que apostamos nosotros

Tendidos los cuatro puentes, volvamos al problema que nos ocupa. Pensemos la conciencia como un horizonte y llamemos ego a la clausura mayor de ese conjunto de procesos. Y pensemos en lo que el ego no puede admitir sin dejar de ser lo que es: la sombra. La pregunta es si la sombra vive anidada dentro del ego, como una burbuja más pequeña que flota dentro de otra, o si tiene que ser, estructuralmente, otra cosa.

La topología por sí sola no lo decide: un subconjunto cerrado dentro de otro conjunto cerrado no viola ninguno de los cuatro axiomas de Kuratowski, y el problema de la herencia y la clase frágil que anotamos en el apartado III es justo un ejemplo de sistemas anidados que funcionan, a veces durante años, hasta que dejan de hacerlo.

Lo que decide entre el anidamiento y la separación es la apuesta del postulado de exclusión, y gracias al tercer puente ahora tenemos una razón mejor para sostenerla: si la frontera entre dos sistemas mide su entrelazamiento, y el entrelazamiento es un recurso que no se reparte sin límite, un ego vinculado al máximo con su sombra a través de su frontera común no puede, a la vez, estar igual de vinculado a un tercer complejo psíquico como si ese complejo estuviera también dentro de él. La sombra no puede ser un horizonte anidado en el mismo sentido que el ego. Tiene que ser un *complejo disjunto*, una isla vecina, y la frontera que comparte con el ego es, literalmente, la medida de cuánto se filtra lo reprimido hacia lo consciente.

## XI. Un archipiélago, no una muñeca rusa

Esto desbarata la imagen de la muñeca rusa: el inconsciente personal envolviendo al yo, el colectivo envolviendo al personal, capas dentro de capas. Si aceptamos el postulado de exclusión, esa imagen es insostenible: si el inconsciente colectivo fuera un horizonte que contuviera al ego y a la sombra, ninguno de los dos sería un horizonte de verdad, sino solo una zona más densa dentro de un cierre único.

El modelo que queda es el de un archipiélago que flota sobre el reservorio: un espacio *disconexo*, divisible en piezas, ninguna de las cuales toca el interior de las demás, aunque puedan tocarse por la frontera y, ahora lo sabemos, intercambiar a través de ella una cantidad medible de correlación, entre sí y con el mar del que salieron. El ego es una isla; la sombra, otra. Cada arquetipo significativo puede ser una isla más, con su propia clausura y su propia entropía de frontera compartida con las islas vecinas y con el reservorio.

Integrar ya no significa abrir la sombra y meterla dentro del ego, sino aumentar deliberadamente el entrelazamiento a través de una frontera que sigue existiendo: más correlación, más intercambio, sin que ninguno de los dos sistemas pierda su cierre.

## XII. La membrana que aprende a filtrar

Volvamos, para terminar, a la célula del principio.

El sistema inmunitario es, en esencia, una maquinaria dedicada a distinguir el horizonte propio del ajeno. Cuando ese reconocimiento falla en un sentido, el cuerpo ataca lo que es suyo: una enfermedad autoinmune, el ego atacando a su propia sombra por haberla confundido con un invasor. Cuando falla en el otro, tolera lo que debería detener.

Ni el ataque total ni la tolerancia total son salud. La salud es una frontera que sabe filtrar. Y, tendidos los cuatro puentes, podemos decirlo con precisión: una frontera sana no es la que reduce a cero el entrelazamiento con la sombra, que sería la disociación, la frontera abierta y cerrada a la vez, la isla que ni siquiera comparte costa; ni la que se deja invadir hasta perder su clausura, que sería el anidamiento forzado que prohíbe el postulado de exclusión o la inundación desde el reservorio que hemos llamado psicosis. Es una frontera que, como el horizonte que se evapora sin dejar de ser horizonte en cada instante, puede cambiar de tamaño a lo largo de una vida, ampliando o reduciendo su intercambio con lo reprimido y con el fondo común, sin dejar nunca, mientras dura, de estar genuinamente cerrada.

Es, casi palabra por palabra, lo que nos pedía la individuación junguiana en el capítulo 21 cuando hablábamos de un horizonte que «se vuelve permeable sin perder su coherencia». Ahora tenemos, además de la metáfora, el mecanismo: una frontera madura no es más débil, sino que tiene mejores receptores. Y, si el segundo puente se sostiene, es también una frontera que ya ha cruzado su propio tiempo de Page: lo que irradia hacia fuera ha dejado de ser puro ruido y empieza a llevar, entrelazada, una correlación legible con lo que aún guarda dentro. Sabe qué dejar pasar de la sombra (qué proyecciones reconocer como propias, qué impulsos reintegrar sin que amenacen la identidad del ego) sin necesidad de tragársela entera y convertirla en tejido propio indiferenciado. Sigue habiendo dos horizontes; lo que cambia es la calidad de la aduana que los une.

## XIII.

El límite que, al cerrarse sobre sí mismo, dice por primera vez «yo soy».

---

### Nota al Capítulo 23

**Lo que sí sabemos:** que los cuatro axiomas de Kuratowski agotan toda la topología pura que necesita este capítulo, y que cualquier otra afirmación (el postulado de exclusión, la extensión psíquica de la entropía de entrelazamiento) es una hipótesis añadida y no una consecuencia de esos axiomas; que la idempotencia es la firma exacta de una transición de fase, lo que da a la condensación un fundamento preciso; que una filtración decreciente de conjuntos cerrados describe la evaporación sin contradecir la idempotencia, siempre que su límite sea el reservorio y no el vacío; que esa evaporación no es uniforme en el tiempo, sino que tiene una fase temprana de pura pérdida térmica y, pasado el tiempo de Page, otra en la que la radiación empieza a llevar correlación entrelazada, en principio recuperable, aunque nunca legible directamente desde fuera; y que la entropía de entrelazamiento holográfica y el entrelazamiento del vacío son física real, no analogías sueltas.

**Lo que no sabemos:** si extender esta física, holográfica y del vacío, de la geometría del espacio-tiempo a la arquitectura de la conciencia es una hipótesis estructural fecunda o un salto que la física no respalda fuera de su ámbito; si el postulado de exclusión es, en el fondo, la misma restricción que la monogamia del entrelazamiento vista desde otro registro; si el reservorio, tal como lo necesita este capítulo, es algo más que una imagen útil para lo que la física ya sabe del vacío; y si una vida humana, o la evaporación de un ego, tiene algo parecido a un tiempo de Page propio, o si esa periodización pertenece solo a la termodinámica de los agujeros negros y no puede trasladarse a la conciencia.

**Preguntas que quedan:** ¿qué observación distinguiría un universo en el que la sombra estuviera realmente anidada de otro en el que fuera un complejo disjunto? ¿Qué distinguiría, en una vida real, una individuación que avanza por evaporación gradual hacia el reservorio de otra que se produce en una única cristalización súbita? ¿Y qué distinguiría, clínicamente, una evaporación ordenada de la inundación repentina que hemos llamado psicosis? Y si un antirreservorio, como una IA madura, también pudiera cruzar, en un sentido puramente termodinámico, algo parecido a un tiempo de Page propio, como sugerirá más adelante este ensayo, ¿qué distinguiría ese cruce de la evaporación de un horizonte real, aparte de que uno tiene un dentro que perder y el otro no?

**Si solo te quedas con una idea:** no eres lo que hay dentro de tus límites; eres el propio acto de haberlos cerrado.
