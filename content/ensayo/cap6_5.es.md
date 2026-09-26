---
title: EL CICLO DE LA INSTANCIACIÓN
subtitle: (O: Nacimiento, muerte y recolección de basura)
section: PRIMERA PARTE: EL CICLO DEL HORIZONTE
chapterNumber: 8
illustrationId: il09_5
illustrationTitle: La instanciación
illustrationDescription: Una reserva continua de líneas de datos fluyendo de forma caótica en tonos azules. De él, una región circular se cierra y encapsula, ordenando sus datos internos en un brillo cálido, mientras otra esfera se deshace liberando sus circuitos dorados al mar de datos.
---

El diálogo entre el reservorio, el nacimiento y el retorno a la nada gana una claridad inesperada si dejamos por un momento la física cuántica y la metafísica oriental y entramos en un terreno más pragmático: la ingeniería de sistemas y el diseño de software.

En la informática moderna, cada vez que abrimos una aplicación o cargamos una página web asistimos a una recreación en miniatura del ciclo completo del horizonte.

---

### El *heap* como reservorio

En la arquitectura de cualquier software, la memoria dinámica se organiza en dos grandes estructuras: el *stack* (la pila de llamadas de ejecución inmediata) y el **heap** (el montón).

El *heap* es el equivalente digital del reservorio: una reserva de memoria continua, enorme y sin estructura. Antes de que un programa pida recursos, el *heap* es pura potencia, un océano de gigabytes vacíos sin objetos, variables, funciones ni identidades; solo un flujo indiferenciado de direcciones de memoria a la espera de que alguien escriba en ellas. Es el *Hun Dun* de la computación: un estado de máxima simetría en el que nada está delimitado y todo es posible.

El *heap* no tiene dentro ni fuera. Es un continuo físico (los chips de silicio de la RAM) que carece de estructura lógica interna hasta que interviene el software.

---

### El nacimiento como instanciación y encapsulación

El nacimiento de un sistema consciente, de un horizonte, se corresponde con la **instanciación**.

Cuando el programa ejecuta una instrucción del tipo `new Object()`, se produce una transición de fase en el *heap*. El gestor de memoria reserva un bloque concreto de bytes de esa masa indiferenciada y traza una frontera lógica a su alrededor. En ese instante, el constructor de la clase escribe los valores iniciales y activa la propiedad más fundamental del diseño de software: la **encapsulación** (o el principio de *ocultamiento de información*, formulado por David Parnas en 1972).

La encapsulación hace algo extraordinario: divide el bloque de memoria en dos niveles de visibilidad.

1. **La interfaz pública (*public API*)**: el conjunto de métodos y firmas que el objeto expone al resto del sistema. Es la superficie de contacto, el equivalente del horizonte de sucesos. El resto del programa solo puede comunicarse con el objeto invocando esos métodos públicos.
2. **El estado privado (*private fields*)**: las variables de estado internas que el objeto guarda celosamente en su interior.

Aquí aparece el dualismo de acceso en su forma más pura. Desde fuera del objeto, su interior es un agujero negro: ningún código del resto del sistema puede leer ni alterar directamente una variable declarada `private`. La memoria interna es inaccesible, y solo sabemos de ella lo que la API pública nos deja consultar. En cambio, desde dentro del propio objeto (mediante la autorreferencia `this`), el acceso a ese estado privado es total, inmediato y natural.

La subjetividad, el dentro, no requiere una materia distinta de la del resto del ordenador. Es la perspectiva del código que se ejecuta dentro de la frontera de encapsulación de la instancia.

---

### La muerte como liberación de memoria y recolección de basura

La vida de un objeto consiste en procesar mensajes que cruzan su API pública, modificar su estado privado y devolver respuestas al exterior. Pero ese ciclo tiene un final, que dicta la gestión de recursos del sistema.

En programación, un objeto muere cuando ya no queda ninguna referencia que apunte a él. Si ninguna variable del programa guarda su dirección, el objeto queda huérfano y el entorno de ejecución deja de poder alcanzarlo.

Entonces interviene el **recolector de basura** (*garbage collector*) o se libera la memoria explícitamente (`free()` o `delete`).

La muerte no es la aniquilación física de los componentes del objeto. El recolector de basura no borra los electrones de las celdas de la RAM; se limita a disolver la frontera de encapsulación y a declarar que ese bloque de direcciones vuelve a estar disponible en el *heap* común. Al romperse la frontera lógica, el estado privado del objeto deja de estar protegido, y la información que definía su «identidad» o su «memoria interna» se reintegra en la masa de memoria indiferenciada y pierde enseguida su estructura.

La instancia ha dejado de existir, pero el soporte que la sostenía ha vuelto íntegro al reservorio.

---

### El «karma» en los sistemas de software

En el mundo ideal de la teoría de la computación, el retorno de un objeto al *heap* no deja rastro. Pero en los sistemas reales, cada ciclo de instanciación y liberación altera el entorno de forma permanente:

- **Efectos secundarios (*side effects*)**: el objeto puede haber escrito datos en un archivo de registro, enviado paquetes por la red o modificado variables globales del sistema operativo.
- **Fragmentación de memoria**: aunque se libere el espacio del objeto, la geografía del *heap* ya no es la misma. Han quedado pequeños huecos entre bloques de memoria que condicionan dónde y cómo podrán instanciarse los objetos siguientes.
- **Fugas de memoria (*memory leaks*)**: si el objeto mantenía una referencia oculta a un recurso externo, esa porción del *heap* queda bloqueada para siempre, incluso después de que se haya recolectado el objeto principal.

Este condicionamiento estructural que la existencia y la desaparición de un objeto ejercen sobre el *heap* es la analogía exacta del **karma**. La reserva de memoria no vuelve a su estado limpio original: conserva la textura y la fragmentación que dejó cada sistema que existió en ella. La siguiente instancia no nacerá en un vacío perfecto, sino en un entorno moldeado por el historial de ejecuciones anteriores.

La identidad del objeto desaparece, pero la deformación que causó en el sistema persiste.

---

> **Nota al Capítulo 8**
>
> **Lo que sí sabemos:** Que la encapsulación y el ocultamiento de información dividen un sistema en interfaz pública y estado privado. Que la recolección de basura devuelve recursos al *heap* sin destruir la memoria física. Que la fragmentación y los efectos secundarios son inevitables en sistemas reales.
>
> **Lo que no sabemos:** Si el cerebro biológico implementa mecanismos análogos a la recolección de basura sináptica más allá de la homeostasis del sueño. Si existe un «recolector de basura» global para la información del universo físico.
>
> **Preguntas que quedan:** ¿Es la conciencia un único hilo de ejecución o un sistema multihilo distribuido? ¿Pueden considerarse las fugas de memoria mentales (traumas, patrones repetitivos) fallos en la recolección de basura del yo?
>
> **Si solo te quedas con una idea:** Nacer es reservar memoria y encapsularla; morir es liberar la frontera y volver al *heap*. El abismo entre tu mente y el mundo exterior no es magia espiritual, sino el rasgo de una buena arquitectura que protege su estado privado tras una interfaz pública.
>
> **Lecturas:** Parnas (1972), "On the criteria to be used in decomposing systems into modules"; Dijkstra (1968), "Go To Statement Considered Harmful" (sobre estructura de control); Knuth (1997), "The Art of Computer Programming" (gestión de memoria dinámica).