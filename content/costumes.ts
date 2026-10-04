// The collection: Kostuma's most wanted costumes, in rank order.
// Imported from the owner's list (scripts/import-catalog.mjs), then curated
// by hand: this file is the source of truth. Facts about 2025–2026 releases
// reflect the owner's list as of 2026-09-30; box-office figures are
// approximate. content/costumes.test.ts checks every entry.
import type { Costume } from "@/lib/catalog/types"

export const costumes: Costume[] = [
  {
    rank: 1,
    slug: "ghostface",
    name: "Ghostface",
    trending: false,
    films: [
      {
        title: "Scream",
        year: 1996,
      },
    ],
    createdBy: ["Kevin Williamson (script) & Wes Craven (director)"],
    broughtToLifeBy: [
      "Mask by Fun World (designer Brigitte Sleiertin, c. 1990)",
      "Voiced by Roger L. Jackson",
    ],
    lore: "A prank-calling, horror-trivia-obsessed slasher who is never the same person twice: every film reveals a new killer (or two) under the robe.",
    funFact:
      "The mask was spotted in a house during location scouting and Craven picked it over custom designs. Its melting face echoes Edvard Munch’s painting The Scream. Scream 7 (Feb 2026) opened to $63.6M in the US, the franchise’s biggest opening.",
    look: {
      pieces: ["Black hooded robe", "White mask", "Prop knife"],
    },
    images: [
      {
        file: "ghostface.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fghostface.5d4f92417a.webp?alt=media",
        width: 1357,
        height: 1400,
      },
    ],
    shops: [
      { shop: "halloweencostumes", search: "Ghostface" },
      { shop: "spirithalloween", search: "Ghost Face" },
      { shop: "amazon", search: "Ghostface costume" },
    ],
  },
  {
    rank: 2,
    slug: "michael-myers",
    name: "Michael Myers",
    trending: false,
    films: [
      {
        title: "Halloween",
        year: 1978,
      },
    ],
    createdBy: ["John Carpenter & Debra Hill"],
    broughtToLifeBy: [
      "Nick Castle played “The Shape”",
      "Tony Moran was the unmasked face",
    ],
    lore: "At age six he stabbed his sister Judith on Halloween 1963 in Haddonfield, Illinois. Fifteen years later he escapes Smith’s Grove Sanitarium and stalks babysitter Laurie Strode.",
    funFact:
      "The famous blank face is a cheap Captain Kirk (William Shatner) mask, spray-painted white with the eyeholes widened. The film cost roughly $300K and earned about $70M. Carpenter borrowed the name from a British film distributor.",
    look: {
      pieces: ["Navy-blue mechanic coveralls", "White mask", "Kitchen knife"],
    },
    images: [
      {
        file: "michael-myers.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fmichael-myers.3f2d6ef00c.webp?alt=media",
        width: 638,
        height: 1400,
      },
    ],
    shops: [
      { shop: "halloweencostumes", search: "Michael Myers" },
      { shop: "spirithalloween", search: "Michael Myers" },
      { shop: "amazon", search: "Michael Myers costume" },
    ],
  },
  {
    rank: 3,
    slug: "nikki-freaky-nikki-freeman",
    name: "Nikki “Freaky Nikki” Freeman",
    trending: true,
    films: [
      {
        title: "Obsession",
        year: 2026,
      },
    ],
    createdBy: ["Curry Barker (writer-director)"],
    broughtToLifeBy: ["Inde Navarrette", "Costume design by Blair James"],
    lore: "Bear makes a selfish wish on a toy called the One Wish Willow: that his friend Nikki will love him more than anyone. Nikki’s personality is overwritten by violent, possessive devotion.",
    funFact:
      "The year’s breakout horror hit (Focus Features, May 2026), made by a YouTube-native filmmaker. Universal put Nikki in Halloween Horror Nights Hollywood 2026 and sells licensed costumes. Navarrette hosts SNL on Oct 31, 2026.",
    look: {
      pieces: [
        "Red-and-black animal-print top",
        "Black leather shorts",
        "Silver necklace",
        "Black wig",
        "Fake blood",
      ],
      alternative: "Or the purple floral dress from the finale.",
    },
    garment: {
      file: "nikki-freaky-nikki-freeman-costume.png",
      url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fnikki-freaky-nikki-freeman-costume.e04ca6dd25.webp?alt=media",
      width: 504,
      height: 999,
    },
    images: [
      {
        file: "nikki-freaky-nikki-freeman.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fnikki-freaky-nikki-freeman.b8c1af883b.webp?alt=media",
        width: 1292,
        height: 1400,
      },
    ],
    shops: [
      { shop: "amazon", search: "Freaky Nikki costume" },
      { shop: "etsy", search: "Nikki Freeman Obsession costume" },
    ],
  },
  {
    rank: 4,
    slug: "art-the-clown",
    name: "Art the Clown",
    trending: false,
    films: [
      {
        title: "Terrifier",
        year: 2016,
      },
    ],
    createdBy: ["Damien Leone"],
    broughtToLifeBy: [
      "David Howard Thornton (2016 onward)",
      "Earlier Mike Giannelli in the shorts",
    ],
    lore: "A mute, silently gleeful killer clown with a bag of tricks, who first appeared in Leone’s low-budget shorts (2008, 2011) and the anthology All Hallows’ Eve (2013).",
    funFact:
      "Leone is a practical-effects makeup artist who built the character on shoestring budgets. Terrifier 3 opened on October 11, 2024 and earned roughly $90M on about a $2M budget.",
    look: {
      pieces: [
        "Black hat",
        "Black-and-white clown suit",
        "Smeared white face",
        "Gloves",
      ],
    },
    images: [
      {
        file: "art-the-clown.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fart-the-clown.19f83f46c5.webp?alt=media",
        width: 815,
        height: 1020,
      },
    ],
    shops: [
      { shop: "halloweencostumes", search: "Art the Clown" },
      { shop: "spirithalloween", search: "Art the Clown" },
      { shop: "amazon", search: "Art the Clown costume" },
    ],
  },
  {
    rank: 5,
    slug: "pennywise",
    name: "Pennywise",
    trending: false,
    films: [
      {
        title: "It",
        year: 2017,
      },
    ],
    createdBy: ["Stephen King (1986 novel)", "Andy Muschietti (2017 director)"],
    broughtToLifeBy: ["Bill Skarsgård (2017)", "Tim Curry (1990 miniseries)"],
    lore: "An ancient shapeshifting cosmic entity that wakes roughly every 27 years in Derry, Maine, favoring a clown form to hunt children.",
    funFact:
      "Skarsgård can point his eyes in different directions, a trick used on screen. His Victorian-flavored costume was designed by Janie Bryant. It Chapter One became the highest-grossing horror film ever, about $700M.",
    look: {
      pieces: [
        "Cream ruffled jumpsuit",
        "Orange pom-poms",
        "Receding red clown wig",
        "Red lip streaks",
      ],
    },
    images: [
      {
        file: "pennywise.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fpennywise.b5517aba89.webp?alt=media",
        width: 775,
        height: 1080,
      },
    ],
    shops: [
      { shop: "halloweencostumes", search: "Pennywise" },
      { shop: "spirithalloween", search: "Pennywise" },
      { shop: "amazon", search: "Pennywise costume" },
    ],
  },
  {
    rank: 6,
    slug: "aunt-gladys",
    name: "Aunt Gladys",
    trending: true,
    films: [
      {
        title: "Weapons",
        year: 2025,
      },
    ],
    createdBy: ["Zach Cregger (writer-director)"],
    broughtToLifeBy: [
      "Amy Madigan",
      "Wig by Melizah Anguiano Wheat, costumes by Trish Somerville",
    ],
    lore: "After all but one of a classroom’s children vanish at 2:17 a.m., the odd, sickly aunt who moves in with the one boy left behind turns out to be a parasitic witch.",
    funFact:
      "Madigan won the Best Supporting Actress Oscar on March 15, 2026, 40 years after her first nomination. A prequel titled Gladys is in the works. Her look includes elongated earlobe prosthetics.",
    look: {
      pieces: [
        "Red bob with blunt bangs",
        "Thick white makeup",
        "Big glasses",
        "Dangly earrings",
        "’90s tracksuit",
      ],
    },
    garment: {
      file: "aunt-gladys-costume.png",
      url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Faunt-gladys-costume.8f03f62e66.webp?alt=media",
      width: 367,
      height: 1001,
    },
    images: [
      {
        file: "aunt-gladys.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Faunt-gladys.844a2de380.webp?alt=media",
        width: 715,
        height: 1400,
      },
    ],
    shops: [
      { shop: "amazon", search: "Aunt Gladys costume" },
      { shop: "etsy", search: "Aunt Gladys costume" },
    ],
  },
  {
    rank: 7,
    slug: "chucky",
    name: "Chucky",
    trending: false,
    films: [
      {
        title: "Child’s Play",
        year: 1988,
      },
    ],
    createdBy: ["Don Mancini (writer)", "Tom Holland (director)"],
    broughtToLifeBy: ["Brad Dourif (voice)", "Doll effects by Kevin Yagher"],
    lore: "Serial killer Charles Lee Ray (the Lakeshore Strangler) uses voodoo to move his soul into a Good Guys doll, and ends up in a six-year-old boy’s toy box.",
    funFact:
      "Dourif has voiced Chucky in every entry except the 2019 remake, where Mark Hamill took over. Mancini’s script was originally titled Blood Buddy.",
    look: {
      pieces: [
        "Overalls",
        "Striped shirt",
        "Red hair",
        "Scarred doll face",
        "Kitchen knife",
      ],
    },
    images: [
      {
        file: "chucky.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fchucky.7d6162a770.webp?alt=media",
        width: 1305,
        height: 1080,
      },
    ],
    shops: [
      { shop: "halloweencostumes", search: "Chucky" },
      { shop: "spirithalloween", search: "Chucky" },
      { shop: "amazon", search: "Chucky costume" },
    ],
  },
  {
    rank: 8,
    slug: "freddy-krueger",
    name: "Freddy Krueger",
    trending: false,
    films: [
      {
        title: "A Nightmare on Elm Street",
        year: 1984,
      },
    ],
    createdBy: ["Wes Craven"],
    broughtToLifeBy: ["Robert Englund"],
    lore: "A child killer burned alive by Springwood parents returns in their kids’ dreams, where he is the one in control.",
    funFact:
      "Craven drew on news stories about young men who died after refusing to sleep, and named Freddy after a childhood bully. The sweater’s red and green were reportedly chosen because the colors clash for the eye. The film’s success built New Line Cinema.",
    look: {
      pieces: [
        "Red-and-green striped sweater",
        "Brown fedora",
        "Burn makeup",
        "Bladed glove",
      ],
    },
    images: [
      {
        file: "freddy-krueger.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Ffreddy-krueger.6971af388e.webp?alt=media",
        width: 675,
        height: 1400,
      },
    ],
    shops: [
      { shop: "halloweencostumes", search: "Freddy Krueger" },
      { shop: "spirithalloween", search: "Freddy Krueger" },
      { shop: "amazon", search: "Freddy Krueger costume" },
    ],
  },
  {
    rank: 9,
    slug: "jason-voorhees",
    name: "Jason Voorhees",
    trending: false,
    films: [
      {
        title: "Friday the 13th",
        year: 1980,
      },
    ],
    createdBy: ["Victor Miller (writer) & Sean S. Cunningham (director)"],
    broughtToLifeBy: [
      "Many actors",
      "Kane Hodder played him four times",
      "Original effects by Tom Savini",
    ],
    lore: "A boy who drowned at Camp Crystal Lake. In the original film his mother did the killing; Jason himself takes over as the adult killer from Part 2 onward.",
    funFact:
      "The hockey mask did not appear until Part III (1982). Ari Lehman played the young Jason who lunges from the lake at the end of the original.",
    look: {
      pieces: ["Hockey goalie mask", "Torn coveralls", "Machete"],
    },
    images: [
      {
        file: "jason-voorhees.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fjason-voorhees.4163a6db59.webp?alt=media",
        width: 1400,
        height: 1066,
      },
    ],
    shops: [
      { shop: "halloweencostumes", search: "Jason Voorhees" },
      { shop: "spirithalloween", search: "Jason Voorhees" },
      { shop: "amazon", search: "Jason Voorhees costume" },
    ],
  },
  {
    rank: 10,
    slug: "beetlejuice",
    name: "Beetlejuice",
    trending: false,
    films: [
      {
        title: "Beetlejuice",
        year: 1988,
      },
    ],
    createdBy: [
      "Michael McDowell & Larry Wilson (story)",
      "Tim Burton (director)",
    ],
    broughtToLifeBy: [
      "Michael Keaton",
      "Oscar-winning makeup by Ve Neill’s team",
    ],
    lore: "A vulgar “bio-exorcist” ghost summoned by saying his name three times, hired by dead newlyweds to scare the living out of their house.",
    funFact:
      "Keaton is on screen for only about 17 minutes and improvised much of the role. The 2024 sequel earned roughly $450M.",
    look: {
      pieces: [
        "Black-and-white striped suit",
        "Wild green-tinged hair",
        "Moldy skin makeup",
      ],
    },
    images: [
      {
        file: "beetlejuice.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fbeetlejuice.b325f09cc9.webp?alt=media",
        width: 1400,
        height: 1112,
      },
    ],
    shops: [
      { shop: "halloweencostumes", search: "Beetlejuice" },
      { shop: "spirithalloween", search: "Beetlejuice" },
      { shop: "amazon", search: "Beetlejuice costume" },
    ],
  },
  {
    rank: 11,
    slug: "dracula",
    name: "Dracula",
    trending: false,
    films: [
      {
        title: "Dracula",
        year: 1931,
      },
    ],
    createdBy: ["Bram Stoker (1897 novel)", "Tod Browning (director)"],
    broughtToLifeBy: ["Bela Lugosi", "Universal Pictures"],
    lore: "The aristocratic Transylvanian vampire who moves to England to feed. Lugosi’s accent and slow, hypnotic delivery defined the look and sound of movie vampires.",
    funFact:
      "Lugosi never bared fangs on screen: Christopher Lee’s Dracula (Hammer, 1958) made them famous, and Gary Oldman (Coppola, 1992) built on the legend. Lugosi was reportedly buried in one of his Dracula capes.",
    look: {
      pieces: [
        "Black cape with tall collar",
        "Widow’s-peak slicked hair",
        "Medallion",
        "Fangs",
      ],
    },
    images: [
      {
        file: "dracula.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fdracula.7907be6c54.webp?alt=media",
        width: 1400,
        height: 1393,
      },
    ],
    shops: [
      { shop: "halloweencostumes", search: "Dracula" },
      { shop: "amazon", search: "Dracula costume" },
    ],
  },
  {
    rank: 12,
    slug: "frankensteins-monster",
    name: "Frankenstein’s Monster",
    trending: false,
    films: [
      {
        title: "Frankenstein",
        year: 1931,
      },
    ],
    createdBy: ["Mary Shelley (1818 novel)", "James Whale (director)"],
    broughtToLifeBy: ["Boris Karloff", "Makeup by Jack Pierce"],
    lore: "A creature stitched together and reanimated by Victor Frankenstein, then abandoned by his creator.",
    funFact:
      "Pierce’s flat head and neck bolts took hours to apply each day. In Shelley’s novel the creature is articulate and unnamed. Guillermo del Toro’s Netflix version (2025) starred Jacob Elordi.",
    look: {
      pieces: [
        "Green skin",
        "Flat-top head",
        "Neck bolts",
        "Stitched scars",
        "Too-small jacket",
      ],
    },
    images: [
      {
        file: "frankensteins-monster.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Ffrankensteins-monster.fdeab66749.webp?alt=media",
        width: 938,
        height: 1400,
      },
    ],
    shops: [
      { shop: "halloweencostumes", search: "Frankenstein" },
      { shop: "spirithalloween", search: "Frankenstein" },
      { shop: "amazon", search: "Frankenstein costume" },
    ],
  },
  {
    rank: 13,
    slug: "bride-of-frankenstein",
    name: "Bride of Frankenstein",
    trending: false,
    films: [
      {
        title: "Bride of Frankenstein",
        year: 1935,
      },
    ],
    createdBy: ["James Whale (director)", "Mary Shelley (source)"],
    broughtToLifeBy: ["Elsa Lanchester", "Makeup by Jack Pierce"],
    lore: "A female creature built as a mate for the Monster, who rejects him with a hiss.",
    funFact:
      "She is on screen for only a few minutes, and Lanchester modeled her hiss on swans. She also played Mary Shelley in the prologue. The 2026 film The Bride! put her back in the conversation.",
    look: {
      pieces: [
        "White gown and wrappings",
        "Towering black wig with white lightning streaks",
      ],
    },
    images: [
      {
        file: "bride-of-frankenstein.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fbride-of-frankenstein.07e6563291.webp?alt=media",
        width: 759,
        height: 1400,
      },
    ],
    shops: [
      { shop: "halloweencostumes", search: "Bride of Frankenstein" },
      { shop: "spirithalloween", search: "Bride of Frankenstein" },
      { shop: "amazon", search: "Bride of Frankenstein costume" },
    ],
  },
  {
    rank: 14,
    slug: "sam",
    name: "Sam",
    trending: false,
    films: [
      {
        title: "Trick ’r Treat",
        year: 2007,
      },
    ],
    createdBy: ["Michael Dougherty"],
    broughtToLifeBy: [
      "Costumed performer",
      "The character first appeared in Dougherty’s 1996 animated short Season’s Greetings",
    ],
    lore: "A pint-sized trick-or-treater in orange footie pajamas who enforces Halloween’s traditions, and punishes anyone who breaks them.",
    funFact:
      "Warner Bros. shelved the film and released it direct-to-DVD in 2009. It became a cult Halloween ritual anyway.",
    look: {
      pieces: [
        "Burlap sack mask with stitched face",
        "Orange footie pajamas",
        "Lollipop",
      ],
    },
    images: [
      {
        file: "sam.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fsam.da48edba95.webp?alt=media",
        width: 580,
        height: 1400,
      },
    ],
    shops: [
      { shop: "halloweencostumes", search: "Trick r Treat Sam" },
      { shop: "spirithalloween", search: "Trick r Treat Sam" },
      { shop: "amazon", search: "Trick r Treat Sam costume" },
    ],
  },
  {
    rank: 15,
    slug: "leatherface",
    name: "Leatherface",
    trending: false,
    films: [
      {
        title: "The Texas Chain Saw Massacre",
        year: 1974,
      },
    ],
    createdBy: ["Tobe Hooper & Kim Henkel"],
    broughtToLifeBy: ["Gunnar Hansen"],
    lore: "A hulking cannibal family member who wears masks stitched from human skin and kills with a chainsaw. The film loosely echoes the crimes of Ed Gein.",
    funFact:
      "Hooper reportedly got the chainsaw idea while stuck in a crowded hardware store at Christmas. Hansen, born in Iceland, filmed through a brutal Texas summer in the same costume.",
    look: {
      pieces: ["Skin mask", "Blood-stained butcher’s apron", "Chainsaw"],
    },
    images: [
      {
        file: "leatherface.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fleatherface.a4fa1859e6.webp?alt=media",
        width: 725,
        height: 1400,
      },
    ],
    shops: [
      { shop: "halloweencostumes", search: "Leatherface" },
      { shop: "spirithalloween", search: "Leatherface" },
      { shop: "amazon", search: "Leatherface costume" },
    ],
  },
  {
    rank: 16,
    slug: "pinhead",
    name: "Pinhead",
    trending: false,
    films: [
      {
        title: "Hellraiser",
        year: 1987,
      },
    ],
    createdBy: [
      "Clive Barker (novella The Hellbound Heart, 1986; also directed)",
    ],
    broughtToLifeBy: [
      "Doug Bradley (first eight films)",
      "Jamie Clayton in the 2022 reboot",
    ],
    lore: "Leader of the Cenobites, extradimensional beings summoned by solving the Lament Configuration puzzle box, who blur pain and pleasure.",
    funFact:
      "Barker called the character the Hell Priest; “Pinhead” was a crew nickname he disliked. The character has only a few minutes of screen time in the first film.",
    look: {
      pieces: [
        "Black leather cassock",
        "Pale skin",
        "Nails in a grid pattern on the head",
      ],
    },
    images: [
      {
        file: "pinhead.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fpinhead.5b8be422c1.webp?alt=media",
        width: 808,
        height: 1080,
      },
    ],
    shops: [
      { shop: "halloweencostumes", search: "Pinhead" },
      { shop: "spirithalloween", search: "Pinhead" },
      { shop: "amazon", search: "Pinhead costume" },
    ],
  },
  {
    rank: 17,
    slug: "jigsaw-and-billy-the-puppet",
    name: "Jigsaw & Billy the Puppet",
    trending: false,
    films: [
      {
        title: "Saw",
        year: 2004,
      },
    ],
    createdBy: ["James Wan & Leigh Whannell"],
    broughtToLifeBy: ["Tobin Bell as John Kramer"],
    lore: "A terminally ill engineer who tests people’s will to live with elaborate traps, and communicates through a tricycle-riding puppet named Billy.",
    funFact:
      "Saw was shot in about 18 days for roughly $1.2M and earned over $100M. Billy started as a puppet built for the short film that got the feature funded.",
    look: {
      pieces: ["Red robe and black cape (Jigsaw)"],
      alternative:
        "Or Billy: white face, red spiral cheeks, black suit and bow tie.",
    },
    garment: {
      file: "jigsaw-and-billy-the-puppet-costume.png",
      url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fjigsaw-and-billy-the-puppet-costume.ffea03a351.webp?alt=media",
      width: 933,
      height: 1400,
    },
    images: [
      {
        file: "jigsaw-and-billy-the-puppet.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fjigsaw-and-billy-the-puppet.74b918903b.webp?alt=media",
        width: 1400,
        height: 1188,
      },
    ],
    shops: [
      { shop: "halloweencostumes", search: "Billy the Puppet" },
      { shop: "spirithalloween", search: "Billy the Puppet" },
      { shop: "amazon", search: "Billy the Puppet costume" },
    ],
  },
  {
    rank: 18,
    slug: "m3gan",
    name: "M3GAN",
    trending: true,
    films: [
      {
        title: "M3GAN",
        year: 2022,
      },
    ],
    createdBy: [
      "Akela Cooper (writer)",
      "Story by Cooper & James Wan",
      "Gerard Johnstone (director)",
    ],
    broughtToLifeBy: [
      "Amie Donald (body/dance)",
      "Jenna Davis (voice)",
      "Animatronics",
    ],
    lore: "A lifelike AI companion doll programmed to protect a young girl, and her guardian takes that mission far too literally.",
    funFact:
      "Her stiff hallway dance went viral before release. The film cost about $12M and earned roughly $180M; M3GAN 2.0 followed in 2025.",
    look: {
      pieces: ["Bob wig", "Pale porcelain makeup", "Plaid dress", "Mary Janes"],
    },
    images: [
      {
        file: "m3gan.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fm3gan.84430d14e7.webp?alt=media",
        width: 1240,
        height: 1400,
      },
    ],
    shops: [
      { shop: "halloweencostumes", search: "M3GAN" },
      { shop: "spirithalloween", search: "M3GAN" },
      { shop: "amazon", search: "M3GAN costume" },
    ],
  },
  {
    rank: 19,
    slug: "samara-morgan",
    name: "Samara Morgan",
    trending: false,
    films: [
      {
        title: "The Ring",
        year: 2002,
      },
    ],
    createdBy: ["Kōji Suzuki (novel)", "Gore Verbinski (director)"],
    broughtToLifeBy: ["Daveigh Chase"],
    lore: "A girl with a terrifying psychic gift who was thrown down a well. Anyone who watches her cursed videotape dies in seven days.",
    funFact:
      "The Ring earned about $249M worldwide and kicked off Hollywood’s remakes of J-horror. Samara crawling out of the TV is one of the most imitated scares ever.",
    look: {
      pieces: [
        "White nightgown",
        "Long wet black hair over face",
        "Pale makeup",
      ],
    },
    images: [
      {
        file: "samara-morgan.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fsamara-morgan.86630ad3e5.webp?alt=media",
        width: 581,
        height: 1080,
      },
    ],
    shops: [
      { shop: "spirithalloween", search: "Lady of the Ring" },
      { shop: "amazon", search: "Samara costume" },
    ],
  },
  {
    rank: 20,
    slug: "the-nun-valak",
    name: "The Nun (Valak)",
    trending: false,
    films: [
      {
        title: "The Conjuring 2",
        year: 2016,
      },
      {
        title: "The Nun",
        year: 2018,
      },
    ],
    createdBy: [
      "James Wan (Conjuring universe)",
      "Inspired by Lorraine Warren’s case files",
    ],
    broughtToLifeBy: ["Bonnie Aarons"],
    lore: "The demon Valak, who appears in a nun’s habit and stalks the Warrens, and whose backstory leads to a Romanian abbey.",
    funFact:
      "The Nun earned about $365M, then the biggest Conjuring-universe hit. Aarons also played the unforgettable man behind the diner in Mulholland Drive.",
    look: {
      pieces: ["Black habit", "Pale face", "Dark eyes", "Jagged teeth"],
    },
    images: [
      {
        file: "the-nun-valak.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fthe-nun-valak.755bb99b58.webp?alt=media",
        width: 887,
        height: 1400,
      },
    ],
    shops: [
      { shop: "halloweencostumes", search: "horror nun" },
      { shop: "spirithalloween", search: "Valak" },
      { shop: "amazon", search: "The Nun costume" },
    ],
  },
  {
    rank: 21,
    slug: "annabelle",
    name: "Annabelle",
    trending: false,
    films: [
      {
        title: "The Conjuring",
        year: 2013,
      },
    ],
    createdBy: ["James Wan (Conjuring)", "Gary Dauberman (spin-off writer)"],
    broughtToLifeBy: ["Porcelain doll prop", "Spin-off Annabelle (2014)"],
    lore: "A doll said to be a conduit for demonic entities, based on a real object in Ed and Lorraine Warren’s occult museum.",
    funFact:
      "The real Annabelle is a Raggedy Ann doll, not the porcelain doll from the films. Wan and the team made a creepier version for the screen.",
    look: {
      pieces: ["Braided pigtails", "Vintage dress", "Cracked porcelain makeup"],
    },
    images: [
      {
        file: "annabelle.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fannabelle.590b65d71e.webp?alt=media",
        width: 1093,
        height: 1400,
      },
    ],
    shops: [
      { shop: "halloweencostumes", search: "Annabelle" },
      { shop: "spirithalloween", search: "Annabelle" },
      { shop: "amazon", search: "Annabelle costume" },
    ],
  },
  {
    rank: 22,
    slug: "regan-macneil",
    name: "Regan MacNeil",
    trending: false,
    films: [
      {
        title: "The Exorcist",
        year: 1973,
      },
    ],
    createdBy: [
      "William Peter Blatty (novel & screenplay)",
      "William Friedkin (director)",
    ],
    broughtToLifeBy: [
      "Linda Blair",
      "Demon voice by Mercedes McCambridge",
      "Makeup by Dick Smith",
    ],
    lore: "A 12-year-old girl possessed by the demon Pazuzu, and two priests who battle it. Loosely based on a 1949 case.",
    funFact:
      "It was the first horror film nominated for Best Picture and won two Oscars (adapted screenplay, sound).",
    look: {
      pieces: [
        "White nightgown",
        "Matted hair",
        "Green-gray makeup",
        "Fake vomit optional",
      ],
    },
    images: [
      {
        file: "regan-macneil.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fregan-macneil.e65d57415d.webp?alt=media",
        width: 525,
        height: 1400,
      },
    ],
    shops: [
      { shop: "spirithalloween", search: "Regan" },
      { shop: "amazon", search: "Exorcist Regan costume" },
    ],
  },
  {
    rank: 23,
    slug: "carrie-white",
    name: "Carrie White",
    trending: false,
    films: [
      {
        title: "Carrie",
        year: 1976,
      },
    ],
    createdBy: ["Stephen King (1974 debut novel)", "Brian De Palma (director)"],
    broughtToLifeBy: ["Sissy Spacek", "Piper Laurie as her mother"],
    lore: "A bullied, telekinetic teen with a fanatically religious mother whose prom night ends in fire after a bucket of pig’s blood.",
    funFact:
      "King threw the first pages in the trash and his wife Tabitha rescued them. Spacek got an Oscar nomination.",
    look: {
      pieces: ["Pale pink prom dress", "Tiara", "Blood-soaked"],
    },
    images: [
      {
        file: "carrie-white.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fcarrie-white.22edadf7e2.webp?alt=media",
        width: 890,
        height: 1400,
      },
    ],
    shops: [{ shop: "etsy", search: "Carrie White costume" }],
  },
  {
    rank: 24,
    slug: "count-orlok",
    name: "Count Orlok",
    trending: true,
    films: [
      {
        title: "Nosferatu",
        year: 1922,
      },
    ],
    createdBy: ["F. W. Murnau (director)", "Unauthorized Dracula adaptation"],
    broughtToLifeBy: [
      "Max Schreck (1922)",
      "Bill Skarsgård in Robert Eggers’s 2024 remake",
    ],
    lore: "A rat-like vampire who brings plague and death to the German port of Wisborg.",
    funFact:
      "Stoker’s widow sued and a court ordered every print destroyed, but some survived. Schreck’s surname means “fright” in German.",
    look: {
      pieces: [
        "Bald head",
        "Pointed ears",
        "Long claws",
        "Rat-like fangs",
        "Black coat",
      ],
    },
    images: [
      {
        file: "count-orlok.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fcount-orlok.ca5e051930.webp?alt=media",
        width: 899,
        height: 1400,
      },
    ],
    shops: [
      { shop: "halloweencostumes", search: "Nosferatu" },
      { shop: "amazon", search: "Nosferatu costume" },
      { shop: "trickortreatstudios", search: "Nosferatu" },
    ],
  },
  {
    rank: 25,
    slug: "pearl",
    name: "Pearl",
    trending: true,
    films: [
      {
        title: "Pearl",
        year: 2022,
      },
      {
        title: "X",
        year: 2022,
      },
    ],
    createdBy: ["Ti West & Mia Goth (co-writers of Pearl)"],
    broughtToLifeBy: ["Mia Goth"],
    lore: "A 1918 Texas farm girl who dreams of stardom, and whose repressed rage boils over into murder; decades later she returns as the elderly killer in X.",
    funFact:
      "Pearl was shot in secret in New Zealand during the making of X. Its famously long, unbroken closing smile has become a cinema meme.",
    look: {
      pieces: [
        "Blue 1910s farm dress",
        "Blonde braided pin curls",
        "Pitchfork or axe",
      ],
    },
    images: [
      {
        file: "pearl.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fpearl.7502004f1c.webp?alt=media",
        width: 1241,
        height: 1400,
      },
    ],
    shops: [
      { shop: "amazon", search: "Pearl X costume" },
      { shop: "etsy", search: "Pearl Mia Goth costume" },
    ],
  },
  {
    rank: 26,
    slug: "freddy-fazbear",
    name: "Freddy Fazbear",
    trending: true,
    films: [
      {
        title: "Five Nights at Freddy’s",
        year: 2023,
      },
    ],
    createdBy: ["Scott Cawthon (game creator, 2014)", "Emma Tammi (director)"],
    broughtToLifeBy: ["Animatronics built by Jim Henson’s Creature Shop"],
    lore: "The mascot animatronics of a shuttered pizza restaurant, which come alive at night around a security guard.",
    funFact:
      "The film earned nearly $300M on about a $20M budget, and a sequel followed in December 2025.",
    look: {
      pieces: ["Brown bear costume with top hat and bow tie"],
    },
    garment: {
      file: "freddy-fazbear-costume.png",
      url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Ffreddy-fazbear-costume.3eadb7239d.webp?alt=media",
      width: 1065,
      height: 1400,
    },
    images: [
      {
        file: "freddy-fazbear.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Ffreddy-fazbear.b4efd31638.webp?alt=media",
        width: 1066,
        height: 1400,
      },
    ],
    shops: [
      { shop: "halloweencostumes", search: "Freddy Fazbear" },
      { shop: "spirithalloween", search: "Freddy Fazbear" },
      { shop: "amazon", search: "Freddy Fazbear costume" },
    ],
  },
  {
    rank: 27,
    slug: "the-grady-twins",
    name: "The Grady Twins",
    trending: false,
    films: [
      {
        title: "The Shining",
        year: 1980,
      },
    ],
    createdBy: ["Stanley Kubrick (director)", "Stephen King (novel)"],
    broughtToLifeBy: ["Lisa and Louise Burns"],
    lore: "Ghosts of the Overlook Hotel who appear in a corridor and invite young Danny to play forever.",
    funFact:
      "Kubrick was inspired by Diane Arbus’s 1967 photograph Identical Twins. In King’s novel the Grady girls aren’t twins.",
    look: {
      pieces: [
        "Matching pale-blue dresses",
        "White socks",
        "Braids",
        "Blank stares",
      ],
    },
    images: [
      {
        file: "the-grady-twins.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fthe-grady-twins.cdb128e84a.webp?alt=media",
        width: 968,
        height: 1000,
      },
    ],
    shops: [
      { shop: "halloweencostumes", search: "Grady Twins" },
      { shop: "amazon", search: "Grady Twins costume" },
    ],
  },
  {
    rank: 28,
    slug: "jack-torrance",
    name: "Jack Torrance",
    trending: false,
    films: [
      {
        title: "The Shining",
        year: 1980,
      },
    ],
    createdBy: ["Stephen King (novel)", "Stanley Kubrick (director)"],
    broughtToLifeBy: ["Jack Nicholson"],
    lore: "A struggling writer who takes a winter caretaker job at the isolated Overlook Hotel and slowly unravels.",
    funFact:
      "The axe-through-the-door scene reportedly took days; Nicholson, a former volunteer fire marshal, smashed through the doors so fast they had to be replaced with sturdier ones. He improvised the “Here’s Johnny!” line.",
    look: {
      pieces: ["Plaid flannel", "Work jacket", "Prop axe", "Frost or blood"],
    },
    images: [
      {
        file: "jack-torrance.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fjack-torrance.3183418ab4.webp?alt=media",
        width: 780,
        height: 1400,
      },
    ],
    shops: [
      { shop: "amazon", search: "Jack Torrance costume" },
      { shop: "etsy", search: "Jack Torrance costume" },
    ],
  },
  {
    rank: 29,
    slug: "hannibal-lecter",
    name: "Hannibal Lecter",
    trending: false,
    films: [
      {
        title: "The Silence of the Lambs",
        year: 1991,
      },
    ],
    createdBy: [
      "Thomas Harris (created in the 1981 novel Red Dragon)",
      "Jonathan Demme (director)",
    ],
    broughtToLifeBy: ["Anthony Hopkins"],
    lore: "A brilliant, cannibalistic psychiatrist imprisoned in a psychiatric hospital who helps a young FBI trainee catch another killer.",
    funFact:
      "Hopkins won Best Actor with roughly 16 minutes on screen. The film swept the “Big Five” Oscars: Picture, Director, Actor, Actress, and Adapted Screenplay.",
    look: {
      pieces: ["White prison jumpsuit", "Restraint mask"],
      alternative: "Or a sharp suit.",
    },
    images: [
      {
        file: "hannibal-lecter.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fhannibal-lecter.9535d56157.webp?alt=media",
        width: 656,
        height: 1400,
      },
    ],
    shops: [
      { shop: "halloweencostumes", search: "Hannibal Lecter" },
      { shop: "spirithalloween", search: "Hannibal Lecter" },
      { shop: "amazon", search: "Hannibal Lecter costume" },
    ],
  },
  {
    rank: 30,
    slug: "norman-bates",
    name: "Norman Bates",
    trending: false,
    films: [
      {
        title: "Psycho",
        year: 1960,
      },
    ],
    createdBy: ["Robert Bloch (novel)", "Alfred Hitchcock (director)"],
    broughtToLifeBy: ["Anthony Perkins"],
    lore: "The shy, boyish manager of the Bates Motel whose relationship with his mother is not what it seems.",
    funFact:
      "Bloch’s novel was loosely inspired by Ed Gein. The shower-scene score by Bernard Herrmann is all strings, and the “blood” was reportedly chocolate syrup.",
    look: {
      pieces: ["Cardigan", "White shirt", "Boyish hair"],
      alternative: "Or “Mother” in wig and shawl.",
    },
    images: [
      {
        file: "norman-bates.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fnorman-bates.7d4bd0cd79.webp?alt=media",
        width: 742,
        height: 1400,
      },
    ],
    shops: [{ shop: "ebay", search: "Norman Bates Psycho costume" }],
  },
  {
    rank: 31,
    slug: "captain-spaulding",
    name: "Captain Spaulding",
    trending: false,
    films: [
      {
        title: "House of 1000 Corpses",
        year: 2003,
      },
    ],
    createdBy: ["Rob Zombie"],
    broughtToLifeBy: ["Sid Haig"],
    lore: "A garish clown who runs a roadside museum of monsters and murderers and introduces the Firefly family.",
    funFact:
      "Haig was a veteran of 1960s cult films like Spider Baby and Coffy. The film was shelved by Universal for years before Lionsgate released it.",
    look: {
      pieces: [
        "Clown makeup with black-and-white face",
        "Cigar",
        "Cheap wig",
        "Hawaiian shirt",
      ],
    },
    images: [
      {
        file: "captain-spaulding.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fcaptain-spaulding.a723f55238.webp?alt=media",
        width: 1400,
        height: 789,
      },
    ],
    shops: [
      { shop: "halloweencostumes", search: "Captain Spaulding" },
      { shop: "spirithalloween", search: "Captain Spaulding" },
      { shop: "amazon", search: "Captain Spaulding costume" },
    ],
  },
  {
    rank: 32,
    slug: "the-headless-horseman",
    name: "The Headless Horseman",
    trending: false,
    films: [
      {
        title: "Sleepy Hollow",
        year: 1999,
      },
    ],
    createdBy: ["Washington Irving (1820 story)", "Tim Burton (director)"],
    broughtToLifeBy: [
      "Christopher Walken (Hessian with filed teeth)",
      "Stunt work by Ray Park",
    ],
    lore: "A Hessian soldier who lost his head in battle and rides through Sleepy Hollow to claim victims.",
    funFact:
      "The film won the Oscar for Art Direction. Walken wore sharpened false teeth for his brief head-on appearances.",
    look: {
      pieces: ["Black cape", "Hidden head", "Jack-o’-lantern or sword"],
    },
    images: [
      {
        file: "the-headless-horseman.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fthe-headless-horseman.cbe89b409e.webp?alt=media",
        width: 980,
        height: 1400,
      },
    ],
    shops: [
      { shop: "halloweencostumes", search: "Headless Horseman" },
      { shop: "spirithalloween", search: "Headless Horseman" },
      { shop: "amazon", search: "Headless Horseman costume" },
    ],
  },
  {
    rank: 33,
    slug: "candyman",
    name: "Candyman",
    trending: false,
    films: [
      {
        title: "Candyman",
        year: 1992,
      },
    ],
    createdBy: [
      "Clive Barker (short story The Forbidden)",
      "Bernard Rose (director)",
    ],
    broughtToLifeBy: [
      "Tony Todd (1992)",
      "Yahya Abdul-Mateen II in the 2021 film",
    ],
    lore: "The vengeful spirit of Daniel Robitaille, an artist murdered for loving a white woman, summoned by saying his name five times in the mirror.",
    funFact:
      "Real bees were used, and Todd was reportedly stung many times. Jordan Peele co-wrote the 2021 sequel. Todd passed away in November 2024.",
    look: {
      pieces: ["Long leather coat", "Hook hand", "Bee-covered makeup"],
    },
    images: [
      {
        file: "candyman.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fcandyman.8efe0f5315.webp?alt=media",
        width: 1400,
        height: 861,
      },
    ],
    shops: [
      { shop: "etsy", search: "Candyman costume" },
      { shop: "ebay", search: "Candyman costume" },
    ],
  },
  {
    rank: 34,
    slug: "the-babadook",
    name: "The Babadook",
    trending: false,
    films: [
      {
        title: "The Babadook",
        year: 2014,
      },
    ],
    createdBy: ["Jennifer Kent (writer-director)"],
    broughtToLifeBy: [
      "Tim Purcell (performer)",
      "Essie Davis and Noah Wiseman as lead cast",
    ],
    lore: "A pop-up children’s book character who invades the home of a grieving mother and her son, feeding on their grief.",
    funFact:
      "In 2017 the internet adopted Mister Babadook as an LGBTQ+ icon after a Netflix categorization glitch and memes.",
    look: {
      pieces: ["Top hat", "Long black coat", "Claw fingers", "Pale face"],
    },
    images: [
      {
        file: "the-babadook.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fthe-babadook.b53e1349a2.webp?alt=media",
        width: 1174,
        height: 1400,
      },
    ],
    shops: [
      { shop: "halloweencostumes", search: "Babadook" },
      { shop: "etsy", search: "Babadook costume" },
    ],
  },
  {
    rank: 35,
    slug: "pirate-clark",
    name: "Pirate Clark",
    trending: true,
    films: [
      {
        title: "Backrooms",
        year: 2026,
      },
    ],
    createdBy: ["Kane Parsons (writer-director; Kane Pixels YouTube series)"],
    broughtToLifeBy: [
      "Robert Bobroczkyi (performer)",
      "Creature FX by Amazing Ape Productions",
    ],
    lore: "Mild spoiler: a towering, distorted copy of a furniture-store owner in his own pirate-mascot outfit, roaming a dimension of endless yellow rooms.",
    funFact:
      "The film cost about $10M and earned $402.5M worldwide, making it A24’s highest-grossing release. Parsons is the youngest director to top the box office.",
    look: {
      pieces: ["Pirate hat and coat", "Eyepatch", "Stretched proportions"],
    },
    garment: {
      file: "pirate-clark-costume.png",
      url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fpirate-clark-costume.f52c32c50c.webp?alt=media",
      width: 710,
      height: 1254,
    },
    images: [
      {
        file: "pirate-clark.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fpirate-clark.c95c8188cd.webp?alt=media",
        width: 619,
        height: 1400,
      },
    ],
    shops: [
      { shop: "spirithalloween", search: "Captain Clark" },
      { shop: "amazon", search: "Pirate Clark costume" },
    ],
  },
  {
    rank: 36,
    slug: "ash-williams",
    name: "Ash Williams",
    trending: false,
    films: [
      {
        title: "The Evil Dead",
        year: 1981,
      },
      {
        title: "Evil Dead II",
        year: 1987,
      },
    ],
    createdBy: ["Sam Raimi"],
    broughtToLifeBy: ["Bruce Campbell"],
    lore: "A cheerful S-Mart housewares clerk turned demon-hunter who replaces his possessed hand with a chainsaw and wields a “boomstick”.",
    funFact:
      "The first film was shot in a Tennessee cabin for a few hundred thousand dollars. Stephen King’s rave review helped it find distribution.",
    look: {
      pieces: ["Blue button-up shirt", "Chainsaw hand", "Sawed-off shotgun"],
    },
    images: [
      {
        file: "ash-williams.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fash-williams.7b7dcceea3.webp?alt=media",
        width: 1045,
        height: 1400,
      },
    ],
    shops: [
      { shop: "halloweencostumes", search: "Evil Dead Ash" },
      { shop: "amazon", search: "Evil Dead Ash costume" },
    ],
  },
  {
    rank: 37,
    slug: "dani-the-may-queen",
    name: "Dani (the May Queen)",
    trending: false,
    films: [
      {
        title: "Midsommar",
        year: 2019,
      },
    ],
    createdBy: ["Ari Aster (writer-director)"],
    broughtToLifeBy: ["Florence Pugh", "Costume design by Andrea Flesch"],
    lore: "A grieving young woman travels to a Swedish midsummer festival with her partner and ends up crowned May Queen.",
    funFact:
      "The film was shot in Hungary. The flower-covered gown became the defining image of the movie.",
    look: {
      pieces: ["White gown", "Tall flower crown", "Dress covered in blossoms"],
    },
    images: [
      {
        file: "dani-the-may-queen.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fdani-the-may-queen.8bc16993b5.webp?alt=media",
        width: 1400,
        height: 1330,
      },
    ],
    shops: [{ shop: "etsy", search: "Midsommar May Queen costume" }],
  },
  {
    rank: 38,
    slug: "red-and-the-tethered",
    name: "Red & The Tethered",
    trending: false,
    films: [
      {
        title: "Us",
        year: 2019,
      },
    ],
    createdBy: ["Jordan Peele"],
    broughtToLifeBy: [
      "Lupita Nyong’o (Adelaide/Red)",
      "Costumes by Kym Barrett",
    ],
    lore: "Underground doppelgangers who rise up to replace the surface world, each tethered to a person above.",
    funFact:
      "Nyong’o based Red’s voice on spasmodic dysphonia. The film’s Hands Across America imagery nods to a 1986 charity event.",
    look: {
      pieces: ["Red jumpsuit", "Single golden glove", "Gold scissors"],
    },
    images: [
      {
        file: "red-and-the-tethered.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fred-and-the-tethered.0577147a52.webp?alt=media",
        width: 608,
        height: 1400,
      },
    ],
    shops: [
      { shop: "amazon", search: "Us Red jumpsuit costume" },
      { shop: "etsy", search: "Us Tethered costume" },
    ],
  },
  {
    rank: 39,
    slug: "grace-the-bride",
    name: "Grace (the Bride)",
    trending: false,
    films: [
      {
        title: "Ready or Not",
        year: 2019,
      },
    ],
    createdBy: [
      "Guy Busick & R. Christopher Murphy (writers)",
      "Radio Silence (directors)",
    ],
    broughtToLifeBy: ["Samara Weaving"],
    lore: "A new bride is forced to play a deadly game of hide-and-seek by her in-laws on her wedding night.",
    funFact:
      "Radio Silence (Matt Bettinelli-Olpin and Tyler Gillett) later took over the Scream franchise.",
    look: {
      pieces: [
        "Torn, bloodied wedding dress",
        "Yellow sneakers",
        "Bandolier of shotgun shells",
        "Shotgun",
      ],
    },
    images: [
      {
        file: "grace-the-bride.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fgrace-the-bride.01d7c20ed6.webp?alt=media",
        width: 714,
        height: 1400,
      },
    ],
    shops: [
      { shop: "halloweencostumes", search: "bloody bride" },
      { shop: "amazon", search: "bloody bride costume" },
    ],
  },
  {
    rank: 40,
    slug: "lydia-deetz",
    name: "Lydia Deetz",
    trending: false,
    films: [
      {
        title: "Beetlejuice",
        year: 1988,
      },
    ],
    createdBy: ["Tim Burton (director)", "Michael McDowell & Larry Wilson"],
    broughtToLifeBy: ["Winona Ryder"],
    lore: "A goth teen who can see ghosts and befriends the Maitlands, and nearly marries Beetlejuice.",
    funFact:
      "Ryder was around 16 during production. She returned for Beetlejuice Beetlejuice (2024), which features her daughter Astrid played by Jenna Ortega.",
    look: {
      pieces: ["Black dress", "Veil", "Bob haircut"],
      alternative: "Or the red wedding dress.",
    },
    images: [
      {
        file: "lydia-deetz.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Flydia-deetz.7ba7a43c6a.webp?alt=media",
        width: 1400,
        height: 1184,
      },
    ],
    shops: [
      { shop: "halloweencostumes", search: "Lydia Deetz" },
      { shop: "spirithalloween", search: "Lydia Deetz" },
      { shop: "amazon", search: "Lydia Deetz costume" },
    ],
  },
  {
    rank: 41,
    slug: "tiffany-valentine",
    name: "Tiffany Valentine",
    trending: false,
    films: [
      {
        title: "Bride of Chucky",
        year: 1998,
      },
    ],
    createdBy: ["Don Mancini (writer)", "Ronny Yu (director)"],
    broughtToLifeBy: ["Jennifer Tilly (voice and physical role)"],
    lore: "Chucky’s ex-girlfriend Tiffany resurrects him and becomes his doll bride.",
    funFact: "Tilly plays both Tiffany and herself in Seed of Chucky (2004).",
    look: {
      pieces: ["Black leather jacket", "Blonde wig", "Stitched face"],
      alternative: "Or the wedding dress.",
    },
    images: [
      {
        file: "tiffany-valentine.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Ftiffany-valentine.2357860ac5.webp?alt=media",
        width: 1082,
        height: 1080,
      },
    ],
    shops: [
      { shop: "halloweencostumes", search: "Tiffany Bride of Chucky" },
      { shop: "spirithalloween", search: "Tiffany Bride of Chucky" },
      { shop: "amazon", search: "Tiffany Bride of Chucky costume" },
    ],
  },
  {
    rank: 42,
    slug: "the-craft-coven",
    name: "The Craft Coven",
    trending: false,
    films: [
      {
        title: "The Craft",
        year: 1996,
      },
    ],
    createdBy: [
      "Peter Filardi & Andrew Fleming (writers)",
      "Andrew Fleming (director)",
    ],
    broughtToLifeBy: ["Robin Tunney, Fairuza Balk, Neve Campbell, Rachel True"],
    lore: "Four outcast high-school girls dabble in witchcraft and get much more than they bargained for.",
    funFact:
      "Neve Campbell shot The Craft the same year as Scream. The film had a Wiccan consultant, Pat Devin.",
    look: {
      pieces: [
        "Plaid skirts",
        "Black chokers",
        "Dark lipstick",
        "Prop candles",
      ],
    },
    images: [
      {
        file: "the-craft-coven.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fthe-craft-coven.5602284dee.webp?alt=media",
        width: 1400,
        height: 803,
      },
    ],
    shops: [{ shop: "amazon", search: "The Craft costume" }],
  },
  {
    rank: 43,
    slug: "jennifer-check",
    name: "Jennifer Check",
    trending: false,
    films: [
      {
        title: "Jennifer’s Body",
        year: 2009,
      },
    ],
    createdBy: ["Diablo Cody (writer)", "Karyn Kusama (director)"],
    broughtToLifeBy: ["Megan Fox"],
    lore: "A cheerleader is sacrificed by a band in a botched ritual and returns as a boy-eating demon.",
    funFact:
      "It flopped in theaters due to a marketing misfire, then became a feminist cult classic.",
    look: {
      pieces: ["Cheerleader uniform", "Blood", "Dark eye makeup"],
    },
    images: [
      {
        file: "jennifer-check.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fjennifer-check.551968b0d6.webp?alt=media",
        width: 635,
        height: 1400,
      },
    ],
    shops: [
      { shop: "halloweencostumes", search: "Jennifer's Body" },
      { shop: "amazon", search: "Jennifer's Body costume" },
    ],
  },
  {
    rank: 44,
    slug: "frank-the-rabbit",
    name: "Frank the Rabbit",
    trending: false,
    films: [
      {
        title: "Donnie Darko",
        year: 2001,
      },
    ],
    createdBy: ["Richard Kelly"],
    broughtToLifeBy: ["James Duval"],
    lore: "A man in a demonic rabbit suit who appears to Donnie and tells him the world will end in a set number of days.",
    funFact:
      "The film flopped in theaters (released weeks after 9/11) and became a cult DVD classic.",
    look: {
      pieces: ["Gray metal-toothed rabbit mask", "Suit"],
    },
    images: [
      {
        file: "frank-the-rabbit.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Ffrank-the-rabbit.433053ad57.webp?alt=media",
        width: 933,
        height: 1400,
      },
    ],
    shops: [
      { shop: "halloweencostumes", search: "Donnie Darko" },
      { shop: "amazon", search: "Donnie Darko costume" },
    ],
  },
  {
    rank: 45,
    slug: "the-gill-man",
    name: "The Gill-man",
    trending: false,
    films: [
      {
        title: "Creature from the Black Lagoon",
        year: 1954,
      },
    ],
    createdBy: ["Maurice Zimm (story)", "Jack Arnold (director)"],
    broughtToLifeBy: [
      "Ben Chapman (land)",
      "Ricou Browning (water)",
      "Designed by Milicent Patrick",
    ],
    lore: "The last of an amphibious species found in the Amazon, who becomes obsessed with the expedition’s female scientist.",
    funFact:
      "The design was credited to Bud Westmore for decades, but the actual creator was Milicent Patrick, a former Disney animator.",
    look: {
      pieces: ["Green scaled suit with gills", "Webbed hands and feet", "Fin"],
    },
    images: [
      {
        file: "the-gill-man.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fthe-gill-man.ef5efb6691.webp?alt=media",
        width: 1400,
        height: 882,
      },
    ],
    shops: [
      { shop: "spirithalloween", search: "Creature from the Black Lagoon" },
      { shop: "amazon", search: "Creature from the Black Lagoon costume" },
    ],
  },
  {
    rank: 46,
    slug: "the-phantom-of-the-opera",
    name: "The Phantom of the Opera",
    trending: false,
    films: [
      {
        title: "The Phantom of the Opera",
        year: 1925,
      },
    ],
    createdBy: ["Gaston Leroux (1910 novel)", "Rupert Julian (director)"],
    broughtToLifeBy: ["Lon Chaney Sr."],
    lore: "A disfigured composer who lives beneath the Paris Opera and obsesses over a young soprano.",
    funFact:
      "Chaney created his own makeup and kept the unmasked face secret until the premiere, reportedly using wires to hoist his nostrils.",
    look: {
      pieces: ["Black cape", "Opera hat", "Skull-like makeup or half-mask"],
    },
    images: [
      {
        file: "the-phantom-of-the-opera.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fthe-phantom-of-the-opera.8d7f0e20b7.webp?alt=media",
        width: 1089,
        height: 1400,
      },
    ],
    shops: [
      { shop: "amazon", search: "Phantom of the Opera costume" },
      { shop: "etsy", search: "Phantom of the Opera costume" },
    ],
  },
  {
    rank: 47,
    slug: "krampus",
    name: "Krampus",
    trending: false,
    films: [
      {
        title: "Krampus",
        year: 2015,
      },
    ],
    createdBy: ["Michael Dougherty (writer-director)", "Alpine folklore"],
    broughtToLifeBy: ["Practical creature effects"],
    lore: "A horned demon who punishes naughty kids at Christmas, based on the companion of St. Nicholas in Central Europe.",
    funFact:
      "In Alpine countries, Krampus parades take place around December 5. Dougherty also made Trick ’r Treat.",
    look: {
      pieces: ["Horned goat mask", "Fur", "Chains", "Bell"],
    },
    images: [
      {
        file: "krampus.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fkrampus.caa2d13fd7.webp?alt=media",
        width: 495,
        height: 1400,
      },
    ],
    shops: [
      { shop: "halloweencostumes", search: "Krampus" },
      { shop: "spirithalloween", search: "Krampus" },
      { shop: "amazon", search: "Krampus costume" },
    ],
  },
  {
    rank: 48,
    slug: "damien-thorn",
    name: "Damien Thorn",
    trending: false,
    films: [
      {
        title: "The Omen",
        year: 1976,
      },
    ],
    createdBy: ["David Seltzer (writer)", "Richard Donner (director)"],
    broughtToLifeBy: ["Harvey Stephens"],
    lore: "A five-year-old adopted by a US ambassador who turns out to be the Antichrist. Everyone around him meets a grisly end.",
    funFact:
      "Jerry Goldsmith won his only Oscar for the score. The 666 birthmark is one of horror’s most famous details.",
    look: {
      pieces: ["School uniform", "Tricycle", "“666” mark on scalp"],
    },
    images: [
      {
        file: "damien-thorn.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fdamien-thorn.0f41b3ee94.webp?alt=media",
        width: 1111,
        height: 1400,
      },
    ],
    shops: [{ shop: "etsy", search: "The Omen costume" }],
  },
  {
    rank: 49,
    slug: "kayako-saeki",
    name: "Kayako Saeki",
    trending: false,
    films: [
      {
        title: "Ju-On: The Grudge",
        year: 2002,
      },
    ],
    createdBy: ["Takashi Shimizu (writer-director)"],
    broughtToLifeBy: ["Takako Fuji"],
    lore: "A woman murdered by her husband in a jealous rage whose spirit haunts the house and anyone who enters.",
    funFact:
      "Fuji also played Kayako in the American remake The Grudge (2004). Her throat-rattling croak is her signature.",
    look: {
      pieces: ["White dress", "Long black hair", "Pale skin", "Crawling pose"],
    },
    images: [
      {
        file: "kayako-saeki.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fkayako-saeki.64e837473e.webp?alt=media",
        width: 651,
        height: 1400,
      },
    ],
    shops: [{ shop: "amazon", search: "The Grudge costume" }],
  },
  {
    rank: 50,
    slug: "victor-crowley",
    name: "Victor Crowley",
    trending: false,
    films: [
      {
        title: "Hatchet",
        year: 2006,
      },
    ],
    createdBy: ["Adam Green"],
    broughtToLifeBy: ["Kane Hodder"],
    lore: "The deformed ghost of a boy accidentally killed by his father’s hatchet, who haunts Honey Island Swamp in Louisiana.",
    funFact:
      "Hodder also played Jason Voorhees four times. Green pitched it as “old-school American horror”.",
    look: {
      pieces: ["Burlap mask or scarred face", "Torn clothes", "Hatchet"],
    },
    images: [
      {
        file: "victor-crowley.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fvictor-crowley.d128f3c7bc.webp?alt=media",
        width: 920,
        height: 1400,
      },
    ],
    shops: [{ shop: "ebay", search: "Victor Crowley mask" }],
  },
  {
    rank: 51,
    slug: "laurie-strode",
    name: "Laurie Strode",
    trending: false,
    films: [
      {
        title: "Halloween",
        year: 1978,
      },
    ],
    createdBy: ["John Carpenter & Debra Hill"],
    broughtToLifeBy: ["Jamie Lee Curtis"],
    lore: "A bookish babysitter who becomes Michael Myers’s target and the archetype of the “final girl”.",
    funFact:
      "Curtis’s film debut; she is the daughter of Psycho star Janet Leigh. She returned for Halloween (2018) and the sequels.",
    look: {
      pieces: ["Plaid shirt", "Jeans", "Kitchen knife", "’70s hair"],
    },
    images: [
      {
        file: "laurie-strode.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Flaurie-strode.cbd5413367.webp?alt=media",
        width: 930,
        height: 1400,
      },
    ],
    shops: [
      { shop: "etsy", search: "Laurie Strode costume" },
      { shop: "trickortreatstudios", search: "Laurie Strode" },
    ],
  },
  {
    rank: 52,
    slug: "dollface",
    name: "Dollface",
    trending: false,
    films: [
      {
        title: "The Strangers",
        year: 2008,
      },
    ],
    createdBy: ["Bryan Bertino (writer-director)"],
    broughtToLifeBy: [
      "Gemma Ward (Dollface)",
      "Kip Weeks (Man in the Mask)",
      "Laura Margolis (Pin-Up Girl)",
    ],
    lore: "Three masked strangers terrorize a young couple in a remote house.",
    funFact:
      "Bertino drew on a real break-in near his childhood home in which someone knocked and asked if a person was home.",
    look: {
      pieces: ["Burlap or doll-face mask", "Dark clothes", "Axe"],
    },
    images: [
      {
        file: "dollface.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fdollface.25f5496361.webp?alt=media",
        width: 840,
        height: 1400,
      },
      {
        file: "strangers_1.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fstrangers_1.5945bf2075.webp?alt=media",
        width: 861,
        height: 1400,
      },
      {
        file: "strangers_2.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fstrangers_2.7dbd656b9c.webp?alt=media",
        width: 975,
        height: 1400,
      },
    ],
    shops: [
      { shop: "amazon", search: "The Strangers costume" },
      { shop: "etsy", search: "The Strangers Dollface mask" },
    ],
  },
  {
    rank: 53,
    slug: "the-purge-anarchists",
    name: "The Purge Anarchists",
    trending: false,
    films: [
      {
        title: "The Purge",
        year: 2013,
      },
      {
        title: "The Purge: Anarchy",
        year: 2014,
      },
    ],
    createdBy: ["James DeMonaco"],
    broughtToLifeBy: ["Various masked performers"],
    lore: "In a near-future America, all crime is legal for one night each year, and masked killers roam the streets.",
    funFact: "The franchise now spans five films and a TV series.",
    look: {
      pieces: ["Creepy grinning or police-style mask", "Dark hooded clothes"],
    },
    images: [
      {
        file: "the-purge-lady-liberty.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fthe-purge-lady-liberty.5e3059037c.webp?alt=media",
        width: 481,
        height: 1400,
      },
      {
        file: "the-purge-uncle-sam.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fthe-purge-uncle-sam.e0ce8e5da1.webp?alt=media",
        width: 588,
        height: 1400,
      },
    ],
    shops: [
      { shop: "halloweencostumes", search: "The Purge" },
      { shop: "spirithalloween", search: "Purge" },
      { shop: "amazon", search: "The Purge costume" },
    ],
  },
  {
    rank: 54,
    slug: "killer-klowns",
    name: "Killer Klowns",
    trending: false,
    films: [
      {
        title: "Killer Klowns from Outer Space",
        year: 1988,
      },
    ],
    createdBy: ["The Chiodo Brothers (Stephen, Edward, and Charles Chiodo)"],
    broughtToLifeBy: ["Practical suits and puppets"],
    lore: "Alien clowns land in a small town in a circus-tent spaceship and turn people into cotton-candy cocoons.",
    funFact:
      "The Chiodos also made the puppets in Team America: World Police. The film flopped at first and became a cult favorite.",
    look: {
      pieces: [
        "Colorful clown suit",
        "Pointed hat",
        "Mask with fangs",
        "Popcorn gun",
      ],
    },
    images: [
      {
        file: "killer-klowns.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fkiller-klowns.f0063f938d.webp?alt=media",
        width: 983,
        height: 964,
      },
    ],
    shops: [
      { shop: "halloweencostumes", search: "Killer Klowns" },
      { shop: "spirithalloween", search: "Killer Klowns" },
      { shop: "amazon", search: "Killer Klowns costume" },
    ],
  },
  {
    rank: 55,
    slug: "remmick",
    name: "Remmick",
    trending: true,
    films: [
      {
        title: "Sinners",
        year: 2025,
      },
    ],
    createdBy: ["Ryan Coogler (writer-director)"],
    broughtToLifeBy: [
      "Jack O’Connell",
      "Michael B. Jordan as twins Smoke and Stack",
    ],
    lore: "An Irish vampire who arrives at a Mississippi juke joint in 1932, with the Black musical community at his mercy.",
    funFact:
      "Wunmi Mosaku received an Oscar nomination for the film. Universal’s Halloween Horror Nights Hollywood 2026 has a Sinners house. Smoke and Stack are the easier costume.",
    look: {
      pieces: ["1930s period wear", "Vampire makeup and fangs"],
    },
    images: [
      {
        file: "remmick.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fremmick.fe1adbcdd7.webp?alt=media",
        width: 552,
        height: 1400,
      },
    ],
    shops: [{ shop: "etsy", search: "Remmick Sinners" }],
  },
  {
    rank: 56,
    slug: "longlegs",
    name: "Longlegs",
    trending: true,
    films: [
      {
        title: "Longlegs",
        year: 2024,
      },
    ],
    createdBy: ["Osgood “Oz” Perkins (writer-director)"],
    broughtToLifeBy: ["Nicolas Cage", "Prosthetics by Harlow MacFarlane"],
    lore: "A satanic serial killer who leaves coded letters at the scenes of family murders, and the young FBI agent who tracks him.",
    funFact:
      "Perkins is the son of Anthony Perkins (Norman Bates). The film cost about $10M and earned over $120M.",
    look: {
      pieces: [
        "White-face makeup",
        "Long stringy hair",
        "Prosthetic nose and chin",
      ],
    },
    images: [
      {
        file: "longlegs.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Flonglegs.d2bcf992ba.webp?alt=media",
        width: 986,
        height: 1254,
      },
    ],
    shops: [{ shop: "etsy", search: "Longlegs costume" }],
  },
  {
    rank: 57,
    slug: "david",
    name: "David",
    trending: false,
    films: [
      {
        title: "The Lost Boys",
        year: 1987,
      },
    ],
    createdBy: [
      "Janice Fischer, James Jeremias, Jeffrey Boam (writers)",
      "Joel Schumacher (director)",
    ],
    broughtToLifeBy: ["Kiefer Sutherland"],
    lore: "The leader of a vampire biker gang in the fictional town of Santa Carla, a stand-in for Santa Cruz.",
    funFact:
      "Sutherland bleached his hair for the role. The film’s “Sleep all day” tagline is famous.",
    look: {
      pieces: ["Long blond mullet", "Leather duster", "Fangs", "Earring"],
    },
    images: [
      {
        file: "david.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fdavid.f731b2a9a6.webp?alt=media",
        width: 545,
        height: 1400,
      },
    ],
    shops: [
      { shop: "spirithalloween", search: "Lost Boys" },
      { shop: "amazon", search: "Lost Boys David costume" },
    ],
  },
  {
    rank: 58,
    slug: "the-creeper",
    name: "The Creeper",
    trending: false,
    films: [
      {
        title: "Jeepers Creepers",
        year: 2001,
      },
    ],
    createdBy: ["Victor Salva"],
    broughtToLifeBy: ["Jonathan Breck"],
    lore: "A winged, ancient predator that feeds for 23 days every 23rd spring.",
    funFact:
      "It became one of the most popular horror monsters of the 2000s despite the film’s modest budget.",
    look: {
      pieces: ["Wide-brim hat", "Long trench coat", "Wings", "Monster mask"],
    },
    images: [
      {
        file: "the-creeper.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fthe-creeper.4efa6d3450.webp?alt=media",
        width: 1200,
        height: 1239,
      },
    ],
    shops: [
      { shop: "halloweencostumes", search: "Jeepers Creepers" },
      { shop: "spirithalloween", search: "Jeepers Creepers" },
      { shop: "amazon", search: "Jeepers Creepers costume" },
    ],
  },
  {
    rank: 59,
    slug: "stripe-and-gizmo",
    name: "Stripe & Gizmo",
    trending: false,
    films: [
      {
        title: "Gremlins",
        year: 1984,
      },
    ],
    createdBy: ["Chris Columbus (writer)", "Joe Dante (director)"],
    broughtToLifeBy: [
      "Chris Walas (creature effects)",
      "Howie Mandel voiced Gizmo",
    ],
    lore: "A mogwai pet that spawns evil gremlins after breaking three rules: no water, no bright light, no food after midnight.",
    funFact:
      "The dark tone of Gremlins and Temple of Doom helped lead to the PG-13 rating in the US.",
    look: {
      pieces: ["Furry Gizmo suit or green Stripe costume with white mohawk"],
    },
    images: [
      {
        file: "stripe-and-gizmo.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fstripe-and-gizmo.54944db746.webp?alt=media",
        width: 713,
        height: 1400,
      },
    ],
    shops: [
      { shop: "halloweencostumes", search: "Gremlins" },
      { shop: "spirithalloween", search: "Gremlins" },
      { shop: "amazon", search: "Gremlins costume" },
    ],
  },
  {
    rank: 60,
    slug: "dr-frank-n-furter",
    name: "Dr. Frank-N-Furter",
    trending: false,
    films: [
      {
        title: "The Rocky Horror Picture Show",
        year: 1975,
      },
    ],
    createdBy: ["Richard O’Brien (writer)", "Jim Sharman (director)"],
    broughtToLifeBy: ["Tim Curry"],
    lore: "A flamboyant alien scientist who hosts a stranded, naive couple in his castle and unveils his muscle-bound creation.",
    funFact:
      "It has the longest theatrical release in film history and is a musical spoof of B-horror and sci-fi. Curry later played Pennywise in 1990.",
    look: {
      pieces: ["Corset", "Pearls", "Fishnets", "Heels", "Dark makeup"],
    },
    images: [
      {
        file: "dr-frank-n-furter.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fdr-frank-n-furter.d96eb4bcc6.webp?alt=media",
        width: 1033,
        height: 1400,
      },
    ],
    shops: [
      { shop: "halloweencostumes", search: "Rocky Horror" },
      { shop: "amazon", search: "Rocky Horror costume" },
    ],
  },
  {
    rank: 61,
    slug: "annie-wilkes",
    name: "Annie Wilkes",
    trending: false,
    films: [
      {
        title: "Misery",
        year: 1990,
      },
    ],
    createdBy: ["Stephen King (1987 novel)", "Rob Reiner (director)"],
    broughtToLifeBy: ["Kathy Bates"],
    lore: "A former nurse who rescues a novelist after a car crash and then holds him hostage to write a new book.",
    funFact:
      "Bates won the Best Actress Oscar. The “hobbling” scene is among cinema’s most feared.",
    look: {
      pieces: ["Cardigan", "Bun hairstyle", "Sledgehammer"],
    },
    images: [
      {
        file: "annie-wilkes.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fannie-wilkes.cfb709428f.webp?alt=media",
        width: 706,
        height: 1400,
      },
    ],
    shops: [{ shop: "amazon", search: "Annie Wilkes costume" }],
  },
  {
    rank: 62,
    slug: "patrick-bateman",
    name: "Patrick Bateman",
    trending: false,
    films: [
      {
        title: "American Psycho",
        year: 2000,
      },
    ],
    createdBy: ["Bret Easton Ellis (novel)", "Mary Harron (director)"],
    broughtToLifeBy: ["Christian Bale"],
    lore: "A Wall Street yuppie with a morning routine, a killer’s hobby, and a business card obsession.",
    funFact:
      "Bale reportedly modeled Bateman on Tom Cruise’s intense friendliness after watching a talk-show interview.",
    look: {
      pieces: ["Sharp suit", "Slicked hair", "Business card", "Axe"],
    },
    images: [
      {
        file: "patrick-bateman.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fpatrick-bateman.35546f09ce.webp?alt=media",
        width: 438,
        height: 1000,
      },
    ],
    shops: [
      { shop: "halloweencostumes", search: "Yuppie Psycho" },
      { shop: "amazon", search: "American Psycho Patrick Bateman costume" },
    ],
  },
  {
    rank: 63,
    slug: "tarman",
    name: "Tarman",
    trending: false,
    films: [
      {
        title: "Return of the Living Dead",
        year: 1985,
      },
    ],
    createdBy: ["Dan O’Bannon (writer-director)"],
    broughtToLifeBy: ["Allan Trautman"],
    lore: "A zombie preserved in tar who is one of several undead in the film, and one of the first to speak.",
    funFact:
      "This film introduced the idea of zombies craving brains. O’Bannon also wrote Alien.",
    look: {
      pieces: ["Black tar-dripping body suit", "Zombie makeup"],
    },
    images: [
      {
        file: "tarman.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Ftarman.b7a2b9f335.webp?alt=media",
        width: 694,
        height: 1400,
      },
    ],
    shops: [
      { shop: "amazon", search: "Tarman costume" },
      { shop: "etsy", search: "Tarman mask" },
      { shop: "trickortreatstudios", search: "Tarman" },
    ],
  },
  {
    rank: 64,
    slug: "the-zombie",
    name: "The Zombie",
    trending: false,
    films: [
      {
        title: "Night of the Living Dead",
        year: 1968,
      },
    ],
    createdBy: ["George A. Romero & John Russo"],
    broughtToLifeBy: ["Duane Jones as Ben", "Countless extras"],
    lore: "The dead rise in rural Pennsylvania and trap a group in a farmhouse.",
    funFact:
      "The film never uses the word “zombie”; it calls them ghouls. It cost about $114K and fell into the public domain due to a missing copyright notice.",
    look: {
      pieces: ["Torn clothes", "Gray makeup", "Fake blood"],
    },
    images: [
      {
        file: "the-zombie.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fthe-zombie.3769f83e28.webp?alt=media",
        width: 778,
        height: 1400,
      },
    ],
    shops: [
      { shop: "halloweencostumes", search: "Zombie" },
      { shop: "spirithalloween", search: "Zombie" },
      { shop: "amazon", search: "Zombie costume" },
    ],
  },
  {
    rank: 65,
    slug: "the-lipstick-face-demon",
    name: "The Lipstick-Face Demon",
    trending: false,
    films: [
      {
        title: "Insidious",
        year: 2010,
      },
    ],
    createdBy: ["Leigh Whannell (writer)", "James Wan (director)"],
    broughtToLifeBy: ["Joseph Bishara (also composer)"],
    lore: "A red-faced demon who lurks in “the Further” and covets the body of a comatose boy.",
    funFact:
      "The design was reportedly inspired by Darth Maul. The film cost about $1.5M and earned over $100M.",
    look: {
      pieces: ["Red face paint", "Black claws", "Black clothes"],
    },
    images: [
      {
        file: "the-lipstick-face-demon.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fthe-lipstick-face-demon.ae2cb66dca.webp?alt=media",
        width: 882,
        height: 1400,
      },
    ],
    shops: [{ shop: "etsy", search: "Insidious Lipstick Demon mask" }],
  },
  {
    rank: 66,
    slug: "eric-draven",
    name: "Eric Draven",
    trending: false,
    films: [
      {
        title: "The Crow",
        year: 1994,
      },
    ],
    createdBy: ["James O’Barr (comic)", "Alex Proyas (director)"],
    broughtToLifeBy: ["Brandon Lee"],
    lore: "A murdered musician who returns from the dead to avenge himself and his fiancée.",
    funFact:
      "Lee died in a prop-gun accident during filming; the movie was completed with doubles and effects.",
    look: {
      pieces: ["Black clothes", "White face paint with black mouth lines"],
    },
    images: [
      {
        file: "eric-draven.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Feric-draven.f08bf6c547.webp?alt=media",
        width: 1028,
        height: 1230,
      },
    ],
    shops: [
      { shop: "halloweencostumes", search: "The Crow" },
      { shop: "amazon", search: "The Crow costume" },
    ],
  },
  {
    rank: 67,
    slug: "pamela-voorhees",
    name: "Pamela Voorhees",
    trending: false,
    films: [
      {
        title: "Friday the 13th",
        year: 1980,
      },
    ],
    createdBy: ["Victor Miller & Sean S. Cunningham"],
    broughtToLifeBy: ["Betsy Palmer"],
    lore: "A grieving camp cook whose revenge for her son Jason’s drowning drives the original murders.",
    funFact:
      "Palmer reportedly took the role because she needed money to buy a car.",
    look: {
      pieces: ["Blue cable-knit sweater", "Hunting knife"],
    },
    images: [
      {
        file: "pamela-voorhees.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fpamela-voorhees.89a96961c1.webp?alt=media",
        width: 1080,
        height: 1400,
      },
    ],
    shops: [
      { shop: "etsy", search: "Pamela Voorhees costume" },
      { shop: "ebay", search: "Pamela Voorhees sweater" },
    ],
  },
  {
    rank: 68,
    slug: "the-invisible-man",
    name: "The Invisible Man",
    trending: false,
    films: [
      {
        title: "The Invisible Man",
        year: 1933,
      },
    ],
    createdBy: ["H. G. Wells (novel)", "James Whale (director)"],
    broughtToLifeBy: ["Claude Rains", "Effects by John P. Fulton"],
    lore: "A scientist who turns himself invisible and descends into megalomania.",
    funFact:
      "This was Rains’s Hollywood debut, and his face is not shown until the final scene.",
    look: {
      pieces: ["Bandages", "Dark goggles", "Hat", "Overcoat"],
    },
    images: [
      {
        file: "the-invisible-man.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fthe-invisible-man.37d71a6db3.webp?alt=media",
        width: 606,
        height: 1400,
      },
    ],
    shops: [{ shop: "etsy", search: "Invisible Man costume" }],
  },
  {
    rank: 69,
    slug: "sweeney-todd",
    name: "Sweeney Todd",
    trending: false,
    films: [
      {
        title: "Sweeney Todd",
        year: 2007,
      },
    ],
    createdBy: ["Stephen Sondheim (1979 musical)", "Tim Burton (director)"],
    broughtToLifeBy: ["Johnny Depp", "Helena Bonham Carter as Mrs. Lovett"],
    lore: "A vengeful barber who slits customers’ throats, whose partner turns them into meat pies.",
    funFact:
      "The film won the Oscar for Art Direction. The story dates to an 1846 penny dreadful.",
    look: {
      pieces: ["Black coat", "White streak in hair", "Razor"],
    },
    images: [
      {
        file: "sweeney-todd.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fsweeney-todd.ab20f98b98.webp?alt=media",
        width: 900,
        height: 1400,
      },
    ],
    shops: [
      { shop: "halloweencostumes", search: "Sweeney Todd" },
      { shop: "amazon", search: "Sweeney Todd costume" },
    ],
  },
  {
    rank: 70,
    slug: "lestat-de-lioncourt",
    name: "Lestat de Lioncourt",
    trending: false,
    films: [
      {
        title: "Interview with the Vampire",
        year: 1994,
      },
    ],
    createdBy: ["Anne Rice (1976 novel)", "Neil Jordan (director)"],
    broughtToLifeBy: ["Tom Cruise"],
    lore: "A charismatic, cruel vampire who turns Louis in 18th-century New Orleans.",
    funFact:
      "Rice initially objected to Cruise’s casting but later praised his performance.",
    look: {
      pieces: ["Frock coat", "Ruffled cravat", "Blond hair", "Fangs"],
    },
    images: [
      {
        file: "lestat-de-lioncourt.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Flestat-de-lioncourt.f527c32a87.webp?alt=media",
        width: 861,
        height: 1400,
      },
    ],
    shops: [
      { shop: "etsy", search: "Lestat costume" },
      { shop: "ebay", search: "Lestat costume coat" },
    ],
  },
  {
    rank: 71,
    slug: "georgie-denbrough",
    name: "Georgie Denbrough",
    trending: false,
    films: [
      {
        title: "It",
        year: 2017,
      },
    ],
    createdBy: ["Stephen King (1986 novel)"],
    broughtToLifeBy: ["Jackson Robert Scott"],
    lore: "Bill’s younger brother who follows a paper boat into a storm drain and meets Pennywise.",
    funFact:
      "The yellow raincoat and paper boat became an instantly recognizable image.",
    look: {
      pieces: ["Yellow raincoat", "Paper boat", "Rubber boots"],
    },
    images: [
      {
        file: "georgie-denbrough.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fgeorgie-denbrough.0cb8c3f6d8.webp?alt=media",
        width: 689,
        height: 1400,
      },
    ],
    shops: [
      { shop: "spirithalloween", search: "Georgie" },
      { shop: "amazon", search: "Georgie costume" },
    ],
  },
  {
    rank: 72,
    slug: "the-leprechaun",
    name: "The Leprechaun",
    trending: false,
    films: [
      {
        title: "Leprechaun",
        year: 1993,
      },
    ],
    createdBy: ["Mark Jones"],
    broughtToLifeBy: ["Warwick Davis"],
    lore: "A murderous leprechaun who hunts down anyone who steals his gold.",
    funFact:
      "It was Jennifer Aniston’s film debut. The series runs to eight films.",
    look: {
      pieces: ["Green suit and hat", "Red beard", "Gold coins"],
    },
    images: [
      {
        file: "the-leprechaun.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fthe-leprechaun.ef9f824af8.webp?alt=media",
        width: 1080,
        height: 1400,
      },
    ],
    shops: [
      { shop: "halloweencostumes", search: "Leprechaun" },
      { shop: "amazon", search: "Leprechaun costume" },
      { shop: "trickortreatstudios", search: "Leprechaun" },
    ],
  },
  {
    rank: 73,
    slug: "mr-boogie-bughuul",
    name: "Mr. Boogie (Bughuul)",
    trending: false,
    films: [
      {
        title: "Sinister",
        year: 2012,
      },
    ],
    createdBy: ["Scott Derrickson & C. Robert Cargill (writers)"],
    broughtToLifeBy: ["Nick King"],
    lore: "A Babylonian entity who consumes children after they are made to murder their families on film.",
    funFact:
      "The film was inspired by a nightmare co-writer C. Robert Cargill had after watching The Ring.",
    look: {
      pieces: ["Long black hair and coat", "White face"],
    },
    images: [
      {
        file: "mr-boogie-bughuul.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fmr-boogie-bughuul.28261866cf.webp?alt=media",
        width: 662,
        height: 1400,
      },
    ],
    shops: [
      { shop: "amazon", search: "Sinister Bughuul costume" },
      { shop: "etsy", search: "Bughuul mask" },
    ],
  },
  {
    rank: 74,
    slug: "ellen-ripley",
    name: "Ellen Ripley",
    trending: false,
    films: [
      {
        title: "Alien",
        year: 1979,
      },
    ],
    createdBy: [
      "Dan O’Bannon & Ronald Shusett (writers)",
      "Ridley Scott (director)",
    ],
    broughtToLifeBy: ["Sigourney Weaver"],
    lore: "The last survivor of the Nostromo who outsmarts the Xenomorph.",
    funFact:
      "The role was written without a specified gender and became a genre benchmark for the “final girl”.",
    look: {
      pieces: ["Nostromo jumpsuit", "Short hair", "Cat carrier"],
    },
    images: [
      {
        file: "ellen-ripley.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fellen-ripley.1465523fe8.webp?alt=media",
        width: 1060,
        height: 1400,
      },
    ],
    shops: [
      { shop: "halloweencostumes", search: "Ellen Ripley" },
      { shop: "amazon", search: "Ellen Ripley costume" },
    ],
  },
  {
    rank: 75,
    slug: "slappy",
    name: "Slappy",
    trending: false,
    films: [
      {
        title: "Goosebumps",
        year: 2015,
      },
    ],
    createdBy: [
      "R. L. Stine (Night of the Living Dummy, 1993)",
      "Rob Letterman (director)",
    ],
    broughtToLifeBy: ["Jack Black (voice)"],
    lore: "A ventriloquist’s dummy who comes to life and terrorizes a town.",
    funFact: "Jack Black also plays R. L. Stine in the film.",
    look: {
      pieces: ["Ventriloquist dummy outfit and mask"],
    },
    images: [
      {
        file: "slappy.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fslappy.b08773e4e4.webp?alt=media",
        width: 1050,
        height: 1400,
      },
    ],
    shops: [
      { shop: "halloweencostumes", search: "Slappy" },
      { shop: "spirithalloween", search: "Slappy" },
      { shop: "amazon", search: "Slappy costume" },
    ],
  },
  {
    rank: 76,
    slug: "john-carver",
    name: "John Carver",
    trending: true,
    films: [
      {
        title: "Thanksgiving",
        year: 2023,
      },
    ],
    createdBy: ["Eli Roth (director)", "Jeff Rendell"],
    broughtToLifeBy: ["Pilgrim-masked performer"],
    lore: "A killer wearing the mask of the first governor of Plymouth Colony hunts down the residents of a Massachusetts town.",
    funFact:
      "The film grew out of a fake trailer Roth made for Grindhouse (2007).",
    look: {
      pieces: ["Pilgrim hat and mask", "Black clothes", "Axe"],
    },
    images: [
      {
        file: "john-carver.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fjohn-carver.e61b45482f.webp?alt=media",
        width: 721,
        height: 1400,
      },
    ],
    shops: [
      { shop: "amazon", search: "Thanksgiving John Carver costume" },
      { shop: "etsy", search: "John Carver Thanksgiving costume" },
      { shop: "trickortreatstudios", search: "John Carver" },
    ],
  },
  {
    rank: 77,
    slug: "blade",
    name: "Blade",
    trending: false,
    films: [
      {
        title: "Blade",
        year: 1998,
      },
    ],
    createdBy: [
      "Stephen Norrington (director)",
      "Marv Wolfman & Gene Colan (creators of Blade in Marvel comics, 1973)",
    ],
    broughtToLifeBy: ["Wesley Snipes"],
    lore: "A half-vampire vampire hunter at war with the vampires who secretly run the city’s nightlife.",
    funFact:
      "It was one of the first successful Marvel movies, before the MCU.",
    look: {
      pieces: ["Black leather coat", "Sunglasses", "Sword"],
    },
    images: [
      {
        file: "blade.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fblade.44172328cd.webp?alt=media",
        width: 913,
        height: 1315,
      },
    ],
    shops: [
      { shop: "amazon", search: "Blade costume" },
      { shop: "etsy", search: "Blade Wesley Snipes costume" },
    ],
  },
  {
    rank: 78,
    slug: "danny-torrance",
    name: "Danny Torrance",
    trending: false,
    films: [
      {
        title: "The Shining",
        year: 1980,
      },
    ],
    createdBy: ["Stephen King (novel)", "Stanley Kubrick (director)"],
    broughtToLifeBy: ["Danny Lloyd"],
    lore: "A psychic boy who sees terrifying visions in the Overlook Hotel and shares “the shining” with the hotel’s cook, Dick Hallorann.",
    funFact:
      "Lloyd retired from acting and became a biology professor. “REDRUM” is murder reversed.",
    look: {
      pieces: ["Red sweater with Apollo 11 rocket", "Tricycle"],
    },
    images: [
      {
        file: "danny-torrance.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fdanny-torrance.c4b19ed432.webp?alt=media",
        width: 793,
        height: 1085,
      },
    ],
    shops: [
      { shop: "amazon", search: "Danny Torrance costume" },
      { shop: "etsy", search: "Danny Torrance Apollo sweater" },
    ],
  },
  {
    rank: 79,
    slug: "sidney-prescott",
    name: "Sidney Prescott",
    trending: false,
    films: [
      {
        title: "Scream",
        year: 1996,
      },
    ],
    createdBy: ["Kevin Williamson & Wes Craven"],
    broughtToLifeBy: ["Neve Campbell"],
    lore: "A high-school student who survives the Woodsboro killings and becomes Ghostface’s recurring target.",
    funFact:
      "Campbell returned for Scream 7 (2026) after sitting out Scream VI over a pay dispute.",
    look: {
      pieces: ["Casual ’90s outfit", "Denim jacket", "Phone"],
    },
    images: [
      {
        file: "sidney-prescott.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fsidney-prescott.237dad6c0b.webp?alt=media",
        width: 760,
        height: 1400,
      },
    ],
    shops: [
      { shop: "amazon", search: "Sidney Prescott costume" },
      { shop: "etsy", search: "Sidney Prescott costume" },
    ],
  },
  {
    rank: 80,
    slug: "ellen-hutter",
    name: "Ellen Hutter",
    trending: true,
    films: [
      {
        title: "Nosferatu",
        year: 2024,
      },
    ],
    createdBy: ["Robert Eggers (writer-director)"],
    broughtToLifeBy: ["Lily-Rose Depp"],
    lore: "A woman linked to Count Orlok since childhood, whose visions and convulsions warn of his return.",
    funFact:
      "The film earned well over $150M. Its Victorian nightgowns and dead-eyed stare are Halloween favorites.",
    look: {
      pieces: ["Victorian nightgown", "Loose hair", "Pale makeup"],
    },
    images: [
      {
        file: "ellen-hutter.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fellen-hutter.3c5ac539d0.webp?alt=media",
        width: 897,
        height: 1300,
      },
    ],
    shops: [{ shop: "etsy", search: "Ellen Hutter Nosferatu dress" }],
  },
  {
    rank: 81,
    slug: "billy-chapman-killer-santa",
    name: "Billy Chapman (Killer Santa)",
    trending: false,
    films: [
      {
        title: "Silent Night, Deadly Night",
        year: 1984,
      },
    ],
    createdBy: ["Charles E. Sellier Jr. (director)"],
    broughtToLifeBy: ["Robert Brian Wilson"],
    lore: "A young man traumatized by a Santa-suited killer as a child snaps into homicide at Christmas.",
    funFact:
      "TriStar pulled the film from theaters after protests, and Siskel and Ebert condemned it. It became a cult classic.",
    look: {
      pieces: ["Santa suit", "Fake beard", "Axe"],
    },
    images: [
      {
        file: "billy-chapman-killer-santa.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fbilly-chapman-killer-santa.a7ff2864ad.webp?alt=media",
        width: 710,
        height: 1200,
      },
    ],
    shops: [
      { shop: "amazon", search: "bloody killer santa costume" },
      { shop: "etsy", search: "Silent Night Deadly Night costume" },
    ],
  },
  {
    rank: 82,
    slug: "alice",
    name: "Alice",
    trending: false,
    films: [
      {
        title: "Resident Evil",
        year: 2002,
      },
    ],
    createdBy: [
      "Paul W. S. Anderson (writer-director)",
      "Capcom (game series)",
    ],
    broughtToLifeBy: ["Milla Jovovich"],
    lore: "An amnesiac operative fights zombies inside the underground Hive complex.",
    funFact:
      "Alice was created for the film and does not appear in the games. The series has six films.",
    look: {
      pieces: ["Red dress", "Thigh holster", "Boots"],
    },
    images: [
      {
        file: "alice.png",
        url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Falice.7fabc37770.webp?alt=media",
        width: 580,
        height: 1400,
      },
    ],
    shops: [
      { shop: "etsy", search: "Resident Evil Alice costume" },
      { shop: "ebay", search: "Resident Evil Alice costume" },
    ],
  },
]
