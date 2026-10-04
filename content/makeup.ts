// The makeup guides: for each costume, the makeup a visitor does at a
// vanity, step by step, to become the character (owner, 2026-10-03: "no
// light touches"; YouCam's Makeup VTO and Hair Color only, the hair once).
// Each guide was studied from the character (the film and its year, the
// makeup department's look, the costume's own photo) and brought to what
// YouCam's makeup engine renders:
// - face paint as a coat of one color across five kinds of makeup at once
//   (`facePaint`), two coats for an opaque base;
// - shapes from YouCam's pattern catalogs: pointed graphic eyes, drawn doll
//   lashes, a dot on the tip of the nose, painted brows;
// - every strength at full.
// What a makeup engine can't draw (a line through the eye, stitches, blood)
// is the guide's `finish`, said after the steps. Every step is one render
// (one unit) on the picture the step before left. content/makeup.test.ts
// checks every guide against YouCam's schema and these rules.
import {
  blush,
  brows,
  contour,
  facePaint,
  gloss,
  glow,
  hair,
  type Hex,
  highlight,
  lashes,
  liner,
  lipLine,
  lips,
  makeup,
  type MakeupGuide,
  type MakeupStep,
  matte,
  metallic,
  noseTip,
  paler,
  satin,
  shading,
  shadow,
  smooth,
} from "@/lib/makeup"

const BLACK: Hex = "#111111"
const WHITE: Hex = "#FFFFFF"

/**
 * A painted base's second coat: the same paint again over the first, and
 * the brows painted out again (`browColor`) when the first coat did it.
 */
function secondCoat(color: Hex, paint: string, browColor?: Hex): MakeupStep {
  return {
    title: "Second coat",
    howTo: `Pat a second coat of the ${paint} over everything and powder again, until no skin shows through anywhere.`,
    products: [paint, "setting powder"],
    render: browColor
      ? makeup(...facePaint(color), brows(browColor, 100))
      : makeup(...facePaint(color)),
  }
}

/** Each costume's guide, by its slug (content/costumes.ts). */
export const makeupGuides: Record<string, MakeupGuide> = {
  ghostface: {
    look: "Ghostface come to life: a chalk-white face, long black hollow eyes, gray mask folds and a long black mouth.",
    steps: [
      {
        title: "White base",
        howTo:
          "Glue your brows flat, then pat thick white cream paint over the whole face, brows and lips with a damp sponge, and press white powder over it.",
        products: [
          "white cream face paint",
          "white setting powder",
          "glue stick",
        ],
        render: makeup(...facePaint(WHITE), brows(WHITE, 100)),
      },
      secondCoat(WHITE, "white cream face paint", WHITE),
      {
        title: "Long black eyes",
        howTo:
          "Pack black eyeshadow all around each eye, lid to brow and down under it, then paint a thick black almond around the eye with liquid liner.",
        products: ["black eyeshadow", "black liquid eyeliner"],
        render: makeup(
          shadow("1color30", matte(BLACK)),
          liner("Drama51", matte(BLACK))
        ),
      },
      {
        title: "Mask folds",
        howTo:
          "Sponge cool gray into the hollows of the cheeks down to the jaw and in half-moons under the eyes, like the mask’s sagging folds.",
        products: ["gray cream face paint"],
        render: makeup(
          contour("#8A8A88", 100, "TriangleFace5"),
          shading("Bronzer2", "#7E7E7C")
        ),
      },
      {
        title: "Long black mouth",
        howTo:
          "Paint the lips solid black, lined past their edges top and bottom into a long, gaping oval. Two coats.",
        products: ["black lipstick", "black lip liner"],
        render: makeup(
          lips(matte(BLACK), "pouty"),
          lipLine("Large&Full1", BLACK)
        ),
      },
    ],
    finish: "The black hooded robe, the hood up over your hair, and the knife.",
  },
  "michael-myers": {
    look: "Michael Myers: a blank mask-white face, flat gray edges, eyes lost in black shadow, no brows, colorless lips and messy dark-brown hair.",
    steps: [
      {
        title: "Mask-white base",
        howTo:
          "Glue your brows flat, then pat an off-white cream paint over the whole face, brows and lips, and press white powder over it.",
        products: [
          "white cream face paint",
          "white setting powder",
          "glue stick",
        ],
        render: makeup(...facePaint("#EDE9E2"), brows("#E4DED4", 100)),
      },
      secondCoat("#EDE9E2", "white cream face paint", "#E4DED4"),
      {
        title: "Flat gray edges",
        howTo:
          "Sponge a soft gray along the hairline, down the sides of the nose and around the jaw, so the face looks molded and flat.",
        products: ["gray cream face paint"],
        render: makeup(
          contour("#9A958C", 100, "OvalFace6"),
          shading("Bronzer3", "#8F8A82")
        ),
      },
      {
        title: "Eyes lost in shadow",
        howTo:
          "Pack a brown-black eyeshadow all around each eye, lid to brow and under, until the eyes sink into the dark like the mask’s eyeholes.",
        products: ["black eyeshadow", "black kohl eyeliner"],
        render: makeup(
          shadow("1color30", matte("#1C1714")),
          liner("FullRim7", matte("#15110E"))
        ),
      },
      {
        title: "Colorless lips",
        howTo:
          "Cover the lips with the white paint, then a pale gray-beige lipstick, so the mouth has no color at all.",
        products: ["nude lipstick"],
        render: makeup(lips(matte("#CFC6BC")), lipLine("Natural1", "#B8AEA2")),
      },
      {
        title: "Dark-brown hair",
        howTo:
          "Color your hair a dull dark brown with temporary hair color and rough it up with your fingers.",
        products: ["dark brown hair color spray"],
        render: hair("#3B2A1E", 100, 15),
      },
    ],
    finish: "Navy coveralls and a plastic kitchen knife.",
  },
  "nikki-freaky-nikki-freeman": {
    look: "Freaky Nikki: clammy pale skin, a fevered flush, red raw eyes ringed in smeared mascara, bitten red lips and wild black hair.",
    steps: [
      {
        title: "Clammy pale skin",
        howTo:
          "Pat on a foundation three shades lighter than your skin, all over the face and lips, so you look sleepless and sick.",
        products: ["light foundation", "translucent setting powder"],
        render: makeup(paler(3)),
      },
      {
        title: "Fevered flush",
        howTo:
          "Blend a hot red blush high and wide across both cheeks, and dab a balm on the cheekbones so the skin looks sweaty.",
        products: ["red cream blush", "clear lip balm"],
        render: makeup(blush("Round2", "#D2394A"), glow("#FFF1EA")),
      },
      {
        title: "Red raw eyes",
        howTo:
          "Press a dull red-brown over the lids and a sore red all along under the eyes, as if you had been crying for hours.",
        products: ["red eyeshadow", "brown eyeshadow"],
        render: makeup(shadow("2colors25", matte("#8C3A3A"), matte("#C2404A"))),
      },
      {
        title: "Smeared mascara",
        howTo:
          "Pile on black mascara top and bottom, then smudge black kohl all around the eyes with your fingertip and drag it out at the corners.",
        products: ["black mascara", "black kohl eyeliner"],
        render: makeup(
          liner("PandaSmudge11", matte(BLACK)),
          lashes("Upper&Lower1")
        ),
      },
      {
        title: "Messy brows",
        howTo:
          "Brush your brows up the wrong way and fill them in dark and heavy with a pencil.",
        products: ["dark brow pencil"],
        render: makeup(
          brows("#1C1612", 100, {
            name: "Original5",
            thickness: 30,
            definition: 40,
          })
        ),
      },
      {
        title: "Bitten red lips",
        howTo:
          "Paint a deep red lipstick on hard, then smear it past one corner of the mouth with your thumb, as if you bit your lip.",
        products: ["deep red lipstick", "red lip liner"],
        render: makeup(
          lips(matte("#A0101E")),
          lipLine("Wider1", "#7A0A14", 100, 100, 15)
        ),
      },
      {
        title: "Black hair",
        howTo:
          "Color your hair glossy black with temporary color, then tousle it until it looks like you slept in it.",
        products: ["black hair color spray"],
        render: hair("#121212", 100, 35),
      },
    ],
    finish:
      "Smear fake blood from your hairline down one side of your face and around your neck, and let it dry in streaks.",
  },
  "art-the-clown": {
    look: "Art the Clown: a chalk-white face, black pointed eyes under thin high brows, a black nose and black lips.",
    steps: [
      {
        title: "White base",
        howTo:
          "Glue your brows flat, then pat thick white cream paint over the whole face, brows and lips with a damp sponge, and press white powder over it.",
        products: [
          "white cream face paint",
          "white setting powder",
          "glue stick",
        ],
        render: makeup(...facePaint(WHITE), brows(WHITE, 100)),
      },
      secondCoat(WHITE, "white cream face paint", WHITE),
      {
        title: "Black pointed eyes",
        howTo:
          "Pack black eyeshadow all around each eye, then paint thick black wings out from the top and bottom lash lines into sharp points.",
        products: ["black eyeshadow", "black liquid eyeliner"],
        render: makeup(
          shadow("1color30", matte(BLACK)),
          liner("Drama8", matte(BLACK))
        ),
      },
      {
        title: "Thin high brows",
        howTo:
          "Draw a thin black arch high above each eye with a liquid liner, swept up at the end for that raised, mocking look.",
        products: ["black liquid eyeliner"],
        render: makeup(
          brows(BLACK, 100, {
            name: "Drama4",
            curvature: 60,
            thickness: -40,
            definition: 100,
          })
        ),
      },
      {
        title: "Black nose",
        howTo: "Paint the tip of your nose solid black in a round dot.",
        products: ["black cream face paint"],
        render: makeup(noseTip(BLACK)),
      },
      {
        title: "Black lips",
        howTo:
          "Paint the lips solid matte black, lined a little past their edges. Two coats, then touch up the black nose.",
        products: ["black lipstick", "black lip liner"],
        render: makeup(
          lips(matte(BLACK), "plump"),
          lipLine("Large&Full1", BLACK),
          noseTip(BLACK)
        ),
      },
    ],
    finish:
      "Slick your hair back off your face. The black-and-white clown suit with black pompoms, and a tiny black hat.",
  },
  pennywise: {
    look: "Pennywise: a chalk-white face, red-rimmed eyes, a red nose, a red heart mouth and curly orange hair.",
    steps: [
      {
        title: "White base",
        howTo:
          "Glue your brows flat, then pat thick white cream paint over the whole face, brows and lips with a damp sponge, and press white powder over it.",
        products: [
          "white cream face paint",
          "white setting powder",
          "glue stick",
        ],
        render: makeup(...facePaint(WHITE), brows(WHITE, 100)),
      },
      secondCoat(WHITE, "white cream face paint", WHITE),
      {
        title: "Red eye rims",
        howTo:
          "Pack a deep red-brown over the lids and a bright red all under the eyes, then line the lashes top and bottom in dark red.",
        products: ["red eyeshadow", "dark red eyeliner"],
        render: makeup(
          shadow("2colors25", matte("#6E1A16"), matte("#C41A1A")),
          liner("FullRim7", matte("#4A0A0A"))
        ),
      },
      {
        title: "Red nose",
        howTo:
          "Paint the tip of your nose with a round dot of bright red cream paint and set it with a little red powder.",
        products: ["red cream face paint"],
        render: makeup(noseTip("#D10F1F")),
      },
      {
        title: "Red heart mouth",
        howTo:
          "Paint the lips bright red, the top lip drawn up into two high points. Two coats, then touch up the red nose.",
        products: ["bright red lipstick", "red lip liner"],
        render: makeup(
          lips(matte("#C8102E"), "heart-shaped"),
          lipLine("Large&Full1", "#A80018"),
          noseTip("#D10F1F")
        ),
      },
      {
        title: "Orange hair",
        howTo:
          "Spray your hair bright orange-red with temporary hair color, all of it, and tease it out wide at the sides.",
        products: ["orange hair color spray"],
        render: hair("#D9481C", 100, 25),
      },
    ],
    finish:
      "With red cream paint, draw a thin line from the forehead down through each eye to the corners of the mouth. The frilly silver clown suit, and a red balloon.",
  },
  "aunt-gladys": {
    look: "Aunt Gladys: caked white pancake, cyan lids, thin drawn-on brows, clown rouge, a smeared ruby mouth and a cheap orange-red bob.",
    steps: [
      {
        title: "Pancake base",
        howTo:
          "Glue your brows flat and cake a white pancake foundation over the face and lips with a sponge, a lot of it, then powder it heavily.",
        products: ["white cream face paint", "setting powder", "glue stick"],
        render: makeup(...facePaint("#F3EEE8"), brows("#EFE8E0", 100)),
      },
      {
        title: "Cyan lids",
        howTo:
          "Sweep a bright cyan-blue eyeshadow from the lashes all the way up to where the brows were, and smudge a navy liner around the eyes.",
        products: ["cyan eyeshadow", "navy eyeliner"],
        render: makeup(
          shadow("1color67", matte("#1FA8D8")),
          liner("FullRim7", matte("#1E2A44"))
        ),
      },
      {
        title: "Drawn-on brows",
        howTo:
          "Draw thin, high, sloppy arches with a brown pencil, higher than your own brows ever were.",
        products: ["brown brow pencil"],
        render: makeup(
          brows("#5A2E1E", 100, {
            name: "Thin1",
            curvature: 70,
            thickness: -60,
            definition: 100,
          })
        ),
      },
      {
        title: "Clown rouge",
        howTo:
          "Rub a hot pink-red rouge in round patches on the apples of the cheeks, too much and too high.",
        products: ["red cream blush"],
        render: makeup(blush("Round2", "#E0566A")),
      },
      {
        title: "Smeared ruby mouth",
        howTo:
          "Paint a bright ruby-red lipstick well past the lip line, top and bottom, and let the edges go ragged.",
        products: ["ruby red lipstick", "red lip liner"],
        render: makeup(
          lips(matte("#B3122E"), "plump"),
          lipLine("Large&Full1", "#9A0E26", 100, 100, 20)
        ),
      },
      {
        title: "Orange-red bob",
        howTo:
          "Color your hair an eye-searing orange-red, push it back off the forehead and let it frizz.",
        products: ["red hair color spray"],
        render: hair("#C8361C", 100, 30),
      },
    ],
    finish:
      "Big green-tinted glasses, a beaded necklace and a purple tracksuit.",
  },
  chucky: {
    look: "Chucky: a smooth plastic doll face, round red cheeks, wide doll eyes with painted lashes, orange brows, rosy lips and orange-red hair.",
    steps: [
      {
        title: "Plastic doll skin",
        howTo:
          "Pat on a matte foundation two shades lighter than your skin over the face and lips and powder it until it looks like smooth plastic.",
        products: ["matte foundation", "translucent setting powder"],
        render: makeup(smooth(60), paler(2)),
      },
      {
        title: "Round red cheeks",
        howTo:
          "Dab a round circle of red-pink cream blush on the apple of each cheek, bold and even, like a painted doll.",
        products: ["red cream blush"],
        render: makeup(blush("Circle2", "#D9443A")),
      },
      {
        title: "Wide doll eyes",
        howTo:
          "Wash a light brown over the lids, then paint spiky doll lashes all around each eye with liquid liner and add false lashes top and bottom.",
        products: [
          "light brown eyeshadow",
          "black liquid eyeliner",
          "false lashes",
        ],
        render: makeup(
          shadow("1color8", matte("#A07A5A")),
          liner("Drama40", matte("#2A1A12")),
          lashes("Upper&Lower1")
        ),
      },
      {
        title: "Orange brows",
        howTo:
          "Fill your brows in with an orange-brown pencil, soft and round.",
        products: ["auburn brow pencil"],
        render: makeup(
          brows("#C25A28", 100, { name: "Original5", thickness: 10 })
        ),
      },
      {
        title: "Rosy lips",
        howTo: "Paint the lips a rosy doll red, kept small and neat.",
        products: ["rosy red lipstick"],
        render: makeup(lips(satin("#C2504E")), lipLine("Natural1", "#A03C3A")),
      },
      {
        title: "Orange-red hair",
        howTo:
          "Color your hair a bright orange-red and rough it into a shaggy mess.",
        products: ["orange hair color spray"],
        render: hair("#C2481E", 100, 30),
      },
    ],
    finish:
      "Dot freckles over your nose with a brown pencil and draw a stitched scar across one cheek. Overalls over a striped shirt.",
  },
  "freddy-krueger": {
    look: "Freddy Krueger: a burned face of raw red and scorched brown, welts on the cheeks, sore red eyes, scorched brows and cracked lips.",
    steps: [
      {
        title: "Burned base",
        howTo:
          "Sponge a raw pinkish-red cream paint over the whole face and lips, uneven, so the skin looks scalded.",
        products: ["red cream face paint", "stipple sponge"],
        render: makeup(...facePaint("#C9786A")),
      },
      {
        title: "Scorched patches",
        howTo:
          "Stipple a dark burnt red-brown over the temples, the middle of the forehead and down into the cheek hollows, in rough patches.",
        products: ["brown cream face paint", "stipple sponge"],
        render: makeup(
          contour("#6E2A22", 100, "HeartFace2"),
          shading("Bronzer1", "#8A3A2E")
        ),
      },
      {
        title: "Raw welts",
        howTo:
          "Dab raw red, pink and purple-brown in patches over the cheekbones with a torn sponge, like blistered skin.",
        products: ["red cream face paint", "purple cream face paint"],
        render: makeup({
          category: "blush",
          pattern: { name: "3colors8" },
          palettes: [matte("#B8323A"), matte("#E07A70"), matte("#7A3A3A")],
        }),
      },
      {
        title: "Sore red eyes",
        howTo:
          "Press a dark brown-red over the lids and a raw red all under the eyes, and line the lashes in dark red.",
        products: ["red eyeshadow", "dark red eyeliner"],
        render: makeup(
          shadow("2colors25", matte("#5A2420"), matte("#A8303A")),
          liner("FullRim7", matte("#3A1410"))
        ),
      },
      {
        title: "Scorched brows",
        howTo:
          "Dab the red-brown paint over your brows so they look burned away.",
        products: ["red cream face paint"],
        render: makeup(brows("#9A5A4A", 100)),
      },
      {
        title: "Cracked lips",
        howTo:
          "Paint the lips a dry brick red and rough the edges with a darker liner so they look cracked.",
        products: ["brick red lipstick", "dark red lip liner"],
        render: makeup(
          lips(matte("#8A3A34")),
          lipLine("Natural1", "#5A2420", 100, 100, 10)
        ),
      },
    ],
    finish:
      "The red-and-green striped sweater, a brown fedora and the bladed glove.",
  },
  "jason-voorhees": {
    look: "Jason’s hockey mask as face paint: a dirty ivory face, black eye holes, red chevrons on the cheeks and lips gone pale.",
    steps: [
      {
        title: "Ivory mask base",
        howTo:
          "Glue your brows flat and pat an ivory cream paint over the whole face, brows and lips, then powder it.",
        products: ["ivory cream face paint", "setting powder", "glue stick"],
        render: makeup(...facePaint("#E8DFC8"), brows("#DDD3BC", 100)),
      },
      secondCoat("#E8DFC8", "ivory cream face paint", "#DDD3BC"),
      {
        title: "Black eye holes",
        howTo:
          "Pack black eyeshadow all around each eye and paint a thick black almond around it with liquid liner, the mask’s dark eye holes.",
        products: ["black eyeshadow", "black liquid eyeliner"],
        render: makeup(
          shadow("1color30", matte("#0E0C0A")),
          liner("Drama51", matte(BLACK))
        ),
      },
      {
        title: "Red chevrons",
        howTo:
          "Paint a red triangle on each cheekbone, its point toward the nose, with red cream paint and sharp edges.",
        products: ["red cream face paint", "flat paint brush"],
        render: makeup(blush("Triangle3", "#B8202A")),
      },
      {
        title: "Grime",
        howTo:
          "Sponge a dirty brown-gray along the hairline, the sides of the nose and the jaw, like an old, scuffed mask.",
        products: ["brown cream face paint", "stipple sponge"],
        render: makeup(
          contour("#8A7A62", 100, "OvalFace6"),
          shading("Bronzer3", "#9A8A70")
        ),
      },
      {
        title: "Pale lips",
        howTo:
          "Cover the lips with the ivory paint and a pale beige lipstick, so the mouth disappears into the mask.",
        products: ["nude lipstick"],
        render: makeup(lips(matte("#CFC3AA")), lipLine("Natural1", "#B0A48A")),
      },
    ],
    finish:
      "Dot the mask’s breathing holes over your forehead and cheeks with a black pencil. A worn work jacket and a machete.",
  },
  beetlejuice: {
    look: "Beetlejuice: gray-green corpse skin, rotting hollows, bruised black sockets, moldy cheeks, gray lips and wild moss-green hair.",
    steps: [
      {
        title: "Corpse base",
        howTo:
          "Pat a gray-green corpse cream paint over the whole face and lips with a damp sponge and dust it with powder, dry and dead.",
        products: ["gray cream face paint", "translucent setting powder"],
        render: makeup(...facePaint("#C3CAB0")),
      },
      {
        title: "Rotting hollows",
        howTo:
          "Sponge mossy gray-green into the hollows of the cheeks, the temples and under the jaw, and purple-gray under the eyes, heavy and uneven.",
        products: ["green cream face paint", "purple cream face paint"],
        render: makeup(
          contour("#4E5A38", 100, "TriangleFace5"),
          shading("Bronzer2", "#5A4A62")
        ),
      },
      {
        title: "Bruised sockets",
        howTo:
          "Pack dark purple-black all over the lids up to the brows, mossy green under the eyes, and smudge black liner into both lash lines.",
        products: [
          "black eyeshadow",
          "purple eyeshadow",
          "black kohl eyeliner",
        ],
        render: makeup(
          shadow("2colors25", matte("#2E1F38"), matte("#4F5A35")),
          liner("PandaSmudge11", matte("#120E14"))
        ),
      },
      {
        title: "Moldy cheeks",
        howTo:
          "Stipple moss green, yellow-green and gray onto the cheekbones with a torn sponge, in rough patches like mildew.",
        products: ["green cream face paint", "stipple sponge"],
        render: makeup({
          category: "blush",
          pattern: { name: "3colors8" },
          palettes: [matte("#6B8E3A"), matte("#A8B83A"), matte("#5A5F4A")],
        }),
      },
      {
        title: "Grubby brows",
        howTo:
          "Brush dark gray-brown paint up through your brows, thick and messy, a little past their ends.",
        products: ["dark brown brow pencil"],
        render: makeup(
          brows("#3A3530", 100, {
            name: "Drama7",
            thickness: 40,
            definition: 30,
          })
        ),
      },
      {
        title: "Dead lips",
        howTo:
          "Paint the lips a gray-green brown and dab a darker line around them with a sponge so the edge looks rough and cracked.",
        products: ["gray lipstick", "dark brown lip liner"],
        render: makeup(
          lips(matte("#6E6E58")),
          lipLine("Natural1", "#4A4636", 100, 100, 20)
        ),
      },
      {
        title: "Moss-green hair",
        howTo:
          "Spray your hair a pale moss green with temporary hair color, patchy, and backcomb it so it sticks up and out everywhere.",
        products: ["green hair color spray"],
        render: hair("#9DB07A", 100, 15),
      },
    ],
    finish: "The black-and-white striped suit, a little crooked.",
  },
  dracula: {
    look: "Dracula, 1931: porcelain-pale skin, knife-sharp cheekbones, hypnotic black-rimmed eyes, high arched brows, blood-red lips and slick black hair.",
    steps: [
      {
        title: "Porcelain base",
        howTo:
          "Pat on a foundation four shades lighter than your skin over the face and lips and powder it matte, cold and bloodless.",
        products: ["porcelain foundation", "translucent setting powder"],
        render: makeup(paler(4)),
      },
      {
        title: "Sharp cheekbones",
        howTo:
          "Carve deep gray-brown shadows under the cheekbones down to the jaw and at the temples, sharp and gaunt.",
        products: ["contour powder"],
        render: makeup(
          contour("#8A6A60", 100, "TriangleFace5"),
          shading("Bronzer5", "#7A5A52")
        ),
      },
      {
        title: "Hypnotic eyes",
        howTo:
          "Press a dark charcoal close around each eye, lid and under, and smudge black kohl into both lash lines for a stare that holds.",
        products: ["charcoal eyeshadow", "black kohl eyeliner"],
        render: makeup(
          shadow("1color23", matte("#3A2A2A")),
          liner("PandaSmudge1", matte(BLACK))
        ),
      },
      {
        title: "High arched brows",
        howTo:
          "Draw your brows black, thick and high in a sharp arch, the tails pointing down.",
        products: ["black brow pencil"],
        render: makeup(
          brows("#151010", 100, {
            name: "HighArch4",
            curvature: 50,
            definition: 100,
          })
        ),
      },
      {
        title: "Blood-red lips",
        howTo: "Paint the lips a deep blood red, matte and sharp-edged.",
        products: ["deep red lipstick", "red lip liner"],
        render: makeup(lips(matte("#7A0A14")), lipLine("Natural1", "#5A0610")),
      },
      {
        title: "Slick black hair",
        howTo:
          "Color your hair glossy black and slick it straight back with gel into a widow’s peak.",
        products: ["black hair color spray", "strong hair gel"],
        render: hair(BLACK, 100, 60),
      },
    ],
    finish: "A high-collared black cape, a medallion and plastic fangs.",
  },
  "frankensteins-monster": {
    look: "Frankenstein’s Monster: dead green-gray skin, gaunt hollows, heavy sunken eyes, thick flat brows, gray-black lips and black hair.",
    steps: [
      {
        title: "Green-gray base",
        howTo:
          "Pat a green-gray cream paint over the whole face and lips with a damp sponge and powder it.",
        products: ["green cream face paint", "setting powder"],
        render: makeup(...facePaint("#9DAA8A")),
      },
      secondCoat("#9DAA8A", "green cream face paint"),
      {
        title: "Gaunt hollows",
        howTo:
          "Sponge a dark green-gray deep into the cheek hollows, the temples and under the jaw, and under the brow bone.",
        products: ["dark green cream face paint"],
        render: makeup(
          contour("#4E5A3E", 100, "TriangleFace5"),
          shading("Bronzer5", "#3E4A32")
        ),
      },
      {
        title: "Heavy sunken eyes",
        howTo:
          "Pack a dark gray-black all around each eye, up to the brow, and line both lash lines dark.",
        products: ["black eyeshadow", "black kohl eyeliner"],
        render: makeup(
          shadow("1color30", matte("#2A2A26")),
          liner("FullRim7", matte("#1A1A16"))
        ),
      },
      {
        title: "Thick flat brows",
        howTo:
          "Fill your brows in black, thick, straight and heavy, as if the forehead were too low.",
        products: ["black brow pencil"],
        render: makeup(
          brows("#141414", 100, {
            name: "Straight2",
            thickness: 60,
            definition: 100,
          })
        ),
      },
      {
        title: "Gray-black lips",
        howTo: "Paint the lips a dark gray-black, flat and matte.",
        products: ["black lipstick"],
        render: makeup(lips(matte("#2E302A")), lipLine("Natural1", "#1A1C18")),
      },
      {
        title: "Black hair",
        howTo:
          "Color your hair flat black and comb it forward into a blunt, square fringe.",
        products: ["black hair color spray"],
        render: hair("#151515", 100, 15),
      },
    ],
    finish:
      "Draw a stitched scar across your forehead with black liner. A jacket a size too small, and heavy boots.",
  },
  "bride-of-frankenstein": {
    look: "The Bride: porcelain skin, sculpted cheekbones, dark smoky eyes with heavy lashes, thin startled brows, oxblood lips and black hair.",
    steps: [
      {
        title: "Porcelain base",
        howTo:
          "Pat a pale porcelain cream paint over the face and lips with a damp sponge and powder it flawless.",
        products: ["pale cream face paint", "translucent setting powder"],
        render: makeup(...facePaint("#F2EEEA")),
      },
      {
        title: "Sculpted cheekbones",
        howTo:
          "Shade under the cheekbones and at the temples with a cool gray-brown, high and sharp, 1930s glamour.",
        products: ["contour powder"],
        render: makeup(
          contour("#8A7E78", 100, "HeartFace3"),
          shading("Bronzer5", "#8A7C74")
        ),
      },
      {
        title: "Smoky eyes",
        howTo:
          "Blend a dark gray from the lashes up to the brow, wing a black liner out sharp and add thick false lashes.",
        products: ["gray eyeshadow", "black liquid eyeliner", "false lashes"],
        render: makeup(
          shadow("1color67", matte("#4A4448")),
          liner("OpenWings3", matte(BLACK)),
          lashes("UpperDense1")
        ),
      },
      {
        title: "Startled brows",
        howTo:
          "Draw thin, high, round black arches above your own brows, so you look shocked awake.",
        products: ["black brow pencil"],
        render: makeup(
          brows("#151212", 100, {
            name: "Thin1",
            curvature: 70,
            thickness: -50,
            definition: 100,
          })
        ),
      },
      {
        title: "Oxblood lips",
        howTo:
          "Paint the lips a deep oxblood, with a sharp, pointed cupid’s bow.",
        products: ["oxblood lipstick", "dark red lip liner"],
        render: makeup(
          lips(matte("#4A0E16"), "heart-shaped"),
          lipLine("Rosebud1", "#3A0A10")
        ),
      },
      {
        title: "Black hair",
        howTo: "Color your hair jet black, all of it.",
        products: ["black hair color spray"],
        render: hair(BLACK, 100, 40),
      },
    ],
    finish:
      "Backcomb your hair up into a tall cone and spray a white streak up each side. A long white gown.",
  },
  sam: {
    look: "Sam’s sack mask as face paint: burlap brown skin, stitched shadows, round black button eyes and a dark stitched mouth.",
    steps: [
      {
        title: "Burlap base",
        howTo:
          "Glue your brows flat and pat a burlap-brown cream paint over the face, brows and lips with a sponge.",
        products: ["brown cream face paint", "glue stick"],
        render: makeup(...facePaint("#B89A6E"), brows("#B0926A", 100)),
      },
      secondCoat("#B89A6E", "brown cream face paint", "#B0926A"),
      {
        title: "Sack folds",
        howTo:
          "Sponge a dark brown along the hairline, down the sides of the nose and under the jaw, like the folds of the sack.",
        products: ["dark brown cream face paint", "stipple sponge"],
        render: makeup(
          contour("#6E5638", 100, "OvalFace6"),
          shading("Bronzer3", "#7A6040")
        ),
      },
      {
        title: "Button eyes",
        howTo:
          "Paint a round black button around each eye with black paint and liner, filled in solid.",
        products: ["black cream face paint", "black liquid eyeliner"],
        render: makeup(
          shadow("1color23", matte("#1A1410")),
          liner("Drama51", matte("#0E0A08"))
        ),
      },
      {
        title: "Stitched mouth",
        howTo:
          "Paint the lips a dark brown and draw the line of the mouth out past the corners, thin and tight.",
        products: ["brown lipstick", "dark brown lip liner"],
        render: makeup(lips(matte("#4A3A28")), lipLine("Wider1", "#2E2418")),
      },
    ],
    finish:
      "Draw stitches across your lips with a brown pencil. The orange hooded pajamas, and a lollipop.",
  },
  leatherface: {
    look: "Leatherface’s skin mask: sallow leathery skin, dried-out shadows, sunken eyes, smeared blue lids, pink rouge, smudged red lips and dark hair.",
    steps: [
      {
        title: "Leathery base",
        howTo:
          "Sponge a sallow yellow-tan cream paint over the whole face and lips, patchy, like dried skin.",
        products: ["tan cream face paint", "stipple sponge"],
        render: makeup(...facePaint("#C2A47A")),
      },
      {
        title: "Dried shadows",
        howTo:
          "Stipple a dark brown into the temples, the middle of the forehead and the cheek hollows, where the mask shrinks.",
        products: ["brown cream face paint", "stipple sponge"],
        render: makeup(
          contour("#6E5236", 100, "HeartFace2"),
          shading("Bronzer1", "#7A5A3C")
        ),
      },
      {
        title: "Sunken eyes",
        howTo:
          "Pack a dark brown-black all around each eye and smudge it into both lash lines.",
        products: ["dark brown eyeshadow", "black kohl eyeliner"],
        render: makeup(
          shadow("1color30", matte("#2A1C12")),
          liner("FullRim7", matte("#1A120A"))
        ),
      },
      {
        title: "Smeared blue lids",
        howTo:
          "Smear a bright blue eyeshadow over the lids with your finger, sloppily, the way the mask was made up.",
        products: ["blue eyeshadow"],
        render: makeup(shadow("1color8", matte("#3A7AB8"))),
      },
      {
        title: "Pink rouge",
        howTo: "Rub a pink rouge in big patches on both cheeks.",
        products: ["pink cream blush"],
        render: makeup(blush("Round2", "#D07080")),
      },
      {
        title: "Smudged red lips",
        howTo:
          "Paint the lips red and smudge the color past the corners with your thumb.",
        products: ["red lipstick"],
        render: makeup(
          lips(matte("#A8303A")),
          lipLine("Wider1", "#8A2028", 100, 100, 10)
        ),
      },
      {
        title: "Dark hair",
        howTo: "Color your hair a dark, dull brown and tangle it.",
        products: ["dark brown hair color spray"],
        render: hair("#2A1E16", 100, 10),
      },
    ],
    finish: "A butcher’s apron over a shirt and tie, and a toy chainsaw.",
  },
  pinhead: {
    look: "Pinhead: bloodless blue-white skin, blue-gray hollows, black-ringed eyes, no brows and black lips.",
    steps: [
      {
        title: "Blue-white base",
        howTo:
          "Glue your brows flat and pat a cold blue-white cream paint over the whole face, brows and lips, then powder it.",
        products: ["white cream face paint", "setting powder", "glue stick"],
        render: makeup(...facePaint("#E6EAEE"), brows("#E0E4E8", 100)),
      },
      secondCoat("#E6EAEE", "white cream face paint", "#E0E4E8"),
      {
        title: "Blue-gray hollows",
        howTo:
          "Sponge a cold blue-gray into the cheek hollows and the temples and in half-moons under the eyes.",
        products: ["gray cream face paint"],
        render: makeup(
          contour("#6A7A8A", 100, "TriangleFace5"),
          shading("Bronzer2", "#5A6A7A")
        ),
      },
      {
        title: "Black-ringed eyes",
        howTo:
          "Ring each eye close with black eyeshadow, lid and under, and line both lash lines black.",
        products: ["black eyeshadow", "black kohl eyeliner"],
        render: makeup(
          shadow("1color23", matte("#1A1E24")),
          liner("FullRim7", matte("#0E1014"))
        ),
      },
      {
        title: "Black lips",
        howTo: "Paint the lips solid black, matte.",
        products: ["black lipstick"],
        render: makeup(lips(matte("#1A1A1E")), lipLine("Natural1", "#0E0E12")),
      },
    ],
    finish:
      "Slick your hair flat back. Draw a fine grid over your forehead and face with black liner, a silver dot where the lines cross. A long black leather coat.",
  },
  "jigsaw-and-billy-the-puppet": {
    look: "Billy the Puppet: a lacquered white face, round red cheeks, black puppet eyes, painted black brows, red lips and glossy black hair.",
    steps: [
      {
        title: "White base",
        howTo:
          "Pat thick white cream paint over the whole face and lips with a damp sponge, and press white powder over it.",
        products: ["white cream face paint", "white setting powder"],
        render: makeup(...facePaint(WHITE)),
      },
      secondCoat(WHITE, "white cream face paint"),
      {
        title: "Red cheeks",
        howTo:
          "Paint a round red circle on each cheek with red cream paint, solid and sharp.",
        products: ["red cream face paint"],
        render: makeup(blush("Circle2", "#C8101E")),
      },
      {
        title: "Puppet eyes",
        howTo:
          "Paint a round black ring close around each eye, lid and under, filled in solid, like a puppet’s painted eyes.",
        products: ["black cream face paint", "black liquid eyeliner"],
        render: makeup(
          shadow("1color23", matte("#0E0E0E")),
          liner("Drama51", matte("#0A0A0A"))
        ),
      },
      {
        title: "Painted brows",
        howTo: "Paint your brows black, straight and hard-edged.",
        products: ["black brow pencil"],
        render: makeup(
          brows("#0E0E0E", 100, {
            name: "Straight2",
            thickness: 30,
            definition: 100,
          })
        ),
      },
      {
        title: "Red lips",
        howTo: "Paint the lips a bright red, small and neat.",
        products: ["red lipstick"],
        render: makeup(lips(matte("#B0101E")), lipLine("Natural1", "#8A0A16")),
      },
      {
        title: "Glossy black hair",
        howTo: "Color your hair black and comb it flat with a glossy gel.",
        products: ["black hair color spray", "hair gel"],
        render: hair("#0E0E0E", 100, 70),
      },
    ],
    finish:
      "Paint a red spiral over each cheek and a black line down from each corner of the mouth. A black suit and a red bow tie.",
  },
  m3gan: {
    look: "M3GAN: flawless plastic skin, too-perfect contour, painted doll lashes around wide eyes, neat brows, doll cheeks and a peachy pout.",
    steps: [
      {
        title: "Plastic skin",
        howTo:
          "Pat on a matte foundation three shades lighter than your skin and blur it with powder until no pore shows: smooth as a doll.",
        products: ["matte foundation", "blurring powder"],
        render: makeup(smooth(80), paler(3)),
      },
      {
        title: "Too-perfect contour",
        howTo:
          "Shade under the cheekbones and at the temples with a cool taupe, perfectly even on both sides.",
        products: ["contour powder"],
        render: makeup(contour("#9A7A6E", 100, "HeartFace3")),
      },
      {
        title: "Wide doll eyes",
        howTo:
          "Wash a soft taupe over the lids, paint fine doll lashes top and bottom with liquid liner and add false lashes, so the eyes look too big.",
        products: ["taupe eyeshadow", "black liquid eyeliner", "false lashes"],
        render: makeup(
          shadow("1color8", matte("#B08A78")),
          liner("Drama34", matte("#2A1E1A")),
          lashes("Upper&Lower1")
        ),
      },
      {
        title: "Neat brows",
        howTo: "Fill your brows in a soft, perfect arch, both exactly alike.",
        products: ["brown brow pencil"],
        render: makeup(
          brows("#6A4A38", 100, { name: "SoftArch1", definition: 100 })
        ),
      },
      {
        title: "Doll cheeks",
        howTo: "Dab a round peach-pink blush on the apples of the cheeks.",
        products: ["peach cream blush"],
        render: makeup(blush("Circle2", "#E28A86")),
      },
      {
        title: "Peachy pout",
        howTo: "Paint the lips a peachy pink satin, a small pout.",
        products: ["peach pink lipstick"],
        render: makeup(
          lips(satin("#C47A72"), "pouty"),
          lipLine("Rosebud1", "#A8605A")
        ),
      },
      {
        title: "Auburn hair",
        howTo:
          "Color your hair a light auburn-brown and brush it smooth and glossy.",
        products: ["auburn hair color spray"],
        render: hair("#8A5A3C", 100, 50),
      },
    ],
    finish:
      "A gray plaid dress with a big pussy-bow collar, and slow, jerky movements.",
  },
  "samara-morgan": {
    look: "Samara: drowned gray-blue skin, bruised hollows, dark sunken eyes, faded brows, gray cracked lips and long wet black hair.",
    steps: [
      {
        title: "Drowned base",
        howTo:
          "Pat a cold gray-blue cream paint over the face and lips with a damp sponge, so the skin looks long underwater.",
        products: ["gray cream face paint", "setting powder"],
        render: makeup(...facePaint("#C9CDD1")),
      },
      {
        title: "Bruised hollows",
        howTo:
          "Sponge a blue-gray into the cheek hollows down to the jaw and a bruise purple in half-moons under the eyes.",
        products: ["gray cream face paint", "purple cream face paint"],
        render: makeup(
          contour("#6A7078", 100, "TriangleFace5"),
          shading("Bronzer2", "#4E4A5A")
        ),
      },
      {
        title: "Sunken eyes",
        howTo:
          "Pack a purple-black all around each eye and smudge it into both lash lines, so the eyes sink into the skull.",
        products: ["black eyeshadow", "black kohl eyeliner"],
        render: makeup(
          shadow("1color30", matte("#1E1A22")),
          liner("PandaSmudge1", matte("#121014"))
        ),
      },
      {
        title: "Faded brows",
        howTo: "Dab the gray paint over your brows so they almost vanish.",
        products: ["gray cream face paint"],
        render: makeup(brows("#8E9298", 100)),
      },
      {
        title: "Cracked gray lips",
        howTo:
          "Cover the lips with the gray paint and a gray-mauve lipstick, rough at the edges.",
        products: ["gray lipstick"],
        render: makeup(
          lips(matte("#8E8A8C")),
          lipLine("Natural1", "#6E6A6C", 100, 100, 10)
        ),
      },
      {
        title: "Black hair",
        howTo: "Color your hair jet black, all of it.",
        products: ["black hair color spray"],
        render: hair("#0E0E0E", 100, 60),
      },
    ],
    finish:
      "Wet your hair and comb it forward over your face. A white nightgown, dripping.",
  },
  "the-nun-valak": {
    look: "Valak: a corpse-white face, hollow cheeks, deep black sockets and dark gray lips under a black veil.",
    steps: [
      {
        title: "Corpse-white base",
        howTo:
          "Glue your brows flat and pat a corpse-white cream paint over the face, brows and lips, then powder it.",
        products: ["white cream face paint", "setting powder", "glue stick"],
        render: makeup(...facePaint("#ECEAE6"), brows("#E4E2DE", 100)),
      },
      secondCoat("#ECEAE6", "white cream face paint", "#E4E2DE"),
      {
        title: "Hollow cheeks",
        howTo:
          "Sponge a gray deep into the cheek hollows, the temples and under the jaw, so the face looks skeletal.",
        products: ["gray cream face paint"],
        render: makeup(
          contour("#6E6A66", 100, "TriangleFace5"),
          shading("Bronzer5", "#5E5A56")
        ),
      },
      {
        title: "Black sockets",
        howTo:
          "Pack black eyeshadow all around each eye, lid to brow and under, and smudge black kohl heavily into both lash lines.",
        products: ["black eyeshadow", "black kohl eyeliner"],
        render: makeup(
          shadow("1color30", matte("#0E0C0E")),
          liner("PandaSmudge11", matte("#080608"))
        ),
      },
      {
        title: "Dark lips",
        howTo: "Paint the lips a dark charcoal gray, matte.",
        products: ["dark gray lipstick"],
        render: makeup(lips(matte("#3A3436")), lipLine("Natural1", "#241E20")),
      },
    ],
    finish: "A black veil with a white band, pulled over your hair.",
  },
  annabelle: {
    look: "Annabelle: a porcelain doll’s face, sallow sunken shading, dark eyes with painted lashes, thin brows, red cheeks, a small dark red mouth and auburn hair.",
    steps: [
      {
        title: "Porcelain base",
        howTo:
          "Pat an ivory porcelain cream paint over the face and lips with a damp sponge and powder it smooth.",
        products: ["ivory cream face paint", "setting powder"],
        render: makeup(...facePaint("#EDE6DE")),
      },
      {
        title: "Sallow shading",
        howTo:
          "Shade under the cheekbones with a dull gray-brown and in half-moons under the eyes, so the doll looks old and sunken.",
        products: ["gray brown cream face paint"],
        render: makeup(
          contour("#A08A78", 100, "HeartFace3"),
          shading("Bronzer2", "#8A7468")
        ),
      },
      {
        title: "Painted doll eyes",
        howTo:
          "Press a dark brown close around each eye, paint spiky doll lashes all around with liquid liner and add false lashes top and bottom.",
        products: [
          "dark brown eyeshadow",
          "black liquid eyeliner",
          "false lashes",
        ],
        render: makeup(
          shadow("1color23", matte("#3A2A24")),
          liner("Drama40", matte("#1E1410")),
          lashes("Upper&Lower1")
        ),
      },
      {
        title: "Thin brows",
        howTo: "Draw thin, round, painted-on brows with a brown pencil.",
        products: ["brown brow pencil"],
        render: makeup(
          brows("#6A4232", 100, {
            name: "Thin1",
            curvature: 40,
            thickness: -40,
            definition: 100,
          })
        ),
      },
      {
        title: "Red cheeks",
        howTo: "Dab a round red circle on the apple of each cheek.",
        products: ["red cream blush"],
        render: makeup(blush("Circle2", "#B8303A")),
      },
      {
        title: "Small red mouth",
        howTo:
          "Paint a small, dark red mouth inside your lips, like a doll’s painted smile.",
        products: ["dark red lipstick", "red lip liner"],
        render: makeup(
          lips(matte("#8A1E24"), "petal"),
          lipLine("Small1", "#6A141A")
        ),
      },
      {
        title: "Auburn hair",
        howTo: "Color your hair a dark auburn, all of it.",
        products: ["auburn hair color spray"],
        render: hair("#5C3420", 100, 30),
      },
    ],
    finish:
      "Braid your hair into two pigtails and draw thin cracks over one cheek and the forehead with black liner. A white lace dress.",
  },
  "regan-macneil": {
    look: "Possessed Regan: sickly yellow-green skin, bruised purple sockets, raw sores on the cheeks, ragged brows, chapped lips and messy brown hair.",
    steps: [
      {
        title: "Sickly base",
        howTo:
          "Pat a pale yellow-green cream paint over the face and lips with a sponge, so the skin looks sick for days.",
        products: ["green cream face paint", "setting powder"],
        render: makeup(...facePaint("#D4D6B8")),
      },
      {
        title: "Rotting hollows",
        howTo:
          "Sponge a dirty olive into the cheek hollows down to the jaw, and a bruise purple in half-moons under the eyes.",
        products: ["green cream face paint", "purple cream face paint"],
        render: makeup(
          contour("#7A7A50", 100, "TriangleFace5"),
          shading("Bronzer2", "#6A4A5A")
        ),
      },
      {
        title: "Bruised eyes",
        howTo:
          "Press a dark purple over the lids, a red-purple all under the eyes, and smudge black into both lash lines.",
        products: ["purple eyeshadow", "black kohl eyeliner"],
        render: makeup(
          shadow("2colors25", matte("#3A2A3A"), matte("#6A3A4A")),
          liner("PandaSmudge11", matte("#1A1012"))
        ),
      },
      {
        title: "Raw sores",
        howTo:
          "Dab raw red, pink and brown in rough patches over the cheekbones with a torn sponge, like sores.",
        products: ["red cream face paint", "stipple sponge"],
        render: makeup({
          category: "blush",
          pattern: { name: "3colors8" },
          palettes: [matte("#9A3A3A"), matte("#C46A5A"), matte("#7A5A3A")],
        }),
      },
      {
        title: "Ragged brows",
        howTo: "Rough your brows up and dull them with a brown pencil.",
        products: ["brown brow pencil"],
        render: makeup(
          brows("#4A3426", 100, {
            name: "Original5",
            thickness: 20,
            definition: 20,
          })
        ),
      },
      {
        title: "Chapped lips",
        howTo:
          "Paint the lips a dry red-brown and rough the edges with a darker liner so they look split.",
        products: ["brown lipstick", "dark brown lip liner"],
        render: makeup(
          lips(matte("#7A3A30")),
          lipLine("Natural1", "#4A1E18", 100, 100, 0)
        ),
      },
      {
        title: "Messy brown hair",
        howTo: "Color your hair a dull brown and tangle it with your fingers.",
        products: ["brown hair color spray"],
        render: hair("#5A3E2A", 100, 10),
      },
    ],
    finish:
      "Draw thin scratches over the cheeks and forehead with a red-brown pencil. A white nightgown.",
  },
  "carrie-white": {
    look: "Carrie at the prom, then soaked: soft pink prom makeup under a face, brows and hair drowned in blood red.",
    steps: [
      {
        title: "Prom base",
        howTo:
          "Pat on a foundation one shade lighter than your skin for a soft, fair prom-night base.",
        products: ["light foundation"],
        render: makeup(paler(1)),
      },
      {
        title: "Pink prom eyes",
        howTo:
          "Wash a soft pink over the lids, line the upper lashes thinly and coat them with mascara.",
        products: ["pink eyeshadow", "brown eyeliner", "mascara"],
        render: makeup(
          shadow("1color8", matte("#D08A9A")),
          liner("Lower11", matte("#4A3030")),
          lashes("Natural1")
        ),
      },
      {
        title: "Rosy cheeks",
        howTo: "Sweep a rosy pink blush across the cheeks.",
        products: ["pink blush"],
        render: makeup(blush("Round2", "#E08A90")),
      },
      {
        title: "Pink lips",
        howTo: "Paint the lips a soft prom pink.",
        products: ["pink lipstick"],
        render: makeup(lips(satin("#D06A7A")), lipLine("Natural1", "#B0505E")),
      },
      {
        title: "Soaked in blood",
        howTo:
          "Pour thick stage blood over your head and smear it over the whole face, brows and lips, dark and wet, the eyes staring out of it.",
        products: ["stage blood"],
        render: makeup(...facePaint("#8E1216"), brows("#6A0E10", 100)),
      },
      {
        title: "Blood in the hair",
        howTo:
          "Work the stage blood through your hair from the roots down, until all of it is red and clumped.",
        products: ["stage blood"],
        render: hair("#8A1A1A", 100, 50),
      },
    ],
    finish: "A pink satin prom dress, soaked through as well, and a tiara.",
  },
  "count-orlok": {
    look: "Count Orlok: bloodless gray-white skin, a skull’s hollows, deep black sockets, heavy black brows and thin dark lips.",
    steps: [
      {
        title: "Bloodless base",
        howTo:
          "Pat a gray-white cream paint over the face and lips with a damp sponge and powder it dead and dry.",
        products: ["white cream face paint", "setting powder"],
        render: makeup(...facePaint("#E2E0D8")),
      },
      secondCoat("#E2E0D8", "white cream face paint"),
      {
        title: "Skull hollows",
        howTo:
          "Sponge a dark gray deep into the cheek hollows, the temples and under the jaw, until the skull shows through.",
        products: ["gray cream face paint"],
        render: makeup(
          contour("#6A6660", 100, "TriangleFace5"),
          shading("Bronzer5", "#5A5650")
        ),
      },
      {
        title: "Deep sockets",
        howTo:
          "Pack black-brown all around each eye, lid to brow and under, and line both lash lines black.",
        products: ["black eyeshadow", "black kohl eyeliner"],
        render: makeup(
          shadow("1color30", matte("#1A1816")),
          liner("FullRim7", matte("#0E0C0A"))
        ),
      },
      {
        title: "Heavy brows",
        howTo: "Fill your brows black, thick and swept up at the ends.",
        products: ["black brow pencil"],
        render: makeup(
          brows("#141210", 100, {
            name: "Drama7",
            thickness: 40,
            definition: 80,
          })
        ),
      },
      {
        title: "Thin dark lips",
        howTo: "Paint the lips a dark gray-brown, kept thin and small.",
        products: ["dark brown lipstick"],
        render: makeup(lips(matte("#3A3432")), lipLine("Small1", "#241E1C")),
      },
    ],
    finish:
      "Slick your hair flat back. Long false nails, plastic rat fangs and a long black coat buttoned high.",
  },
  pearl: {
    look: "Pearl: a sweet farm-girl face gone wrong: a hot flush, wide staring lashed eyes, soft brows and a big glossy red smile.",
    steps: [
      {
        title: "Fresh farm skin",
        howTo:
          "Pat on a foundation one shade lighter than your skin and leave it a little dewy.",
        products: ["light foundation"],
        render: makeup(paler(1, 100, 40)),
      },
      {
        title: "Hot flush",
        howTo:
          "Blend a bright red-pink blush wide across the cheeks and the nose, too much of it.",
        products: ["red cream blush"],
        render: makeup(blush("Round2", "#E0505A")),
      },
      {
        title: "Wide staring eyes",
        howTo:
          "Ring the eyes in dark brown liner top and bottom and pile on mascara so they look stretched wide open.",
        products: ["brown eyeliner", "black mascara"],
        render: makeup(
          liner("FullRim7", matte("#3A2418")),
          lashes("Upper&Lower1")
        ),
      },
      {
        title: "Soft brows",
        howTo: "Brush your brows up and fill them in softly.",
        products: ["brown brow pencil"],
        render: makeup(brows("#6A4A3A", 100, { name: "Original5" })),
      },
      {
        title: "Big red smile",
        howTo:
          "Paint the lips a glossy bright red, lined past their edges into a big, eager smile.",
        products: ["red lipstick", "red lip liner"],
        render: makeup(
          lips(gloss("#C8101E"), "smile"),
          lipLine("Large&Full1", "#A00A18")
        ),
      },
    ],
    finish:
      "Braid your hair into two plaits. Flick fake blood across your face. Overalls over a short-sleeved shirt, and an axe.",
  },
  "freddy-fazbear": {
    look: "Freddy Fazbear as face paint: a brown fur face, a tan muzzle, dark-rimmed eyes, bushy black brows, a black nose and a brown bear mouth.",
    steps: [
      {
        title: "Brown fur base",
        howTo:
          "Pat a warm brown cream paint over the whole face and lips with a damp sponge.",
        products: ["brown cream face paint", "setting powder"],
        render: makeup(...facePaint("#7A4E2C")),
      },
      secondCoat("#7A4E2C", "brown cream face paint"),
      {
        title: "Tan muzzle",
        howTo:
          "Sponge a light tan under the eyes, down the nose and over the chin for the bear’s lighter muzzle.",
        products: ["tan cream face paint"],
        render: makeup(highlight("#C8A07A")),
      },
      {
        title: "Dark-rimmed eyes",
        howTo:
          "Ring each eye in dark brown-black, close all around, and line both lash lines.",
        products: ["dark brown eyeshadow", "black kohl eyeliner"],
        render: makeup(
          shadow("1color23", matte("#2A1A10")),
          liner("FullRim7", matte("#140A06"))
        ),
      },
      {
        title: "Bushy black brows",
        howTo: "Paint big, bushy black brows, swept up at the ends.",
        products: ["black cream face paint"],
        render: makeup(
          brows(BLACK, 100, { name: "Drama7", thickness: 60, definition: 100 })
        ),
      },
      {
        title: "Black nose",
        howTo: "Paint the tip of your nose black in a round dot.",
        products: ["black cream face paint"],
        render: makeup(noseTip(BLACK)),
      },
      {
        title: "Bear mouth",
        howTo:
          "Paint the lips a dark brown, drawn out wide past the corners, then touch up the black nose.",
        products: ["dark brown lipstick", "dark brown lip liner"],
        render: makeup(
          lips(matte("#4A2E1A")),
          lipLine("Wider1", "#2E1C10"),
          noseTip(BLACK)
        ),
      },
      {
        title: "Brown hair",
        howTo: "Color your hair a warm brown, the fur’s color.",
        products: ["brown hair color spray"],
        render: hair("#6B4423", 100, 20),
      },
    ],
    finish: "A small black top hat and a black bow tie.",
  },
  "the-grady-twins": {
    look: "The Grady twins: ghost-pale skin, gray shadows under blank doll eyes, soft brows, pink cheeks, berry lips and light-brown hair.",
    steps: [
      {
        title: "Ghost-pale base",
        howTo:
          "Pat on a foundation four shades lighter than your skin and powder it flat, like a ghost in a hallway.",
        products: ["porcelain foundation", "translucent setting powder"],
        render: makeup(paler(4)),
      },
      {
        title: "Gray shadows",
        howTo:
          "Sponge a cool gray in half-moons under the eyes and lightly under the cheekbones.",
        products: ["gray cream face paint"],
        render: makeup(
          contour("#9A9098", 100, "HeartFace3"),
          shading("Bronzer2", "#8A8A92")
        ),
      },
      {
        title: "Blank doll eyes",
        howTo:
          "Wash a pale taupe over the lids, draw fine doll lashes top and bottom with liquid liner and add false lashes.",
        products: ["taupe eyeshadow", "black liquid eyeliner", "false lashes"],
        render: makeup(
          shadow("1color8", matte("#B8A8A8")),
          liner("Drama34", matte("#3A3030")),
          lashes("Upper&Lower1")
        ),
      },
      {
        title: "Soft brows",
        howTo: "Fill your brows in soft and light.",
        products: ["light brown brow pencil"],
        render: makeup(brows("#7A5A44", 100, { name: "SoftArch1" })),
      },
      {
        title: "Pink cheeks",
        howTo: "Dab a round pink blush on the apples of the cheeks.",
        products: ["pink blush"],
        render: makeup(blush("Circle2", "#E09098")),
      },
      {
        title: "Berry lips",
        howTo: "Paint the lips a small, satiny berry.",
        products: ["berry lipstick"],
        render: makeup(lips(satin("#A84A5A")), lipLine("Rosebud1", "#8A3A48")),
      },
      {
        title: "Light-brown hair",
        howTo: "Color your hair a light brown, all of it.",
        products: ["light brown hair color spray"],
        render: hair("#7A5A3E", 100, 30),
      },
    ],
    finish:
      "Part your hair to one side with a barrette. Matching pale-blue dresses: best with your twin.",
  },
  "jack-torrance": {
    look: "Jack Torrance, frozen in the maze: frostbitten white-blue skin, icy hollows, red raw eyes, frosted brows, blue lips and frosted hair.",
    steps: [
      {
        title: "Frostbitten base",
        howTo:
          "Pat an icy blue-white cream paint over the face and lips with a damp sponge, cold and dead.",
        products: ["white cream face paint", "setting powder"],
        render: makeup(...facePaint("#E4ECF0")),
      },
      {
        title: "Icy hollows",
        howTo:
          "Sponge a cold blue-gray into the cheek hollows and the temples and in half-moons under the eyes.",
        products: ["blue cream face paint"],
        render: makeup(
          contour("#8AA0B4", 100, "TriangleFace5"),
          shading("Bronzer2", "#7A90A8")
        ),
      },
      {
        title: "Frozen eyes",
        howTo:
          "Press a cold blue-gray over the lids and a raw red all under the eyes, and line them in slate.",
        products: ["blue eyeshadow", "red eyeshadow", "gray eyeliner"],
        render: makeup(
          shadow("2colors25", matte("#9AB0C4"), matte("#B04A50")),
          liner("FullRim7", matte("#5A6A7A"))
        ),
      },
      {
        title: "Frosted brows",
        howTo: "Dab white paint through your brows like frost.",
        products: ["white cream face paint"],
        render: makeup(brows("#E8EEF2", 100)),
      },
      {
        title: "Blue lips",
        howTo: "Paint the lips a cold, frozen blue.",
        products: ["blue lipstick"],
        render: makeup(lips(matte("#6A88A8")), lipLine("Natural1", "#4A6280")),
      },
      {
        title: "Frosted hair",
        howTo: "Spray your hair a frosty white-gray, as if snow froze in it.",
        products: ["white hair color spray"],
        render: hair("#DCE4EA", 100, 20),
      },
    ],
    finish:
      "Dust white powder over your shoulders like frost. A plaid shirt and a red jacket.",
  },
  "hannibal-lecter": {
    look: "Hannibal Lecter: prison-pale skin, hollow cheeks, a cold dark-rimmed stare, groomed brows, thin pale lips and slicked-back hair.",
    steps: [
      {
        title: "Prison-pale base",
        howTo:
          "Pat on a foundation three shades lighter than your skin and powder it matte, a face that hasn’t seen the sun.",
        products: ["light foundation", "translucent setting powder"],
        render: makeup(paler(3)),
      },
      {
        title: "Hollow cheeks",
        howTo:
          "Shade deep under the cheekbones and at the temples with a cool gray-brown, gaunt and still.",
        products: ["contour powder"],
        render: makeup(
          contour("#8A7066", 100, "TriangleFace5"),
          shading("Bronzer5", "#7A6258")
        ),
      },
      {
        title: "Cold stare",
        howTo:
          "Press a muted gray-brown close around each eye and line both lash lines dark, so the eyes never blink.",
        products: ["gray brown eyeshadow", "dark brown eyeliner"],
        render: makeup(
          shadow("1color23", matte("#5A4A4A")),
          liner("FullRim7", matte("#2A2020"))
        ),
      },
      {
        title: "Groomed brows",
        howTo: "Brush your brows straight and fill them in neat.",
        products: ["brow pencil"],
        render: makeup(
          brows("#4A3A32", 100, { name: "Straight2", definition: 100 })
        ),
      },
      {
        title: "Thin pale lips",
        howTo: "Paint the lips a pale, cool nude, kept thin.",
        products: ["nude lipstick"],
        render: makeup(lips(matte("#B8968A")), lipLine("Small1", "#9A7A6E")),
      },
      {
        title: "Slicked hair",
        howTo:
          "Color your hair a dark gray-brown and slick it straight back with gel.",
        products: ["gray hair color spray", "hair gel"],
        render: hair("#4A4440", 100, 60),
      },
    ],
    finish:
      "Smear a little fake blood around the mouth. A white prison jumpsuit and the restraint mask.",
  },
  "norman-bates": {
    look: "Norman as Mother: powdery pale skin, the shadows of age, sunken eyes, thin gray brows, faded rouge, faded rose lips and gray hair.",
    steps: [
      {
        title: "Powdered base",
        howTo:
          "This guide makes you “Mother” rather than Norman. Pat on a foundation four shades lighter than your skin and press a lot of powder over it, old and dry.",
        products: ["porcelain foundation", "translucent setting powder"],
        render: makeup(paler(4)),
      },
      {
        title: "Shadows of age",
        howTo:
          "Shade under the cheekbones and in half-moons under the eyes with a soft gray-brown, so the face sags.",
        products: ["gray brown cream face paint"],
        render: makeup(
          contour("#9A8A80", 100, "HeartFace3"),
          shading("Bronzer2", "#8A7A72")
        ),
      },
      {
        title: "Sunken eyes",
        howTo:
          "Press a muted brown close around each eye and line both lash lines softly.",
        products: ["brown eyeshadow", "brown eyeliner"],
        render: makeup(
          shadow("1color23", matte("#5A4A48")),
          liner("FullRim7", matte("#3A2E2C"))
        ),
      },
      {
        title: "Thin gray brows",
        howTo: "Gray your brows and draw them thin with a gray pencil.",
        products: ["gray brow pencil"],
        render: makeup(
          brows("#8A8480", 100, { name: "Thin1", thickness: -30 })
        ),
      },
      {
        title: "Faded rouge",
        howTo: "Dab a faded pink rouge on the cheeks.",
        products: ["pink blush"],
        render: makeup(blush("Round2", "#D8A0A0")),
      },
      {
        title: "Faded rose lips",
        howTo: "Paint the lips a faded rose, old-fashioned and neat.",
        products: ["rose lipstick"],
        render: makeup(lips(matte("#B07A80")), lipLine("Natural1", "#8A5A60")),
      },
      {
        title: "Gray hair",
        howTo: "Color your hair a soft steel gray, all of it.",
        products: ["gray hair color spray"],
        render: hair("#A8A39C", 100, 20),
      },
    ],
    finish:
      "Pin your hair into a tight bun and wrap a shawl around your shoulders.",
  },
  "captain-spaulding": {
    look: "Captain Spaulding: a clown-white face, blue painted eyes, arched black brows, a red nose, a big smeared red mouth and wild gray-white hair.",
    steps: [
      {
        title: "White base",
        howTo:
          "Pat thick white cream paint over the whole face and lips with a damp sponge, and press white powder over it.",
        products: ["white cream face paint", "white setting powder"],
        render: makeup(...facePaint(WHITE)),
      },
      secondCoat(WHITE, "white cream face paint"),
      {
        title: "Blue clown eyes",
        howTo:
          "Paint a bright blue from the lashes up to the brows and down under the eyes, then wing a navy liner out into points.",
        products: ["blue cream face paint", "navy liquid eyeliner"],
        render: makeup(
          shadow("2colors25", matte("#1E5AC8"), matte("#2A6AD8")),
          liner("Drama8", matte("#0E1A3A"))
        ),
      },
      {
        title: "Arched black brows",
        howTo: "Paint high, sharp black arches over your brows.",
        products: ["black cream face paint"],
        render: makeup(
          brows(BLACK, 100, {
            name: "HighArch4",
            curvature: 60,
            definition: 100,
          })
        ),
      },
      {
        title: "Red nose",
        howTo: "Paint the tip of your nose with a round dot of bright red.",
        products: ["red cream face paint"],
        render: makeup(noseTip("#D0101E")),
      },
      {
        title: "Big red mouth",
        howTo:
          "Paint a big red mouth out past the corners, a little smeared, then touch up the red nose.",
        products: ["red cream face paint", "red lip liner"],
        render: makeup(
          lips(matte("#C8101E"), "smile"),
          lipLine("Wider1", "#A00A18", 100, 100, 15),
          noseTip("#D0101E")
        ),
      },
      {
        title: "Wild gray hair",
        howTo: "Spray your hair a dirty gray-white and tease it out wild.",
        products: ["gray hair color spray"],
        render: hair("#D8D6D0", 100, 15),
      },
    ],
    finish:
      "A stars-and-stripes top hat, a clown shirt and a red bow tie. Yellow your teeth with tooth paint.",
  },
  "the-headless-horseman": {
    look: "The Hessian before he lost his head: deathly pale skin, gaunt shadows, dark-ringed eyes, wild black brows, bloodless lips and wild black hair.",
    steps: [
      {
        title: "Deathly base",
        howTo:
          "Pat on a foundation four shades lighter than your skin and powder it matte and cold.",
        products: ["porcelain foundation", "translucent setting powder"],
        render: makeup(paler(4)),
      },
      {
        title: "Gaunt shadows",
        howTo:
          "Sponge a cold gray deep under the cheekbones, at the temples and under the jaw.",
        products: ["gray cream face paint"],
        render: makeup(
          contour("#6E6A6A", 100, "TriangleFace5"),
          shading("Bronzer5", "#5A5656")
        ),
      },
      {
        title: "Dark-ringed eyes",
        howTo:
          "Pack a black-brown all around each eye and smudge black kohl heavily into both lash lines.",
        products: ["black eyeshadow", "black kohl eyeliner"],
        render: makeup(
          shadow("1color30", matte("#1E1A1C")),
          liner("PandaSmudge11", matte("#0E0C0E"))
        ),
      },
      {
        title: "Wild black brows",
        howTo: "Fill your brows black, thick and wavy.",
        products: ["black brow pencil"],
        render: makeup(
          brows("#101010", 100, { name: "Drama14", thickness: 30 })
        ),
      },
      {
        title: "Bloodless lips",
        howTo: "Cover the lips with a pale gray-nude, bloodless.",
        products: ["nude lipstick"],
        render: makeup(lips(matte("#A89A98")), lipLine("Natural1", "#8A7C7A")),
      },
      {
        title: "Wild black hair",
        howTo: "Color your hair black and tease it into wild spikes.",
        products: ["black hair color spray"],
        render: hair("#101010", 100, 25),
      },
    ],
    finish:
      "Sharp plastic fangs, a black cape and a jack-o’-lantern under your arm.",
  },
  candyman: {
    look: "Candyman: a honey-gold glow, deep bronze sculpting, burnished gold lids, strong brows and deep plum-brown lips.",
    steps: [
      {
        title: "Honey glow",
        howTo:
          "Sweep a gold highlighter over the cheekbones, down the nose and on the chin, so the skin glows like honey.",
        products: ["gold highlighter"],
        render: makeup(glow("#E0A040")),
      },
      {
        title: "Bronze sculpting",
        howTo:
          "Carve a deep bronze under the cheekbones, at the temples and along the jaw.",
        products: ["bronzer"],
        render: makeup(
          contour("#5A3A24", 100, "HeartFace3"),
          shading("Bronzer5", "#6A4428")
        ),
      },
      {
        title: "Gold eyes",
        howTo:
          "Press a metallic gold over the lids, a deep brown into the outer corners, and line the eyes dark.",
        products: ["gold eyeshadow", "brown eyeshadow", "black kohl eyeliner"],
        render: makeup(
          shadow("2colors83", metallic("#C89A3A"), matte("#3A2414")),
          liner("FullRim7", matte("#1A0E08"))
        ),
      },
      {
        title: "Strong brows",
        howTo: "Fill your brows straight, dark and strong.",
        products: ["dark brow pencil"],
        render: makeup(
          brows("#1A120C", 100, {
            name: "Straight2",
            thickness: 30,
            definition: 100,
          })
        ),
      },
      {
        title: "Plum lips",
        howTo: "Paint the lips a deep plum-brown, matte.",
        products: ["plum lipstick"],
        render: makeup(lips(matte("#5A2A2E")), lipLine("Natural1", "#3A1A1C")),
      },
    ],
    finish:
      "A long coat with a fur collar, a toy hook, and toy bees on your collar and lips.",
  },
  "the-babadook": {
    look: "The Babadook: a chalk-white face, black hollow sockets, sunken gray cheeks, a wide black mouth and black hair.",
    steps: [
      {
        title: "White base",
        howTo:
          "Glue your brows flat, then pat thick white cream paint over the whole face, brows and lips, and press white powder over it.",
        products: [
          "white cream face paint",
          "white setting powder",
          "glue stick",
        ],
        render: makeup(...facePaint(WHITE), brows(WHITE, 100)),
      },
      secondCoat(WHITE, "white cream face paint", WHITE),
      {
        title: "Black sockets",
        howTo:
          "Pack black all around each eye, lid to brow and under, and smudge it out wide.",
        products: ["black eyeshadow", "black kohl eyeliner"],
        render: makeup(
          shadow("1color30", matte(BLACK)),
          liner("PandaSmudge11", matte(BLACK))
        ),
      },
      {
        title: "Sunken cheeks",
        howTo:
          "Sponge a gray deep into the cheek hollows, the temples and under the jaw.",
        products: ["gray cream face paint"],
        render: makeup(
          contour("#8A8A8A", 100, "TriangleFace5"),
          shading("Bronzer5", "#7A7A7A")
        ),
      },
      {
        title: "Wide black mouth",
        howTo: "Paint the lips black and draw them out wide past the corners.",
        products: ["black lipstick", "black lip liner"],
        render: makeup(lips(matte(BLACK)), lipLine("Wider1", BLACK)),
      },
      {
        title: "Black hair",
        howTo: "Color your hair black, all of it.",
        products: ["black hair color spray"],
        render: hair(BLACK, 100, 20),
      },
    ],
    finish:
      "Draw jagged white teeth into the black mouth with a white liner. A tall black top hat and a long black coat.",
  },
  "pirate-clark": {
    look: "Pirate Clark: a haunted stare in huge white-rimmed eyes, deep hollows, a scraggly dark beard shadow, heavy brows and a stretched mouth.",
    steps: [
      {
        title: "Haunted hollows",
        howTo:
          "Sponge a dark brown deep under the cheekbones and in heavy bags under the eyes.",
        products: ["dark brown cream face paint"],
        render: makeup(
          contour("#4A3A34", 100, "TriangleFace5"),
          shading("Bronzer2", "#3A2E2A")
        ),
      },
      {
        title: "Bulging eyes",
        howTo:
          "Shade dark close around each eye, then line the inner rims and lash lines with a white pencil so the eyes look huge.",
        products: [
          "dark brown eyeshadow",
          "white eyeliner pencil",
          "false lashes",
        ],
        render: makeup(
          shadow("1color23", matte("#2A2220")),
          liner("FullRim7", matte("#F4F2EE")),
          lashes("Upper&Lower1")
        ),
      },
      {
        title: "Scraggly beard",
        howTo:
          "Stipple a near-black along the jaw, the chin and the edges of the face, like a scraggly beard.",
        products: ["black cream face paint", "stipple sponge"],
        render: makeup(shading("Bronzer3", "#241E1C")),
      },
      {
        title: "Heavy brows",
        howTo: "Fill your brows black, thick and bushy.",
        products: ["black brow pencil"],
        render: makeup(
          brows("#141414", 100, { name: "Drama7", thickness: 50 })
        ),
      },
      {
        title: "Stretched mouth",
        howTo:
          "Paint the lips a dull brown and line them out past the corners, too wide.",
        products: ["brown lipstick", "dark brown lip liner"],
        render: makeup(lips(matte("#6A4A44")), lipLine("Wider1", "#3A2A26")),
      },
      {
        title: "Black hair",
        howTo: "Color your hair black, all of it.",
        products: ["black hair color spray"],
        render: hair("#151515", 100, 20),
      },
    ],
    finish:
      "A tricorn hat with a white feather, a teal shirt, a long beige vest and a purple sash.",
  },
  "ash-williams": {
    look: "Ash after the long night: sweaty pale skin, dirt and grime, bruises, tired red eyes, messy brows, dry lips and dark-brown hair.",
    steps: [
      {
        title: "Sweaty base",
        howTo:
          "Pat on a foundation one shade lighter than your skin and dab balm over it so the skin shines with sweat.",
        products: ["light foundation", "clear lip balm"],
        render: makeup(paler(1, 100, 60)),
      },
      {
        title: "Dirt and grime",
        howTo:
          "Stipple a dirty brown at the temples, the middle of the forehead and the cheek hollows with a torn sponge.",
        products: ["brown cream face paint", "stipple sponge"],
        render: makeup(
          contour("#5A4836", 100, "HeartFace2"),
          shading("Bronzer1", "#6E5A46")
        ),
      },
      {
        title: "Bruises",
        howTo:
          "Dab bruise purple, red-brown and gray on the cheekbones in patches.",
        products: ["bruise wheel"],
        render: makeup({
          category: "blush",
          pattern: { name: "3colors8" },
          palettes: [matte("#6A4A6A"), matte("#8A5A4A"), matte("#4A3A3A")],
        }),
      },
      {
        title: "Tired red eyes",
        howTo:
          "Press a dark brown over the lids and a sore red under the eyes, and smudge brown liner along the lashes.",
        products: ["red eyeshadow", "brown kohl eyeliner"],
        render: makeup(
          shadow("2colors25", matte("#5A4040"), matte("#A84A4A")),
          liner("PandaSmudge1", matte("#2A1E1A"))
        ),
      },
      {
        title: "Messy brows",
        howTo: "Rough your brows up the wrong way.",
        products: ["brow gel"],
        render: makeup(
          brows("#2A1E16", 100, {
            name: "Original5",
            thickness: 20,
            definition: 20,
          })
        ),
      },
      {
        title: "Dry lips",
        howTo: "Dull the lips with a dry nude and rough the edges.",
        products: ["nude lipstick"],
        render: makeup(
          lips(matte("#9A6A60")),
          lipLine("Natural1", "#7A4E46", 100, 100, 10)
        ),
      },
      {
        title: "Dark-brown hair",
        howTo: "Color your hair dark brown and mess it up.",
        products: ["dark brown hair color spray"],
        render: hair("#3A2A1E", 100, 20),
      },
    ],
    finish:
      "Smear fake blood across one cheekbone. A blue shirt with the sleeves rolled up, and a toy chainsaw.",
  },
  "dani-the-may-queen": {
    look: "Dani crowned and crying: a fair base, burning red cheeks, red-rimmed teary eyes, soft blonde brows, bare pink lips and blonde hair.",
    steps: [
      {
        title: "Fair base",
        howTo: "Pat on a foundation one shade lighter than your skin.",
        products: ["light foundation"],
        render: makeup(paler(1)),
      },
      {
        title: "Burning cheeks",
        howTo:
          "Blend a hot red blush across the cheeks and the nose, wide, sunburned from crying in the sun, and dab balm on top for tears.",
        products: ["red cream blush", "clear lip balm"],
        render: makeup(blush("Rectangle7", "#E0606A"), glow("#FFF0E8")),
      },
      {
        title: "Red-rimmed eyes",
        howTo:
          "Press a soft red over the lids and a sore red all under the eyes, and line the lower lashes red-brown.",
        products: ["red eyeshadow", "brown eyeliner"],
        render: makeup(
          shadow("2colors25", matte("#C87A7A"), matte("#D0505A")),
          liner("Lower11", matte("#8A4A4A"))
        ),
      },
      {
        title: "Soft blonde brows",
        howTo: "Brush your brows up and tint them a soft blonde.",
        products: ["blonde brow gel"],
        render: makeup(brows("#B89868", 100, { name: "Original5" })),
      },
      {
        title: "Bare pink lips",
        howTo: "Dab a sheer pink on the lips, bitten-looking.",
        products: ["pink lip tint"],
        render: makeup(lips(matte("#D08080")), lipLine("Natural1", "#B06A6A")),
      },
      {
        title: "Blonde hair",
        howTo: "Color your hair a warm golden blonde.",
        products: ["blonde hair color spray"],
        render: hair("#D8B878", 100, 40),
      },
    ],
    finish: "A tall crown of wildflowers and a white embroidered dress.",
  },
  "red-and-the-tethered": {
    look: "Red: deep hollow shadows, a blank wide stare ringed in black, deep red lips and black hair.",
    steps: [
      {
        title: "Hollow shadows",
        howTo:
          "Sponge a dark brown deep under the cheekbones and in heavy half-moons under the eyes, so the face looks starved.",
        products: ["dark brown cream face paint"],
        render: makeup(
          contour("#4A3A30", 100, "TriangleFace5"),
          shading("Bronzer2", "#3A2C26")
        ),
      },
      {
        title: "Blank wide stare",
        howTo:
          "Ring each eye close in black, top and bottom, and pile on mascara so the eyes look stretched open and never blink.",
        products: ["black eyeshadow", "black kohl eyeliner", "black mascara"],
        render: makeup(
          shadow("1color23", matte("#2A1E1A")),
          liner("FullRim7", matte("#0E0A08")),
          lashes("Upper&Lower1")
        ),
      },
      {
        title: "Deep red lips",
        howTo: "Paint the lips a deep red, the jumpsuit’s red, matte.",
        products: ["deep red lipstick"],
        render: makeup(lips(matte("#7A0E16")), lipLine("Natural1", "#5A0A10")),
      },
      {
        title: "Black hair",
        howTo: "Color your hair black, all of it.",
        products: ["black hair color spray"],
        render: hair("#111111", 100, 20),
      },
    ],
    finish: "A red jumpsuit, one golden glove and toy gold scissors.",
  },
  "grace-the-bride": {
    look: "Grace on her wedding night: a dewy bridal base, soft contour, smoky eyes smeared from running, groomed brows, pink lips and blonde hair.",
    steps: [
      {
        title: "Dewy bridal base",
        howTo:
          "Pat on a foundation one shade lighter than your skin and leave it glowing.",
        products: ["light foundation"],
        render: makeup(paler(1, 100, 60)),
      },
      {
        title: "Soft contour",
        howTo: "Shade softly under the cheekbones and at the temples.",
        products: ["contour powder"],
        render: makeup(contour("#B08A70", 100, "HeartFace3")),
      },
      {
        title: "Smeared smoky eyes",
        howTo:
          "Blend a warm brown over the lids and a dark brown at the corners, then smudge black liner and mascara down under the eyes as if you ran all night.",
        products: ["brown eyeshadow", "black kohl eyeliner", "black mascara"],
        render: makeup(
          shadow("2colors83", matte("#8A6048"), matte("#3A2418")),
          liner("PandaSmudge11", matte("#1E1410")),
          lashes("UpperDense1")
        ),
      },
      {
        title: "Groomed brows",
        howTo: "Fill your brows in a soft, neat arch.",
        products: ["brow pencil"],
        render: makeup(brows("#8A6A48", 100, { name: "SoftArch1" })),
      },
      {
        title: "Pink lips",
        howTo: "Paint the lips a soft bridal pink.",
        products: ["pink lipstick"],
        render: makeup(lips(satin("#C47A80")), lipLine("Natural1", "#A0606A")),
      },
      {
        title: "Blonde hair",
        howTo: "Color your hair a golden blonde.",
        products: ["blonde hair color spray"],
        render: hair("#D9BA82", 100, 40),
      },
    ],
    finish:
      "Smear fake blood across one cheek and the forehead. A torn wedding dress, yellow sneakers, a bandolier of shells and a shotgun.",
  },
  "lydia-deetz": {
    look: "Lydia Deetz: goth-pale skin, gray hollows, dark smudged eyes, strong black brows, dark plum lips and jet-black hair.",
    steps: [
      {
        title: "Goth-pale base",
        howTo:
          "Pat on a foundation four shades lighter than your skin and powder it matte.",
        products: ["porcelain foundation", "translucent setting powder"],
        render: makeup(paler(4)),
      },
      {
        title: "Gray hollows",
        howTo:
          "Shade softly under the cheekbones and in half-moons under the eyes with a cool gray.",
        products: ["gray cream face paint"],
        render: makeup(
          contour("#9A8E90", 100, "HeartFace3"),
          shading("Bronzer2", "#8A7A80")
        ),
      },
      {
        title: "Smudged dark eyes",
        howTo:
          "Blend a smoky gray over the lids, a near-black under the eyes, smudge black kohl all around and add false lashes.",
        products: ["gray eyeshadow", "black kohl eyeliner", "false lashes"],
        render: makeup(
          shadow("2colors25", matte("#5A4A50"), matte("#2A2026")),
          liner("PandaSmudge1", matte(BLACK)),
          lashes("UpperDense1")
        ),
      },
      {
        title: "Strong black brows",
        howTo: "Fill your brows black, straight and strong.",
        products: ["black brow pencil"],
        render: makeup(
          brows(BLACK, 100, {
            name: "Straight2",
            thickness: 30,
            definition: 100,
          })
        ),
      },
      {
        title: "Dark plum lips",
        howTo: "Paint the lips a dark plum, matte.",
        products: ["dark plum lipstick"],
        render: makeup(lips(matte("#4A1E2E")), lipLine("Natural1", "#321420")),
      },
      {
        title: "Jet-black hair",
        howTo: "Color your hair jet black, all of it.",
        products: ["black hair color spray"],
        render: hair("#0E0E0E", 100, 30),
      },
    ],
    finish:
      "Cut or pin your bangs into short spiky points. A black dress and a camera on a strap.",
  },
  "tiffany-valentine": {
    look: "Tiffany the doll: a matte doll face, sculpted cheeks, a plum smoky eye with a sharp wing and big lashes, thin brows, red lips and platinum hair.",
    steps: [
      {
        title: "Matte doll base",
        howTo:
          "Pat on a matte foundation two shades lighter than your skin and powder it smooth as plastic.",
        products: ["matte foundation", "translucent setting powder"],
        render: makeup(smooth(60), paler(2)),
      },
      {
        title: "Sculpted cheeks",
        howTo: "Shade under the cheekbones and at the temples, sharp.",
        products: ["contour powder"],
        render: makeup(contour("#A07A6E", 100, "HeartFace3")),
      },
      {
        title: "Plum smoky eyes",
        howTo:
          "Blend a plum over the lids and a dark plum into the outer corners, wing a black liner out sharp and add big false lashes.",
        products: ["plum eyeshadow", "black liquid eyeliner", "false lashes"],
        render: makeup(
          shadow("2colors83", matte("#7A3A6A"), matte("#3A1A34")),
          liner("OpenWings3", matte(BLACK)),
          lashes("Winged1")
        ),
      },
      {
        title: "Thin brows",
        howTo: "Draw thin, arched ’90s brows.",
        products: ["brown brow pencil"],
        render: makeup(
          brows("#6A4A38", 100, {
            name: "Thin1",
            curvature: 50,
            definition: 100,
          })
        ),
      },
      {
        title: "Pink cheeks",
        howTo: "Sweep a pink blush along the cheekbones.",
        products: ["pink blush"],
        render: makeup(blush("Oblique2", "#D07A86")),
      },
      {
        title: "Red lips",
        howTo: "Paint the lips a bold red, lined full.",
        products: ["red lipstick", "red lip liner"],
        render: makeup(
          lips(matte("#B0102A")),
          lipLine("Large&Full1", "#8A0A20")
        ),
      },
      {
        title: "Platinum hair",
        howTo: "Color your hair platinum blonde and curl it big.",
        products: ["platinum hair color spray"],
        render: hair("#EDE3C8", 100, 50),
      },
    ],
    finish:
      "Dot a beauty mark above your lip and draw a stitched scar on one cheek. A black leather jacket and a wedding veil.",
  },
  "the-craft-coven": {
    look: "Nancy from The Craft: pale skin, a gaunt ’90s contour, black kohl smudged around plum eyes, thin dark brows, vampy berry lips and dark hair.",
    steps: [
      {
        title: "Pale ’90s base",
        howTo:
          "Pat on a foundation three shades lighter than your skin and powder it matte.",
        products: ["light foundation", "translucent setting powder"],
        render: makeup(paler(3)),
      },
      {
        title: "Gaunt contour",
        howTo:
          "Shade deep under the cheekbones and at the temples, gaunt and sharp.",
        products: ["contour powder"],
        render: makeup(
          contour("#8A6A60", 100, "TriangleFace5"),
          shading("Bronzer5", "#7A5A52")
        ),
      },
      {
        title: "Black kohl eyes",
        howTo:
          "Blend a plum-brown over the lids, near-black into the corners, and smudge black kohl heavily all around.",
        products: ["plum eyeshadow", "black kohl eyeliner"],
        render: makeup(
          shadow("2colors83", matte("#4A3440"), matte("#1A1014")),
          liner("PandaSmudge11", matte(BLACK))
        ),
      },
      {
        title: "Thin dark brows",
        howTo:
          "Cover the outer half of your brows with concealer, then draw them thin and dark.",
        products: ["dark brow pencil", "concealer"],
        render: makeup(
          brows("#1E1612", 100, {
            name: "Thin1",
            thickness: -40,
            definition: 100,
          })
        ),
      },
      {
        title: "Vampy berry lips",
        howTo: "Paint the lips a deep vampy berry, almost black.",
        products: ["dark berry lipstick"],
        render: makeup(lips(matte("#4A0E22")), lipLine("Natural1", "#2E0814")),
      },
      {
        title: "Dark hair",
        howTo: "Color your hair a near-black brown.",
        products: ["dark brown hair color spray"],
        render: hair("#1E1612", 100, 30),
      },
    ],
    finish: "A black choker, a silver cross, a plaid skirt and a candle.",
  },
  "jennifer-check": {
    look: "Jennifer Check: luminous skin, sculpted cheeks, grungy smoky eyes, groomed dark brows, a glossy berry pout and dark hair.",
    steps: [
      {
        title: "Luminous base",
        howTo:
          "Pat on a foundation one shade lighter than your skin and leave it glowing.",
        products: ["light foundation"],
        render: makeup(paler(1, 100, 60)),
      },
      {
        title: "Sculpted cheeks",
        howTo:
          "Shade under the cheekbones and sweep a highlighter over them, down the nose and on the chin.",
        products: ["contour powder", "highlighter"],
        render: makeup(contour("#A0786A", 100, "HeartFace3"), glow("#FFF1E8")),
      },
      {
        title: "Grunge smoky eyes",
        howTo:
          "Blend a smoky gray-brown over the lids, near-black into the corners, smudge black kohl all around and add false lashes.",
        products: ["gray eyeshadow", "black kohl eyeliner", "false lashes"],
        render: makeup(
          shadow("2colors83", matte("#5A4A4A"), matte("#1E1616")),
          liner("PandaSmudge11", matte(BLACK)),
          lashes("UpperDense1")
        ),
      },
      {
        title: "Groomed brows",
        howTo: "Fill your brows dark in a clean arch.",
        products: ["dark brow pencil"],
        render: makeup(
          brows("#1E1612", 100, { name: "SoftArch1", definition: 100 })
        ),
      },
      {
        title: "Glossy berry pout",
        howTo: "Paint the lips a glossy berry-pink, lined full.",
        products: ["berry lip gloss", "berry lip liner"],
        render: makeup(
          lips(gloss("#A8304E"), "pouty"),
          lipLine("Large&Full1", "#8A1E3A")
        ),
      },
      {
        title: "Dark hair",
        howTo: "Color your hair a glossy near-black.",
        products: ["dark brown hair color spray"],
        render: hair("#1E1612", 100, 50),
      },
    ],
    finish:
      "For the demon, let fake blood run from both corners of your mouth down the chin. A cheerleader uniform.",
  },
  "frank-the-rabbit": {
    look: "Frank the Rabbit’s mask as face paint: a metallic silver-gray skull, dark hollows, sunken black eyes and gray lips.",
    steps: [
      {
        title: "Silver-gray base",
        howTo:
          "Glue your brows flat and pat a silver-gray cream paint over the face, brows and lips with a damp sponge.",
        products: ["silver cream face paint", "glue stick"],
        render: makeup(...facePaint("#B8BCC0"), brows("#B0B4B8", 100)),
      },
      secondCoat("#B8BCC0", "silver cream face paint", "#B0B4B8"),
      {
        title: "Dark hollows",
        howTo:
          "Sponge a dark gray deep into the cheek hollows, the temples and under the jaw.",
        products: ["dark gray cream face paint"],
        render: makeup(
          contour("#5A5E62", 100, "TriangleFace5"),
          shading("Bronzer5", "#4A4E52")
        ),
      },
      {
        title: "Sunken black eyes",
        howTo:
          "Pack black all around each eye and paint a thick black almond around it with liquid liner.",
        products: ["black eyeshadow", "black liquid eyeliner"],
        render: makeup(
          shadow("1color30", matte("#1A1C1E")),
          liner("Drama51", matte("#0E1012"))
        ),
      },
      {
        title: "Metal sheen",
        howTo:
          "Sweep a silver highlighter over the cheekbones, down the nose and on the chin, like polished metal.",
        products: ["silver highlighter"],
        render: makeup(glow("#E8ECF0")),
      },
      {
        title: "Gray lips",
        howTo: "Paint the lips a dark gray.",
        products: ["gray lipstick"],
        render: makeup(lips(matte("#6A6E72")), lipLine("Natural1", "#4A4E52")),
      },
    ],
    finish:
      "Draw big square white teeth over your lips with a white liner. Gray bunny ears on a headband, and a furry gray suit.",
  },
  "the-gill-man": {
    look: "The Gill-man: swamp-green skin, deep dark-green hollows, metallic teal eyes, dark green brows and green lips.",
    steps: [
      {
        title: "Swamp-green base",
        howTo:
          "Pat a swamp-green cream paint over the whole face and lips with a damp sponge.",
        products: ["green cream face paint", "setting powder"],
        render: makeup(...facePaint("#6E8A5A")),
      },
      secondCoat("#6E8A5A", "green cream face paint"),
      {
        title: "Deep hollows",
        howTo:
          "Sponge a near-black green deep into the cheek hollows, the temples and under the jaw.",
        products: ["dark green cream face paint"],
        render: makeup(
          contour("#2E3E26", 100, "TriangleFace5"),
          shading("Bronzer5", "#24321E")
        ),
      },
      {
        title: "Metallic gill eyes",
        howTo:
          "Pack a metallic teal-green all around each eye and line both lash lines black-green.",
        products: ["metallic green eyeshadow", "black eyeliner"],
        render: makeup(
          shadow("1color30", metallic("#2E7A6E")),
          liner("FullRim7", matte("#0E1E14"))
        ),
      },
      {
        title: "Dark green brows",
        howTo: "Paint your brows a dark swamp green.",
        products: ["dark green cream face paint"],
        render: makeup(brows("#1E2E1A", 100)),
      },
      {
        title: "Green lips",
        howTo: "Paint the lips a deep green.",
        products: ["green lipstick"],
        render: makeup(lips(matte("#3A5A34")), lipLine("Natural1", "#24381E")),
      },
    ],
    finish:
      "Sponge a darker green through a piece of fishnet over your cheeks and forehead for scales.",
  },
  "the-phantom-of-the-opera": {
    look: "The Phantom, 1925: a skull-white face, deep black sockets, skull hollows, dark nostrils, thin dark lips and slick black hair.",
    steps: [
      {
        title: "Skull-white base",
        howTo:
          "Pat a bone-white cream paint over the face and lips with a damp sponge and powder it.",
        products: ["white cream face paint", "setting powder"],
        render: makeup(...facePaint("#EEEBE4")),
      },
      secondCoat("#EEEBE4", "white cream face paint"),
      {
        title: "Skull hollows",
        howTo:
          "Sponge a dark gray deep into the cheek hollows, the temples and under the jaw.",
        products: ["gray cream face paint"],
        render: makeup(
          contour("#5E5A54", 100, "TriangleFace5"),
          shading("Bronzer5", "#4E4A44")
        ),
      },
      {
        title: "Black sockets",
        howTo:
          "Pack black all around each eye, lid to brow and under, smudged wide.",
        products: ["black eyeshadow", "black kohl eyeliner"],
        render: makeup(
          shadow("1color30", matte(BLACK)),
          liner("PandaSmudge11", matte(BLACK))
        ),
      },
      {
        title: "Dark nostrils",
        howTo: "Paint the tip of the nose dark, like a skull’s nose.",
        products: ["black cream face paint"],
        render: makeup(noseTip("#2A2624")),
      },
      {
        title: "Thin dark lips",
        howTo:
          "Paint the lips a dark gray, kept thin, then touch up the dark nose.",
        products: ["dark gray lipstick"],
        render: makeup(
          lips(matte("#3A3432")),
          lipLine("Small1", "#241E1C"),
          noseTip("#2A2624")
        ),
      },
      {
        title: "Slick black hair",
        howTo: "Color your hair black and slick it flat back.",
        products: ["black hair color spray", "hair gel"],
        render: hair(BLACK, 100, 60),
      },
    ],
    finish:
      "Draw a row of teeth over your lips with white and black liner. A cape, and a white half mask in your hand.",
  },
  krampus: {
    look: "Krampus: an ashen demon face, black demon shadows, blood-red sockets, heavy black brows, dark red lips and black hair.",
    steps: [
      {
        title: "Ashen demon base",
        howTo:
          "Pat a dark ash-brown cream paint over the whole face and lips with a damp sponge.",
        products: ["brown cream face paint", "setting powder"],
        render: makeup(...facePaint("#7A5A4A")),
      },
      {
        title: "Demon shadows",
        howTo:
          "Sponge near-black deep into the cheek hollows, the temples and down the middle of the forehead.",
        products: ["black cream face paint"],
        render: makeup(
          contour("#2A1A14", 100, "TriangleFace5"),
          shading("Bronzer1", "#3A221A")
        ),
      },
      {
        title: "Blood-red sockets",
        howTo:
          "Pack a dark blood red over the lids and a red all under the eyes, and smudge black into both lash lines.",
        products: ["red eyeshadow", "black kohl eyeliner"],
        render: makeup(
          shadow("2colors25", matte("#5A0E0E"), matte("#8A1A1A")),
          liner("PandaSmudge11", matte(BLACK))
        ),
      },
      {
        title: "Heavy black brows",
        howTo: "Paint big, heavy black brows, swept up at the ends.",
        products: ["black cream face paint"],
        render: makeup(
          brows(BLACK, 100, { name: "Drama7", thickness: 60, definition: 100 })
        ),
      },
      {
        title: "Dark red lips",
        howTo: "Paint the lips a dark red, drawn out wide.",
        products: ["dark red lipstick"],
        render: makeup(lips(matte("#4A0A0E")), lipLine("Wider1", "#2A0608")),
      },
      {
        title: "Black hair",
        howTo: "Color your hair black and rough it up.",
        products: ["black hair color spray"],
        render: hair("#111111", 100, 20),
      },
    ],
    finish: "Horns on a headband, a long tongue, a fur stole and a heavy bell.",
  },
  "damien-thorn": {
    look: "Damien: a pale, solemn face, faint hollows, a cold shadowed stare, dark brows, colorless lips and dark hair.",
    steps: [
      {
        title: "Solemn pale base",
        howTo:
          "Pat on a foundation three shades lighter than your skin and powder it matte.",
        products: ["light foundation", "translucent setting powder"],
        render: makeup(paler(3)),
      },
      {
        title: "Faint hollows",
        howTo:
          "Shade softly under the cheekbones and in half-moons under the eyes.",
        products: ["gray brown cream face paint"],
        render: makeup(
          contour("#9A8076", 100, "HeartFace3"),
          shading("Bronzer2", "#8A7268")
        ),
      },
      {
        title: "Cold stare",
        howTo:
          "Press a muted gray-brown close around each eye and line both lash lines dark.",
        products: ["gray brown eyeshadow", "dark brown eyeliner"],
        render: makeup(
          shadow("1color23", matte("#4A3A3A")),
          liner("FullRim7", matte("#2A1E1E"))
        ),
      },
      {
        title: "Dark brows",
        howTo: "Fill your brows dark and straight.",
        products: ["dark brow pencil"],
        render: makeup(
          brows("#1E1612", 100, { name: "Straight2", definition: 100 })
        ),
      },
      {
        title: "Colorless lips",
        howTo: "Cover the lips with a pale nude so they have no color.",
        products: ["nude lipstick"],
        render: makeup(lips(matte("#C2A89E")), lipLine("Natural1", "#A88E84")),
      },
      {
        title: "Dark hair",
        howTo: "Color your hair a dark brown.",
        products: ["dark brown hair color spray"],
        render: hair("#2A1E16", 100, 30),
      },
    ],
    finish:
      "Write 666 small behind your ear with eyeliner. A school uniform, or a little black suit.",
  },
  "kayako-saeki": {
    look: "Kayako: a ghost-white face, gray-blue hollows, dark hollow eyes, no brows, gray lips and long black hair.",
    steps: [
      {
        title: "Ghost-white base",
        howTo:
          "Glue your brows flat and pat a ghost-white cream paint over the face, brows and lips, then powder it.",
        products: ["white cream face paint", "setting powder", "glue stick"],
        render: makeup(...facePaint("#ECEEEF"), brows("#E4E6E8", 100)),
      },
      secondCoat("#ECEEEF", "white cream face paint", "#E4E6E8"),
      {
        title: "Gray-blue hollows",
        howTo:
          "Sponge a gray-blue into the cheek hollows down to the jaw and in half-moons under the eyes.",
        products: ["gray cream face paint"],
        render: makeup(
          contour("#7A8490", 100, "TriangleFace5"),
          shading("Bronzer2", "#5E6672")
        ),
      },
      {
        title: "Dark hollow eyes",
        howTo:
          "Pack a blue-black all around each eye and smudge black kohl heavily into both lash lines.",
        products: ["black eyeshadow", "black kohl eyeliner"],
        render: makeup(
          shadow("1color30", matte("#1A1C22")),
          liner("PandaSmudge11", matte("#0E0E12"))
        ),
      },
      {
        title: "Gray lips",
        howTo: "Paint the lips a cold gray.",
        products: ["gray lipstick"],
        render: makeup(lips(matte("#8A8C90")), lipLine("Natural1", "#6A6C70")),
      },
      {
        title: "Black hair",
        howTo: "Color your hair jet black, all of it.",
        products: ["black hair color spray"],
        render: hair("#0E0E0E", 100, 50),
      },
    ],
    finish:
      "Comb your hair forward over one eye. A long white dress, and that croak.",
  },
  "victor-crowley": {
    look: "Victor Crowley: blotchy red-purple skin, deep sunken shadows, raw blotches, dark hollow eyes, ragged brows, dark lips and stringy black hair.",
    steps: [
      {
        title: "Blotchy base",
        howTo:
          "Sponge a dusky red-purple cream paint over the whole face and lips, uneven.",
        products: ["purple cream face paint", "stipple sponge"],
        render: makeup(...facePaint("#9A6A6A")),
      },
      {
        title: "Sunken shadows",
        howTo:
          "Stipple a dark plum-brown deep into the cheek hollows, the temples and down the forehead.",
        products: ["dark purple cream face paint", "stipple sponge"],
        render: makeup(
          contour("#4A2A2E", 100, "TriangleFace5"),
          shading("Bronzer1", "#5A3438")
        ),
      },
      {
        title: "Raw blotches",
        howTo:
          "Dab raw red, red-brown and purple in rough patches over the cheekbones.",
        products: ["red cream face paint", "purple cream face paint"],
        render: makeup({
          category: "blush",
          pattern: { name: "3colors8" },
          palettes: [matte("#7A2A3A"), matte("#A04A4A"), matte("#5A3A4A")],
        }),
      },
      {
        title: "Dark hollow eyes",
        howTo:
          "Pack a red-black all around each eye and smudge black heavily into both lash lines.",
        products: ["black eyeshadow", "black kohl eyeliner"],
        render: makeup(
          shadow("1color30", matte("#1E1214")),
          liner("PandaSmudge11", matte("#0E0A0A"))
        ),
      },
      {
        title: "Ragged brows",
        howTo: "Rough your brows up and darken them unevenly.",
        products: ["dark brow pencil"],
        render: makeup(
          brows("#1E1414", 100, {
            name: "Original5",
            thickness: 20,
            definition: 10,
          })
        ),
      },
      {
        title: "Dark lips",
        howTo: "Paint the lips a dark plum, ragged past the corners.",
        products: ["dark plum lipstick"],
        render: makeup(
          lips(matte("#4A2A2E")),
          lipLine("Wider1", "#2E1A1C", 100, 100, 0)
        ),
      },
      {
        title: "Black hair",
        howTo: "Color your hair black and leave it stringy.",
        products: ["black hair color spray"],
        render: hair("#121212", 100, 30),
      },
    ],
    finish: "Denim overalls and a toy hatchet.",
  },
  "laurie-strode": {
    look: "Laurie Strode, the survivor: a weathered base, hard-won shadows, bruises, smudged dark eyes, straight brows, dry lips and gray-blonde hair.",
    steps: [
      {
        title: "Weathered base",
        howTo: "Pat on a matte foundation one shade lighter than your skin.",
        products: ["matte foundation"],
        render: makeup(paler(1)),
      },
      {
        title: "Hard-won shadows",
        howTo:
          "Shade deep under the cheekbones and in heavy bags under the eyes, forty years of not sleeping.",
        products: ["contour powder"],
        render: makeup(
          contour("#8A6A5A", 100, "TriangleFace5"),
          shading("Bronzer2", "#6E5A52")
        ),
      },
      {
        title: "Bruises",
        howTo:
          "Dab bruise purple, red-brown and gray on the cheekbones in patches.",
        products: ["bruise wheel"],
        render: makeup({
          category: "blush",
          pattern: { name: "3colors8" },
          palettes: [matte("#6A4A6A"), matte("#8A5A4A"), matte("#5A4A4A")],
        }),
      },
      {
        title: "Smudged eyes",
        howTo:
          "Blend a dark brown over the lids and under the eyes and smudge brown kohl into both lash lines.",
        products: ["dark brown eyeshadow", "brown kohl eyeliner"],
        render: makeup(
          shadow("2colors25", matte("#5A4A44"), matte("#3A2E2A")),
          liner("PandaSmudge1", matte("#2A1E1A"))
        ),
      },
      {
        title: "Straight brows",
        howTo: "Fill your brows straight and plain.",
        products: ["brow pencil"],
        render: makeup(brows("#6A5A48", 100, { name: "Straight2" })),
      },
      {
        title: "Dry lips",
        howTo: "Dull the lips with a dry nude.",
        products: ["nude lipstick"],
        render: makeup(
          lips(matte("#A07A70")),
          lipLine("Natural1", "#84604E", 100, 100, 20)
        ),
      },
      {
        title: "Gray-blonde hair",
        howTo: "Color your hair a gray-streaked blonde.",
        products: ["ash blonde hair color spray"],
        render: hair("#B8A88A", 100, 20),
      },
    ],
    finish:
      "Round glasses, a gray jacket and a toy shotgun, and a little fake blood for the last fight.",
  },
  dollface: {
    look: "Dollface’s mask as makeup: porcelain skin, black painted doll eyes, thin painted brows, rosy cheeks, a small red mouth and blonde hair.",
    steps: [
      {
        title: "Porcelain base",
        howTo:
          "Glue your brows flat and pat an ivory porcelain cream paint over the face, brows and lips, then powder it.",
        products: ["ivory cream face paint", "setting powder", "glue stick"],
        render: makeup(...facePaint("#F2ECE4"), brows("#ECE4DA", 100)),
      },
      secondCoat("#F2ECE4", "ivory cream face paint", "#ECE4DA"),
      {
        title: "Painted doll eyes",
        howTo:
          "Ring each eye in black and paint spiky doll lashes all around with liquid liner, then add false lashes top and bottom.",
        products: ["black eyeshadow", "black liquid eyeliner", "false lashes"],
        render: makeup(
          shadow("1color23", matte("#1A1414")),
          liner("Drama40", matte("#0E0A0A")),
          lashes("Upper&Lower1")
        ),
      },
      {
        title: "Thin painted brows",
        howTo: "Paint thin, high, perfect arches above your own brows.",
        products: ["black liquid eyeliner"],
        render: makeup(
          brows("#2A1E1A", 100, {
            name: "Thin1",
            curvature: 60,
            thickness: -60,
            definition: 100,
          })
        ),
      },
      {
        title: "Rosy doll cheeks",
        howTo: "Dab a round rose circle on the apple of each cheek.",
        products: ["pink cream blush"],
        render: makeup(blush("Circle2", "#E08088")),
      },
      {
        title: "Small red mouth",
        howTo: "Paint a small red doll’s mouth inside your lips.",
        products: ["red lipstick"],
        render: makeup(
          lips(matte("#B0101E"), "petal"),
          lipLine("Small1", "#8A0A16")
        ),
      },
      {
        title: "Blonde hair",
        howTo: "Color your hair a golden blonde.",
        products: ["blonde hair color spray"],
        render: hair("#D9C08A", 100, 40),
      },
    ],
    finish:
      "Draw a few fine cracks over one cheek with a gray liner. A dark coat, and a blank, unblinking stare.",
  },
  "the-purge-anarchists": {
    look: "Lady Liberty from The Purge: verdigris statue-green skin, dark teal shadows, neon green eyes, teal brows and teal lips.",
    steps: [
      {
        title: "Verdigris base",
        howTo:
          "Pat a statue-green cream paint over the whole face and lips with a damp sponge.",
        products: ["green cream face paint", "setting powder"],
        render: makeup(...facePaint("#7FB8A8")),
      },
      secondCoat("#7FB8A8", "green cream face paint"),
      {
        title: "Statue shadows",
        howTo:
          "Sponge a dark teal into the cheek hollows down to the jaw and around the edges of the face.",
        products: ["teal cream face paint"],
        render: makeup(
          contour("#3E6A5E", 100, "TriangleFace5"),
          shading("Bronzer3", "#4A7A6C")
        ),
      },
      {
        title: "Neon green eyes",
        howTo:
          "Pack a neon green all around each eye and wing a dark green liner out into points.",
        products: ["neon green eyeshadow", "green liquid eyeliner"],
        render: makeup(
          shadow("1color30", matte("#2EE86A")),
          liner("Drama8", matte("#0E3A22"))
        ),
      },
      {
        title: "Teal brows",
        howTo: "Paint your brows a dark teal.",
        products: ["teal cream face paint"],
        render: makeup(brows("#2E5A4E", 100)),
      },
      {
        title: "Teal lips",
        howTo: "Paint the lips a deep teal, drawn out wide.",
        products: ["teal lipstick"],
        render: makeup(lips(matte("#3E7A6A")), lipLine("Wider1", "#2A5A4E")),
      },
    ],
    finish:
      "Draw a neon-green X over each eye and a stitched smile with green liner. A spiky crown and a green robe.",
  },
  "killer-klowns": {
    look: "A Killer Klown: candy-pink skin, hot-pink shading, blue and pink clown eyes, high painted brows, a red nose, a huge red mouth and orange hair.",
    steps: [
      {
        title: "Candy-pink base",
        howTo:
          "Pat a pastel candy-pink cream paint over the whole face and lips with a damp sponge.",
        products: ["pink cream face paint", "setting powder"],
        render: makeup(...facePaint("#F4C8D4")),
      },
      secondCoat("#F4C8D4", "pink cream face paint"),
      {
        title: "Hot-pink shading",
        howTo:
          "Sponge a hot pink at the temples, down the middle of the forehead and into the cheek hollows.",
        products: ["hot pink cream face paint"],
        render: makeup(
          contour("#E0508A", 100, "HeartFace2"),
          shading("Bronzer1", "#D84080")
        ),
      },
      {
        title: "Clown eyes",
        howTo:
          "Paint a bright blue from the lashes up to the brows, hot pink under the eyes, and wing a navy liner out into points.",
        products: [
          "blue cream face paint",
          "pink cream face paint",
          "navy liquid eyeliner",
        ],
        render: makeup(
          shadow("2colors25", matte("#2A6AE0"), matte("#E040A0")),
          liner("Drama8", matte("#0E1A4A"))
        ),
      },
      {
        title: "High painted brows",
        howTo: "Paint thin, high, sweeping brows in dark blue.",
        products: ["blue liquid eyeliner"],
        render: makeup(
          brows("#1A1A6A", 100, {
            name: "Drama4",
            curvature: 60,
            thickness: -20,
            definition: 100,
          })
        ),
      },
      {
        title: "Red nose",
        howTo: "Paint the tip of your nose with a big round dot of red.",
        products: ["red cream face paint"],
        render: makeup(noseTip("#E0101E")),
      },
      {
        title: "Huge red mouth",
        howTo:
          "Paint a huge red mouth out past the corners into a grin, then touch up the red nose.",
        products: ["red cream face paint", "red lip liner"],
        render: makeup(
          lips(matte("#D0101E"), "smile"),
          lipLine("Wider1", "#A00A18"),
          noseTip("#E0101E")
        ),
      },
      {
        title: "Orange hair",
        howTo: "Spray your hair a bright orange and tease it out big.",
        products: ["orange hair color spray"],
        render: hair("#E06A1A", 100, 30),
      },
    ],
    finish: "Plastic fangs, a pointed party hat and a toy ray gun.",
  },
  remmick: {
    look: "Remmick: a vampire’s 1930s pallor, hungry hollows, red-rimmed eyes, brushed brows, bloodless lips and light-brown hair.",
    steps: [
      {
        title: "Vampire pallor",
        howTo:
          "Pat on a foundation four shades lighter than your skin and powder it matte, cold.",
        products: ["porcelain foundation", "translucent setting powder"],
        render: makeup(paler(4)),
      },
      {
        title: "Hungry hollows",
        howTo:
          "Shade deep under the cheekbones and in half-moons under the eyes, gaunt and hungry.",
        products: ["contour powder"],
        render: makeup(
          contour("#8A6A62", 100, "TriangleFace5"),
          shading("Bronzer2", "#7A5A58")
        ),
      },
      {
        title: "Red-rimmed eyes",
        howTo:
          "Press a red-brown over the lids and a sore red all under the eyes, and line them dark red.",
        products: ["red eyeshadow", "dark red eyeliner"],
        render: makeup(
          shadow("2colors25", matte("#7A4A48"), matte("#B83A42")),
          liner("FullRim7", matte("#5A1A1E"))
        ),
      },
      {
        title: "Brushed brows",
        howTo: "Brush your brows up and fill them in.",
        products: ["brow pencil"],
        render: makeup(brows("#6A4A34", 100, { name: "Original5" })),
      },
      {
        title: "Bloodless lips",
        howTo: "Cover the lips with a pale, bloodless nude.",
        products: ["nude lipstick"],
        render: makeup(lips(matte("#B89A96")), lipLine("Natural1", "#9A7C78")),
      },
      {
        title: "Light-brown hair",
        howTo: "Color your hair a light brown and comb it back.",
        products: ["light brown hair color spray"],
        render: hair("#8A6A48", 100, 30),
      },
    ],
    finish:
      "Let fake blood run from the corners of your mouth. Suspenders, a waistcoat and a flat cap.",
  },
  longlegs: {
    look: "Longlegs: a white pancake face, puffy waxen cheeks, pink-rimmed eyes, colorless brows, smeared pink lips and stringy white-blond hair.",
    steps: [
      {
        title: "White pancake",
        howTo:
          "Glue your brows flat and cake a white pancake foundation over the face, brows and lips with a sponge, then powder it.",
        products: ["white cream face paint", "setting powder", "glue stick"],
        render: makeup(...facePaint("#F4F0EA"), brows("#ECE6DE", 100)),
      },
      secondCoat("#F4F0EA", "white cream face paint", "#ECE6DE"),
      {
        title: "Puffy waxen cheeks",
        howTo:
          "Shade softly under the cheeks and press a white highlighter over the cheeks, forehead and chin, so the face looks swollen and waxy.",
        products: ["contour powder", "white highlighter"],
        render: makeup(
          contour("#B8A49A", 100, "HeartFace3"),
          highlight("#FFF8F0", "OvalFace62")
        ),
      },
      {
        title: "Pink-rimmed eyes",
        howTo:
          "Press a pale pink over the lids, a hot pink all under the eyes, and line them pink.",
        products: ["pink eyeshadow", "pink eyeliner"],
        render: makeup(
          shadow("2colors25", matte("#D0A0A0"), matte("#E07A8A")),
          liner("FullRim7", matte("#B06070"))
        ),
      },
      {
        title: "Smeared pink lips",
        howTo: "Paint a pink-red lipstick past the lip line, smeared.",
        products: ["pink lipstick"],
        render: makeup(
          lips(matte("#C85A6A")),
          lipLine("Large&Full1", "#A84050", 100, 100, 15)
        ),
      },
      {
        title: "White-blond hair",
        howTo: "Spray your hair a dirty white-blond and leave it stringy.",
        products: ["white hair color spray"],
        render: hair("#E2DCCB", 100, 20),
      },
    ],
    finish: "Round glasses and a pale, crumpled suit.",
  },
  david: {
    look: "David from The Lost Boys: vampire-pale skin, sharp hollows, smudged black punk eyes, bleached brows, pale lips and a platinum mullet.",
    steps: [
      {
        title: "Vampire pale",
        howTo:
          "Pat on a foundation four shades lighter than your skin and powder it matte.",
        products: ["porcelain foundation", "translucent setting powder"],
        render: makeup(paler(4)),
      },
      {
        title: "Sharp hollows",
        howTo:
          "Shade deep under the cheekbones and at the temples, sharp and hungry.",
        products: ["contour powder"],
        render: makeup(
          contour("#8A6A62", 100, "TriangleFace5"),
          shading("Bronzer5", "#7A5A54")
        ),
      },
      {
        title: "Smudged punk eyes",
        howTo:
          "Blend a gray-plum over the lids, near-black into the corners and smudge black kohl all around.",
        products: ["gray eyeshadow", "black kohl eyeliner"],
        render: makeup(
          shadow("2colors83", matte("#4A3A40"), matte("#1A1216")),
          liner("PandaSmudge11", matte(BLACK))
        ),
      },
      {
        title: "Bleached brows",
        howTo: "Brush a blonde brow gel through your brows so they fade.",
        products: ["blonde brow gel"],
        render: makeup(brows("#C8B890", 100)),
      },
      {
        title: "Pale lips",
        howTo: "Cover the lips with a pale, cold nude.",
        products: ["nude lipstick"],
        render: makeup(lips(matte("#B89A98")), lipLine("Natural1", "#9A7C7A")),
      },
      {
        title: "Platinum hair",
        howTo: "Spray your hair platinum blonde and tease it up into a mullet.",
        products: ["platinum hair color spray"],
        render: hair("#EEE6CF", 100, 40),
      },
    ],
    finish:
      "Plastic fangs, one earring, a long black coat and a fingerless glove.",
  },
  "the-creeper": {
    look: "The Creeper: dark olive leathery skin, black leathery shadows, sunken black eyes, a heavy brow and dark lips.",
    steps: [
      {
        title: "Leathery base",
        howTo:
          "Pat a dark olive cream paint over the whole face and lips with a damp sponge.",
        products: ["olive cream face paint", "setting powder"],
        render: makeup(...facePaint("#6E6A44")),
      },
      secondCoat("#6E6A44", "olive cream face paint"),
      {
        title: "Leathery shadows",
        howTo:
          "Stipple near-black into the cheek hollows, the temples and down the middle of the forehead.",
        products: ["black cream face paint", "stipple sponge"],
        render: makeup(
          contour("#2A2A18", 100, "TriangleFace5"),
          shading("Bronzer1", "#34341E")
        ),
      },
      {
        title: "Sunken black eyes",
        howTo:
          "Pack black all around each eye and smudge it heavily into both lash lines.",
        products: ["black eyeshadow", "black kohl eyeliner"],
        render: makeup(
          shadow("1color30", matte("#0E0E08")),
          liner("PandaSmudge11", matte("#080804"))
        ),
      },
      {
        title: "Heavy brow",
        howTo: "Paint big, heavy black brows, swept up.",
        products: ["black cream face paint"],
        render: makeup(
          brows("#141408", 100, { name: "Drama7", thickness: 60 })
        ),
      },
      {
        title: "Dark lips",
        howTo: "Paint the lips near-black, drawn out wide.",
        products: ["black lipstick"],
        render: makeup(lips(matte("#2E2A1A")), lipLine("Wider1", "#1A180E")),
      },
    ],
    finish: "A wide-brim hat and a long duster coat.",
  },
  "stripe-and-gizmo": {
    look: "Stripe the gremlin: green skin, dark green hollows, red-rimmed eyes, wild dark brows, a dark green mouth and white hair.",
    steps: [
      {
        title: "Gremlin-green base",
        howTo:
          "Pat a gremlin-green cream paint over the whole face and lips with a damp sponge.",
        products: ["green cream face paint", "setting powder"],
        render: makeup(...facePaint("#7A9A5A")),
      },
      secondCoat("#7A9A5A", "green cream face paint"),
      {
        title: "Dark green hollows",
        howTo:
          "Sponge a dark green deep into the cheek hollows, the temples and under the jaw.",
        products: ["dark green cream face paint"],
        render: makeup(
          contour("#3A5A2A", 100, "TriangleFace5"),
          shading("Bronzer5", "#2E4A22")
        ),
      },
      {
        title: "Red-rimmed eyes",
        howTo:
          "Press a dark brown over the lids and a bright red all under the eyes, and line them dark.",
        products: ["brown eyeshadow", "red eyeshadow", "black eyeliner"],
        render: makeup(
          shadow("2colors25", matte("#3A2A1A"), matte("#C02A2A")),
          liner("FullRim7", matte("#1A0E0A"))
        ),
      },
      {
        title: "Wild brows",
        howTo: "Paint thick, wavy dark green brows.",
        products: ["dark green cream face paint"],
        render: makeup(
          brows("#1E2A14", 100, { name: "Drama14", thickness: 30 })
        ),
      },
      {
        title: "Dark green mouth",
        howTo: "Paint the lips dark green, drawn out wide.",
        products: ["green lipstick"],
        render: makeup(lips(matte("#2E4A22")), lipLine("Wider1", "#1E3416")),
      },
      {
        title: "White hair",
        howTo: "Spray your hair white, all of it.",
        products: ["white hair color spray"],
        render: hair("#ECECE6", 100, 20),
      },
    ],
    finish:
      "Spike your hair into a mohawk with gel. Big pointed ears on a headband.",
  },
  "dr-frank-n-furter": {
    look: "Frank-N-Furter: a pale matte base, sharp cheekbones and blush, a purple-black cat eye with big lashes, dramatic brows, deep red lips and black curls.",
    steps: [
      {
        title: "Matte pale base",
        howTo:
          "Pat on a foundation three shades lighter than your skin and powder it matte.",
        products: ["light foundation", "translucent setting powder"],
        render: makeup(paler(3)),
      },
      {
        title: "Sharp cheekbones",
        howTo:
          "Shade under the cheekbones and sweep a bold pink-red blush along them.",
        products: ["contour powder", "red blush"],
        render: makeup(
          contour("#8A6A64", 100, "HeartFace3"),
          blush("Oblique2", "#C8506A")
        ),
      },
      {
        title: "Purple cat eyes",
        howTo:
          "Blend a dark purple under the eyes and a bright purple over the lids out into a wing, line them black and add big lashes.",
        products: ["purple eyeshadow", "black liquid eyeliner", "false lashes"],
        render: makeup(
          shadow("2colors164", matte("#3A1A4A"), matte("#6A2A8A")),
          liner("OpenWings3", matte(BLACK)),
          lashes("Winged1")
        ),
      },
      {
        title: "Dramatic brows",
        howTo: "Draw high, sharp black arches.",
        products: ["black brow pencil"],
        render: makeup(
          brows(BLACK, 100, {
            name: "HighArch4",
            curvature: 60,
            thickness: -20,
            definition: 100,
          })
        ),
      },
      {
        title: "Deep red lips",
        howTo: "Paint the lips a deep red, lined full.",
        products: ["deep red lipstick", "red lip liner"],
        render: makeup(
          lips(matte("#8A0A1E")),
          lipLine("Large&Full1", "#6A0614")
        ),
      },
      {
        title: "Black curls",
        howTo: "Color your hair black and curl it big.",
        products: ["black hair color spray", "curling iron"],
        render: hair(BLACK, 100, 40),
      },
    ],
    finish:
      "Dot a beauty mark on one cheek. Pearls, a corset, fishnets and a lot of attitude.",
  },
  "annie-wilkes": {
    look: "Annie Wilkes in a rage: a plain matte base, tired shadows, small hard eyes, plain brows, an angry flush, muted rose lips and brown hair.",
    steps: [
      {
        title: "Plain matte base",
        howTo: "Pat on a matte foundation one shade lighter than your skin.",
        products: ["matte foundation"],
        render: makeup(paler(1)),
      },
      {
        title: "Tired shadows",
        howTo:
          "Shade under the cheekbones and in half-moons under the eyes, worn out.",
        products: ["contour powder"],
        render: makeup(
          contour("#9A7A6E", 100, "HeartFace3"),
          shading("Bronzer2", "#8A6A60")
        ),
      },
      {
        title: "Small hard eyes",
        howTo:
          "Press a muted brown close around each eye and line both lash lines, so the eyes look small and hard.",
        products: ["brown eyeshadow", "brown eyeliner"],
        render: makeup(
          shadow("1color23", matte("#5A4A44")),
          liner("FullRim7", matte("#3A2E2A"))
        ),
      },
      {
        title: "Plain brows",
        howTo: "Fill your brows straight and plain.",
        products: ["brow pencil"],
        render: makeup(brows("#4A3A2E", 100, { name: "Straight2" })),
      },
      {
        title: "Angry flush",
        howTo: "Rub a red flush high on both cheeks.",
        products: ["red blush"],
        render: makeup(blush("Round2", "#D06A6A")),
      },
      {
        title: "Muted rose lips",
        howTo: "Paint the lips a muted rose.",
        products: ["rose lipstick"],
        render: makeup(lips(matte("#A8706E")), lipLine("Natural1", "#8A5654")),
      },
      {
        title: "Brown hair",
        howTo: "Color your hair a plain mid-brown.",
        products: ["brown hair color spray"],
        render: hair("#5A3E2A", 100, 20),
      },
    ],
    finish:
      "Pin your hair into a short bob with bangs. A cardigan, a small gold cross and a sledgehammer.",
  },
  "patrick-bateman": {
    look: "Patrick Bateman after the morning routine: poreless glowing skin, a chiseled jaw, a cold stare, groomed brows, nude lips and slicked dark hair.",
    steps: [
      {
        title: "Poreless glow",
        howTo:
          "Pat on a foundation your own shade, blur every pore and leave the skin glowing.",
        products: ["foundation", "blurring primer"],
        render: makeup(smooth(80), paler(0, 100, 60)),
      },
      {
        title: "Chiseled jaw",
        howTo:
          "Carve a cool brown under the cheekbones and hard along the jaw and the edges of the face.",
        products: ["contour powder"],
        render: makeup(
          contour("#7A5A4A", 100, "HeartFace3"),
          shading("Bronzer3", "#6A4E40")
        ),
      },
      {
        title: "Cold stare",
        howTo:
          "Press a muted gray-brown close around each eye and line both lash lines dark.",
        products: ["gray brown eyeshadow", "dark brown eyeliner"],
        render: makeup(
          shadow("1color23", matte("#4A3A36")),
          liner("FullRim7", matte("#2A1E1A"))
        ),
      },
      {
        title: "Groomed brows",
        howTo: "Brush your brows straight and fill them in precise.",
        products: ["brow pencil"],
        render: makeup(
          brows("#2A1E16", 100, { name: "Straight2", definition: 100 })
        ),
      },
      {
        title: "Nude lips",
        howTo: "Dab a nude balm on the lips, groomed and blank.",
        products: ["nude lip balm"],
        render: makeup(lips(matte("#B08478")), lipLine("Natural1", "#946A60")),
      },
      {
        title: "Slicked dark hair",
        howTo: "Color your hair dark brown and slick it back hard.",
        products: ["dark brown hair color spray", "hair gel"],
        render: hair("#2A1E16", 100, 70),
      },
    ],
    finish:
      "Flick fake blood across your face. A clear raincoat over a sharp suit, and a business card.",
  },
  tarman: {
    look: "Tarman: tar-gray rot, black tar creeping over the face, ochre bone on the cheekbones, sunken black eyes and black lips.",
    steps: [
      {
        title: "Tar-gray base",
        howTo:
          "Pat a dark tar-gray cream paint over the whole face and lips with a damp sponge.",
        products: ["gray cream face paint", "setting powder"],
        render: makeup(...facePaint("#5A564C")),
      },
      secondCoat("#5A564C", "gray cream face paint"),
      {
        title: "Creeping tar",
        howTo:
          "Sponge black into the temples, under the cheekbones, along the jaw and the edges of the face, thick and uneven.",
        products: ["black cream face paint", "stipple sponge"],
        render: makeup(
          contour("#141210", 100, "HeartFace2"),
          shading("Bronzer3", "#1E1A16")
        ),
      },
      {
        title: "Ochre bones",
        howTo:
          "Dab a dirty ochre on the cheekbones, down the nose and on the chin, like bone showing through.",
        products: ["yellow cream face paint"],
        render: makeup(highlight("#B8963E")),
      },
      {
        title: "Sunken black eyes",
        howTo:
          "Pack black all around each eye and smudge it heavily into both lash lines.",
        products: ["black eyeshadow", "black kohl eyeliner"],
        render: makeup(
          shadow("1color30", matte("#0A0806")),
          liner("PandaSmudge11", matte("#060504"))
        ),
      },
      {
        title: "Black lips",
        howTo: "Paint the lips black, drawn out wide.",
        products: ["black lipstick"],
        render: makeup(lips(matte("#1A1612")), lipLine("Wider1", "#0E0C0A")),
      },
    ],
    finish:
      "Dab clear lip gloss over the dark patches so they look wet and sticky. Torn black rags.",
  },
  "the-zombie": {
    look: "A 1968 zombie: ashen gray skin, sunken gray hollows, bruised dead eyes, faded brows and gray lips.",
    steps: [
      {
        title: "Ashen base",
        howTo:
          "Pat an ashen gray cream paint over the whole face and lips with a damp sponge, dusty and dead.",
        products: ["gray cream face paint", "setting powder"],
        render: makeup(...facePaint("#B8BAB0")),
      },
      {
        title: "Sunken hollows",
        howTo:
          "Sponge a dark gray into the cheek hollows down to the jaw and a purple-gray under the eyes.",
        products: ["gray cream face paint", "purple cream face paint"],
        render: makeup(
          contour("#5A5C54", 100, "TriangleFace5"),
          shading("Bronzer2", "#4A4A50")
        ),
      },
      {
        title: "Bruised dead eyes",
        howTo:
          "Press a dark gray-purple over the lids and a bruise purple under the eyes, and smudge black into the lash lines.",
        products: ["purple eyeshadow", "black kohl eyeliner"],
        render: makeup(
          shadow("2colors25", matte("#3A3640"), matte("#5A4A5A")),
          liner("PandaSmudge11", matte("#141216"))
        ),
      },
      {
        title: "Faded brows",
        howTo: "Dab the gray paint over your brows so they fade.",
        products: ["gray cream face paint"],
        render: makeup(brows("#8A8C84", 100)),
      },
      {
        title: "Gray lips",
        howTo: "Paint the lips a dead gray, rough at the edges.",
        products: ["gray lipstick"],
        render: makeup(
          lips(matte("#6E6E68")),
          lipLine("Natural1", "#4E4E48", 100, 100, 10)
        ),
      },
    ],
    finish:
      "Let a trickle of fake blood run from the corner of your mouth. Dirty, torn clothes.",
  },
  "the-lipstick-face-demon": {
    look: "The Lipstick-Face Demon: a blood-red face, black-red shadows, black around the eyes, heavy black brows, black lips and black hair.",
    steps: [
      {
        title: "Blood-red base",
        howTo:
          "Pat a blood-red cream paint over the whole face and lips with a damp sponge.",
        products: ["red cream face paint", "setting powder"],
        render: makeup(...facePaint("#A8141C")),
      },
      secondCoat("#A8141C", "red cream face paint"),
      {
        title: "Black-red shadows",
        howTo:
          "Sponge near-black deep into the cheek hollows down to the jaw and in half-moons under the eyes.",
        products: ["black cream face paint"],
        render: makeup(
          contour("#3A0608", 100, "TriangleFace5"),
          shading("Bronzer2", "#2A0406")
        ),
      },
      {
        title: "Black eyes",
        howTo:
          "Pack black all around each eye and sweep a big smoked black wing out from the corners, like flames.",
        products: ["black eyeshadow", "black kohl eyeliner"],
        render: makeup(
          shadow("1color30", matte(BLACK)),
          liner("Drama12", matte(BLACK))
        ),
      },
      {
        title: "Heavy black brows",
        howTo: "Paint big, heavy black brows, swept up.",
        products: ["black cream face paint"],
        render: makeup(
          brows(BLACK, 100, { name: "Drama7", thickness: 60, definition: 100 })
        ),
      },
      {
        title: "Black lips",
        howTo: "Paint the lips black, drawn out wide.",
        products: ["black lipstick", "black lip liner"],
        render: makeup(lips(matte(BLACK)), lipLine("Wider1", BLACK)),
      },
      {
        title: "Black hair",
        howTo: "Color your hair black and slick it back.",
        products: ["black hair color spray"],
        render: hair("#0E0E0E", 100, 40),
      },
    ],
    finish:
      "Paint black flames up from your jaw onto the cheeks with black cream paint. Black clothes and long black nails.",
  },
  "eric-draven": {
    look: "Eric Draven, the Crow: a white face, gray hollows, black smudged eyes, black brows, black lips drawn wide and black hair.",
    steps: [
      {
        title: "White base",
        howTo:
          "Pat thick white cream paint over the whole face and lips with a damp sponge, and press white powder over it.",
        products: ["white cream face paint", "white setting powder"],
        render: makeup(...facePaint(WHITE)),
      },
      secondCoat(WHITE, "white cream face paint"),
      {
        title: "Gray hollows",
        howTo:
          "Sponge a soft gray into the cheek hollows, the temples and under the jaw.",
        products: ["gray cream face paint"],
        render: makeup(
          contour("#9A9A9A", 100, "TriangleFace5"),
          shading("Bronzer5", "#8A8A8A")
        ),
      },
      {
        title: "Black smudged eyes",
        howTo:
          "Pack black all around each eye and smudge it out with your fingertip.",
        products: ["black eyeshadow", "black kohl eyeliner"],
        render: makeup(
          shadow("1color30", matte(BLACK)),
          liner("PandaSmudge11", matte(BLACK))
        ),
      },
      {
        title: "Black brows",
        howTo: "Fill your brows black and straight.",
        products: ["black brow pencil"],
        render: makeup(
          brows(BLACK, 100, {
            name: "Straight2",
            thickness: 20,
            definition: 100,
          })
        ),
      },
      {
        title: "Black lips",
        howTo: "Paint the lips black and drag the corners out past the mouth.",
        products: ["black lipstick", "black lip liner"],
        render: makeup(lips(matte(BLACK)), lipLine("Wider1", BLACK)),
      },
      {
        title: "Black hair",
        howTo: "Color your hair black, wet-looking.",
        products: ["black hair color spray"],
        render: hair("#0E0E0E", 100, 50),
      },
    ],
    finish:
      "With black liquid liner, draw a line straight up and down through each eye. A long black coat, and a crow on your shoulder.",
  },
  "pamela-voorhees": {
    look: "Pamela Voorhees, 1980: a soft natural base, powder-blue lids, light brows, coral cheeks, coral lips and light-brown hair.",
    steps: [
      {
        title: "Natural ’80s base",
        howTo: "Pat on a foundation one shade lighter than your skin.",
        products: ["light foundation"],
        render: makeup(paler(1)),
      },
      {
        title: "Powder-blue lids",
        howTo:
          "Sweep a powder blue from the lashes up to the brows, line the lower lashes in navy and add mascara.",
        products: ["blue eyeshadow", "navy eyeliner", "mascara"],
        render: makeup(
          shadow("1color67", matte("#7AA8D8")),
          liner("Lower11", matte("#3A4A6A")),
          lashes("Natural1")
        ),
      },
      {
        title: "Light brows",
        howTo: "Brush your brows into a soft arch.",
        products: ["brow pencil"],
        render: makeup(brows("#8A6A4A", 100, { name: "SoftArch1" })),
      },
      {
        title: "Coral cheeks",
        howTo: "Sweep a coral blush along the cheekbones.",
        products: ["coral blush"],
        render: makeup(blush("Oblique2", "#E07A60")),
      },
      {
        title: "Coral lips",
        howTo: "Paint the lips a coral, glossy.",
        products: ["coral lipstick"],
        render: makeup(lips(gloss("#D86A5A")), lipLine("Natural1", "#B85040")),
      },
      {
        title: "Light-brown hair",
        howTo: "Color your hair a light brown.",
        products: ["light brown hair color spray"],
        render: hair("#8A6A4A", 100, 30),
      },
    ],
    finish: "A blue cable-knit sweater and a hunting knife.",
  },
  "the-invisible-man": {
    look: "The Invisible Man fading out: washed-out white skin, gray edges, dark goggle eyes and colorless lips.",
    steps: [
      {
        title: "Washed-out base",
        howTo:
          "Glue your brows flat and pat a white cream paint over the face, brows and lips, then powder it.",
        products: ["white cream face paint", "setting powder", "glue stick"],
        render: makeup(...facePaint("#F0F0EE"), brows("#E8E8E6", 100)),
      },
      secondCoat("#F0F0EE", "white cream face paint", "#E8E8E6"),
      {
        title: "Fading gray edges",
        howTo:
          "Sponge a soft gray along the hairline, the sides of the nose and the jaw, so the face fades out at its edges.",
        products: ["gray cream face paint"],
        render: makeup(
          contour("#A8A8A6", 100, "OvalFace6"),
          shading("Bronzer3", "#9A9A98")
        ),
      },
      {
        title: "Dark goggle eyes",
        howTo:
          "Paint a round black ring around each eye, filled in solid, like dark goggles.",
        products: ["black eyeshadow", "black liquid eyeliner"],
        render: makeup(
          shadow("1color30", matte("#1A1A1A")),
          liner("Drama51", matte("#0E0E0E"))
        ),
      },
      {
        title: "Colorless lips",
        howTo: "Cover the lips with the white paint.",
        products: ["white cream face paint"],
        render: makeup(lips(matte("#D8D4D0")), lipLine("Natural1", "#C0BCB8")),
      },
    ],
    finish:
      "Wrap white gauze loosely around your head, and add round dark glasses, a hat and a scarf.",
  },
  "sweeney-todd": {
    look: "Sweeney Todd: ghostly pale skin, gaunt hollows, red-rimmed dark circles, dark brows, dark lips and black hair.",
    steps: [
      {
        title: "Ghostly base",
        howTo:
          "Pat a ghostly gray-white cream paint over the face and lips with a damp sponge.",
        products: ["white cream face paint", "setting powder"],
        render: makeup(...facePaint("#E8E6E2")),
      },
      {
        title: "Gaunt hollows",
        howTo:
          "Sponge a gray deep into the cheek hollows down to the jaw and a bruise purple under the eyes.",
        products: ["gray cream face paint", "purple cream face paint"],
        render: makeup(
          contour("#6E6A68", 100, "TriangleFace5"),
          shading("Bronzer2", "#5A4A54")
        ),
      },
      {
        title: "Red-rimmed circles",
        howTo:
          "Press a dark plum over the lids and a raw red-purple all under the eyes, and smudge black into the lash lines.",
        products: ["plum eyeshadow", "red eyeshadow", "black kohl eyeliner"],
        render: makeup(
          shadow("2colors25", matte("#3A2A30"), matte("#7A2A34")),
          liner("PandaSmudge11", matte("#1A1012"))
        ),
      },
      {
        title: "Dark brows",
        howTo: "Fill your brows black and straight.",
        products: ["black brow pencil"],
        render: makeup(
          brows("#141010", 100, {
            name: "Straight2",
            thickness: 20,
            definition: 100,
          })
        ),
      },
      {
        title: "Dark lips",
        howTo: "Paint the lips a dark gray-plum.",
        products: ["dark plum lipstick"],
        render: makeup(lips(matte("#3E2E30")), lipLine("Natural1", "#2A1E20")),
      },
      {
        title: "Black hair",
        howTo: "Color your hair black and tease it up wild.",
        products: ["black hair color spray"],
        render: hair("#141414", 100, 25),
      },
    ],
    finish:
      "Spray a white streak into the front of your hair. A dark waistcoat and a toy razor.",
  },
  "lestat-de-lioncourt": {
    look: "Lestat: luminous vampire-pale skin, sculpted cheekbones, soft shadowed eyes, blond brows, pale mauve lips and golden hair.",
    steps: [
      {
        title: "Luminous pale base",
        howTo:
          "Pat on a foundation four shades lighter than your skin and leave it with a soft glow.",
        products: ["porcelain foundation"],
        render: makeup(paler(4, 100, 50)),
      },
      {
        title: "Sculpted cheekbones",
        howTo:
          "Shade under the cheekbones and sweep a white highlighter over them, down the nose and on the chin.",
        products: ["contour powder", "white highlighter"],
        render: makeup(contour("#A08A84", 100, "HeartFace3"), glow(WHITE)),
      },
      {
        title: "Shadowed eyes",
        howTo:
          "Wash a cool mauve-gray from the lids to the brows and under the eyes, and smudge a soft brown liner.",
        products: ["mauve eyeshadow", "brown kohl eyeliner"],
        render: makeup(
          shadow("1color55", matte("#8A7A80")),
          liner("PandaSmudge1", matte("#3A2E32"))
        ),
      },
      {
        title: "Blond brows",
        howTo: "Brush a blonde gel through your brows.",
        products: ["blonde brow gel"],
        render: makeup(brows("#C8A870", 100)),
      },
      {
        title: "Pale mauve lips",
        howTo: "Paint the lips a pale, cold mauve.",
        products: ["mauve lipstick"],
        render: makeup(lips(matte("#B08A94")), lipLine("Natural1", "#946E78")),
      },
      {
        title: "Golden hair",
        howTo: "Color your hair a golden blond.",
        products: ["golden blonde hair color spray"],
        render: hair("#D8B060", 100, 50),
      },
    ],
    finish:
      "Draw faint blue veins at the temples with a blue liner. Plastic fangs and a frilled shirt.",
  },
  "georgie-denbrough": {
    look: "Georgie after the storm drain: drowned blue-gray skin, drowned shadows, bruised eyes, faded brows and bluish lips.",
    steps: [
      {
        title: "Drowned base",
        howTo:
          "Pat a cold blue-gray cream paint over the face and lips with a damp sponge.",
        products: ["gray cream face paint", "setting powder"],
        render: makeup(...facePaint("#C4CCD2")),
      },
      {
        title: "Drowned shadows",
        howTo:
          "Sponge a blue-gray into the cheek hollows down to the jaw and a purple in half-moons under the eyes.",
        products: ["blue cream face paint", "purple cream face paint"],
        render: makeup(
          contour("#6A7684", 100, "TriangleFace5"),
          shading("Bronzer2", "#4E5468")
        ),
      },
      {
        title: "Bruised eyes",
        howTo:
          "Press a sickly yellow-green over the lids and a bruise purple under the eyes, and line them dark.",
        products: ["green eyeshadow", "purple eyeshadow", "dark eyeliner"],
        render: makeup(
          shadow("2colors25", matte("#7A7A4A"), matte("#4A3A5A")),
          liner("FullRim7", matte("#2A2A3A"))
        ),
      },
      {
        title: "Faded brows",
        howTo: "Dab the gray paint over your brows so they fade.",
        products: ["gray cream face paint"],
        render: makeup(brows("#9AA0A6", 100)),
      },
      {
        title: "Bluish lips",
        howTo: "Paint the lips a cold, drowned blue.",
        products: ["blue lipstick"],
        render: makeup(lips(matte("#6A7A94")), lipLine("Natural1", "#4E5A74")),
      },
    ],
    finish: "Wet your hair, wear a yellow raincoat and carry a paper boat.",
  },
  "the-leprechaun": {
    look: "The Leprechaun: deep weathered shadows, ruddy red cheeks, green lids, bushy ginger brows, a muddy red mouth and ginger hair.",
    steps: [
      {
        title: "Weathered shadows",
        howTo:
          "Sponge a red-brown deep into the temples, the middle of the forehead and the cheek hollows, old and weathered.",
        products: ["brown cream face paint"],
        render: makeup(
          contour("#7A5040", 100, "HeartFace2"),
          shading("Bronzer1", "#8A5A48")
        ),
      },
      {
        title: "Ruddy cheeks",
        howTo: "Rub a ruddy red wide across the cheeks and over the nose.",
        products: ["red cream blush"],
        render: makeup(blush("Rectangle7", "#C8504A")),
      },
      {
        title: "Green lids",
        howTo:
          "Sweep a deep green from the lashes up to the brows and line the eyes dark green.",
        products: ["green eyeshadow", "dark green eyeliner"],
        render: makeup(
          shadow("1color67", matte("#3A7A3A")),
          liner("FullRim7", matte("#1A3A1A"))
        ),
      },
      {
        title: "Bushy ginger brows",
        howTo: "Fill your brows ginger, thick and bushy.",
        products: ["auburn brow pencil"],
        render: makeup(
          brows("#B85A2A", 100, { name: "Drama7", thickness: 60 })
        ),
      },
      {
        title: "Muddy red mouth",
        howTo: "Paint the lips a muddy brick red.",
        products: ["brick red lipstick"],
        render: makeup(lips(matte("#8A3A30")), lipLine("Natural1", "#6A2A22")),
      },
      {
        title: "Ginger hair",
        howTo: "Color your hair a bright ginger.",
        products: ["ginger hair color spray"],
        render: hair("#B8501E", 100, 30),
      },
    ],
    finish:
      "A fake ginger beard, a green top hat with a buckle, and chocolate gold coins.",
  },
  "mr-boogie-bughuul": {
    look: "Bughuul: a bone-white face, smeared black hollows, black eyes, no brows, a black mouth and long black hair.",
    steps: [
      {
        title: "Bone-white base",
        howTo:
          "Glue your brows flat and pat a bone-white cream paint over the face, brows and lips, then powder it.",
        products: ["white cream face paint", "setting powder", "glue stick"],
        render: makeup(...facePaint("#ECEAE2"), brows("#E4E2DA", 100)),
      },
      secondCoat("#ECEAE2", "white cream face paint", "#E4E2DA"),
      {
        title: "Smeared hollows",
        howTo:
          "Smear near-black into the cheek hollows down to the jaw and in big half-moons under the eyes.",
        products: ["black cream face paint"],
        render: makeup(
          contour("#2A2826", 100, "TriangleFace5"),
          shading("Bronzer2", "#1E1C1A")
        ),
      },
      {
        title: "Black eyes",
        howTo: "Pack black all around each eye and smudge it out wide.",
        products: ["black eyeshadow", "black kohl eyeliner"],
        render: makeup(
          shadow("1color30", matte(BLACK)),
          liner("PandaSmudge11", matte(BLACK))
        ),
      },
      {
        title: "Black mouth",
        howTo: "Paint the lips black, lined past their edges top and bottom.",
        products: ["black lipstick", "black lip liner"],
        render: makeup(lips(matte(BLACK)), lipLine("Large&Full1", BLACK)),
      },
      {
        title: "Black hair",
        howTo: "Color your hair black, all of it.",
        products: ["black hair color spray"],
        render: hair("#0E0E0E", 100, 30),
      },
    ],
    finish:
      "Smear the black mouth down onto your chin with a finger. A long black coat.",
  },
  "ellen-ripley": {
    look: "Ripley after the alien: sweaty skin, soot and grime, long-shift shadows, natural brows, bare lips and dark curly hair.",
    steps: [
      {
        title: "Sweaty base",
        howTo:
          "Pat on a foundation one shade lighter than your skin and dab balm over it so it shines with sweat.",
        products: ["light foundation", "clear lip balm"],
        render: makeup(paler(1, 100, 60)),
      },
      {
        title: "Soot and grime",
        howTo:
          "Stipple a sooty brown-gray at the temples, the middle of the forehead and the cheek hollows.",
        products: ["brown cream face paint", "stipple sponge"],
        render: makeup(
          contour("#4A4038", 100, "HeartFace2"),
          shading("Bronzer1", "#5A4E44")
        ),
      },
      {
        title: "Long-shift shadows",
        howTo:
          "Press a dark brown over the lids and under the eyes, and smudge brown kohl along the lashes.",
        products: ["dark brown eyeshadow", "brown kohl eyeliner"],
        render: makeup(
          shadow("2colors25", matte("#5A4A44"), matte("#4A3A3A")),
          liner("PandaSmudge1", matte("#2A201C"))
        ),
      },
      {
        title: "Natural brows",
        howTo: "Brush your brows up and fill them in strong.",
        products: ["brow pencil"],
        render: makeup(brows("#3A2A1E", 100, { name: "Original5" })),
      },
      {
        title: "Bare lips",
        howTo: "Dull the lips with a dry nude.",
        products: ["nude lipstick"],
        render: makeup(
          lips(matte("#B08070")),
          lipLine("Natural1", "#946454", 100, 100, 20)
        ),
      },
      {
        title: "Dark curls",
        howTo: "Color your hair a dark brown and curl it big.",
        products: ["dark brown hair color spray", "curling iron"],
        render: hair("#3A2A1E", 100, 30),
      },
    ],
    finish: "An olive flight suit and a cat carrier.",
  },
  slappy: {
    look: "Slappy the dummy: a glossy wood-tan face, lacquer shine, painted doll eyes, thick arched black brows, rosy cheeks, a red grin and slick black hair.",
    steps: [
      {
        title: "Lacquered wood base",
        howTo:
          "Pat a wood-tan cream paint over the whole face and lips with a damp sponge.",
        products: ["tan cream face paint", "setting powder"],
        render: makeup(...facePaint("#E8C8A8")),
      },
      {
        title: "Lacquer shine",
        howTo:
          "Shade softly under the cheekbones and sweep a gloss highlighter over them, down the nose and on the chin, like varnished wood.",
        products: ["contour powder", "highlighter"],
        render: makeup(contour("#A07A5A", 100, "HeartFace3"), glow("#FFF4E4")),
      },
      {
        title: "Painted doll eyes",
        howTo:
          "Wash a brown over the lids, paint spiky doll lashes all around with liquid liner and add false lashes top and bottom.",
        products: ["brown eyeshadow", "black liquid eyeliner", "false lashes"],
        render: makeup(
          shadow("1color8", matte("#8A5A4A")),
          liner("Drama40", matte("#1A100A")),
          lashes("Upper&Lower1")
        ),
      },
      {
        title: "Thick arched brows",
        howTo: "Paint thick, high, arched black brows.",
        products: ["black cream face paint"],
        render: makeup(
          brows(BLACK, 100, {
            name: "HighArch4",
            curvature: 60,
            thickness: 60,
            definition: 100,
          })
        ),
      },
      {
        title: "Rosy cheeks",
        howTo: "Dab a round rosy circle on each cheek.",
        products: ["red cream blush"],
        render: makeup(blush("Circle2", "#E0605A")),
      },
      {
        title: "Red grin",
        howTo: "Paint the lips red, drawn out wide into a grin.",
        products: ["red lipstick", "red lip liner"],
        render: makeup(
          lips(matte("#B8101E"), "smile"),
          lipLine("Wider1", "#8A0A16")
        ),
      },
      {
        title: "Slick black hair",
        howTo: "Color your hair black and comb it flat and shiny.",
        products: ["black hair color spray", "hair gel"],
        render: hair("#0E0E0E", 100, 80),
      },
    ],
    finish:
      "Draw a black line from each corner of the mouth down to the chin, a dummy’s jaw. A gray suit, a red bow tie and a stiff, jerky walk.",
  },
  "john-carver": {
    look: "John Carver’s pilgrim mask as makeup: waxy tan skin, carved shadows, dark eye holes, arched painted brows and small pursed lips.",
    steps: [
      {
        title: "Waxy mask base",
        howTo:
          "Pat a waxy tan cream paint over the whole face and lips with a damp sponge.",
        products: ["tan cream face paint", "setting powder"],
        render: makeup(...facePaint("#E2C8A4")),
      },
      secondCoat("#E2C8A4", "tan cream face paint"),
      {
        title: "Carved shadows",
        howTo:
          "Sponge a brown along the hairline, down the sides of the nose and around the jaw, like a carved mask.",
        products: ["brown cream face paint"],
        render: makeup(
          contour("#9A7A54", 100, "OvalFace6"),
          shading("Bronzer3", "#8A6A48")
        ),
      },
      {
        title: "Dark eye holes",
        howTo: "Ring each eye close in black-brown and line both lash lines.",
        products: ["dark brown eyeshadow", "black eyeliner"],
        render: makeup(
          shadow("1color23", matte("#1E1610")),
          liner("FullRim7", matte("#0E0A06"))
        ),
      },
      {
        title: "Painted brows",
        howTo: "Paint high, arched brown brows, thick and even.",
        products: ["brown cream face paint"],
        render: makeup(
          brows("#3A2614", 100, {
            name: "HighArch4",
            curvature: 40,
            thickness: 20,
            definition: 100,
          })
        ),
      },
      {
        title: "Pursed lips",
        howTo: "Paint a small, pursed mouth in a dull brown-pink.",
        products: ["brown pink lipstick"],
        render: makeup(
          lips(matte("#A86A54"), "petal"),
          lipLine("Small1", "#8A5040")
        ),
      },
    ],
    finish:
      "Draw a thin curled mustache and a pointed goatee with a brown pencil. A pilgrim hat and a black jumpsuit.",
  },
  blade: {
    look: "Blade: a matte even base, sharply sculpted cheekbones and jaw, a hard stare, defined brows and dark lips.",
    steps: [
      {
        title: "Matte base",
        howTo: "Pat on a matte foundation in your own shade, even all over.",
        products: ["matte foundation"],
        render: makeup(paler(0)),
      },
      {
        title: "Sharp sculpt",
        howTo:
          "Carve a deep shadow under the cheekbones down to the jaw and around the edges of the face.",
        products: ["contour powder"],
        render: makeup(
          contour("#4A3226", 100, "TriangleFace5"),
          shading("Bronzer3", "#3E2A20")
        ),
      },
      {
        title: "Hard stare",
        howTo: "Ring each eye close in black-brown and line both lash lines.",
        products: ["dark brown eyeshadow", "black eyeliner"],
        render: makeup(
          shadow("1color23", matte("#2A1E1A")),
          liner("FullRim7", matte("#0E0A08"))
        ),
      },
      {
        title: "Defined brows",
        howTo: "Fill your brows sharp and angled.",
        products: ["dark brow pencil"],
        render: makeup(
          brows("#0E0A08", 100, { name: "Arrow13", definition: 100 })
        ),
      },
      {
        title: "Dark lips",
        howTo: "Dull the lips with a dark brown.",
        products: ["dark brown lipstick"],
        render: makeup(lips(matte("#5A3A34")), lipLine("Natural1", "#3A2420")),
      },
    ],
    finish:
      "Narrow black sunglasses, a goatee drawn in with a brow pencil and a long black coat.",
  },
  "danny-torrance": {
    look: "Danny Torrance: pale and scared, gray hollows, dark sleepless circles, wide eyes, soft brows, pale lips and brown hair.",
    steps: [
      {
        title: "Pale scared base",
        howTo:
          "Pat on a foundation three shades lighter than your skin and powder it matte.",
        products: ["light foundation", "translucent setting powder"],
        render: makeup(paler(3)),
      },
      {
        title: "Gray hollows",
        howTo:
          "Shade softly under the cheekbones and in dark half-moons under the eyes.",
        products: ["gray cream face paint"],
        render: makeup(
          contour("#9A8A88", 100, "HeartFace3"),
          shading("Bronzer2", "#7A6E78")
        ),
      },
      {
        title: "Wide sleepless eyes",
        howTo:
          "Press a gray-mauve over the lids and under the eyes, line the lower lashes and add false lashes, so the eyes look wide open.",
        products: ["mauve eyeshadow", "brown eyeliner", "false lashes"],
        render: makeup(
          shadow("2colors25", matte("#9A8A88"), matte("#6A5A68")),
          liner("Lower11", matte("#4A3A3A")),
          lashes("Upper&Lower1")
        ),
      },
      {
        title: "Soft brows",
        howTo: "Brush your brows up softly.",
        products: ["brow gel"],
        render: makeup(brows("#6A4A30", 100, { name: "Original5" })),
      },
      {
        title: "Pale lips",
        howTo: "Cover the lips with a pale nude.",
        products: ["nude lipstick"],
        render: makeup(lips(matte("#C4A098")), lipLine("Natural1", "#A88278")),
      },
      {
        title: "Brown hair",
        howTo: "Color your hair a mid-brown.",
        products: ["brown hair color spray"],
        render: hair("#6B4A30", 100, 30),
      },
    ],
    finish: "A red rocket sweater, and one raised finger: “Redrum.”",
  },
  "sidney-prescott": {
    look: "Sidney Prescott, 1996: a matte ’90s base, brown contour, brown-lined eyes, groomed brows, brown-lined lips and dark-brown hair.",
    steps: [
      {
        title: "Matte ’90s base",
        howTo: "Pat on a matte foundation one shade lighter than your skin.",
        products: ["matte foundation"],
        render: makeup(paler(1)),
      },
      {
        title: "Brown contour",
        howTo: "Shade a warm brown under the cheekbones and at the temples.",
        products: ["contour powder"],
        render: makeup(
          contour("#8A6450", 100, "HeartFace3"),
          shading("Bronzer5", "#7A5644")
        ),
      },
      {
        title: "Brown-lined eyes",
        howTo:
          "Sweep a warm brown over the lids, line the eyes all around in dark brown and coat the lashes.",
        products: ["brown eyeshadow", "dark brown eyeliner", "mascara"],
        render: makeup(
          shadow("1color22", matte("#8A6048")),
          liner("FullRim7", matte("#3A2418")),
          lashes("UpperDense1")
        ),
      },
      {
        title: "Groomed brows",
        howTo: "Fill your brows dark and neat.",
        products: ["dark brow pencil"],
        render: makeup(
          brows("#2A1E16", 100, { name: "Straight2", definition: 100 })
        ),
      },
      {
        title: "Brown-lined lips",
        howTo:
          "Line the lips past their edges in dark brown and fill them with a peachy brown, the ’90s way.",
        products: ["brown lip liner", "peach brown lipstick"],
        render: makeup(
          lips(matte("#A06A5A")),
          lipLine("Large&Full1", "#6A4030")
        ),
      },
      {
        title: "Dark-brown hair",
        howTo: "Color your hair a glossy dark brown.",
        products: ["dark brown hair color spray"],
        render: hair("#2A1E16", 100, 40),
      },
    ],
    finish:
      "A denim jacket and a cordless phone, and a little fake blood for the end.",
  },
  "ellen-hutter": {
    look: "Ellen Hutter, possessed: feverish pallor, gray hollows, hollow red-rimmed eyes, faded brows, muted lips and brown hair.",
    steps: [
      {
        title: "Feverish pallor",
        howTo:
          "Pat on a foundation four shades lighter than your skin and dab balm over it, clammy with fever.",
        products: ["porcelain foundation", "clear lip balm"],
        render: makeup(paler(4, 100, 50)),
      },
      {
        title: "Gray hollows",
        howTo:
          "Sponge a gray deep under the cheekbones and a purple-gray under the eyes.",
        products: ["gray cream face paint"],
        render: makeup(
          contour("#8A7E7A", 100, "TriangleFace5"),
          shading("Bronzer2", "#6A5A60")
        ),
      },
      {
        title: "Hollow red eyes",
        howTo:
          "Press a gray-brown over the lids and a raw red all under the eyes, and line them dark red.",
        products: ["red eyeshadow", "dark red eyeliner"],
        render: makeup(
          shadow("2colors25", matte("#6A5A5A"), matte("#A84A52")),
          liner("FullRim7", matte("#5A2A2E"))
        ),
      },
      {
        title: "Faded brows",
        howTo: "Dab foundation over your brows so they fade.",
        products: ["foundation"],
        render: makeup(brows("#8A7A6A", 100)),
      },
      {
        title: "Muted lips",
        howTo: "Dull the lips with a dry, muted rose.",
        products: ["rose lipstick"],
        render: makeup(
          lips(matte("#A88078")),
          lipLine("Natural1", "#8A645C", 100, 100, 20)
        ),
      },
      {
        title: "Brown hair",
        howTo: "Color your hair a mid-brown.",
        products: ["brown hair color spray"],
        render: hair("#5A3E2A", 100, 30),
      },
    ],
    finish:
      "Braid your hair into a rope updo and let fake blood run from your eyes like tears. A white nightgown.",
  },
  "billy-chapman-killer-santa": {
    look: "Killer Santa: a cold pale face, gray hollows, red-rimmed eyes, rosy Santa cheeks and nose, white brows, cold red lips and white hair.",
    steps: [
      {
        title: "Cold pale base",
        howTo:
          "Pat on a foundation three shades lighter than your skin and powder it matte.",
        products: ["light foundation", "translucent setting powder"],
        render: makeup(paler(3)),
      },
      {
        title: "Gray hollows",
        howTo:
          "Shade deep under the cheekbones and in half-moons under the eyes.",
        products: ["gray cream face paint"],
        render: makeup(
          contour("#8A7A78", 100, "TriangleFace5"),
          shading("Bronzer2", "#6E6064")
        ),
      },
      {
        title: "Red-rimmed eyes",
        howTo:
          "Press a dull red-brown over the lids and a raw red all under the eyes, and line them dark red.",
        products: ["red eyeshadow", "dark red eyeliner"],
        render: makeup(
          shadow("2colors25", matte("#7A5A5A"), matte("#B84A52")),
          liner("FullRim7", matte("#5A2A2E"))
        ),
      },
      {
        title: "Santa cheeks",
        howTo: "Rub a jolly red blush round on both cheeks.",
        products: ["red cream blush"],
        render: makeup(blush("Round2", "#D8404A")),
      },
      {
        title: "Red nose",
        howTo: "Dab red on the tip of your nose.",
        products: ["red cream blush"],
        render: makeup(noseTip("#C8303A")),
      },
      {
        title: "White brows",
        howTo: "Dab white paint through your brows.",
        products: ["white cream face paint"],
        render: makeup(brows("#ECECE6", 100)),
      },
      {
        title: "Cold red lips",
        howTo: "Paint the lips a cold red, then touch up the red nose.",
        products: ["red lipstick"],
        render: makeup(
          lips(matte("#A8202E")),
          lipLine("Natural1", "#8A1824"),
          noseTip("#C8303A")
        ),
      },
      {
        title: "White hair",
        howTo: "Spray your hair white, all of it.",
        products: ["white hair color spray"],
        render: hair("#ECECE6", 100, 20),
      },
    ],
    finish:
      "A Santa suit and a white beard, with fake blood on the fur trim, and a toy axe.",
  },
  alice: {
    look: "Alice from Resident Evil, battle-worn: grime, bruises, smudged eyes, natural brows, nude lips and auburn hair.",
    steps: [
      {
        title: "Natural base",
        howTo: "Pat on a foundation one shade lighter than your skin.",
        products: ["light foundation"],
        render: makeup(paler(1)),
      },
      {
        title: "Grime",
        howTo:
          "Stipple a dirty brown at the temples, the middle of the forehead and the cheek hollows.",
        products: ["brown cream face paint", "stipple sponge"],
        render: makeup(
          contour("#6A5444", 100, "HeartFace2"),
          shading("Bronzer1", "#7A6050")
        ),
      },
      {
        title: "Bruises",
        howTo:
          "Dab bruise purple, red-brown and gray on the cheekbones in patches.",
        products: ["bruise wheel"],
        render: makeup({
          category: "blush",
          pattern: { name: "3colors8" },
          palettes: [matte("#6A4A6A"), matte("#8A5A4A"), matte("#5A4A4A")],
        }),
      },
      {
        title: "Smudged eyes",
        howTo:
          "Blend a brown over the lids, a dark brown into the corners and smudge brown kohl along the lashes.",
        products: ["brown eyeshadow", "brown kohl eyeliner"],
        render: makeup(
          shadow("2colors83", matte("#8A6A58"), matte("#3A2A22")),
          liner("PandaSmudge1", matte("#2A1E1A"))
        ),
      },
      {
        title: "Natural brows",
        howTo: "Brush your brows up and fill them in.",
        products: ["brow pencil"],
        render: makeup(brows("#6A4A30", 100, { name: "Original5" })),
      },
      {
        title: "Nude lips",
        howTo: "Dull the lips with a peachy nude.",
        products: ["nude lipstick"],
        render: makeup(lips(matte("#B8857A")), lipLine("Natural1", "#9A6A60")),
      },
      {
        title: "Auburn hair",
        howTo: "Color your hair a bright auburn.",
        products: ["auburn hair color spray"],
        render: hair("#A8643A", 100, 30),
      },
    ],
    finish:
      "A short red dress and combat boots, scuffed with dirt, and a little fake blood.",
  },
}
