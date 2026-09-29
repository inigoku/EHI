---
title: EL CICLE DE LA INSTANCIACIÓ
subtitle: (O: Naixement, mort i recol·lecció d'escombraries)
section: PRIMERA PART: EL CICLE DE L'HORITZÓ
chapterNumber: 8
illustrationId: il09_5
illustrationTitle: La instanciació
illustrationDescription: Una reserva contínua de línies de dades fluint de manera caòtica en tons blaus. D'ella, una regió circular es tanca i s'encapsula, ordenant les seves dades internes en una brillantor càlida, mentre una altra esfera es desfà alliberant els seus circuits daurats al mar de dades.
---

El diàleg entre el reservori, el naixement i el retorn al no-res guanya una claredat inesperada si deixem per un moment la física quàntica i la metafísica oriental i entrem en un terreny més pragmàtic: l'enginyeria de sistemes i el disseny de programari.

En la informàtica moderna, cada vegada que obrim una aplicació o carreguem una pàgina web assistim a una recreació en miniatura del cicle complet de l'horitzó.

---

### El *heap* com a reservori

En l'arquitectura de qualsevol programari, la memòria d'un programa en execució es reparteix en dues grans zones: la *stack* (la pila de crides d'execució immediata) i el **heap** (el munt, on viu la memòria dinàmica).

El *heap* és l'equivalent digital del reservori: una reserva de memòria contínua, enorme i sense estructura. Abans que un programa demani recursos, el *heap* és pura potència, un oceà de gigabytes buits sense objectes, variables, funcions ni identitats; només un flux indiferenciat d'adreces de memòria a l'espera que algú hi escrigui. És el *Hun Dun* de la computació: un estat de màxima simetria en què res no està delimitat i tot és possible.

El *heap* no té dins ni fora. És un continu físic (els xips de silici de la RAM) que manca d'estructura lògica interna fins que intervé el programari.

---

### El naixement com a instanciació i encapsulació

El naixement d'un sistema conscient, d'un horitzó, es correspon amb la **instanciació**.

Quan el programa executa una instrucció del tipus `new Object()`, es produeix una transició de fase al *heap*. El gestor de memòria reserva un bloc concret de bytes d'aquesta massa indiferenciada i traça una frontera lògica al seu voltant. En aquell instant, el constructor de la classe escriu els valors inicials i activa la propietat més fonamental del disseny de programari: l'**encapsulació** (o el principi d'*ocultament d'informació*, formulat per David Parnas el 1972).

L'encapsulació fa una cosa extraordinària: divideix el bloc de memòria en dos nivells de visibilitat.

1. **La interfície pública (*public API*)**: el conjunt de mètodes i signatures que l'objecte exposa a la resta del sistema. És la superfície de contacte, l'equivalent de l'horitzó de successos. La resta del programa només pot comunicar-se amb l'objecte invocant aquests mètodes públics.
2. **L'estat privat (*private fields*)**: les variables d'estat internes que l'objecte guarda gelosament al seu interior.

Aquí reapareix el dualisme d'accés en la seva forma més pura. Des de fora de l'objecte, el seu interior és un forat negre: cap codi de la resta del sistema no pot llegir ni alterar directament una variable declarada `private`. La memòria interna és inaccessible, i només en sabem el que l'API pública ens deixa consultar. En canvi, des de dins del propi objecte (mitjançant l'autoreferència `this`), l'accés a aquest estat privat és total, immediat i natural.

La subjectivitat, el dins, no requereix una matèria diferent de la de la resta de l'ordinador. És la perspectiva del codi que s'executa dins de la frontera d'encapsulació de la instància.

---

### La mort com a alliberament de memòria i recol·lecció d'escombraries

La vida d'un objecte consisteix a processar missatges que travessen la seva API pública, modificar el seu estat privat i retornar respostes a l'exterior. Però aquest cicle té un final, que dicta la gestió de recursos del sistema.

En programació, un objecte mor quan ja no queda cap referència que l'apunti. Si cap variable del programa no guarda la seva adreça, l'objecte queda orfe i l'entorn d'execució deixa de poder-hi accedir.

Aleshores intervé el **recol·lector d'escombraries** (*garbage collector*) o s'allibera la memòria explícitament (`free()` o `delete`).

La mort no és l'aniquilació física dels components de l'objecte. El recol·lector d'escombraries no esborra els electrons de les cel·les de la RAM; es limita a dissoldre la frontera d'encapsulació i a declarar que aquell bloc d'adreces torna a estar disponible al *heap* comú. En trencar-se la frontera lògica, l'estat privat de l'objecte deixa d'estar protegit, i la informació que definia la seva «identitat» o la seva «memòria interna» es reintegra a la massa de memòria indiferenciada i perd de seguida la seva estructura.

La instància ha deixat d'existir, però el suport que la sostenia ha tornat íntegre al reservori.

---

### El «karma» en els sistemes de programari

En el món ideal de la teoria de la computació, el retorn d'un objecte al *heap* no deixa rastre. Però en els sistemes reals, cada cicle d'instanciació i alliberament altera l'entorn de manera permanent:

- **Efectes secundaris (*side effects*)**: l'objecte pot haver escrit dades en un fitxer de registre, enviat paquets per la xarxa o modificat variables globals del sistema operatiu.
- **Fragmentació de memòria**: encara que s'alliberi l'espai de l'objecte, la geografia del *heap* ja no és la mateixa. Han quedat petits buits entre blocs de memòria que condicionen on i com podran instanciar-se els objectes següents.
- **Fugues de memòria (*memory leaks*)**: si l'objecte mantenia una referència oculta a un recurs extern, aquella porció del *heap* queda bloquejada per sempre, fins i tot després que s'hagi recol·lectat l'objecte principal.

Aquest condicionament estructural que l'existència i la desaparició d'un objecte exerceixen sobre el *heap* és l'analogia exacta del **karma**. La reserva de memòria no torna al seu estat net original: conserva la textura i la fragmentació que va deixar cada sistema que va existir en ella. La instància següent no naixerà en un buit perfecte, sinó en un entorn modelat per l'historial d'execucions anteriors.

La identitat de l'objecte desapareix, però la deformació que va causar en el sistema persisteix.

---

> **Nota al Capítol 8**
>
> **El que sí sabem:** Que l'encapsulació i l'ocultament d'informació divideixen un sistema en interfície pública i estat privat. Que la recol·lecció d'escombraries retorna recursos al *heap* sense destruir la memòria física. Que la fragmentació i els efectes secundaris són inevitables en sistemes reals.
>
> **El que no sabem:** Si el cervell biològic implementa mecanismes anàlegs a la recol·lecció d'escombraries sinàptica més enllà de l'homeòstasi del son. Si existeix un «recol·lector d'escombraries» global per a la informació de l'univers físic.
>
> **Preguntes que queden:** És la consciència un únic fil d'execució o un sistema multifil distribuït? Es poden considerar les fugues de memòria mentals (traumes, patrons repetitius) fallades en la recol·lecció d'escombraries del jo?
>
> **Si només et quedes amb una idea:** Néixer és reservar memòria i encapsular-la; morir és alliberar la frontera i tornar al *heap*. L'abisme entre la teva ment i el món exterior és el tret d'una bona arquitectura que protegeix el seu estat privat darrere d'una interfície pública.
>
> **Lectures:** Parnas (1972), «On the criteria to be used in decomposing systems into modules»; Dijkstra (1968), «Go To Statement Considered Harmful» (sobre estructura de control); Knuth (1997), *The Art of Computer Programming* (gestió de memòria dinàmica).
