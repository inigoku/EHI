import { Language } from "./language";

export interface UiStrings {
  nav: {
    home: string;
    essay: string;
    cuentos: string;
    poemas: string;
    reconstruccion: string;
  };
  header: {
    bookTitle: string;
    sectionEssay: string;
    sectionCuentos: string;
    sectionPoemas: string;
    sectionReconstruccion: string;
    author: string;
    part: string;
    of: string;
    interludio: string;
    story: string;
    prologue: string;
    poem: string;
    glossary: string;
    link: string;
    showMenu: string;
    languageToggleLabel: string;
  };
  sidebar: {
    byAuthor: string;
    readingProgress: string;
    chaptersExplored: (done: number, total: number) => string;
    activeReader: string;
    readingMode: string;
    glossary: string;
    reflections: string;
    searchPlaceholder: string;
    noChaptersFound: string;
    introSection: string;
  };
  settings: {
    title: string;
    colorScheme: string;
    cosmos: string;
    paper: string;
    amber: string;
    textSize: string;
    small: string;
    normal: string;
    large: string;
    veryLarge: string;
    extraLarge: string;
    focusMode: string;
    hideDistractions: string;
  };
  landing: {
    hypothesisLabel: string;
    start: string;
    discoverMore: string;
    startReading: string;
    sectionLabel: string;
    bridgeTitle: string;
    synopsis: string;
    card1Title: string;
    card1Desc: string;
    card2Title: string;
    card2Desc: string;
    card3Title: string;
    card3Desc: string;
    pathsTitle: string;
    pathsSubtitle: string;
    pathEssayTitle: string;
    pathEssayDesc: string;
    pathEssayBtn: string;
    pathCuentosTitle: string;
    pathCuentosDesc: string;
    pathCuentosBtn: string;
    pathPoemasTitle: string;
    pathPoemasDesc: string;
    pathPoemasBtn: string;
    pathReconTitle: string;
    pathReconDesc: string;
    pathReconBtn: string;
    footerTagline: string;
    footerRights: string;
    muteOn: string;
    muteOff: string;
    introPhrases: string[];
  };
  pathLanding: {
    explorationLine: string;
    essayTitle: string;
    essaySubtitle: string;
    essayDescription: string;
    essayBtn: string;
    cuentosTitle: string;
    cuentosSubtitle: string;
    cuentosDescription: string;
    cuentosBtn: string;
    poemasTitle: string;
    poemasSubtitle: string;
    poemasDescription: string;
    poemasBtn: string;
    reconTitle: string;
    reconSubtitle: string;
    reconDescription: string;
    reconBtn: string;
  };
  glossaryDrawer: {
    title: string;
    conceptLabel: string;
    physicsLabel: string;
    metaphorLabel: string;
    footerHint: string;
  };
  journal: {
    title: string;
    subtitle: string;
    dialogosTitle: string;
    dialogosSubtitle: string;
    copyAll: string;
    downloadTxt: string;
    tabReflections: string;
    tabDialogos: string;
    emptyTitle: string;
    emptyDesc: string;
    chapterLabel: string;
    introLabel: string;
    copyTooltip: string;
    deleteTooltip: string;
    confirmDelete: string;
    copiedAlert: string;
  };
  chapterContent: {
    prev: string;
    next: string;
    partOf: (n: string, total: number) => string;
    interludeLabel: string;
    storyOf: (n: string, total: number) => string;
    prologueOf: (total: number) => string;
    reconOf: (n: string) => string;
    poemLinkOf: (n: string) => string;
    poemFrialdadOf: (n: string) => string;
    poemReconOf: (n: string) => string;
    poemGlossaryLabel: string;
    chapterPrefix: (n: string) => string;
    storyPrefix: (n: string) => string;
    partPrefix: (n: string) => string;
    reconTabNarrativa: string;
    reconTabEnsayo: string;
    reconTabPoema: string;
    reconCierreLabel: string;
    readRelatedEssay: string;
    readRelatedStory: string;
    backToEssay: string;
    reflectionBoxTitle: string;
    reflectionBoxTitleRecon: (tab: string) => string;
    reflectionBoxTitlePoetic: string;
    delete: string;
    placeholderRecon: (tab: string) => string;
    placeholderPoem: string;
    placeholderCuento: string;
    placeholderEssay: string;
    hintCuento: string;
    hintEssay: string;
    hintPoem: string;
    saveButton: string;
    savedButton: string;
    saveNote: string;
    savedNote: string;
    expand: string;
    collapse: string;
    confirmClearReflection: string;
    pendingTranslation: string;
  };
}

export const uiStrings: Record<Language, UiStrings> = {
  es: {
    nav: {
      home: "Inicio",
      essay: "Ensayo",
      cuentos: "Cuentos",
      poemas: "Poemas",
      reconstruccion: "Reconstrucción",
    },
    header: {
      bookTitle: "El Horizonte Interior",
      sectionEssay: "Ensayo Interactivo",
      sectionCuentos: "Antología de Cuentos",
      sectionPoemas: "Antología Poética",
      sectionReconstruccion: "Reconstrucción",
      author: "Autor",
      part: "Parte",
      of: "de",
      interludio: "Interludio",
      story: "Relato",
      prologue: "Prólogo",
      poem: "Poema",
      glossary: "Glosario",
      link: "Enlace",
      showMenu: "Mostrar Menú",
      languageToggleLabel: "Idioma",
    },
    sidebar: {
      byAuthor: "Por Íñigo Barrera Barceló",
      readingProgress: "Progreso de Lectura",
      chaptersExplored: (done, total) => `${done} de ${total} cap. explorados`,
      activeReader: "Lector Activo",
      readingMode: "Modo de Lectura",
      glossary: "Glosario",
      reflections: "Reflexiones",
      searchPlaceholder: "Buscar por palabra...",
      noChaptersFound: "No se encontraron capítulos.",
      introSection: "INTRODUCCIÓN",
    },
    settings: {
      title: "Ajustes de Lectura",
      colorScheme: "Esquema de Color",
      cosmos: "Cosmos",
      paper: "Papel",
      amber: "Ámbar",
      textSize: "Tamaño del Texto",
      small: "Pequeño",
      normal: "Normal",
      large: "Grande",
      veryLarge: "Muy Grande",
      extraLarge: "Extra Grande",
      focusMode: "Modo Enfoque",
      hideDistractions: "Ocultar distracciones",
    },
    landing: {
      hypothesisLabel: "Hipótesis Holográfica",
      start: "Comenzar",
      discoverMore: "DESCUBRIR MÁS",
      startReading: "Comenzar Lectura",
      sectionLabel: "El Horizonte de Sucesos de la Mente",
      bridgeTitle: "Un puente entre la geometría y el alma",
      synopsis:
        "El Horizonte Interior es una exploración sobre la conciencia que desafía las fronteras tradicionales entre la ciencia y la experiencia vital. A través del prisma de la física teórica y el principio holográfico, esta obra plantea una hipótesis atrevida: que la mente no está guardada dentro del cerebro, sino escrita en su periferia geométrica.",
      card1Title: "1. La Burbuja",
      card1Desc:
        "La conciencia funciona como un horizonte. No es una barrera física, sino una frontera geométrica viva que define y organiza un interior en contraposición a un exterior.",
      card2Title: "2. El Océano",
      card2Desc:
        "El \"vacío\" no está vacío. Es un reservorio de posibilidad del que emergen las conciencias individuales y las formas, similar a cómo las olas emergen de la superficie del agua.",
      card3Title: "3. La Red",
      card3Desc:
        "La conciencia no radica en elementos aislados, sino en la forma en que se conectan. Representa la información integrada (Phi) que hace al sistema más que la suma de sus partes.",
      pathsTitle: "Cuatro Senderos de Exploración",
      pathsSubtitle: "La obra está diseñada como una estructura poliédrica. Elige la puerta que resuene con tu curiosidad.",
      pathEssayTitle: "Ensayo Interactivo",
      pathEssayDesc:
        "La columna vertebral teórica. 26 capítulos donde la física moderna dialoga directamente con la metafísica y la experiencia consciente.",
      pathEssayBtn: "Comenzar Ensayo",
      pathCuentosTitle: "Cuentos de Tarel",
      pathCuentosDesc:
        "16 relatos alegóricos. La física explicada mediante fábulas, desde la ciudad sumergida en el silencio hasta el laberinto del interruptor.",
      pathCuentosBtn: "Leer Relatos",
      pathPoemasTitle: "Antología Poética",
      pathPoemasDesc:
        "Poesía y glosarios líricos. Los ecos emocionales del horizonte traducidos en versos libres y arquitecturas metafóricas.",
      pathPoemasBtn: "Explorar Poemas",
      pathReconTitle: "La Reconstrucción",
      pathReconDesc:
        "6 planos de síntesis. Un modo integrador donde ensayo, narrativa y poesía se fusionan en pestañas en paralelo.",
      pathReconBtn: "Ver Planos",
      footerTagline: "Una propuesta filosófico-científica sobre la conciencia humana.",
      footerRights: "Todos los derechos reservados.",
      muteOn: "Silenciar música",
      muteOff: "Activar música",
      introPhrases: [
        "¿Y si tu conciencia tuviera la misma geometría que un agujero negro?",
        "Una frontera viva que separa el adentro del afuera.",
        "No guardamos recuerdos en cajones. Los proyectamos en la piel de nuestro horizonte.",
        "Un viaje entre la física cuántica, la filosofía de la mente y la experiencia humana.",
        "Cruza el límite del Horizonte Interior.",
      ],
    },
    pathLanding: {
      explorationLine: "Línea de Exploración",
      essayTitle: "Ensayo Interactivo",
      essaySubtitle: "La Geometría de la Conciencia y la Física del Alma",
      essayDescription:
        "La columna vertebral del experimento. 26 capítulos donde se explora de forma rigurosa pero accesible la hipótesis holográfica de la mente, conectando la termodinámica de agujeros negros, el vacío cuántico y la Teoría de Información Integrada con las intuiciones de la sabiduría taoísta antigua.",
      essayBtn: "Iniciar Ensayo",
      cuentosTitle: "Cuentos de Tarel",
      cuentosSubtitle: "Fábulas de la Frontera",
      cuentosDescription:
        "16 relatos alegóricos y poéticos que encarnan los conceptos matemáticos en historias vivas. Sigue las andanzas de Tarel en su ciudad suspendida sobre el agua en el silencio, y descubre laberintos donde el deseo es un interruptor que dobla la geometría del espacio.",
      cuentosBtn: "Leer Relatos",
      poemasTitle: "Antología Poética: Ecos en el Borde",
      poemasSubtitle: "Lírica del Límite Emocional",
      poemasDescription:
        "Versos libres y glosarios líricos que traducen al lenguaje del sentimiento las implicaciones físicas de la frontera: el dolor de la asimetría, el duelo concebido como una arquitectura con un hueco y el amor como el entrelazamiento geométrico de dos mundos.",
      poemasBtn: "Explorar Poemas",
      reconTitle: "Planos de la Reconstrucción",
      reconSubtitle: "Síntesis Tridimensional de la Conciencia",
      reconDescription:
        "6 planos integrales de síntesis. Un modo poliédrico e interactivo donde la narrativa, el ensayo teórico y la lírica poética se muestran en paralelo en pestañas, permitiendo al lector reconstruir los fragmentos del horizonte tras su evaporación.",
      reconBtn: "Ver Planos",
    },
    glossaryDrawer: {
      title: "El Experimento Explicado",
      conceptLabel: "Concepto de la Hipótesis",
      physicsLabel: "En Física se llama:",
      metaphorLabel: "Para la vida diaria es como:",
      footerHint: "Usa los términos resaltados en el texto para abrir este panel.",
    },
    journal: {
      title: "Tu Bitácora de Lectura",
      subtitle: 'Compilación de reflexiones de "El Horizonte Interior"',
      dialogosTitle: "Diálogos con el Horizonte",
      dialogosSubtitle: "Pregúntale al Horizonte, queda anotado en la bitácora",
      copyAll: "Copiar Todo",
      downloadTxt: "Descargar TXT",
      tabReflections: "Reflexiones",
      tabDialogos: "Diálogos con el Horizonte",
      emptyTitle: "La bitácora está vacía",
      emptyDesc:
        "Escribe tus apuntes y reflexiones en el bloque lateral que encontrarás al final de cada capítulo para verlos reunidos aquí.",
      chapterLabel: "Capítulo",
      introLabel: "Intro",
      copyTooltip: "Copiar",
      deleteTooltip: "Borrar",
      confirmDelete: "¿Estás seguro de que deseas borrar esta reflexión permanente?",
      copiedAlert: "¡Todas tus reflexiones han sido copiadas al portapapeles!",
    },
    chapterContent: {
      prev: "Anterior",
      next: "Siguiente",
      partOf: (n, total) => `Parte ${n} de ${total}`,
      interludeLabel: "Interludio",
      storyOf: (n, total) => `Relato ${n} de ${total}`,
      prologueOf: (total) => `Relato Prólogo de ${total}`,
      reconOf: (n) => `Parte ${n} de 6`,
      poemLinkOf: (n) => `Poema Enlace ${n} de 8`,
      poemFrialdadOf: (n) => `Poema Frialdad ${n} de 6`,
      poemReconOf: (n) => `Poema Reconstrucción ${n} de 6`,
      poemGlossaryLabel: "Glosario",
      chapterPrefix: (n) => `Capítulo ${n}: `,
      storyPrefix: (n) => `Relato ${n}: `,
      partPrefix: (n) => `Parte ${n}: `,
      reconTabNarrativa: "Narrativa",
      reconTabEnsayo: "Ensayo",
      reconTabPoema: "Poema",
      reconCierreLabel: "Cierre",
      readRelatedEssay: "Leer ensayo relacionado",
      readRelatedStory: "Leer cuento relacionado",
      backToEssay: "Regresar al ensayo correspondiente",
      reflectionBoxTitle: "Bitácora de Reflexión",
      reflectionBoxTitleRecon: (tab) => `Bitácora de Reflexión: ${tab}`,
      reflectionBoxTitlePoetic: "Bitácora de Reflexión Poética",
      delete: "Borrar",
      placeholderRecon: (tab) => `¿Qué resonó en tu interior tras leer este capítulo (${tab})?...`,
      placeholderPoem: "Escribe tus impresiones...",
      placeholderCuento: "¿Qué resonó en tu interior tras leer este relato?...",
      placeholderEssay: "¿Qué ecos resuenan en tu horizonte interno tras leer este capítulo?...",
      hintCuento: "Escribe tus reflexiones, apuntes, o sensaciones que te despierte este relato. Se guardarán automáticamente.",
      hintEssay: "Escribe tus reflexiones, apuntes de física, o pensamientos que te despierte este capítulo. Se guardarán automáticamente en tu navegador.",
      hintPoem: "Anota los ecos y sensaciones íntimas que te inspira esta poesía. Se guardarán localmente.",
      saveButton: "Guardar en Bitácora",
      savedButton: "¡Guardado en Bitácora!",
      saveNote: "Guardar Apunte",
      savedNote: "¡Apunte Guardado!",
      expand: "Desplegar",
      collapse: "Plegar",
      confirmClearReflection: "¿Estás seguro de que quieres borrar tu reflexión para este capítulo?",
      pendingTranslation: "Traducción al inglés pendiente. Mostrando el texto original en español.",
    },
  },
  en: {
    nav: {
      home: "Home",
      essay: "Essay",
      cuentos: "Stories",
      poemas: "Poems",
      reconstruccion: "Reconstruction",
    },
    header: {
      bookTitle: "The Inner Horizon",
      sectionEssay: "Interactive Essay",
      sectionCuentos: "Short Story Anthology",
      sectionPoemas: "Poetry Anthology",
      sectionReconstruccion: "Reconstruction",
      author: "Author",
      part: "Part",
      of: "of",
      interludio: "Interlude",
      story: "Story",
      prologue: "Prologue",
      poem: "Poem",
      glossary: "Glossary",
      link: "Link",
      showMenu: "Show Menu",
      languageToggleLabel: "Language",
    },
    sidebar: {
      byAuthor: "By Íñigo Barrera Barceló",
      readingProgress: "Reading Progress",
      chaptersExplored: (done, total) => `${done} of ${total} ch. explored`,
      activeReader: "Active Reader",
      readingMode: "Reading Mode",
      glossary: "Glossary",
      reflections: "Reflections",
      searchPlaceholder: "Search by word...",
      noChaptersFound: "No chapters found.",
      introSection: "INTRODUCTION",
    },
    settings: {
      title: "Reading Settings",
      colorScheme: "Color Scheme",
      cosmos: "Cosmos",
      paper: "Paper",
      amber: "Amber",
      textSize: "Text Size",
      small: "Small",
      normal: "Normal",
      large: "Large",
      veryLarge: "Very Large",
      extraLarge: "Extra Large",
      focusMode: "Focus Mode",
      hideDistractions: "Hide distractions",
    },
    landing: {
      hypothesisLabel: "Holographic Hypothesis",
      start: "Start",
      discoverMore: "DISCOVER MORE",
      startReading: "Start Reading",
      sectionLabel: "The Event Horizon of the Mind",
      bridgeTitle: "A bridge between geometry and the soul",
      synopsis:
        "is an exploration of consciousness that challenges the traditional boundaries between science and lived experience. Through the lens of theoretical physics and the holographic principle, this work proposes a bold hypothesis: that the mind is not stored inside the brain, but written on its geometric periphery.",
      card1Title: "1. The Bubble",
      card1Desc:
        "Consciousness works like a horizon. It's not a physical barrier, but a living geometric boundary that defines and organizes an interior against an exterior.",
      card2Title: "2. The Ocean",
      card2Desc:
        "The \"void\" isn't empty. It's a reservoir of possibility from which individual consciousnesses and forms emerge, much like waves emerge from the surface of the water.",
      card3Title: "3. The Network",
      card3Desc:
        "Consciousness doesn't reside in isolated elements, but in the way they connect. It represents integrated information (Phi), which makes the system more than the sum of its parts.",
      pathsTitle: "Four Paths of Exploration",
      pathsSubtitle: "The work is designed as a polyhedral structure. Choose the door that resonates with your curiosity.",
      pathEssayTitle: "Interactive Essay",
      pathEssayDesc:
        "The theoretical backbone. 26 chapters where modern physics speaks directly with metaphysics and conscious experience.",
      pathEssayBtn: "Start the Essay",
      pathCuentosTitle: "Tales of Tarel",
      pathCuentosDesc:
        "16 allegorical stories. Physics explained through fables, from the city submerged in silence to the labyrinth of the switch.",
      pathCuentosBtn: "Read the Stories",
      pathPoemasTitle: "Poetry Anthology",
      pathPoemasDesc:
        "Poetry and lyrical glossaries. The emotional echoes of the horizon translated into free verse and metaphorical architectures.",
      pathPoemasBtn: "Explore the Poems",
      pathReconTitle: "The Reconstruction",
      pathReconDesc:
        "6 planes of synthesis. An integrative mode where essay, narrative, and poetry merge in parallel tabs.",
      pathReconBtn: "View the Planes",
      footerTagline: "A philosophical-scientific proposal about human consciousness.",
      footerRights: "All rights reserved.",
      muteOn: "Mute music",
      muteOff: "Turn on music",
      introPhrases: [
        "What if your consciousness had the same geometry as a black hole?",
        "A living boundary that separates the inside from the outside.",
        "We don't store memories in drawers. We project them onto the skin of our horizon.",
        "A journey through quantum physics, philosophy of mind, and human experience.",
        "Cross the boundary of the Inner Horizon.",
      ],
    },
    pathLanding: {
      explorationLine: "Line of Exploration",
      essayTitle: "Interactive Essay",
      essaySubtitle: "The Geometry of Consciousness and the Physics of the Soul",
      essayDescription:
        "The backbone of the experiment. 26 chapters that rigorously yet accessibly explore the holographic hypothesis of the mind, connecting black hole thermodynamics, the quantum vacuum, and Integrated Information Theory with the intuitions of ancient Taoist wisdom.",
      essayBtn: "Start the Essay",
      cuentosTitle: "Tales of Tarel",
      cuentosSubtitle: "Fables of the Boundary",
      cuentosDescription:
        "16 allegorical, poetic stories that embody mathematical concepts in living tales. Follow Tarel through its city suspended over silent water, and discover labyrinths where desire is a switch that bends the geometry of space.",
      cuentosBtn: "Read the Stories",
      poemasTitle: "Poetry Anthology: Echoes at the Edge",
      poemasSubtitle: "Lyric of the Emotional Limit",
      poemasDescription:
        "Free verse and lyrical glossaries that translate the physical implications of the boundary into the language of feeling: the pain of asymmetry, grief conceived as an architecture with a hollow, and love as the geometric entanglement of two worlds.",
      poemasBtn: "Explore the Poems",
      reconTitle: "Planes of the Reconstruction",
      reconSubtitle: "Three-Dimensional Synthesis of Consciousness",
      reconDescription:
        "6 integral planes of synthesis. A polyhedral, interactive mode where narrative, theoretical essay, and poetic lyric appear side by side in parallel tabs, letting the reader reconstruct the fragments of the horizon after its evaporation.",
      reconBtn: "View the Planes",
    },
    glossaryDrawer: {
      title: "The Experiment Explained",
      conceptLabel: "Concept of the Hypothesis",
      physicsLabel: "In Physics it's called:",
      metaphorLabel: "In everyday life it's like:",
      footerHint: "Use the highlighted terms in the text to open this panel.",
    },
    journal: {
      title: "Your Reading Journal",
      subtitle: 'A collection of reflections on "The Inner Horizon"',
      dialogosTitle: "Dialogues with the Horizon",
      dialogosSubtitle: "Ask the Horizon a question — it's recorded in the journal",
      copyAll: "Copy All",
      downloadTxt: "Download TXT",
      tabReflections: "Reflections",
      tabDialogos: "Dialogues with the Horizon",
      emptyTitle: "Your journal is empty",
      emptyDesc:
        "Write your notes and reflections in the side panel at the end of each chapter to see them gathered here.",
      chapterLabel: "Chapter",
      introLabel: "Intro",
      copyTooltip: "Copy",
      deleteTooltip: "Delete",
      confirmDelete: "Are you sure you want to permanently delete this reflection?",
      copiedAlert: "All your reflections have been copied to the clipboard!",
    },
    chapterContent: {
      prev: "Previous",
      next: "Next",
      partOf: (n, total) => `Part ${n} of ${total}`,
      interludeLabel: "Interlude",
      storyOf: (n, total) => `Story ${n} of ${total}`,
      prologueOf: (total) => `Story Prologue of ${total}`,
      reconOf: (n) => `Part ${n} of 6`,
      poemLinkOf: (n) => `Poem Link ${n} of 8`,
      poemFrialdadOf: (n) => `Coldness Poem ${n} of 6`,
      poemReconOf: (n) => `Poem Reconstruction ${n} of 6`,
      poemGlossaryLabel: "Glossary",
      chapterPrefix: (n) => `Chapter ${n}: `,
      storyPrefix: (n) => `Story ${n}: `,
      partPrefix: (n) => `Part ${n}: `,
      reconTabNarrativa: "Narrative",
      reconTabEnsayo: "Essay",
      reconTabPoema: "Poem",
      reconCierreLabel: "Closing",
      readRelatedEssay: "Read the related essay",
      readRelatedStory: "Read the related story",
      backToEssay: "Return to the corresponding essay",
      reflectionBoxTitle: "Reading Journal",
      reflectionBoxTitleRecon: (tab) => `Reading Journal: ${tab}`,
      reflectionBoxTitlePoetic: "Poetic Reading Journal",
      delete: "Delete",
      placeholderRecon: (tab) => `What resonated within you after reading this chapter (${tab})?...`,
      placeholderPoem: "Write your impressions...",
      placeholderCuento: "What resonated within you after reading this story?...",
      placeholderEssay: "What echoes resonate in your inner horizon after reading this chapter?...",
      hintCuento: "Write your reflections, notes, or feelings this story awakened in you. They'll be saved automatically.",
      hintEssay: "Write your reflections, physics notes, or thoughts this chapter awakened in you. They'll be saved automatically in your browser.",
      hintPoem: "Jot down the echoes and intimate feelings this poem stirs in you. They'll be saved locally.",
      saveButton: "Save to Journal",
      savedButton: "Saved to Journal!",
      saveNote: "Save Note",
      savedNote: "Note Saved!",
      expand: "Expand",
      collapse: "Collapse",
      confirmClearReflection: "Are you sure you want to delete your reflection for this chapter?",
      pendingTranslation: "English translation pending. Showing the original Spanish text.",
    },
  },
};
