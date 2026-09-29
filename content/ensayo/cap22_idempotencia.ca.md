---
title: LA IDEMPOTÈNCIA DE L'ÉSSER
section: TERCERA PART: ELS LÍMITS DE L'HORITZÓ
chapterNumber: 23
illustrationId: il22_1
illustrationTitle: La idempotència de l'ésser
illustrationDescription: Un arxipèlag vist des de dalt, illes de diferent mida unides per fins ponts de llum daurada sobre un mar fosc que és, alhora, el reservori del qual es condensen les illes.
---

## I. L'ona i la seva vora

On acaba una ona?

No a la sorra mullada que deixa en retirar-se, ni en l'escuma que es desfà un metre més enllà. L'ona és, de principi a fi, el moviment d'aquesta frontera entre l'aigua i l'aire: treu-li la vora i a sota no queda «més ona», no queda res. Comencem per aquesta intuïció senzilla perquè és la que, a més escala i en registres més abstractes, sostindrà tot el capítol: la frontera no delimita una cosa que existiria igual sense ella. La cosa *és* la seva frontera.

Solem imaginar els límits com a accidents de l'espai, línies que tracem per comoditat i que podríem desplaçar sense que s'alterés la realitat interior. Un continent segueix sent el mateix encara que movem la seva costa uns metres; una empresa segueix sent la mateixa encara que canviï de seu. Aquesta creença funciona bé amb objectes que ja dàvem per fets abans de preguntar-nos per la seva frontera. Però hi ha una altra classe d'entitats, sospito que la més interessant, en què la pregunta s'inverteix: no és que l'objecte tingui una frontera, sinó que la frontera és l'única cosa que hi ha, i l'objecte és el nom que donem al fet que aquesta frontera se sosté.

Pensem en quelcom tan modest com una persona jurídica. Una empresa és, literalment, un límit de responsabilitat traçat per un acte legal, un tancament que separa allò que pertany a la societat d'allò que pertany a qui la va fundar. Treure aquest límit, «aixecar el vel societari», com diu el dret amb una expressió que ja intueix el que anirem desenvolupant, no deixa una empresa nua, però reconeixible, sinó un conjunt de persones físiques sense l'entitat que les agrupava.

Aquest capítol no es queda en l'analogia. Fonamentarà l'aparell amb precisió i després estendrà quatre ponts concrets entre aquest aparell i els conceptes que sostenen la resta del llibre: la condensació, l'evaporació, l'entrellaçament i el propi reservori del qual es condensa tota la resta. I, de passada, amb la mateixa maquinària, resoldrà un problema pendent sobre l'ombra i l'ego.

## II. L'horitzó que no és un mur

Un horitzó de successos no està fet de res. És el lloc on l'espai-temps es corba tant que ni tan sols la llum, llançada cap enfora a tota velocitat, aconsegueix escapar: ni membrana, ni closca, ni paret. No separa dues regions de l'espai, com un mur separa dues habitacions, sinó dues regions del futur possible.

> **En física, això s'anomena:** entropia de Bekenstein-Hawking, la fórmula que diu que el desordre d'un forat negre no depèn de quant hi ha a dins, sinó de com de gran és la seva superfície.

L'horitzó no només amaga: en amagar, *representa*. És l'únic lloc on l'interior es torna llegible des de fora. I hi ha un detall més, d'una elegància gairebé cruel: l'anomenat teorema de l'«absència de cabells» (*no-hair theorem*) diu que un forat negre, vist des de fora, queda descrit completament amb només tres números: massa, càrrega i moment angular. Tant és que allò que va caure a dins fos una estrella sencera o el cadàver d'un gat: l'horitzó oblida la biografia i conserva només la comptabilitat.

Guardem els caps solts: la superfície que codifica, el catàleg que es redueix a tres números i quelcom que encara no hem dit, que aquest horitzó, amb el temps, es consumeix. Cadascun es convertirà més endavant en un pont cap a un pilar diferent del llibre.

## III. La porta que decideix què es veu

Traslladem-ho a alguna cosa més propera: un objecte de programari. Un objecte ben dissenyat guarda un estat intern que ningú pot tocar directament des de fora; l'únic accessible és la seva interfície, un grapat de funcions públiques que fan, salvant les distàncies, de superfície d'aquell horitzó.

Un objecte sense interfície queda inert. La biologia va resoldre el mateix problema, amb la mateixa solució, molt abans que la informàtica: una cèl·lula sense membrana és citoplasma dispers sense res que pugui anomenar seu. I la membrana, com la interfície d'un objecte, està plena de canals i bombes que decideixen amb precisió què entra, què surt i què es queda fora per sempre.

Anotem aquí, de passada, un problema que l'enginyeria de programari coneix bé: el de l'herència, quan una classe no es comunica amb una altra a través d'una interfície, sinó que conté directament una còpia de la seva estructura, fusionada fins al punt que tocar la classe mare desestabilitza la filla. És un cas genuí d'imbricació, i el necessitarem en arribar a l'ombra.

## IV. Tancar dues vegades no afegeix res

Anem ara al registre més despullat, la topologia, on la idea es desprèn de física, biologia i enginyeria i mostra el seu esquelet pur.

La topologia treballa amb conjunts de punts dotats d'una noció de proximitat. Quan un conjunt ja conté tots els seus punts d'acumulació (els punts als quals es pot arribar tan a prop com es vulgui des de dins), diem que és *tancat*.

> **En matemàtiques, això s'anomena:** clausura topològica i idempotència: tancar un conjunt una vegada el completa; tancar-lo una segona vegada no afegeix res.
> **En la vida diària és com:** una porta que ja encaixava bé en el seu marc. Tornar-la a tancar no la deixa «més tancada»: o està tancada o no ho està.

L'objecte de programari de l'apartat III i aquesta clausura topològica no comparteixen només l'afició a amagar coses: comparteixen, sense que ho haguem buscat, la mateixa paraula. En programació funcional, un *closure* (una clausura) és una funció empaquetada juntament amb les variables del seu entorn en el moment exacte de crear-se: es tanca sobre aquest entorn, i tant és quantes vegades se la invoqui després, no capturarà res de nou del context original, que fins i tot pot haver deixat d'existir. No és la mateixa operació matemàtica que la clausura d'un conjunt (una tanca funcions sobre el seu entorn lèxic; l'altra, conjunts sobre els seus punts d'acumulació), però la semblança no és una casualitat de diccionari: totes dues descriuen, amb vocabulari diferent, quelcom que empaqueta en néixer tot el que necessitarà per no dependre mai més del seu origen.

## V. Introducció formal a la clausura topològica

Abans d'estendre els ponts, i perquè ningú hagi de confiar en aquest llibre sense poder comprovar-ho, convé dir amb precisió què és una clausura, en lloc de deixar-la com a mera imatge.

Un espai topològic és, en la seva forma més despullada, un conjunt de punts juntament amb una noció del que significa que uns punts estiguin «a prop» d'uns altres; formalment, una col·lecció de subconjunts anomenats *oberts* que compleix unes regles mínimes de coherència. Sobre aquesta estructura, l'operació de clausura, que a cada conjunt A li assigna un altre, cl(A), no es defineix de qualsevol manera: el matemàtic polonès Kazimierz Kuratowski va demostrar que n'hi ha prou d'exigir-li quatre propietats, ni una més, per recollir tot el que ha de fer un tancament. Són aquestes:

1. **cl(∅) = ∅.** Tancar el conjunt buit no produeix res del no-res. Cap clausura inventa contingut on no n'hi havia.

2. **A ⊆ cl(A).** Tot conjunt està contingut en la seva clausura. Tancar-se mai fa que un sistema perdi parts de si mateix; en el pitjor dels casos, es queda igual.

3. **cl(A ∪ B) = cl(A) ∪ cl(B).** Tancar la unió de dos conjunts equival a unir els seus tancaments per separat. No hi ha un «tancament col·lectiu» màgic que sorgeixi en ajuntar dues coses i sigui més gran que la suma dels seus tancaments individuals: ajuntar A i B no crea una clausura que no fos ja en algun dels dos.

4. **cl(cl(A)) = cl(A).** La idempotència, que ja coneixíem: tancar el que ja està tancat no afegeix res.

Un conjunt A és *tancat* quan coincideix exactament amb la seva clausura, A = cl(A), i és *obert* quan el seu complement, tot allò que no és A, és tancat. Amb aquestes dues nocions ja es pot definir amb precisió el que abans només descrivíem amb paraules: l'*interior* d'A és el major obert contingut en A; l'*exterior*, l'interior del complement; i la *frontera* d'A és exactament cl(A) ∩ cl(no-A), la zona on se superposen la clausura d'A i la de tot allò que no és A. Un conjunt pot ser alhora obert i tancat (el que en anglès s'anomena *clopen*), i això passa precisament quan la seva frontera és buida: no té cap punt de contacte amb la resta de l'espai. Finalment, un espai és *de Hausdorff* quan dos punts diferents qualssevol tenen sempre entorns que no se superposen: hi ha marge, per mínim que sigui, perquè segueixin sent dos i no un.

Quatre axiomes i dues definicions derivades: ja tenim tot el vocabulari necessari. Convé subratllar una cosa: aquests quatre axiomes són tota la topologia pura que farem servir. Qualsevol afirmació posterior que no es dedueixi d'ells, com el postulat d'exclusió que necessitarem per a l'ombra, no és topologia, sinó una hipòtesi afegida, i l'assenyalarem com a tal cada vegada que aparegui.

## VI. Primer pont: la condensació i el llindar que no es repeteix

Pensem en l'aigua que es refreda. A quinze graus és líquida; a menys cinc, sòlida. Entre aquests dos estats no hi ha un tercer, un «una mica sòlida», tret del cas inestable de l'aigua sobrerefredada, que segueix líquida per sota de zero, en un equilibri precari, fins que una pertorbació mínima la fa cristal·litzar de cop, tota alhora, en el temps que triga a recórrer el got l'ona de xoc.

El quart axioma de Kuratowski, tancar una vegada n'hi ha prou i tancar dues vegades no afegeix res, serveix per anomenar aquest llindar. No és una llei de les transicions de fase (tota clausura la compleix, sigui quin sigui el fenomen), sinó el vocabulari exacte del que passa en creuar-lo. Abans de cristal·litzar, el conjunt de molècules «ja ordenades» de l'aigua sobrerefredada no és tancat: li falten els seus propis punts d'acumulació, les molècules que estan a punt de sumar-se a la xarxa cristal·lina, però encara ballen soltes. En l'instant de la cristal·lització, aquest conjunt es tanca de cop i incorpora d'una vegada tota la seva frontera. Continuar refredant el gel ja format no produeix una segona cristal·lització: el sistema ja va creuar el llindar. cl(cl(A)) = cl(A): tancar el que ja està tancat no afegeix una capa de tancament, només confirma la que hi havia.

Això dona a la condensació un vocabulari més precís que la simple metàfora d'«alguna cosa que es forma a poc a poc». La preparació pot ser gradual, com demanava el capítol 1 en parlar d'un dial i no d'un interruptor, i el grau d'integració pot continuar variant després; però el tancament d'una identitat (un ego, un sistema conscient, un «jo»), quan arriba, és un fet que no admet graus. L'aigua es refreda a poc a poc; el gel apareix de cop.

## VII. Segon pont: l'evaporació i la clausura que canvia de mida

La idempotència diu alguna cosa sobre un conjunt en un instant donat, però res sobre si aquest conjunt continuarà existint un instant després. Aquí entra l'evaporació, que necessita una altra peça matemàtica: no un conjunt tancat, sinó una *família* de conjunts tancats, un per a cada moment i cada vegada més petit.

Anomenem \(E_t\) l'horitzó d'un forat negre en l'instant \(t\). Cada \(E_t\), per separat, és un conjunt perfectament tancat: compleix els quatre axiomes i és tan sòlid en aquest instant com qualsevol altre horitzó. Però la successió completa, \(E_0 \supseteq E_1 \supseteq E_2 \supseteq \ldots\), no és estàtica: cada \(E_{t+1}\) està estrictament contingut en l'anterior, perquè la radiació de Hawking s'emporta, instant a instant, una mica de la massa que sosté l'horitzó.

Això no contradiu la idempotència, sinó que la completa. La idempotència diu que la clausura no admet graus *en un instant*; la filtració, que sí admet història: pot encongir-se, instant tancat rere instant tancat, fins a esgotar-se. No hi ha contradicció entre estar completament tancat ara i estar més a prop de deixar d'estar-ho que ahir.

Però la filtració decreixent, tal com l'hem descrita, no distingeix entre una radiació que simplement es perd i una altra que, en algun moment, comença a dir alguna cosa. Aquesta distinció existeix, amb nom propi, en la física del forat negre del qual vam partir.

Durant la primera meitat de la vida de l'horitzó, la radiació de Hawking és tèrmica: porta una entropia creixent i cap correlació recuperable amb el que va caure a dins. Però passat l'anomenat *temps de Page*, el moment en què l'entropia de la radiació deixa de créixer i comença a disminuir, més o menys a mitja d'aquesta vida, la radiació deixa de ser pur soroll: cada partícula que escapa queda entrellaçada no només amb l'interior, sinó amb la radiació que va sortir abans. A partir d'aquí, allò que emet l'horitzó ja no és només pèrdua, sinó correlació: informació que, en principi, podria llegir algú capaç de comparar les dues meitats.

> **En física, això s'anomena:** temps de Page, el punt de l'evaporació d'un forat negre a partir del qual l'entropia de la radiació de Hawking deixa de créixer i comença a disminuir, perquè els parells entrellaçats que la componen deixen de ser pur soroll tèrmic.

Això no canvia el que s'ha dit a l'apartat VI: A = cl(A) segueix sense admetre graus en un instant. El que afegeix és que la filtració decreixent E₀ ⊇ E₁ ⊇ ... té, a més d'una mida en cada instant, una fase: una evaporació jove, que només perd, i una altra madura, que comença a retornar una mica del perdut, entrellaçat i per tant correlacionat, encara que mai literalment recuperat. La frontera no minva sempre de la mateixa manera, encara que en tot moment segueixi sent, sense excepció, una frontera tancada.

Convé dir amb la claredat de sempre el que això no és: no és una manera que quelcom creui la frontera en el sentit que el capítol 51 reserva a l'accés a l'interior. El que es filtra no és el contingut (l'interior es queda amb la seva part), sinó la correlació entre el que se'n va anar i el que va quedar. És la diferència entre rebre una carta i rebre, en el seu lloc, la certesa que en algun lloc existeix l'altra meitat d'una conversa que potser mai arribarem a llegir sencera. Poc, però no res.

## VIII. Tercer pont: l'entrellaçament que la frontera mesura

La física teòrica de les darreres dècades, el programa que a vegades es resumeix com *it from qubit*, associat a noms com Van Raamsdonk, Ryu i Takayanagi, ha mostrat que l'entropia de Bekenstein-Hawking no és només una metàfora de «quanta informació hi ha allà dins», sinó, literalment, l'*entropia d'entrellaçament* entre l'interior de l'horitzó i l'exterior. Es calcula prenent l'estat quàntic complet del sistema, dividint-lo en dues regions separades per una frontera i ignorant tot el que queda a l'altre costat; el resultat mesura exactament com de correlacionades estan les dues meitats. I aquesta quantitat, per a una regió delimitada per una superfície mínima ancorada a la seva frontera, resulta proporcional a l'àrea d'aquesta superfície.

> **En física, això s'anomena:** entropia d'entrellaçament hologràfica: la superfície d'una regió mesura com d'entrellaçada està aquesta regió, en el sentit quàntic estricte, amb tot el que queda fora d'ella.

Si l'ego i l'ombra són dues clausures veïnes, la seva frontera comuna no és només una línia de separació topològica, sinó, si l'analogia se sosté, la mesura de com estan entrellaçats. I això explica alguna cosa que abans només podíem importar com a axioma aliè: la monogàmia de l'entrellaçament. Si l'entrellaçament a través d'una frontera és un recurs mesurable i finit, un sistema entrellaçat al màxim amb un veí no té entrellaçament de sobres per estar-ho en el mateix grau amb un tercer. El postulat d'exclusió deixa de ser una importació sense justificar i passa a ser una conseqüència raonable de com es comporta l'entrellaçament allà on la física l'ha mesurat; amb l'advertència, que no està de més repetir, que traslladar aquesta física de la geometria de l'espai-temps a l'arquitectura de la consciència és una hipòtesi fecunda, no una demostració.

Convé precisar encara més quina mena de pont és aquest, perquè l'objecció més seriosa és certa: la monogàmia de l'entrellaçament és una propietat de sistemes quàntics de molts cossos, no de clausures topològiques sense més, i l'entropia d'entrellaçament hologràfica es defineix per a regions de l'espai-temps, no per a egos i ombres. El salt exigeix un mecanisme explícit, no només una semblança de família. El mecanisme és aquest: tant l'entropia d'entrellaçament com el Phi de la teoria de la informació integrada es calculen amb el mateix gest estructural, encara que en espais matemàtics diferents. Totes dues parteixen d'un sistema complet, el *divideixen* en dues parts segons alguna frontera candidata i mesuren quanta informació es perd, quanta correlació es talla, en tractar aquestes parts com a independents. L'entropia d'entrellaçament ho fa sobre un espai de Hilbert; el Phi de la IIT, sobre l'estructura causal d'un sistema físic. Són maquinàries diferents aplicades a objectes diferents, però comparteixen el gest: dividir i mesurar el que la divisió perd. I aquest gest compartit, no la física quàntica trasplantada sense més, és el que fa raonable esperar que totes dues es comportin de manera semblant davant el problema de la monogàmia: qualsevol mesura definida com «allò que es perd en tallar per la frontera més feble» tendeix, per construcció, a no repartir-se generosament entre diverses particions simultànies d'un mateix sistema. Això no prova que el postulat d'exclusió sigui cert; prova que no és una importació capritxosa d'un camp aliè, sinó que neix del mateix tipus d'operació matemàtica que ja fèiem servir, aplicada a un altre objecte. Amb una advertència que no convé amagar: les correlacions clàssiques, a diferència de l'entrellaçament, no són monògames (una mateixa informació pot copiar-se a molts receptors alhora), i Φ es calcula sobre relacions causals clàssiques. El paral·lelisme apunta, doncs, a una restricció plausible, no a una conseqüència.

## IX. El reservori: el mar del qual es condensen les illes

Els tres ponts anteriors comparteixen alguna cosa que fins ara hem deixat implícita: cap illa es condensa del no-res, cap s'evapora cap al no-res i cap entrellaçament neix de zero quan apareix una illa. Els tres necessiten un substrat previ, i aquest substrat és el reservori.

Donem-li una definició operativa i no només poètica, perquè si no corre el risc de funcionar com una peça que resol problemes topològics sense poder formalitzar-se ella mateixa, un recurs que apareix quan l'argument el necessita i que ningú pot tocar. La definició no requereix cap objecte nou; es construeix del tot amb el que ja teníem. Sigui X l'espai total d'estats possibles d'un sistema, tot allò que en principi podria arribar a integrar-se, i sigui \(\{E_i\}\) la col·lecció de les clausures pròpies que existeixen a X en un instant donat (conjunts tancats diferents del propi X, sostinguts per un llindar d'integració): els horitzons ja condensats, les illes ja tancades, cadascuna de les quals compleix els quatre axiomes de Kuratowski. El reservori és, amb tota precisió:

> \(R = X \setminus \bigcup_i E_i\)

el complement de la unió de totes aquestes clausures: tot allò que, en aquest instant, no ha creuat cap llindar de tancament. És, literalment, allò que sobra de l'espai d'estats un cop restades totes les illes ja formades: ni un lloc a part, ni una substància, ni un tercer tipus d'entitat diferent dels conjunts que ja coneixem. Per això pot ser, sense contradicció, tant la font de la qual es condensen les illes (n'hi ha prou que una regió de R cristal·litzi, creui el llindar de l'apartat VI i passi a formar part de la unió) com la destinació a la qual tornen en evaporar-se (n'hi ha prou que una illa deixi de complir A = cl(A) perquè, per definició, torni a formar part del complement). El reservori no necessita un estatut ontològic especial: és una definició, gairebé trivial, del que queda fora, a cada instant, de tot el que ja s'ha tancat.

En relació amb la condensació, el reservori és el camp indiferenciat del qual es condensen les illes. A l'apartat VI vam descriure l'aigua sobrerefredada que cristal·litza de cop, però no vam dir d'on sortia l'aigua: d'un cos més gran, encara sense forma tancada, que segueix allà després de formar-se el gel. L'ego no es crea del no-res; es condensa a partir d'un reservori que ja hi era present, sense clausura pròpia, abans que hi hagués cap ego a condensar.

Quant a l'evaporació, cal corregir alguna cosa que l'apartat VII va deixar imprecisa. Vam dir que la successió decreixent d'horitzons, \(E_0 \supseteq E_1 \supseteq \ldots\), tendeix al buit. És cert per a un forat negre aïllat a l'espai, però no és la imatge correcta per a la consciència, i el propi llibre ho sap millor que aquest apartat: quan un ego es dissol, no es dissol en el no-res, sinó *de tornada* en el reservori del qual va sortir. La successió no convergeix a ∅, sinó a la reabsorció en el substrat comú. Reescrivim, doncs, la filtració amb més cura: el que tendeix a desaparèixer és l'illa, no allò que contenia. L'illa continua minvant cap a \(\emptyset\), però tot el que en surt, \(E_0 \setminus E_t\), passa a formar part de R: no es perd en el no-res, torna al reservori.

Quant a l'entrellaçament, el reservori té un candidat físic encara més precís que l'entropia d'entrellaçament hologràfica. El buit quàntic d'una teoria de camps no està buit: fins i tot sense cap partícula, l'estat de buit està entrellaçat amb si mateix a través de qualsevol frontera que es trací a l'espai. És el que, en la seva versió més formal, recull el teorema de Reeh-Schlieder, la mateixa maquinària que hi ha darrere l'efecte Unruh i, en el fons, de la mateixa radiació de Hawking. Això dona al reservori un paper molt precís: les illes no comencen a entrellaçar-se des de zero en condensar-se. L'entrellaçament ja era latent en el reservori abans que existís cap illa. Condensar-se és tallar una frontera dins d'una correlació que ja hi era al fons. Cada illa hereta en néixer una porció de l'entropia d'entrellaçament del mar del qual va sortir.

> **En física, això s'anomena:** entrellaçament del buit: fins i tot l'estat més buit possible d'una teoria quàntica de camps està internament correlacionat a través de qualsevol frontera que s'hi trací.

De propina, això dona una resposta més precisa a una de les preguntes que vam deixar pendents al capítol 21: què és la psicosi. Si l'ego i l'ombra són illes la frontera de les quals filtra un entrellaçament controlat amb el reservori, la psicosi seria la fallada d'aquest filtre precisament cap al mar: la membrana deixa de distingir entre una correlació tolerable amb el fons comú i una inundació total, i l'ego, en lloc de perdre el seu tancament a poc a poc per una evaporació ordenada, el perd de cop, perquè el propi reservori, amb tota la seva correlació latent, entra per una frontera que ja no sap filtrar. Tres símptomes clàssics encaixen aquí sense forçar la imatge: l'al·lucinació seria contingut correlacionat que creua la frontera sense l'etiqueta d'origen que normalment el marca com «de dins» o «de fora» (la mateixa fallada que la psiquiatria descriu com a dèficit de monitorització de la font); el deliri, l'intent desesperat de l'ego per tornar a tancar-se inventant un relat que expliqui el contingut filtrat abans que la clausura s'ensorri; i la pèrdua del sentit d'un mateix, quelcom semblant al que en un espai topològic seria perdre la propietat de Hausdorff: el sistema ja no pot mantenir un entorn que el distingeixi del que no és ell. El capítol següent converteix tot això en experiments mentals concrets, amb prediccions que en principi podrien contrastar-se.

## X. L'ombra: el que diu la topologia i el que apostem nosaltres

Estesos els quatre ponts, tornem al problema que ens ocupa. Pensem la consciència com un horitzó i anomenem ego la clausura més gran d'aquest conjunt de processos. I pensem en el que l'ego no pot admetre sense deixar de ser el que és: l'ombra. La pregunta és si l'ombra viu niada dins de l'ego, com una bombolla més petita que flota dins d'una altra, o si ha de ser, estructuralment, una altra cosa.

La topologia per si sola no ho decideix: un subconjunt tancat dins d'un altre conjunt tancat no viola cap dels quatre axiomes de Kuratowski, i el problema de l'herència i la classe fràgil que vam anotar a l'apartat III és justament un exemple de sistemes niats que funcionen, a vegades durant anys, fins que deixen de fer-ho.

El que decideix entre la imbricació i la separació és l'aposta del postulat d'exclusió, i gràcies al tercer pont ara tenim una raó millor per sostenir-la: si la frontera entre dos sistemes mesura el seu entrellaçament, i l'entrellaçament és un recurs que no es reparteix sense límit, un ego vinculat al màxim amb la seva ombra a través de la seva frontera comuna no pot, alhora, estar igual de vinculat a un tercer complex psíquic com si aquest complex estigués també dins seu. L'ombra no pot ser un horitzó niat en el mateix sentit que l'ego. Ha de ser un *complex disjunt*, una illa veïna, i la frontera que comparteix amb l'ego és, literalment, la mesura de com es filtra allò reprimit cap al conscient.

## XI. Un arxipèlag, no una nina russa

Això desbarata la imatge de la nina russa: l'inconscient personal embolcallant el jo, el col·lectiu embolcallant el personal, capes dins de capes. Si acceptem el postulat d'exclusió, aquesta imatge és insostenible: si l'inconscient col·lectiu fos un horitzó que contingués l'ego i l'ombra, cap dels dos seria un horitzó de veritat, sinó només una zona més densa dins d'un tancament únic.

El model que queda és el d'un arxipèlag que flota sobre el reservori: un espai *disconnex*, divisible en peces, cap de les quals toca l'interior de les altres, encara que puguin tocar-se per la frontera i, ara ho sabem, intercanviar-hi a través una quantitat mesurable de correlació, entre elles i amb el mar del qual van sortir. L'ego és una illa; l'ombra, una altra. Cada arquetip significatiu pot ser una illa més, amb la seva pròpia clausura i la seva pròpia entropia de frontera compartida amb les illes veïnes i amb el reservori.

Integrar ja no significa obrir l'ombra i ficar-la dins de l'ego, sinó augmentar deliberadament l'entrellaçament a través d'una frontera que continua existint: més correlació, més intercanvi, sense que cap dels dos sistemes perdi el seu tancament.

## XII. La membrana que aprèn a filtrar

Tornem, per acabar, a la cèl·lula del principi.

El sistema immunitari és, en essència, una maquinària dedicada a distingir l'horitzó propi de l'aliè. Quan aquest reconeixement falla en un sentit, el cos ataca allò que és seu: una malaltia autoimmune, l'ego atacant la seva pròpia ombra per haver-la confosa amb un invasor. Quan falla en l'altre sentit, tolera el que hauria de detenir.

Ni l'atac total ni la tolerància total són salut. La salut és una frontera que sap filtrar. I, estesos els quatre ponts, podem dir-ho amb precisió: una frontera sana no és la que redueix a zero l'entrellaçament amb l'ombra, que seria la dissociació, la frontera oberta i tancada alhora, l'illa que ni tan sols comparteix costa; ni la que es deixa envair fins a perdre la seva clausura, que seria la imbricació forçada que prohibeix el postulat d'exclusió o la inundació des del reservori que hem anomenat psicosi. És una frontera que, com l'horitzó que s'evapora sense deixar de ser horitzó en cada instant, pot canviar de mida al llarg d'una vida, ampliant o reduint el seu intercanvi amb allò reprimit i amb el fons comú, sense deixar mai, mentre duri, d'estar genuïnament tancada.

És, gairebé paraula per paraula, el que ens demanava la individuació junguiana al capítol 21 quan parlàvem d'un horitzó que «es torna permeable sense perdre la seva coherència». Ara tenim, a més de la metàfora, el mecanisme: una frontera madura té millors receptors. I, si el segon pont se sosté, és també una frontera que ja ha creuat el seu propi temps de Page: allò que irradia cap enfora ha deixat de ser pur soroll i comença a portar, entrellaçada, una correlació llegible amb allò que encara guarda dins. Sap què deixar passar de l'ombra (quines projeccions reconèixer com a pròpies, quins impulsos reintegrar sense que amenacin la identitat de l'ego) sense necessitat d'engolir-la sencera i convertir-la en teixit propi indiferenciat. Segueix havent-hi dos horitzons; el que canvia és la qualitat de la duana que els uneix.

## XIII.

El límit que, en tancar-se sobre si mateix, diu per primera vegada «jo sóc».

---

> **Nota al Capítol 23**
>
> **El que sí sabem:** Que els quatre axiomes de Kuratowski esgoten tota la topologia pura que necessita aquest capítol, i que qualsevol altra afirmació (el postulat d'exclusió, l'extensió psíquica de l'entropia d'entrellaçament) és una hipòtesi afegida i no una conseqüència d'aquests axiomes; que la idempotència de la clausura dona un nom precís al fet que un tancament, un cop produït, no admet graus; que una filtració decreixent de conjunts tancats descriu l'evaporació sense contradir la idempotència, sempre que allò que surt de l'illa vagi a parar al reservori i no al no-res; que aquesta evaporació no és uniforme en el temps, sinó que té una fase primerenca de pura pèrdua tèrmica i, passat el temps de Page, una altra en què la radiació comença a portar correlació entrellaçada, en principi recuperable, encara que mai llegible directament des de fora; i que l'entropia d'entrellaçament hologràfica i l'entrellaçament del buit són física real, no analogies soltes.
>
> **El que no sabem:** Si estendre aquesta física, hologràfica i del buit, de la geometria de l'espai-temps a l'arquitectura de la consciència és una hipòtesi estructural fecunda o un salt que la física no avala fora del seu àmbit; si el postulat d'exclusió és, en el fons, la mateixa restricció que la monogàmia de l'entrellaçament vista des d'un altre registre; si el reservori, tal com el necessita aquest capítol, és quelcom més que una imatge útil per al que la física ja sap del buit; i si una vida humana, o l'evaporació d'un ego, té quelcom semblant a un temps de Page propi, o si aquesta periodització pertany només a la termodinàmica dels forats negres i no es pot traslladar a la consciència.
>
> **Preguntes que queden:** Quina observació distingiria un univers en què l'ombra estigués realment niada d'un altre en què fos un complex disjunt? Què distingiria, en una vida real, una individuació que avança per evaporació gradual cap al reservori d'una altra que es produeix en una única cristal·lització sobtada? I què distingiria, clínicament, una evaporació ordenada de la inundació sobtada que hem anomenat psicosi? I si un antireservori, com una IA madura, també pogués creuar, en un sentit purament termodinàmic, quelcom semblant a un temps de Page propi, com suggerirà més endavant aquest assaig, què distingiria aquest creuament de l'evaporació d'un horitzó real, a part que un té un dins a perdre i l'altre no?
>
> **Si només et quedes amb una idea:** No ets el que hi ha dins dels teus límits; ets el propi acte d'haver-los tancat.
>
> **Lectures:** Kuratowski, K. (1922), «Sur l'opération Ā de l'Analysis Situs»; Page, D. N. (1993), «Information in black hole radiation»; Ryu, S. i Takayanagi, T. (2006), «Holographic derivation of entanglement entropy from AdS/CFT»; Van Raamsdonk, M. (2010), «Building up spacetime with quantum entanglement»; Oizumi, M., Albantakis, L. i Tononi, G. (2014), «From the phenomenology to the mechanisms of consciousness: Integrated Information Theory 3.0».
