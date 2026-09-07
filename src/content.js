// Each word keeps one meaning throughout the journey.
export const WORDS = {
  moku: { meaning: "ovoce", glyph: "M8 8h16v16H8z M12 12l8 8m0-8-8 8" },
  nalu: { meaning: "voda", glyph: "M6 10q5-8 10 0t10 0M6 20q5-8 10 0t10 0" },
  balu: { meaning: "velký", glyph: "M7 24V8h18v16M12 16h8" },
  tiki: { meaning: "malý", glyph: "M8 10h16M16 10v14m-5-5 5 5 5-5" },
  luma: {
    meaning: "světlo",
    glyph: "M16 4v6m0 12v6M4 16h6m12 0h6M11 11h10v10H11z",
  },
  noko: { meaning: "ne / bez", glyph: "M8 7l16 18M24 7 8 25M6 16h20" },
  paku: { meaning: "jdi", glyph: "M6 24 14 8l5 10 7-10M6 28h20" },
  sula: { meaning: "vlevo", glyph: "M24 7H10v18h14M10 16h10" },
  taro: { meaning: "vpravo", glyph: "M8 7h14v18H8M12 16h10" },
  hama: { meaning: "domov", glyph: "M5 25 16 5l11 20H5M12 25v-8h8v8" },
};

export const CHAPTERS = [
  {
    title: "Šeptající džungle",
    subtitle: "První slova, první přátelství",
    image: "jungle",
    icon: "leaf",
  },
  {
    title: "Údolí světlušek",
    subtitle: "Ne všechno je tak, jak vypadá",
    image: "cave",
    icon: "spark",
  },
  {
    title: "Ztracené stezky",
    subtitle: "Dva směry. Který je ten pravý?",
    image: "jungle",
    icon: "sign",
  },
  {
    title: "Za světlem domova",
    subtitle: "Poslední kroky zvládnete spolu",
    image: "home",
    icon: "home",
  },
];

const clue = (label, icon, text, ...phrase) => ({ label, icon, text, phrase });
const choice = (id, label, icon) => ({ id, label, icon });

export const LEVELS = [
  {
    title: "Někdo tu má hlad",
    chapter: 0,
    type: "choice",
    phrase: ["moku"],
    story:
      "Z kapradí vykoukne rozcuchaný cizinec. Kručí mu v břiše. Ukazuje pod listy a opakuje jediné slovo.",
    question: "Co znamená „moku“?",
    instruction: "Prozkoumej stopy v obrázku. Pak vyber význam slova.",
    clues: [
      clue(
        "Pod listy",
        "leaf",
        "Pod listy leží zralé ovoce. Grunt si ho přitáhne k nosu, olízne se a řekne: „Moku!“",
        "moku",
      ),
      clue(
        "U potoka",
        "water",
        "Grunt se na vodu sotva podívá. Ukazuje zpátky na ovoce a hladově si hladí břicho.",
        "moku",
      ),
    ],
    choices: [
      choice("water", "Voda", "water"),
      choice("fruit", "Ovoce", "leaf"),
      choice("home", "Domov", "home"),
    ],
    answer: "fruit",
    learns: ["moku"],
    hints: [
      "Všimni si, co chce Grunt sníst.",
      "„Moku“ je to zralé pod listy. Vyber ovoce.",
    ],
    wrong:
      "Grunt zavrtí hlavou a pohladí si prázdné břicho. Co by si dal k jídlu?",
    success:
      "Moku znamená ovoce! Grunt se zakousne a poprvé se usměje. Právě jste si porozuměli.",
  },
  {
    title: "Žíznivý kamarád",
    chapter: 0,
    type: "choice",
    phrase: ["nalu"],
    story:
      "O kus dál Grunt přestane žvýkat. Dřepne si u potoka a nabere něco do dlaní.",
    question: "Co znamená „nalu“?",
    instruction: "Stejné slovo na dvou místech. Co mají společného?",
    clues: [
      clue(
        "Potok",
        "water",
        "Grunt nabere vodu, napije se a spokojeně vydechne: „Nalu.“",
        "nalu",
      ),
      clue(
        "Kapky na listu",
        "leaf",
        "Na list dopadnou dešťové kapky. Grunt je zachytí prstem: „Nalu!“ U kamene tohle slovo neříká.",
        "nalu",
      ),
    ],
    choices: [
      choice("leaf", "List", "leaf"),
      choice("stone", "Kámen", "stone"),
      choice("water", "Voda", "water"),
    ],
    answer: "water",
    learns: ["nalu"],
    hints: ["Co je v potoce i v dešťové kapce?", "Nalu znamená voda."],
    wrong: "Grunt zavrtí hlavou. Pak se znovu napije. Hledej něco, co teče.",
    success:
      "Nalu je voda. Dvě slova už znáš! Grunt ti podá naplněný list. Na cestě jste teď dva.",
  },
  {
    title: "Na velikosti záleží",
    chapter: 0,
    type: "choice",
    phrase: ["balu", "moku"],
    story:
      "Grunt našel dvě hromádky ovoce. Roztáhne ruce, pak je dá skoro k sobě. Tentokrát přidává nová slova.",
    question: "Které ovoce si Grunt přeje?",
    instruction: "Porovnej obě stopy. Pořadí slov je velikost → věc.",
    clues: [
      clue(
        "Dvě hromádky",
        "leaf",
        "U obrovského plodu Grunt roztáhne ruce: „Balu moku.“ U drobného plodu je přiblíží: „Tiki moku.“",
        "balu",
        "moku",
        "tiki",
        "moku",
      ),
      clue(
        "Dva kameny",
        "stone",
        "Stejné gesto zopakuje u balvanu: „Balu.“ U oblázku zašeptá: „Tiki.“ Slova tedy neoznačují barvu ani chuť.",
        "balu",
        "tiki",
      ),
    ],
    choices: [
      choice("small", "Malé ovoce", "leaf"),
      choice("big", "Velké ovoce", "leaf"),
      choice("water", "Vodu", "water"),
    ],
    answer: "big",
    learns: ["balu", "tiki"],
    hints: [
      "Moku už znáš. Jak daleko od sebe má ruce, když říká balu?",
      "Balu = velký, tiki = malý. Chce velké ovoce.",
    ],
    wrong: "Grunt znovu roztáhne ruce co nejdál od sebe: „Baaalu moku!“",
    success:
      "Balu je velký, tiki je malý. Grunt vítězoslavně zvedne obří plod… a málem pod ním zmizí.",
  },
  {
    title: "Malý dar",
    chapter: 1,
    type: "build",
    phrase: ["moku"],
    story:
      "Cestu hlídá maličký svítící brouk. Grunt má nápad: darujete mu ovoce. Jen aby ho ten dar nezavalil!",
    question: "Řekni Gruntovi: „Malé ovoce.“",
    instruction: "Klepáním sestav zprávu. Slovo odebereš klepnutím ve zprávě.",
    clues: [
      clue(
        "Malý strážce",
        "spark",
        "Brouk je menší než Gruntův palec. Obrovský plod by neunesl. Drobný plod se mu vejde do tlapek.",
        "tiki",
      ),
      clue(
        "Gruntův příklad",
        "book",
        "Grunt zopakuje „balu moku“ a zvedne velké ovoce. Velikost říká před názvem věci.",
        "balu",
        "moku",
      ),
    ],
    bank: ["moku", "balu", "nalu", "tiki"],
    answer: ["tiki", "moku"],
    learns: [],
    hints: [
      "Nejdřív velikost, potom věc. Pomůže ti slovníček.",
      "Vyber tiki a potom moku.",
    ],
    wrong: "Brouk se schová za list. Potřebuje MALÉ OVOCE, v tomto pořadí.",
    success:
      "Tiki moku! Brouk si odnese malou svačinu a rozsvítí vám cestu do údolí.",
  },
  {
    title: "Slovo, které září",
    chapter: 1,
    type: "choice",
    phrase: ["luma"],
    story:
      "Pod kořeny se otevře modrá jeskyně. Grunt ukazuje na světlušku, zářící houbu i proužek slunce.",
    question: "Co mají všechny tři věci společného?",
    instruction: "Nehledej jméno věci. Hledej společnou vlastnost.",
    clues: [
      clue(
        "Světluška",
        "spark",
        "Světluška se rozsvítí: „Luma!“ Zhasne a Grunt mlčí. Rozsvítí se, a znovu: „Luma!“",
        "luma",
      ),
      clue(
        "Sluneční paprsek",
        "sun",
        "Grunt strčí ruku do slunečního paprsku: „Luma.“ Totéž říká u zářící houby. U obyčejné houby mlčí.",
        "luma",
      ),
    ],
    choices: [
      choice("light", "Světlo", "sun"),
      choice("bug", "Brouk", "leaf"),
      choice("warm", "Teplo", "spark"),
    ],
    answer: "light",
    learns: ["luma"],
    hints: [
      "I studená houba může mít luma. Co dělá světluška?",
      "Luma znamená světlo, ne brouka ani teplo.",
    ],
    wrong:
      "Grunt ukáže na studenou svítící houbu a potom na slunce. Nejde o teplotu ani o zvíře.",
    success:
      "Luma je světlo. Jeskyně se rozzáří stovkami malých světel. Jako by i ona měla radost.",
  },
  {
    title: "Někdy méně znamená víc",
    chapter: 1,
    type: "choice",
    phrase: ["noko", "luma"],
    story:
      "Světlo probudilo ospalé netopýry. Grunt hledá místo k odpočinku. Ukáže do klidného kouta: „Noko luma.“",
    question: "Kde si chce Grunt odpočinout?",
    instruction: "Nové slovo mění význam toho, co následuje.",
    clues: [
      clue(
        "Prázdná dlaň",
        "hand",
        "Grunt ukáže ovoce: „Moku.“ Schová ho, ukáže prázdnou dlaň a zavrtí hlavou: „Noko moku.“",
        "moku",
        "noko",
        "moku",
      ),
      clue(
        "Dva kouty",
        "moon",
        "U svítících hub mhouří oči: „Luma.“ V tmavém koutě je otevře, zavrtí hlavou a řekne: „Noko luma.“",
        "luma",
        "noko",
        "luma",
      ),
    ],
    choices: [
      choice("bright", "U svítících hub", "spark"),
      choice("dark", "V tmavém koutě", "moon"),
      choice("outside", "Na slunci", "sun"),
    ],
    answer: "dark",
    learns: ["noko"],
    hints: [
      "Noko moku říká, když v dlani ovoce NENÍ.",
      "Noko znamená ne nebo bez. Noko luma = bez světla. Vyber tmavý kout.",
    ],
    wrong: "Grunt si zakryje oči. „Noko luma!“ Teď potřebuje místo bez světla.",
    success:
      "Noko znamená ne nebo bez. Jedno malé slovo a všechno je obráceně! Grunt si na chvilku zdřímne.",
  },
  {
    title: "Nohy do práce",
    chapter: 2,
    type: "choice",
    phrase: ["paku"],
    story:
      "Ráno! Grunt protáhne záda, vstane a ukáže na stezku. Zatímco ty stojíš, on už přešlapuje.",
    question: "Co ti Grunt říká slovem „paku“?",
    instruction: "Pozoruj pohyb. Tentokrát slovo označuje činnost.",
    clues: [
      clue(
        "Stopy v mechu",
        "steps",
        "Grunt udělá tři kroky po stezce: „Paku, paku!“ Když se zastaví, přestane to říkat.",
        "paku",
      ),
      clue(
        "Pozvání na cestu",
        "hand",
        "Grunt ti zamává, abys šel s ním. Pak se pomalu rozejde. Nikam neskáče ani neutíká.",
        "paku",
      ),
    ],
    choices: [
      choice("sleep", "Spi", "moon"),
      choice("eat", "Jez", "leaf"),
      choice("go", "Jdi", "steps"),
    ],
    answer: "go",
    learns: ["paku"],
    hints: [
      "To slovo říká, jen když se pohybuje po stezce.",
      "Paku znamená jdi.",
    ],
    wrong: "Grunt znovu vykročí a ohlédne se, jestli jdeš za ním.",
    success:
      "Paku znamená jdi. Teď už můžete mluvit i o tom, co spolu uděláte.",
  },
  {
    title: "Vlevo, nebo vpravo?",
    chapter: 2,
    type: "choice",
    phrase: ["paku", "sula"],
    story:
      "Stezka se rozděluje. Grunt stojí vedle tebe a díváte se stejným směrem. Za levou větví cesty tančí světlušky.",
    question: "Kterou cestu Grunt navrhuje?",
    instruction: "Vlevo a vpravo vždy znamená tvůj pohled na obrazovku.",
    clues: [
      clue(
        "Levá stezka",
        "left",
        "Grunt ukáže doleva na obrazovce a řekne: „Sula.“ Prstem sleduje levou stezku mezi kapradím.",
        "sula",
      ),
      clue(
        "Pravá stezka",
        "right",
        "Grunt ukáže doprava na obrazovce: „Taro.“ Jsou to dvě různá slova pro dva směry.",
        "taro",
      ),
    ],
    choices: [
      choice("right", "Doprava", "right"),
      choice("left", "Doleva", "left"),
      choice("stay", "Zůstat tady", "stone"),
    ],
    answer: "left",
    learns: ["sula", "taro"],
    hints: [
      "Paku znamená jdi. Prozkoumej levou i pravou stezku.",
      "Sula = vlevo, taro = vpravo. Grunt říká: jdi vlevo.",
    ],
    wrong: "Grunt zopakuje „sula“ a ukáže na levou stranu obrazovky.",
    success:
      "Sula je vlevo, taro vpravo. Světlušky vás provedou kolem pořádně hluboké strže.",
  },
  {
    title: "Teď vedeš ty",
    chapter: 2,
    type: "build",
    phrase: ["sula", "taro"],
    story:
      "Grunt si s cestou neví rady. Na pravé stezce jsou čerstvé lidské stopy. Levou zablokoval spadlý strom.",
    question: "Řekni Gruntovi: „Jdi vpravo.“",
    instruction: "Nejdřív činnost, potom směr. Tentokrát rozhoduješ ty.",
    clues: [
      clue(
        "Lidské stopy",
        "steps",
        "Otisky bosých nohou vedou doprava. Vypadají jako Gruntovy, ale jsou menší. Možná patří jeho rodině!",
        "taro",
      ),
      clue(
        "Spadlý strom",
        "leaf",
        "Levá stezka končí u mohutného kmene. Grunt ho zkusí nadzvednout. Ani se nehne.",
        "sula",
      ),
    ],
    bank: ["sula", "nalu", "taro", "paku", "noko"],
    answer: ["paku", "taro"],
    learns: [],
    hints: [
      "Slovníček ti připomene slova pro chůzi a pravý směr.",
      "Vyber paku a potom taro.",
    ],
    wrong:
      "Hledejte cestu za stopami doprava. Zpráva má říkat nejdřív jdi, pak vpravo.",
    success:
      "Paku taro! Grunt ti důvěřuje a vykročí doprava. Mezi stromy už prosvítá teplé světlo.",
  },
  {
    title: "Suchou nohou",
    chapter: 3,
    type: "choice",
    phrase: ["noko", "nalu"],
    story:
      "Domov už musí být blízko. Zbývá překonat rokli. Grunt neumí plavat a ukazuje na své suché nohy.",
    question: "Kudy přejít, když Grunt chce „noko nalu“?",
    instruction: "Spoj dvě známá slova. Nápověda může být i v tom, co chybí.",
    clues: [
      clue(
        "Dno rokle",
        "water",
        "Dole teče hluboká voda. Mělký brod je také mokrý. Grunt si u obou cest zakrývá nos.",
        "nalu",
      ),
      clue(
        "Kamenný most",
        "stone",
        "Nad vodou vede pevný suchý most. Grunt na něj poklepe, ukáže na suchá chodidla a přikývne.",
        "noko",
        "nalu",
      ),
    ],
    choices: [
      choice("ford", "Mělkým brodem", "water"),
      choice("swim", "Přeplavat řeku", "water"),
      choice("bridge", "Po suchém mostě", "stone"),
    ],
    answer: "bridge",
    learns: [],
    hints: [
      "Noko neznamená malé množství. Znamená ne nebo bez.",
      "Noko nalu = bez vody. Suchá cesta vede po mostě.",
    ],
    wrong: "I v mělkém brodu je voda. Grunt chce přejít úplně suchou nohou.",
    success:
      "Most ani nezavrzá. „Noko nalu,“ vydechne Grunt spokojeně a ukáže na své stále suché nohy.",
  },
  {
    title: "Zpráva pro kamaráda",
    chapter: 3,
    type: "build",
    phrase: ["paku"],
    story:
      "Před poslední zatáčkou vede pravá cesta po suché zemi. Levá míří do vody. Grunt čeká na tvoje pokyny.",
    question: "Sestav: „Jdi vpravo, ne do vody.“",
    instruction: "Čtyři slova: činnost → směr → ne → voda.",
    clues: [
      clue(
        "Suchá stezka",
        "right",
        "Pravá cesta vede k oranžovému světlu mezi skalami. Je suchá a bezpečná.",
        "taro",
      ),
      clue(
        "Mokrá odbočka",
        "water",
        "Voda na levé cestě je hluboká. Připomeň Gruntovi i to, kam jít nemá. Noko stojí před věcí, kterou odmítá.",
        "noko",
        "nalu",
      ),
    ],
    bank: ["nalu", "sula", "paku", "luma", "noko", "taro"],
    answer: ["paku", "taro", "noko", "nalu"],
    learns: [],
    hints: [
      "Rozděl zprávu na dvě části: jdi vpravo / ne voda.",
      "Pořadí je paku → taro → noko → nalu.",
    ],
    wrong:
      "Zkus zprávu po částech. Nejprve jdi vpravo. Potom ne voda. Každé slovo má své místo.",
    success:
      "Grunt rozumí celé větě! Opatrně projde po pravé stezce. Z jeskyně se ozve známý hlas…",
  },
  {
    title: "Poslední slovo",
    chapter: 3,
    type: "build",
    phrase: ["hama"],
    story:
      "Ve skále září útulná jeskyně. Na kameni je obrázek Grunta s rodinou. Grunt si přitiskne ruce k srdci: „Hama.“",
    question: "Řekni mu jeho řečí: „Jdi domů.“",
    instruction:
      "Poslední nové slovo poznáš ze stop. Pak ho spoj se slovem, které už znáš.",
    clues: [
      clue(
        "Rodinná malba",
        "home",
        "Na malbě je Grunt, jeho rodina a tahle jeskyně. Grunt se usmívá, ukazuje dovnitř a opakuje „hama“. Tady bydlí.",
        "hama",
      ),
      clue(
        "Teplo u vchodu",
        "sun",
        "Na oheň Grunt řekne „luma“. Ale „hama“ říká, až když obejme všechny u vchodu. Není to slovo pro světlo.",
        "luma",
        "hama",
      ),
    ],
    bank: ["moku", "hama", "paku", "noko", "luma"],
    answer: ["paku", "hama"],
    learns: ["hama"],
    hints: [
      "Hama je místo, kde Grunt bydlí s rodinou. Začni slovem jdi.",
      "Vyber paku a potom hama. Znamená to jdi domů.",
    ],
    wrong: "Grunt už je skoro doma. Potřebuje jen dvě slova: jdi a domov.",
    success:
      "„Paku hama.“ Grunt se zastaví, obejme tě a usměje se. I bez společné řeči jste našli společnou cestu.",
  },
];
