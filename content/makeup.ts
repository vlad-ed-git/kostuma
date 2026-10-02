// The makeup guides: for each costume, the steps that turn a face into the
// character, or, for a mask or a costume-only character, a face that goes
// with the costume. Researched online per character (makeup tutorials,
// interviews with the films' makeup departments, costume guides), 2026-10-02.
// Every step is a real-world instruction plus what YouCam renders for it
// (lib/makeup.ts), so the Fitting Room can show the visitor's face after
// each step: one unit per step. What no render can show (blood, stitches,
// lenses, teeth) goes in `finish`. content/makeup.test.ts checks every guide.
import {
  base,
  blush,
  brows,
  contour,
  glow,
  gloss,
  hair,
  type Hex,
  lashes,
  lipLine,
  liner,
  lips,
  makeup,
  type MakeupGuide,
  matte,
  metallic,
  paler,
  satin,
  shading,
  shadow,
  shimmer,
  smooth,
} from "@/lib/makeup"

/** Clown white: face paint, not foundation. */
const WHITE: Hex = "#F6F4EF"
const BLACK: Hex = "#111111"

/** Each costume's guide, by its slug (content/costumes.ts). */
export const makeupGuides: Record<string, MakeupGuide> = {
  ghostface: {
    look: "Ghostface painted on: a chalk-white face, black hollow eyes and a long black scream for a mouth.",
    steps: [
      {
        title: "White face",
        howTo:
          "Pat white cream face paint over your face, ears and neck with a damp sponge, then set it with translucent powder so it doesn't crease.",
        products: ["white cream face paint", "translucent setting powder"],
        render: makeup(base(WHITE)),
      },
      {
        title: "Black hollow eyes",
        howTo:
          "Fill each eye socket, from the brow bone to under the eye, with black cream paint, drooping at the outer corners like the mask's. Soften the edges with black eyeshadow.",
        products: ["black cream face paint", "black eyeshadow"],
        render: makeup(
          shadow("1color57", matte(BLACK, 95)),
          liner("PandaSmudge11", matte(BLACK, 90))
        ),
      },
      {
        title: "The scream",
        howTo:
          "Paint your lips black and stretch the shape past the corners into a long oval. Shade under the cheekbones and at the temples with gray.",
        products: ["black liquid lipstick", "gray cream face paint"],
        render: makeup(
          lips(matte(BLACK, 95)),
          lipLine("Large&Full1", BLACK, 90, 80, 30),
          contour("#8E8E8A", 50)
        ),
      },
    ],
  },
  "michael-myers": {
    look: "The Shape's blank face: flat off-white skin, brows that almost vanish, black eye holes and dark-brown hair.",
    steps: [
      {
        title: "Blank white face",
        howTo:
          "Cover your face and brows with off-white cream paint for the mask's flat, lifeless look, and powder it matte.",
        products: ["white cream face paint", "translucent setting powder"],
        render: makeup(base("#EDE7DC"), brows("#E2DACE", 70)),
      },
      {
        title: "Dark eye holes",
        howTo:
          "Shade the whole eye socket and under the eyes with matte black and dark-brown eyeshadow, so the eyes sink back like the mask's widened eyeholes.",
        products: ["black eyeshadow", "dark brown eyeshadow"],
        render: makeup(shadow("1color57", matte("#1B1512", 85))),
      },
      {
        title: "Brown hair",
        howTo: "Finish with messy dark-brown hair: your own or a short wig.",
        products: ["short dark brown wig"],
        render: hair("#3B2A1E", 80, 15),
      },
    ],
  },
  "nikki-freaky-nikki-freeman": {
    look: "Nikki's uncanny-valley face: drained skin, eyes that look too big, a mouth stretched too long, and black hair.",
    steps: [
      {
        title: "Drained skin",
        howTo:
          "Blot out your natural color, lips included, with a matte foundation a shade lighter than your skin, for a flat, mannequin-like finish.",
        products: [
          "matte full coverage foundation",
          "translucent setting powder",
        ],
        render: makeup(paler(1, 85)),
      },
      {
        title: "Too-big eyes",
        howTo:
          "Press brown shadow deep into the under-eye hollows and drag it up toward the brow. Line only the middle of the upper and lower lash lines in black so the irises look taller.",
        products: ["matte brown eyeshadow", "black kohl eyeliner"],
        render: makeup(
          shadow("2colors25", matte("#6B4E44", 70), matte("#4A332C", 80)),
          liner("FullRim7", matte(BLACK, 60))
        ),
      },
      {
        title: "Too-long mouth",
        howTo:
          "Shade the inside of the lips with a deep berry and pull the color past the corners, so the mouth looks far longer than it is.",
        products: ["deep berry lipstick", "lip liner"],
        render: makeup(
          lips(matte("#6E2A35", 85)),
          lipLine("Wider1", "#5A1F2A", 80, 60, 40)
        ),
      },
      {
        title: "Black hair",
        howTo: "Finish with long black hair, straight and a little messy.",
        products: ["long black wig"],
        render: hair("#121212", 90, 30),
      },
    ],
    finish:
      "For the finale, smear fake blood over your face and draw her friend's tattoos on your arms.",
  },
  "art-the-clown": {
    look: "Art's grin: a solid white face, smudged black eyes swept upward, high black brows and a wide black mouth.",
    steps: [
      {
        title: "White base",
        howTo:
          "Sponge white cream paint over your whole face for an even, opaque finish, and set it with translucent powder so it lasts the night.",
        products: ["white cream face paint", "translucent setting powder"],
        render: makeup(base(WHITE)),
      },
      {
        title: "Eyes and brows",
        howTo:
          "Pack black shadow on the lids and under the eyes and smudge it up and out; messy edges are right for Art. Paint thin, high-arched black brows.",
        products: ["black eyeshadow", "black cream eyeliner"],
        render: makeup(
          shadow("1color23", matte(BLACK, 70)),
          liner("PandaSmudge11", matte(BLACK, 90)),
          brows(BLACK, 90, { name: "HighArch4", curvature: 40, thickness: -20 })
        ),
      },
      {
        title: "Black grin",
        howTo:
          "Paint your lips black with a liquid lipstick and stretch them into a wide, exaggerated grin well past the lip line.",
        products: ["black liquid lipstick"],
        render: makeup(
          lips(matte(BLACK, 95), "smile"),
          lipLine("Wider1", BLACK, 95, 70, 30)
        ),
      },
    ],
    finish:
      "Black out the tip of your nose and paint jagged white teeth into the grin with a fine brush.",
  },
  pennywise: {
    look: "Pennywise: clown-white skin, red-brown sunken eyes, thin high brows, red lips and orange hair.",
    steps: [
      {
        title: "Clown white",
        howTo:
          "Stipple white cream paint over your face, forehead and neck in thin layers, then set it with powder.",
        products: ["clown white face paint", "translucent setting powder"],
        render: makeup(base(WHITE)),
      },
      {
        title: "Eyes and brows",
        howTo:
          "Blend red-brown shadow patchily over the lids and under the eyes, darken the outer corners with black, and paint very thin, angular gray brows high on the forehead.",
        products: ["red brown eyeshadow", "black eyeshadow", "gray face paint"],
        render: makeup(
          shadow("2colors83", matte("#8B3A2E", 75), matte("#2A1A18", 70)),
          brows("#8D8D8D", 60, {
            name: "Arrow13",
            curvature: 40,
            thickness: -60,
          })
        ),
      },
      {
        title: "Red lips",
        howTo: "Paint your lips a bright red with a cream face paint.",
        products: ["red cream face paint"],
        render: makeup(lips(matte("#B3141B", 90), "smile")),
      },
      {
        title: "Orange hair",
        howTo: "Finish with orange-red hair pushed back off a high forehead.",
        products: ["orange clown wig"],
        render: hair("#C8501E", 85, 25),
      },
    ],
    finish:
      "Draw his red lines: from each corner of the mouth up to the lower lids, and short ones from the upper lids to the brows.",
  },
  "aunt-gladys": {
    look: "Aunt Gladys: thick white makeup worn for days, odd thin brows, cyan-blue lids, smeared red lips and a red bob.",
    steps: [
      {
        title: "Thick white base",
        howTo:
          "Cover your face in a thick white foundation and leave it a little uneven, as if it has been on for days.",
        products: ["white cream foundation"],
        render: makeup(base("#F2ECE4", 90)),
      },
      {
        title: "Cyan lids, odd brows",
        howTo:
          "Sweep a bright cyan-blue shadow over the lids up to the crease, and draw thin, strangely arched brows over your own.",
        products: ["cyan blue eyeshadow", "brown brow pencil"],
        render: makeup(
          shadow("1color22", matte("#1FA3D6", 85)),
          brows("#5A3A2A", 70, {
            name: "Arrow13",
            curvature: 60,
            thickness: -60,
          })
        ),
      },
      {
        title: "Smeared red lips",
        howTo:
          "Paint a blue-red matte lipstick (MAC Ruby Woo is the film's) slightly past the lip line and smudge the edges.",
        products: ["blue red matte lipstick"],
        render: makeup(
          lips(matte("#A3172B", 90)),
          lipLine("Large&Full1", "#A3172B", 85, 60, 25)
        ),
      },
      {
        title: "Red bob",
        howTo: "Finish with a bright red bob with blunt bangs.",
        products: ["red bob wig with bangs"],
        render: hair("#C8161D", 90, 35),
      },
    ],
    finish: "Big tinted glasses and dangly earrings finish her.",
  },
  chucky: {
    look: "Chucky's Good Guy face: a pale doll base, round red cheeks and bright orange-red hair.",
    steps: [
      {
        title: "Doll base",
        howTo:
          "Use a foundation a shade paler than your skin, then contour the cheeks, temples and jaw with a cool brown to round out the face.",
        products: ["light foundation", "cool brown contour"],
        render: makeup(paler(1, 80), contour("#8A6E62", 45)),
      },
      {
        title: "Cheeks and brows",
        howTo:
          "Blend vibrant red blush in circles on the apples of your cheeks, and tint the brows a light orange-brown.",
        products: ["red cream blush", "auburn brow gel"],
        render: makeup(blush("Circle2", "#D2343A", 65), brows("#B5652F", 60)),
      },
      {
        title: "Orange-red hair",
        howTo: "Finish with short, messy orange-red hair.",
        products: ["chucky wig"],
        render: hair("#D2561C", 85, 25),
      },
    ],
    finish:
      "Dot a few brown freckles on the cheeks and draw red scars across the face with a red gel liner.",
  },
  "freddy-krueger": {
    look: "Freddy's burned face: bruised red-brown skin with purple and red in the hollows and shadowed eyes.",
    steps: [
      {
        title: "Burned base",
        howTo:
          "Pat a red-brown cream paint over the whole face, uneven on purpose.",
        products: ["red brown cream face paint", "stipple sponge"],
        render: makeup(base("#8E4A4A", 65)),
      },
      {
        title: "Burn shadows",
        howTo:
          "Push purple and deep red into the hollows: under the cheekbones, at the temples and all around the eyes.",
        products: ["purple cream face paint", "dark red cream face paint"],
        render: makeup(
          contour("#5E2F45", 70),
          shading("Bronzer2", "#7A2A2A", 60),
          shadow("1color23", matte("#4B1F2E", 70))
        ),
      },
      {
        title: "Raw lips",
        howTo: "Stain the lips a dull red-purple.",
        products: ["dark red lip stain"],
        render: makeup(lips(matte("#6A2D35", 70))),
      },
    ],
    finish:
      "For raised burns, build texture with liquid latex and tissue before the paint, then add the brown fedora.",
  },
  "jason-voorhees": {
    look: "Jason under the mask: drowned gray-blue skin, deep-set dark eyes and lips gone blue.",
    steps: [
      {
        title: "Drowned skin",
        howTo:
          "Cover your face with a gray-blue cream paint, blotchy rather than smooth, like skin that has been underwater.",
        products: ["gray cream face paint", "blue cream face paint"],
        render: makeup(base("#A7B0AE", 85)),
      },
      {
        title: "Sunken eyes",
        howTo:
          "Shade the eye sockets and under the eyes a deep gray-purple, and hollow the cheeks with gray.",
        products: ["dark purple eyeshadow", "gray cream face paint"],
        render: makeup(
          shadow("1color57", matte("#3E3442", 80)),
          contour("#6F7472", 60)
        ),
      },
      {
        title: "Blue lips",
        howTo: "Dab a dull blue-gray onto the lips.",
        products: ["blue gray lipstick"],
        render: makeup(lips(matte("#6C7380", 70))),
      },
    ],
    finish:
      "The hockey mask goes on top; or paint its red chevrons on your forehead and cheeks instead.",
  },
  beetlejuice: {
    look: "Beetlejuice: a pale yellow-white face, lavender and purple sunken eyes, green mold at the edges and green-tinged hair.",
    steps: [
      {
        title: "Pale yellow base",
        howTo:
          "Cover your face with a pale, yellowish white cream paint, the original's 1988 base.",
        products: ["pale yellow cream face paint"],
        render: makeup(base("#E9E3C4", 90)),
      },
      {
        title: "Purple eyes",
        howTo:
          "Blend lavender over the lids up to the brows and dark purple underneath, then smudge black along the lash line.",
        products: [
          "lavender eyeshadow",
          "dark purple eyeshadow",
          "black eyeliner",
        ],
        render: makeup(
          shadow("2colors25", matte("#B79AD3", 75), matte("#3D1F47", 85)),
          liner("PandaSmudge1", matte(BLACK, 70))
        ),
      },
      {
        title: "Green mold",
        howTo:
          "Sponge two greens, dark first then light, along the temples, jaw and hairline like moss.",
        products: ["green cream face paint", "makeup sponge"],
        render: makeup(contour("#5E7A35", 55)),
      },
      {
        title: "Green-tinged hair",
        howTo: "Finish with wild white hair tinted green.",
        products: ["beetlejuice wig"],
        render: hair("#C8D4A0", 80, 20),
      },
    ],
    finish:
      "Press crumbled green eyeshadow or foam onto the mossy patches for texture.",
  },
  dracula: {
    look: "Lugosi's Dracula: a pale face, high dark brows, black-lined eyes, deep red lips and slick black hair.",
    steps: [
      {
        title: "Pale base",
        howTo:
          "Use a foundation two shades paler than your skin, and shade lightly under the cheekbones.",
        products: ["pale foundation", "gray contour"],
        render: makeup(paler(2, 85), contour("#9A968A", 40)),
      },
      {
        title: "Hypnotic eyes",
        howTo:
          "Line the eyes in black, smudge a little dark shadow on the lids, and arch the brows dark and high.",
        products: ["black kohl eyeliner", "black brow pencil"],
        render: makeup(
          liner("FullRim7", matte(BLACK, 75)),
          shadow("1color8", matte("#4A3F45", 50)),
          brows("#1A1A1A", 80, { name: "HighArch4", curvature: 40 })
        ),
      },
      {
        title: "Deep red lips",
        howTo: "Paint the lips a deep blood red.",
        products: ["deep red lipstick"],
        render: makeup(lips(matte("#6A0F1A", 90))),
      },
      {
        title: "Slick black hair",
        howTo: "Comb black hair straight back with gel.",
        products: ["black hair color spray", "hair gel"],
        render: hair("#121212", 85, 60),
      },
    ],
    finish: "Draw a widow's peak with a brow pencil and add fangs.",
  },
  "frankensteins-monster": {
    look: "The Monster: green-gray skin, hollow cheeks, heavy dark brows, shadowed lids, black lips and black hair.",
    steps: [
      {
        title: "Green-gray skin",
        howTo:
          "Cover your face with green-gray cream paint, Karloff's color, then hollow the cheeks and temples with a darker gray-green.",
        products: ["green gray cream face paint"],
        render: makeup(base("#9EAA92", 95), contour("#5C6656", 65)),
      },
      {
        title: "Heavy eyes",
        howTo:
          "Shade the lids and under the eyes gray, and thicken the brows straight and dark.",
        products: ["gray eyeshadow", "black brow pencil"],
        render: makeup(
          shadow("1color23", matte("#4A5245", 75)),
          brows("#1E1E1E", 85, { name: "Straight2", thickness: 40 })
        ),
      },
      {
        title: "Black lips",
        howTo: "Paint the lips black.",
        products: ["black lipstick"],
        render: makeup(lips(matte(BLACK, 85))),
      },
      {
        title: "Black hair",
        howTo: "Finish with short black hair combed flat on top.",
        products: ["black hair color spray"],
        render: hair("#151515", 85, 20),
      },
    ],
    finish:
      "Draw stitched scars on the forehead with a black liner and wear neck bolts.",
  },
  "bride-of-frankenstein": {
    look: "The Bride: a white face, thin arched brows, smudged dark eyes, crisp dark lips and towering black hair.",
    steps: [
      {
        title: "White base",
        howTo:
          "Cover your face with white paint and bring a lighter coat down your neck and shoulders.",
        products: ["white cream face paint"],
        render: makeup(base("#F2EFEA", 90)),
      },
      {
        title: "Arched brows, dark eyes",
        howTo:
          "Glue your brows flat, draw thin high arches in black over them, smudge black around the eyes and outward, and add lashes.",
        products: ["brow glue stick", "black eyeliner", "false eyelashes"],
        render: makeup(
          brows(BLACK, 85, { name: "Thin1", curvature: 60, thickness: -50 }),
          liner("PandaSmudge1", matte(BLACK, 80)),
          lashes("UpperDense1")
        ),
      },
      {
        title: "Crisp dark lips",
        howTo: "Paint the lips a dark plum-red with a fine, crisp line.",
        products: ["dark plum lipstick", "dark lip liner"],
        render: makeup(
          lips(matte("#4A1020", 90)),
          lipLine("Natural1", "#2E0A14", 85, 40, 90)
        ),
      },
      {
        title: "Black hair",
        howTo: "Finish with black hair teased tall.",
        products: ["bride of frankenstein wig"],
        render: hair("#141414", 85, 25),
      },
    ],
    finish:
      "Tease the hair into a tower and add white lightning streaks with white hair color spray.",
  },
  sam: {
    look: "Sam's sack painted on: burlap-brown shading, black button eyes and a tight, stitched-shut mouth.",
    steps: [
      {
        title: "Burlap shading",
        howTo:
          "Sponge a burlap brown around the edges of your face, into the cheek hollows and down the nose, rough like the sack.",
        products: ["brown cream face paint", "makeup sponge"],
        render: makeup(shading("Bronzer3", "#8A6B48", 60)),
      },
      {
        title: "Button eyes",
        howTo:
          "Fill the eye sockets with black, round and dark like Sam's buttons.",
        products: ["black cream face paint"],
        render: makeup(shadow("1color57", matte(BLACK, 90))),
      },
      {
        title: "Stitched mouth",
        howTo: "Paint the lips dark brown and keep the line thin and tight.",
        products: ["dark brown lipstick"],
        render: makeup(
          lips(matte("#4A3020", 85)),
          lipLine("Small1", "#3A2416", 85, 60, 70)
        ),
      },
    ],
    finish:
      "Draw stitches across the mouth with a brown liner and pull the orange hood up over your hair.",
  },
  leatherface: {
    look: "Leatherface's 'Pretty Woman' mask: brown-shadowed hollows, smeared blue lids, pink cheeks and smeared pink-red lips.",
    steps: [
      {
        title: "Skin-mask hollows",
        howTo:
          "Sponge a dull brown into the hollows of the cheeks, the temples and along the jaw, like the seams of a skin mask.",
        products: ["brown cream face paint", "makeup sponge"],
        render: makeup(contour("#7A5A3E", 60)),
      },
      {
        title: "Smeared blue lids",
        howTo:
          "Smear a bright blue shadow over the lids and past the edges, as if a clumsy hand put it on.",
        products: ["bright blue eyeshadow"],
        render: makeup(shadow("1color22", matte("#2F6FD1", 80))),
      },
      {
        title: "Pink cheeks and lips",
        howTo:
          "Rub dark pink into the cheeks and smear a pink-red lipstick over and past the lips.",
        products: ["pink cream blush", "pink red lipstick"],
        render: makeup(
          blush("Round2", "#C2456E", 60),
          lips(matte("#C2456E", 85)),
          lipLine("Large&Full1", "#B83A5E", 80, 60, 20)
        ),
      },
      {
        title: "Dark hair",
        howTo: "Finish with dark-brown hair, set but messy.",
        products: ["dark brown wig"],
        render: hair("#3A2A1E", 80, 20),
      },
    ],
  },
  pinhead: {
    look: "Pinhead: a pale white face and lids, gray-blue shadows, black-shaded eyes and black lips.",
    steps: [
      {
        title: "Pale base",
        howTo:
          "Cover your face and lids with white cream paint, then shade the hollows with gray and a touch of blue.",
        products: ["white cream face paint", "gray cream face paint"],
        render: makeup(base("#ECEBE7", 95), contour("#7E8796", 55)),
      },
      {
        title: "Dark eyes",
        howTo:
          "Shade the lids blue-gray and under the eyes black, then line all around in black.",
        products: ["blue gray eyeshadow", "black eyeshadow", "black eyeliner"],
        render: makeup(
          shadow("2colors25", matte("#4F6280", 70), matte(BLACK, 80)),
          liner("FullRim7", matte(BLACK, 70))
        ),
      },
      {
        title: "Black lips",
        howTo: "Paint the lips black.",
        products: ["black lipstick"],
        render: makeup(lips(matte(BLACK, 85))),
      },
    ],
    finish:
      "Draw his grid over a bald cap and your face with a fine black liner, and glue prop pins at the crossings.",
  },
  "jigsaw-and-billy-the-puppet": {
    look: "Billy the Puppet: a white face, black-ringed eyes and brows, round red cheeks, red lips and wild black hair.",
    steps: [
      {
        title: "White face",
        howTo:
          "Cover your face with white face paint or a very pale foundation.",
        products: ["white cream face paint"],
        render: makeup(base(WHITE)),
      },
      {
        title: "Puppet eyes",
        howTo:
          "Fill in the brows black and ring the eyes with black pencil, then deepen them with black shadow.",
        products: ["black eyeliner pencil", "black eyeshadow"],
        render: makeup(
          brows(BLACK, 90, { name: "Straight2", thickness: 30 }),
          liner("PandaSmudge1", matte(BLACK, 90)),
          shadow("1color23", matte(BLACK, 75))
        ),
      },
      {
        title: "Red cheeks and lips",
        howTo:
          "Paint round red circles on the cheeks, and red lips dragged out a little at the corners.",
        products: ["red cream face paint", "red lipstick"],
        render: makeup(
          blush("Circle2", "#C8102E", 85),
          lips(matte("#C8102E", 90), "smile")
        ),
      },
      {
        title: "Wild black hair",
        howTo: "Finish with a mop of wild black hair.",
        products: ["black curly wig"],
        render: hair("#141414", 85, 20),
      },
    ],
    finish:
      "Swirl the red circles into spirals with a fine brush and draw black puppet lines down from the corners of the mouth.",
  },
  m3gan: {
    look: "M3GAN: flawless porcelain skin, neat brows, lined doll eyes with lashes top and bottom, a cherry-red lip and brown hair.",
    steps: [
      {
        title: "Porcelain skin",
        howTo:
          "Use a full-coverage foundation a few shades lighter than your skin, blur it until it looks poreless, and add a soft glow on the high points.",
        products: ["full coverage light foundation", "liquid highlighter"],
        render: makeup(paler(2, 95, 30), glow("#FFF6EE", 45)),
      },
      {
        title: "Doll eyes",
        howTo:
          "Line the upper lashes in black, add false lashes on top and plenty of mascara on the bottom, and keep the brows neat.",
        products: ["black liquid eyeliner", "false eyelashes", "black mascara"],
        render: makeup(
          liner("Lower11", matte(BLACK, 80)),
          lashes("Upper&Lower1"),
          brows("#4A3528", 60, { name: "SoftArch1" })
        ),
      },
      {
        title: "Cherry lips",
        howTo:
          "Paint a cherry-red satin lipstick and blush the cheeks the faintest pink.",
        products: ["cherry red lipstick", "pink blush"],
        render: makeup(
          lips(satin("#B0101E", 85)),
          blush("Circle2", "#E39A9A", 30)
        ),
      },
      {
        title: "Brown hair",
        howTo: "Finish with smooth brown doll hair and curtain bangs.",
        products: ["m3gan wig"],
        render: hair("#5A3A26", 85, 45),
      },
    ],
  },
  "samara-morgan": {
    look: "Samara: ghostly gray-white skin, deep dark eyes, colorless lips and long wet black hair.",
    steps: [
      {
        title: "Ghostly base",
        howTo:
          "Cover your face with a pale gray-white paint and shade the hollows of the cheeks with gray.",
        products: ["white cream face paint", "gray cream face paint"],
        render: makeup(base("#DCDDD8", 95), contour("#8B8E8C", 55)),
      },
      {
        title: "Dark eyes",
        howTo:
          "Shade the sockets and under the eyes in gray and black, smudged, and line all around in black.",
        products: ["black eyeshadow", "black kohl eyeliner"],
        render: makeup(
          shadow("1color57", matte("#2E2C30", 80)),
          liner("FullRim7", matte(BLACK, 75))
        ),
      },
      {
        title: "Pale lips",
        howTo: "Cover the lips with a pale gray so they fade into the face.",
        products: ["gray lipstick"],
        render: makeup(lips(matte("#9C9796", 75))),
      },
      {
        title: "Black hair",
        howTo: "Finish with long black hair, wet with gel.",
        products: ["long black wig", "hair gel"],
        render: hair("#101010", 90, 70),
      },
    ],
    finish: "Let the wet hair hang over your face.",
  },
  "the-nun-valak": {
    look: "Valak: no brows, a white face with hollow cheeks, black eyes and dark lips.",
    steps: [
      {
        title: "White face, no brows",
        howTo:
          "Glue your brows flat with a glue stick, then cover your face and brows with white cream paint.",
        products: ["brow glue stick", "white cream face paint"],
        render: makeup(base(WHITE), brows("#F2EFE9", 100)),
      },
      {
        title: "Hollow cheeks, black eyes",
        howTo:
          "Hollow the cheeks with gray, deepened with black shadow, and paint black all around the eyes.",
        products: ["gray cream face paint", "black cream face paint"],
        render: makeup(
          contour("#5E5E5E", 70),
          shadow("1color57", matte(BLACK, 95))
        ),
      },
      {
        title: "Dark lips",
        howTo: "Paint the lips a dark gray-black.",
        products: ["black lipstick"],
        render: makeup(lips(matte("#2A2426", 90))),
      },
    ],
    finish:
      "Flick black specks over the face for grime, and add jagged teeth with tooth black or prop teeth.",
  },
  annabelle: {
    look: "Annabelle: porcelain skin, round red cheeks, a tiny red cupid's-bow mouth and auburn braids.",
    steps: [
      {
        title: "Porcelain base",
        howTo:
          "Apply a full-coverage foundation one or two shades lighter than your skin.",
        products: ["full coverage light foundation"],
        render: makeup(paler(2, 95)),
      },
      {
        title: "Doll cheeks and lashes",
        howTo:
          "Blend red cream blush in circles on the apples of your cheeks, and add lashes top and bottom.",
        products: ["red cream blush", "false eyelashes"],
        render: makeup(blush("Circle2", "#C8323C", 70), lashes("Upper&Lower1")),
      },
      {
        title: "Small red mouth",
        howTo:
          "Paint a small red heart-shaped pout in the center of the lips, not out to the corners.",
        products: ["red lipstick", "red lip liner"],
        render: makeup(
          lips(matte("#B3122A", 90), "heart-shaped"),
          lipLine("Rosebud1", "#9C0F22", 85, 40, 80)
        ),
      },
      {
        title: "Auburn braids",
        howTo: "Finish with auburn hair in two braided pigtails.",
        products: ["auburn braided wig"],
        render: hair("#7A2E1F", 85, 25),
      },
    ],
    finish: "Draw jagged cracks across the porcelain with a black eyeliner.",
  },
  "regan-macneil": {
    look: "Possessed Regan: a sickly green-gray pallor, bruised purple eyes, chapped dark lips and matted brown hair.",
    steps: [
      {
        title: "Sickly base",
        howTo:
          "Cover your face with a pale base tinted green, then shade under the cheekbones with green-gray.",
        products: ["pale cream face paint", "green cream face paint"],
        render: makeup(base("#D2D6BE", 85), contour("#7E8A6E", 55)),
      },
      {
        title: "Bruised eyes",
        howTo:
          "Shade around the eyes with purple and blue, darkest right under them, and rim them in a sore red-brown.",
        products: ["purple eyeshadow", "red brown eyeliner"],
        render: makeup(
          shadow("2colors25", matte("#5B4A6E", 70), matte("#3B2C46", 85)),
          liner("FullRim7", matte("#5E2A2E", 60))
        ),
      },
      {
        title: "Chapped lips",
        howTo: "Dab a dull red-brown on the lips and leave them dry.",
        products: ["red brown lip stain"],
        render: makeup(lips(matte("#6B3A36", 70))),
      },
      {
        title: "Matted hair",
        howTo: "Finish with light-brown hair, matted and messy.",
        products: ["light brown wig"],
        render: hair("#6B4E36", 80, 15),
      },
    ],
    finish:
      "Add scabs and scratches with scar wax and a red-brown pencil. Her yellow eyes are contact lenses, which need a prescription.",
  },
  "carrie-white": {
    look: "Carrie at the prom: soft pink 70s makeup and strawberry-blonde waves, before the blood.",
    steps: [
      {
        title: "Soft pink eyes",
        howTo:
          "Sweep a soft pink shadow over the lids and add a coat of mascara.",
        products: ["soft pink eyeshadow", "mascara"],
        render: makeup(
          shadow("1color8", matte("#E2A2B0", 60)),
          lashes("Natural1")
        ),
      },
      {
        title: "Pink cheeks and lips",
        howTo:
          "Warm the cheeks with a little pink blush and gloss the lips pink.",
        products: ["pink blush", "pink lip gloss"],
        render: makeup(
          blush("Round2", "#E59AA6", 40),
          lips(gloss("#E07D93", 70))
        ),
      },
      {
        title: "Strawberry-blonde waves",
        howTo: "Finish with long strawberry-blonde hair curled into waves.",
        products: ["strawberry blonde wig"],
        render: hair("#D69A6A", 80, 35),
      },
    ],
    finish:
      "Then the prom ends: pour fake blood over your hair, face and dress.",
  },
  "count-orlok": {
    look: "Orlok: a deathly pale face, deep skull-like eye sockets, bushy dark brows and thin dark lips.",
    steps: [
      {
        title: "Deathly pale",
        howTo:
          "Cover your face with a pale gray-white paint and sink the cheeks with gray.",
        products: ["white cream face paint", "gray cream face paint"],
        render: makeup(base("#E1DFD6", 95), contour("#77746C", 65)),
      },
      {
        title: "Skull eyes",
        howTo:
          "Shade the sockets deep gray-black all around the eye, and thicken the brows bushy and dark.",
        products: ["black eyeshadow", "dark brow pencil"],
        render: makeup(
          shadow("1color57", matte("#2B2724", 90)),
          brows("#1E1A18", 90, { name: "Original5", thickness: 50 })
        ),
      },
      {
        title: "Thin dark lips",
        howTo: "Paint the lips a thin, dark gray-brown.",
        products: ["dark brown lipstick"],
        render: makeup(
          lips(matte("#4A3A3A", 80)),
          lipLine("Small1", "#3A2A2A", 80, 40, 60)
        ),
      },
    ],
    finish: "A bald cap, pointed ears and rat fangs complete him.",
  },
  pearl: {
    look: "Pearl: a sweet farm girl with rosy cheeks, bright red lips and blonde braids, smiling a little too wide.",
    steps: [
      {
        title: "Rosy cheeks",
        howTo:
          "Keep the skin fresh and natural, and blend pink-red blush high on the cheeks.",
        products: ["pink cream blush"],
        render: makeup(blush("Round2", "#D9576A", 55)),
      },
      {
        title: "Red lips, fair brows",
        howTo:
          "Paint the lips a bright red for the audition, and tint the brows fair.",
        products: ["bright red lipstick", "blonde brow gel"],
        render: makeup(lips(matte("#C21E2C", 85)), brows("#C9A46A", 50)),
      },
      {
        title: "Blonde braids",
        howTo: "Finish with blonde hair in braided pin curls.",
        products: ["blonde braided wig"],
        render: hair("#D9B77A", 80, 30),
      },
    ],
    finish:
      "Spatter fake blood across your face and dress for the farmhouse finale.",
  },
  "freddy-fazbear": {
    look: "Freddy Fazbear in paint: warm brown fur tones, bold black brows, dark-rimmed eyes and brown hair under the top hat.",
    steps: [
      {
        title: "Fur shading",
        howTo:
          "Sponge a warm brown around the edges of your face, into the cheek hollows and down the nose, like fur.",
        products: ["brown cream face paint", "makeup sponge"],
        render: makeup(shading("Bronzer3", "#6A4228", 60)),
      },
      {
        title: "Bold brows and eyes",
        howTo:
          "Paint thick black brows and darken around the eyes with black shadow.",
        products: ["black cream face paint", "black eyeshadow"],
        render: makeup(
          brows(BLACK, 95, {
            name: "Straight2",
            thickness: 60,
            definition: 80,
          }),
          shadow("1color23", matte("#2A1A12", 75))
        ),
      },
      {
        title: "Brown hair",
        howTo: "Finish with brown hair tucked under a little top hat.",
        products: ["brown hair color spray"],
        render: hair("#5A3820", 80, 20),
      },
    ],
    finish:
      "Sponge tan around the mouth and chin for his muzzle, paint a black nose tip and a stitched line down to the mouth, then add the top hat and bow tie.",
  },
  "the-grady-twins": {
    look: "The twins: pale porcelain skin, shadowed blank eyes, a hint of pink on the cheeks, berry lips and light-brown hair.",
    steps: [
      {
        title: "Pale porcelain",
        howTo:
          "Use a foundation two shades paler than your skin for a porcelain look, set with translucent powder.",
        products: ["pale foundation", "translucent setting powder"],
        render: makeup(paler(2, 90)),
      },
      {
        title: "Ghostly eyes",
        howTo:
          "Shade softly around the eyes in gray-black so they sink back, with lashes top and bottom.",
        products: ["dark gray eyeshadow", "mascara"],
        render: makeup(
          shadow("1color23", matte("#4A4446", 60)),
          lashes("Upper&Lower1", BLACK, 60)
        ),
      },
      {
        title: "Cheeks and lips",
        howTo: "Add a hint of pink blush and a berry lip.",
        products: ["pink blush", "berry lipstick"],
        render: makeup(
          blush("Circle2", "#E8A0A8", 35),
          lips(matte("#8A3A4E", 70))
        ),
      },
      {
        title: "Light-brown hair",
        howTo:
          "Finish with long, straight light-brown hair parted in the middle.",
        products: ["light brown wig"],
        render: hair("#9A7A58", 80, 25),
      },
    ],
    finish: "It works best twice: bring your twin.",
  },
  "jack-torrance": {
    look: "Jack frozen in the maze: blue-white skin, frosted brows, icy blue hollows, pale lips and frosted hair.",
    steps: [
      {
        title: "Frozen skin",
        howTo:
          "Pat a thin layer of white face paint over your face for a blue-white pallor.",
        products: ["white cream face paint"],
        render: makeup(base("#DCE4EA", 75)),
      },
      {
        title: "Icy hollows",
        howTo:
          "Dust an icy-blue pearly shadow into the cheek hollows, beside the nose and around the eyes.",
        products: ["icy blue shimmer eyeshadow"],
        render: makeup(
          contour("#9FB3C4", 55),
          shadow("1color23", shimmer("#9DB6CC", 60))
        ),
      },
      {
        title: "Frosted brows and lips",
        howTo: "Coat the brows with white and leave the lips a pale gray-blue.",
        products: ["white brow mascara", "pale blue lipstick"],
        render: makeup(brows("#F3F6F8", 85), lips(matte("#9AA6B2", 70))),
      },
      {
        title: "Frosted hair",
        howTo: "Finish with hair frosted gray-white.",
        products: ["white hair color spray"],
        render: hair("#B9BEC2", 75, 20),
      },
    ],
    finish: "Dust fake snow over your hair and shoulders.",
  },
  "hannibal-lecter": {
    look: "Hannibal: prison-pale skin, cold shadowed eyes, pale lips and slicked-back dark hair.",
    steps: [
      {
        title: "Prison pallor",
        howTo:
          "Even out your skin with a foundation a shade or two paler than yours.",
        products: ["pale foundation"],
        render: makeup(paler(1, 70)),
      },
      {
        title: "Cold stare",
        howTo:
          "Shade just around the eyes with a cool gray-brown, and keep the lips pale.",
        products: ["cool brown eyeshadow", "nude lip balm"],
        render: makeup(
          shadow("1color23", matte("#7A6C66", 45)),
          lips(matte("#B89A90", 55))
        ),
      },
      {
        title: "Slicked-back hair",
        howTo: "Comb dark hair straight back with gel.",
        products: ["hair gel"],
        render: hair("#3A2C24", 75, 70),
      },
    ],
    finish:
      "Keep a hint of widow's peak, and the restraint mask for the full effect.",
  },
  "norman-bates": {
    look: "'Mother': a pale, aged face with sunken eyes and cheeks under a gray bun.",
    steps: [
      {
        title: "Pale base",
        howTo: "Use a foundation one or two shades lighter than your skin.",
        products: ["pale foundation"],
        render: makeup(paler(1, 75)),
      },
      {
        title: "Sunken age",
        howTo:
          "Shade under the eyes and under the cheekbones with gray-brown to sink them.",
        products: ["gray brown contour"],
        render: makeup(
          contour("#8A7A6E", 55),
          shadow("1color23", matte("#6E5E58", 55))
        ),
      },
      {
        title: "Gray hair",
        howTo: "Finish with gray hair.",
        products: ["gray bun wig"],
        render: hair("#A3A19B", 85, 15),
      },
    ],
    finish:
      "Pin the hair into a bun and wrap a shawl around your shoulders. For Norman himself, skip the gray and wear a cardigan.",
  },
  "captain-spaulding": {
    look: "Spaulding: a white clown face, bright blue over the eyes, a big red mouth and wild gray-white hair.",
    steps: [
      {
        title: "White face",
        howTo: "Cover your face with white face paint and set it with powder.",
        products: ["white cream face paint", "translucent setting powder"],
        render: makeup(base(WHITE)),
      },
      {
        title: "Blue eyes",
        howTo: "Paint bright blue over the lids, all the way up to the brows.",
        products: ["blue cream face paint"],
        render: makeup(shadow("1color67", matte("#2D5BD3", 85))),
      },
      {
        title: "Big red mouth",
        howTo: "Paint a big red mouth well past the lip line.",
        products: ["red cream face paint"],
        render: makeup(
          lips(matte("#C8102E", 90), "smile"),
          lipLine("Wider1", "#C8102E", 85, 70, 40)
        ),
      },
      {
        title: "Wild gray hair",
        howTo: "Finish with wild, curly gray-white hair.",
        products: ["gray curly clown wig"],
        render: hair("#D8D6CE", 85, 15),
      },
    ],
    finish:
      "Paint the nose red, add black frown lines, and stain your teeth yellow with tooth paint for the full Spaulding.",
  },
  "the-headless-horseman": {
    look: "The Horseman before he lost his head: ghostly pale skin, blackened brows, dark-ringed eyes, pale lips and wild black hair.",
    steps: [
      {
        title: "Ghostly pale",
        howTo:
          "Use a matte foundation two shades paler than your skin and shade the cheeks lightly gray.",
        products: ["pale foundation", "gray contour"],
        render: makeup(paler(2, 90), contour("#8E8A82", 45)),
      },
      {
        title: "Black brows and eyes",
        howTo:
          "Blacken the brows into sharp shapes and smudge black liner all around the eyes.",
        products: ["black brow pencil", "black kohl eyeliner"],
        render: makeup(
          brows(BLACK, 90, { name: "Arrow13", thickness: 20 }),
          liner("PandaSmudge11", matte(BLACK, 80))
        ),
      },
      {
        title: "Pale lips",
        howTo: "Cover the lips with a pale, colorless lipstick.",
        products: ["pale nude lipstick"],
        render: makeup(lips(matte("#B5ADA6", 70))),
      },
      {
        title: "Wild black hair",
        howTo: "Finish with black hair spiked up wildly.",
        products: ["spiky black wig"],
        render: hair("#111111", 85, 20),
      },
    ],
    finish:
      "Add filed, pointed prop teeth. His blue eyes are contact lenses, which need a prescription.",
  },
  candyman: {
    look: "Candyman, the man made of bees: a honey-gold glow, gold and deep-brown eyes and dark lips.",
    steps: [
      {
        title: "Honey glow",
        howTo:
          "Warm the high points of the face with a honey-gold highlighter and sculpt under the cheekbones with a deep brown.",
        products: ["gold highlighter", "deep brown contour"],
        render: makeup(glow("#D9A441", 70), contour("#4A3020", 45)),
      },
      {
        title: "Hive eyes",
        howTo:
          "Press metallic gold shadow on the lids and smoke the outer corners in a deep brown.",
        products: ["metallic gold eyeshadow", "deep brown eyeshadow"],
        render: makeup(
          shadow("2colors83", metallic("#C9A13B", 70), matte("#3A2414", 80))
        ),
      },
      {
        title: "Dark lips",
        howTo: "Stain the lips a dark brown.",
        products: ["dark brown lipstick"],
        render: makeup(lips(matte("#4A2A22", 70))),
      },
    ],
    finish:
      "Place a few prop bees around the mouth and on the coat's fur collar, and add the hook.",
  },
  "the-babadook": {
    look: "The Babadook: a pale face, a dark mask shape around the eyes, a black grin and black hair.",
    steps: [
      {
        title: "Pale face",
        howTo: "Cover your face with white cream paint.",
        products: ["white cream face paint"],
        render: makeup(base("#E6E4DE", 95)),
      },
      {
        title: "Mask eyes",
        howTo:
          "Draw a mask shape around both eyes with a black pencil, fill it with black and soften the edges.",
        products: ["black eyeliner pencil", "black cream face paint"],
        render: makeup(
          shadow("1color57", matte(BLACK, 95)),
          liner("PandaSmudge11", matte(BLACK, 85))
        ),
      },
      {
        title: "Black grin",
        howTo:
          "Outline a wide grin around the lips with black liner and fill it with black paint.",
        products: ["black lip liner", "black cream face paint"],
        render: makeup(
          lips(matte(BLACK, 90), "smile"),
          lipLine("Wider1", BLACK, 90, 70, 40)
        ),
      },
      {
        title: "Black hair",
        howTo: "Finish with black hair under the top hat.",
        products: ["black hair color spray"],
        render: hair("#121212", 85, 20),
      },
    ],
    finish: "Paint jagged white teeth into the grin and put on the top hat.",
  },
  "pirate-clark": {
    look: "Pirate Clark's mascot colors on your face: gaunt washed-out skin, teal and yellow eyes and a faded pink grin stretched too wide.",
    steps: [
      {
        title: "Washed-out skin",
        howTo:
          "Even out your skin with a foundation a shade paler than yours, and stretch the face longer by shading under the cheekbones and at the temples.",
        products: ["pale foundation", "gray brown contour"],
        render: makeup(paler(1, 70), contour("#8C7E70", 50)),
      },
      {
        title: "Mascot eyes",
        howTo:
          "Blend teal over the lids and yellow underneath, the colors of his shirt and vest.",
        products: ["teal eyeshadow", "yellow eyeshadow"],
        render: makeup(
          shadow("2colors25", matte("#1E8A8A", 80), matte("#E3C21B", 75))
        ),
      },
      {
        title: "Stretched grin",
        howTo:
          "Paint the lips a faded pink and stretch the line out past the corners.",
        products: ["pink lipstick", "lip liner"],
        render: makeup(
          lips(matte("#C8607A", 80)),
          lipLine("Wider1", "#B04A66", 80, 60, 30)
        ),
      },
    ],
    finish:
      "A tricorn hat with a white feather, an eyepatch and the pink sash.",
  },
  "ash-williams": {
    look: "Ash after a long night: grimy, tired and shadowed, with messy dark-brown hair.",
    steps: [
      {
        title: "Grime",
        howTo:
          "Sponge a brown-gray shadow along the edges of the face, into the cheek hollows and down the nose.",
        products: ["brown gray eyeshadow", "makeup sponge"],
        render: makeup(shading("Bronzer3", "#6E5A4A", 55)),
      },
      {
        title: "Tired eyes",
        howTo: "Smudge dark brown under and around the eyes.",
        products: ["dark brown eyeshadow"],
        render: makeup(shadow("1color23", matte("#4A3A32", 55))),
      },
      {
        title: "Messy hair",
        howTo: "Finish with dark-brown hair, messed up.",
        products: ["dark brown hair color spray"],
        render: hair("#3A2A1E", 80, 25),
      },
    ],
    finish:
      "Smear fake blood across one cheekbone and the back of your right hand.",
  },
  "dani-the-may-queen": {
    look: "Dani crowned and crying: flushed red cheeks, red-rimmed teary eyes, bare lips and blonde hair.",
    steps: [
      {
        title: "Flushed cheeks",
        howTo: "Blend a red-pink cream blush wide across the cheeks.",
        products: ["red pink cream blush"],
        render: makeup(blush("Round2", "#D9505E", 60)),
      },
      {
        title: "Crying eyes",
        howTo:
          "Line the rims with a soft red pencil and smudge pink-red around the eyes, as if she has been sobbing; keep the lips bare.",
        products: ["red eyeliner pencil", "pink eyeshadow"],
        render: makeup(
          liner("FullRim7", matte("#B8404A", 55)),
          shadow("1color23", matte("#C46A70", 45)),
          lips(matte("#C99088", 45))
        ),
      },
      {
        title: "Blonde hair",
        howTo: "Finish with short blonde hair pulled back from the face.",
        products: ["blonde wig"],
        render: hair("#D6BC86", 80, 30),
      },
    ],
    finish:
      "Wear a tall flower crown; a dab of lip oil on the cheeks reads as tears.",
  },
  "red-and-the-tethered": {
    look: "Red: shadowed, deprived skin, bleached brows, gold lids for the golden glove and a deep red lip for the jumpsuit.",
    steps: [
      {
        title: "Deprived shadows",
        howTo:
          "Shade around the eyes, the cheeks and the temples with a deep brown, so the face looks worn.",
        products: ["deep brown eyeshadow"],
        render: makeup(shading("Bronzer2", "#5A4030", 50)),
      },
      {
        title: "Bleached brows",
        howTo: "Lighten the brows to a pale blonde with a brow gel.",
        products: ["blonde brow gel"],
        render: makeup(brows("#E3D2A8", 80)),
      },
      {
        title: "Gold and red",
        howTo:
          "Press metallic gold shadow on the lids and paint the lips a deep red.",
        products: ["metallic gold eyeshadow", "deep red lipstick"],
        render: makeup(
          shadow("1color8", metallic("#C9A13B", 75)),
          lips(matte("#8E1420", 85))
        ),
      },
    ],
    finish: "The red jumpsuit, one golden glove and gold scissors.",
  },
  "grace-the-bride": {
    look: "Grace on her wedding night: soft bridal glam with warm brown eyes, pink lips and blonde hair, until the blood.",
    steps: [
      {
        title: "Bridal glow",
        howTo:
          "Add a soft glow on the high points and a peachy-pink blush on the cheeks.",
        products: ["liquid highlighter", "peach blush"],
        render: makeup(glow("#FFF1E0", 50), blush("Round2", "#E09A90", 35)),
      },
      {
        title: "Eyes and lips",
        howTo:
          "Blend a warm brown shadow on the lids, deeper at the outer corners, add lashes, and wear a pink satin lipstick.",
        products: ["warm brown eyeshadow", "false eyelashes", "pink lipstick"],
        render: makeup(
          shadow("2colors83", matte("#C79A7E", 55), matte("#6E4A3A", 60)),
          lashes("Natural1"),
          lips(satin("#D48A8E", 70))
        ),
      },
      {
        title: "Blonde hair",
        howTo: "Finish with blonde hair in a braided updo.",
        products: ["blonde wig"],
        render: hair("#D9BE8A", 80, 35),
      },
    ],
    finish:
      "Rip the dress, then smear dirt, soot and fake blood over your face, arms and gown.",
  },
  "lydia-deetz": {
    look: "Lydia: pale skin, peach-washed eyes with dark smudges underneath, dark lips and jet-black hair.",
    steps: [
      {
        title: "Pale base",
        howTo: "Use a foundation two shades paler than your skin.",
        products: ["pale foundation"],
        render: makeup(paler(2, 85)),
      },
      {
        title: "Peach and dark eyes",
        howTo:
          "Sweep peach shadow over the lids up under the brows, smudge dark shadow under the eyes, and line all around in black.",
        products: ["peach eyeshadow", "dark eyeshadow", "black kohl eyeliner"],
        render: makeup(
          shadow("2colors25", matte("#E8A882", 60), matte("#3A2A2E", 70)),
          liner("FullRim7", matte(BLACK, 70))
        ),
      },
      {
        title: "Dark lips",
        howTo: "Paint the lips a dark wine.",
        products: ["dark wine lipstick"],
        render: makeup(lips(matte("#4A1C26", 80))),
      },
      {
        title: "Jet-black hair",
        howTo: "Finish with jet-black hair and long bangs.",
        products: ["black wig with bangs"],
        render: hair("#0F0F0F", 90, 30),
      },
    ],
    finish: "Cut or pin the bangs into spiky points.",
  },
  "tiffany-valentine": {
    look: "Tiffany: a plum smoky eye with a sharp black wing, big lashes, red lips and platinum hair.",
    steps: [
      {
        title: "Plum smoky eye",
        howTo:
          "Lay a light purple on the lids, deepen the outer corner with plum, draw a sharp black wing and add big lashes.",
        products: [
          "purple eyeshadow palette",
          "black liquid eyeliner",
          "false eyelashes",
        ],
        render: makeup(
          shadow("2colors164", matte("#B48AC4", 70), matte("#4A1E4E", 85)),
          liner("OpenWings3", matte(BLACK, 95)),
          lashes("Winged1")
        ),
      },
      {
        title: "Red lips",
        howTo:
          "Line the lips with a darker red or brown, then fill with a bright classic red.",
        products: ["bright red lipstick", "dark red lip liner"],
        render: makeup(
          lips(matte("#C21A2C", 90)),
          lipLine("Natural1", "#6E1A1E", 85, 50, 80)
        ),
      },
      {
        title: "Platinum hair",
        howTo: "Finish with big platinum-blonde hair.",
        products: ["platinum blonde wig"],
        render: hair("#ECE3CF", 85, 35),
      },
    ],
    finish:
      "Dot a beauty mark above the lip; for the doll version, draw stitched scars across the face.",
  },
  "the-craft-coven": {
    look: "Nancy's 90s goth: pale skin, black kohl smudged around plum-brown eyes and a vampy dark berry lip.",
    steps: [
      {
        title: "Pale skin",
        howTo:
          "Use a foundation a shade paler than your skin for a slightly sickly, ethereal look.",
        products: ["pale foundation"],
        render: makeup(paler(1, 70)),
      },
      {
        title: "Smudged kohl",
        howTo:
          "Blend plum-brown shadow over the lids and outer corners, then smudge black kohl all around the eye.",
        products: ["plum eyeshadow", "black kohl pencil"],
        render: makeup(
          shadow("2colors83", matte("#7A3A4E", 65), matte("#2E1626", 80)),
          liner("FullRim7", matte(BLACK, 90))
        ),
      },
      {
        title: "Vampy lips",
        howTo: "Line the lips in purple and fill with a deep, matte berry.",
        products: ["dark berry lipstick", "purple lip liner"],
        render: makeup(
          lips(matte("#4B1630", 90)),
          lipLine("Natural1", "#3A1030", 85, 50, 80)
        ),
      },
      {
        title: "Dark hair",
        howTo: "Finish with dark-brown hair, a little messy.",
        products: ["dark brown wig"],
        render: hair("#2A1E1A", 85, 25),
      },
    ],
  },
  "jennifer-check": {
    look: "Jennifer: luminous skin, grungy smoky eyes, a glossy berry-pink pout and long dark hair.",
    steps: [
      {
        title: "Luminous skin",
        howTo:
          "Add a glow on the high points and sculpt softly under the cheekbones.",
        products: ["liquid highlighter", "contour stick"],
        render: makeup(glow("#FFF0E6", 55), contour("#9A7A6A", 35)),
      },
      {
        title: "Smoky eyes",
        howTo:
          "Smoke a gray-mauve shadow around the eyes, deeper at the corners, smudge black liner into the lashes and add lashes.",
        products: ["smoky eyeshadow palette", "black kohl eyeliner"],
        render: makeup(
          shadow("2colors83", matte("#6E5A62", 60), matte("#2A2228", 75)),
          liner("PandaSmudge1", matte(BLACK, 75)),
          lashes("UpperDense1")
        ),
      },
      {
        title: "Berry gloss",
        howTo: "Finish the lips with a berry-pink gloss.",
        products: ["berry pink lip gloss"],
        render: makeup(lips(gloss("#B04A6E", 70))),
      },
      {
        title: "Dark hair",
        howTo: "Finish with long dark-brown hair.",
        products: ["long dark brown wig"],
        render: hair("#2A1C16", 85, 40),
      },
    ],
    finish: "For the demon, smear fake blood around the mouth and chin.",
  },
  "frank-the-rabbit": {
    look: "Frank in paint: a gray rabbit face, deep black eye holes ringed in silver, and pale gray lips.",
    steps: [
      {
        title: "Gray base",
        howTo:
          "Cover your face with a gray cream paint and shade the hollows darker gray.",
        products: ["gray cream face paint"],
        render: makeup(base("#9C9C9A", 90), contour("#5A5A58", 55)),
      },
      {
        title: "Hollow eyes",
        howTo:
          "Fill the eye sockets with black and ring them with a silver liner.",
        products: ["black cream face paint", "metallic silver eyeliner"],
        render: makeup(
          shadow("1color57", matte(BLACK, 95)),
          liner("FullRim7", metallic("#C8CCD0", 80))
        ),
      },
      {
        title: "Pale lips",
        howTo: "Cover the lips with a pale gray.",
        products: ["gray lipstick"],
        render: makeup(lips(matte("#C9C8C4", 80))),
      },
    ],
    finish:
      "Paint big square white teeth over the mouth and wear gray bunny ears.",
  },
  "the-gill-man": {
    look: "The Gill-man: green skin shaded darker in the hollows, metallic teal-green eyes and green lips.",
    steps: [
      {
        title: "Green skin",
        howTo:
          "Cover your face with green cream paint and shade the hollows with a darker green.",
        products: ["green cream face paint", "dark green cream face paint"],
        render: makeup(base("#5F8A5A", 95), contour("#2E4A2E", 65)),
      },
      {
        title: "Swamp eyes",
        howTo:
          "Press a metallic teal-green on the lids, darken the corners with deep green and line all around.",
        products: ["metallic green eyeshadow", "dark green eyeliner"],
        render: makeup(
          shadow("2colors83", metallic("#3FA08A", 75), matte("#1E3A28", 80)),
          liner("FullRim7", matte("#14261A", 80))
        ),
      },
      {
        title: "Green lips",
        howTo: "Paint the lips green.",
        products: ["green lipstick"],
        render: makeup(lips(matte("#3E5E3C", 80))),
      },
    ],
    finish:
      "Stipple darker green with a sponge for scales, and glue paper or foam fins at the ears.",
  },
  "the-phantom-of-the-opera": {
    look: "Chaney's Phantom: a ghoulish pale face, black skull-socket eyes, sunken cheeks, dark lips and slick black hair.",
    steps: [
      {
        title: "Ghoulish pale",
        howTo:
          "Cover your face with a pale, not quite white, cream paint and sink the cheeks deep gray.",
        products: ["pale cream face paint", "gray cream face paint"],
        render: makeup(base("#DCD8CC", 90), contour("#4E4A44", 70)),
      },
      {
        title: "Skull sockets",
        howTo: "Paint the eye sockets black, all around the eye.",
        products: ["black cream face paint"],
        render: makeup(shadow("1color57", matte(BLACK, 95))),
      },
      {
        title: "Dark lips",
        howTo: "Paint the lips a dark gray-brown.",
        products: ["dark brown lipstick"],
        render: makeup(lips(matte("#3A2E2C", 85))),
      },
      {
        title: "Slick black hair",
        howTo: "Finish with black hair slicked back.",
        products: ["black hair color spray", "hair gel"],
        render: hair("#121212", 85, 60),
      },
    ],
    finish:
      "Blacken the nostrils, add jagged prop teeth, and keep a half mask for the opera.",
  },
  krampus: {
    look: "Krampus: a dark, sculpted demon face in black, brown and blood red, with sharp black brows and black hair.",
    steps: [
      {
        title: "Demon shading",
        howTo:
          "Contour the cheeks, temples and jaw dramatically in near-black brown, and sweep dark red around the eyes and cheeks.",
        products: ["dark brown cream face paint", "dark red cream face paint"],
        render: makeup(
          contour("#2A1A14", 75),
          shading("Bronzer2", "#4A1A14", 60)
        ),
      },
      {
        title: "Black eyes",
        howTo:
          "Blend dark red into black around the eyes, smudge black liner up and out, and draw sharp black brows.",
        products: [
          "dark red eyeshadow",
          "black eyeshadow",
          "black brow pencil",
        ],
        render: makeup(
          shadow("2colors83", matte("#6A1414", 70), matte(BLACK, 90)),
          liner("PandaSmudge11", matte(BLACK, 85)),
          brows(BLACK, 90, { name: "Arrow13" })
        ),
      },
      {
        title: "Blood-red lips",
        howTo: "Paint the lips a blood red so dark it's almost black.",
        products: ["dark red lipstick"],
        render: makeup(lips(matte("#5A0A10", 90))),
      },
      {
        title: "Black hair",
        howTo: "Finish with shaggy black hair.",
        products: ["black hair color spray"],
        render: hair("#121212", 85, 20),
      },
    ],
    finish: "Horns, fur, a long red tongue, and bells and chains on the belt.",
  },
  "damien-thorn": {
    look: "Damien: a pale, solemn face, faintly shadowed eyes and dark hair.",
    steps: [
      {
        title: "Solemn pallor",
        howTo:
          "Lighten the skin with a sheer foundation a shade paler than yours and shade softly under the eyes.",
        products: ["pale foundation", "taupe eyeshadow"],
        render: makeup(paler(1, 60), shadow("1color23", matte("#6E5E5A", 40))),
      },
      {
        title: "Dark hair",
        howTo: "Finish with dark, slightly curly hair.",
        products: ["black hair color spray"],
        render: hair("#151210", 85, 25),
      },
    ],
    finish: "Draw 666 on your scalp, hidden under the hair.",
  },
  "kayako-saeki": {
    look: "Kayako: a white, lifeless face, dark hollow eyes, gray lips and long black hair.",
    steps: [
      {
        title: "White face",
        howTo: "Cover your face with a white or very light cream paint.",
        products: ["white cream face paint"],
        render: makeup(base("#EFEEEA", 95)),
      },
      {
        title: "Hollow eyes",
        howTo:
          "Shade dark, hollow sockets all around the eyes and line them in black.",
        products: ["black eyeshadow", "black kohl eyeliner"],
        render: makeup(
          shadow("1color57", matte("#24202A", 85)),
          liner("FullRim7", matte(BLACK, 80))
        ),
      },
      {
        title: "Gray lips",
        howTo: "Cover the lips with gray.",
        products: ["gray lipstick"],
        render: makeup(lips(matte("#8E8A8A", 75))),
      },
      {
        title: "Long black hair",
        howTo: "Finish with long black hair.",
        products: ["long black wig"],
        render: hair("#101010", 90, 40),
      },
    ],
    finish: "Let the hair fall over your face.",
  },
  "victor-crowley": {
    look: "Victor Crowley: mottled red-purple skin, a sunken face, dark hollow eyes and long black hair.",
    steps: [
      {
        title: "Mottled skin",
        howTo:
          "With a sponge, push red-purple onto the cheekbones and dark brown into the hollows, blotchy on purpose.",
        products: [
          "red purple cream face paint",
          "dark brown cream face paint",
        ],
        render: makeup(
          blush("Oblique2", "#8A3A4A", 60),
          contour("#5A4A40", 65)
        ),
      },
      {
        title: "Sunken eyes",
        howTo: "Shade the sockets a dark red-brown all around the eyes.",
        products: ["dark red brown eyeshadow"],
        render: makeup(shadow("1color57", matte("#3A2228", 80))),
      },
      {
        title: "Long black hair",
        howTo: "Finish with long, stringy black hair.",
        products: ["long black wig"],
        render: hair("#141414", 85, 20),
      },
    ],
    finish:
      "Build scars with scar wax and carry the hatchet. His clouded eye is a white contact lens, which needs a prescription.",
  },
  "laurie-strode": {
    look: "Laurie in '78: a natural 70s face with soft lids, mascara, rosy lips and short light waves.",
    steps: [
      {
        title: "Soft 70s eyes",
        howTo: "Wash a soft taupe over the lids and add a coat of mascara.",
        products: ["taupe eyeshadow", "mascara"],
        render: makeup(
          shadow("1color8", matte("#B89A88", 45)),
          lashes("Natural1", BLACK, 70)
        ),
      },
      {
        title: "Rosy cheeks and lips",
        howTo: "Add a little rose blush and a rosy satin lipstick.",
        products: ["rose blush", "rosy lipstick"],
        render: makeup(
          blush("Round2", "#D9909A", 30),
          lips(satin("#C77A80", 60))
        ),
      },
      {
        title: "Light waves",
        howTo: "Finish with short, light honey-blonde waves.",
        products: ["short honey blonde wig"],
        render: hair("#C9A570", 80, 30),
      },
    ],
    finish: "Add fake blood on the light-blue shirt for the closet scene.",
  },
  dollface: {
    look: "Dollface's mask on your skin: porcelain white, round pink cheeks, painted brows, a tiny red mouth and blonde hair.",
    steps: [
      {
        title: "Porcelain white",
        howTo: "Cover your face with a porcelain-white cream paint.",
        products: ["porcelain white cream face paint"],
        render: makeup(base("#F2E8DE", 95)),
      },
      {
        title: "Doll features",
        howTo:
          "Paint round pink cheeks, draw thin, arched brown brows and add doll lashes top and bottom.",
        products: ["pink cream blush", "brown brow pencil", "false eyelashes"],
        render: makeup(
          blush("Circle2", "#E58A9A", 60),
          brows("#6A4A3A", 80, { name: "Thin1", curvature: 50 }),
          lashes("Upper&Lower1")
        ),
      },
      {
        title: "Tiny mouth",
        howTo: "Paint a tiny red heart-shaped mouth in the center of the lips.",
        products: ["red lipstick", "red lip liner"],
        render: makeup(
          lips(matte("#B3122A", 90), "heart-shaped"),
          lipLine("Small1", "#9C0F22", 85, 40, 80)
        ),
      },
      {
        title: "Blonde hair",
        howTo: "Finish with blonde hair.",
        products: ["blonde wig"],
        render: hair("#D8BE8E", 80, 30),
      },
    ],
    finish: "Keep your face still and blank: the stare does the rest.",
  },
  "the-purge-anarchists": {
    look: "Lady Liberty's mask in paint: teal-green skin, dark eyes and a pale teal smile.",
    steps: [
      {
        title: "Teal skin",
        howTo:
          "Cover your face with teal cream paint and shade the hollows a darker teal.",
        products: ["teal cream face paint"],
        render: makeup(base("#3E8E86", 95), contour("#2A5E58", 55)),
      },
      {
        title: "Dark eyes",
        howTo: "Shade a dark circle all around each eye.",
        products: ["black eyeshadow"],
        render: makeup(shadow("1color57", matte("#1A2E2C", 85))),
      },
      {
        title: "Pale smile",
        howTo:
          "Paint a wide smile over the lips in a lighter teal, past the corners.",
        products: ["light teal cream face paint"],
        render: makeup(
          lips(matte("#9ED6CC", 85), "smile"),
          lipLine("Wider1", "#7CC0B6", 80, 60, 50)
        ),
      },
    ],
    finish:
      "Draw little X stitches over the eyes and spatter red paint for blood.",
  },
  "killer-klowns": {
    look: "A Klown from outer space: candy-pink skin, bright blue and pink eyes, a big red mouth and bright green hair, like Jumbo's.",
    steps: [
      {
        title: "Candy-pink base",
        howTo: "Cover your face with a candy-pink cream paint.",
        products: ["pink cream face paint"],
        render: makeup(base("#F2C6CF", 90)),
      },
      {
        title: "Clown eyes",
        howTo:
          "Sweep bright blue under and inside the eyes and hot pink up into a wing, and arch the brows high and dark.",
        products: [
          "bright blue eyeshadow",
          "hot pink eyeshadow",
          "brow pencil",
        ],
        render: makeup(
          shadow("2colors164", matte("#2DB3E0", 85), matte("#E0218A", 85)),
          brows("#2A1A3A", 85, { name: "HighArch4" })
        ),
      },
      {
        title: "Big red mouth",
        howTo: "Paint a big, plump red mouth well past the lip line.",
        products: ["red cream face paint"],
        render: makeup(
          lips(matte("#D0102C", 95), "plump"),
          lipLine("Large&Full1", "#D0102C", 90, 70, 40)
        ),
      },
      {
        title: "Green hair",
        howTo: "Finish with bright green hair.",
        products: ["green clown wig"],
        render: hair("#3FB83F", 90, 30),
      },
    ],
    finish: "Add fang teeth and a pointed hat; the popcorn gun is optional.",
  },
  remmick: {
    look: "Remmick: pale 1930s skin, hungry shadowed eyes, bloodless lips and light-brown hair.",
    steps: [
      {
        title: "Pale skin",
        howTo:
          "Use a foundation a shade or two lighter than your skin and shade under the cheekbones.",
        products: ["pale foundation", "contour"],
        render: makeup(paler(1, 70), contour("#8A7A6E", 40)),
      },
      {
        title: "Hungry eyes",
        howTo:
          "Shade softly around the eyes in a red-brown and keep the lips pale.",
        products: ["red brown eyeshadow", "nude lip balm"],
        render: makeup(
          shadow("1color23", matte("#6A4A48", 50)),
          lips(matte("#A06A68", 55))
        ),
      },
      {
        title: "Light-brown hair",
        howTo: "Finish with light-brown hair, combed back.",
        products: ["light brown hair color spray"],
        render: hair("#8A6A4A", 80, 35),
      },
    ],
    finish:
      "Smear fake blood around the mouth and add fangs. His red eyes are contact lenses, which need a prescription.",
  },
  longlegs: {
    look: "Longlegs: a cold-cream white face, red lips and long, stringy white-blond hair.",
    steps: [
      {
        title: "Cold-cream white",
        howTo:
          "Cover your face with a white cream, thick but not quite opaque, like cold cream.",
        products: ["white cream face paint"],
        render: makeup(base("#F1ECE2", 85)),
      },
      {
        title: "Red lips",
        howTo: "Paint the lips red, a little past the line.",
        products: ["red lipstick"],
        render: makeup(
          lips(matte("#C2343C", 80)),
          lipLine("Large&Full1", "#B02A32", 75, 50, 40)
        ),
      },
      {
        title: "White-blond hair",
        howTo: "Finish with long, stringy white-blond hair.",
        products: ["long white blonde wig"],
        render: hair("#E7DFC8", 85, 20),
      },
    ],
    finish: "His swollen nose and cheeks are prosthetics; you can skip them.",
  },
  david: {
    look: "David: pale skin, smudged 80s punk eyes and a platinum mullet.",
    steps: [
      {
        title: "Pale skin",
        howTo:
          "Use a foundation a shade lighter than your skin and shade under the cheekbones.",
        products: ["pale foundation", "contour"],
        render: makeup(paler(1, 65), contour("#8C7A6E", 45)),
      },
      {
        title: "Punk eyes",
        howTo:
          "Smudge black liner all around the eyes and a dark shadow under them.",
        products: ["black kohl eyeliner", "dark eyeshadow"],
        render: makeup(
          liner("PandaSmudge1", matte(BLACK, 80)),
          shadow("1color23", matte("#3A2E34", 55))
        ),
      },
      {
        title: "Platinum mullet",
        howTo: "Finish with a spiky platinum-blonde mullet.",
        products: ["platinum blonde mullet wig"],
        render: hair("#ECE4CF", 85, 30),
      },
    ],
    finish:
      "Add fangs and a long black coat. His yellow eyes are contact lenses, which need a prescription.",
  },
  "the-creeper": {
    look: "The Creeper: dark, leathery olive skin, a heavy brow, sunken black eyes and a lipless mouth.",
    steps: [
      {
        title: "Leathery skin",
        howTo:
          "Cover your face with a dark olive cream paint and shade the hollows near-black.",
        products: ["dark olive cream face paint", "black cream face paint"],
        render: makeup(base("#4E5A3A", 90), contour("#2E2A20", 70)),
      },
      {
        title: "Sunken eyes",
        howTo:
          "Fill the sockets with black and thicken the brows into a heavy, low ridge.",
        products: ["black cream face paint", "black brow pencil"],
        render: makeup(
          shadow("1color57", matte(BLACK, 90)),
          brows("#1E1C14", 90, { name: "Straight2", thickness: 60 })
        ),
      },
      {
        title: "Lipless mouth",
        howTo: "Cover the lips with the base color so they disappear.",
        products: ["dark olive cream face paint"],
        render: makeup(lips(matte("#4E5A3A", 90))),
      },
    ],
    finish: "A wide-brim hat, a long coat, and jagged teeth if you dare.",
  },
  "stripe-and-gizmo": {
    look: "Stripe: green gremlin skin, dark sunken eyes rimmed in red, and a white mohawk.",
    steps: [
      {
        title: "Gremlin skin",
        howTo:
          "Cover your face with green cream paint and shade the hollows a darker green.",
        products: ["green cream face paint"],
        render: makeup(base("#6E8F4A", 95), contour("#3A5228", 65)),
      },
      {
        title: "Gremlin eyes",
        howTo: "Shade the sockets dark brown and rim the eyes in red.",
        products: ["dark brown eyeshadow", "red eyeliner"],
        render: makeup(
          shadow("1color57", matte("#2A1A10", 80)),
          liner("FullRim7", matte("#8A1A1A", 70))
        ),
      },
      {
        title: "White hair",
        howTo: "Finish with white hair.",
        products: ["white hair color spray"],
        render: hair("#F2F2EE", 85, 20),
      },
    ],
    finish:
      "Spike the white hair into a mohawk. His red eyes are contact lenses, which need a prescription.",
  },
  "dr-frank-n-furter": {
    look: "Frank-N-Furter: dramatic dark brows, a black-and-purple upswept cat eye, big lashes, deep red lips and black curls.",
    steps: [
      {
        title: "Base and brows",
        howTo:
          "Lighten the skin with a foundation a shade paler than yours and draw the brows extremely dark, long and arched.",
        products: ["pale foundation", "black brow pencil"],
        render: makeup(
          paler(1, 60),
          brows(BLACK, 95, { name: "Arrow13", curvature: 50, thickness: 30 })
        ),
      },
      {
        title: "Cat eye",
        howTo:
          "Blend purple under and inside the eye, sweep matte black up into a cat eye, line it sharp and add big lashes.",
        products: ["purple eyeshadow", "black eyeshadow", "false eyelashes"],
        render: makeup(
          shadow("2colors164", matte("#5A2A6A", 80), matte(BLACK, 95)),
          liner("OpenWings3", matte(BLACK, 95)),
          lashes("Winged1")
        ),
      },
      {
        title: "Deep red lips",
        howTo: "Line the lips dark and fill with a deep red.",
        products: ["deep red lipstick", "dark lip liner"],
        render: makeup(
          lips(matte("#6E0E1E", 90)),
          lipLine("Natural1", "#3E0A12", 85, 50, 80)
        ),
      },
      {
        title: "Black curls",
        howTo: "Finish with short black curls.",
        products: ["black curly wig"],
        render: hair("#121212", 85, 40),
      },
    ],
    finish: "Pearls, a corset and a lot of attitude.",
  },
  "annie-wilkes": {
    look: "Annie: a plain, no-nonsense face, a touch of warmth on the cheeks, muted rose lips and a brown bob.",
    steps: [
      {
        title: "Plain face",
        howTo:
          "Skip the glamour: warm the cheeks with a neutral blush and wear a muted rose lipstick, never glossy.",
        products: ["neutral blush", "muted rose lipstick"],
        render: makeup(
          blush("Round2", "#CF8E86", 30),
          lips(matte("#A46A6C", 55))
        ),
      },
      {
        title: "Brown bob",
        howTo: "Finish with a brown bob, curled under at the ends.",
        products: ["brown bob wig"],
        render: hair("#5A4030", 80, 25),
      },
    ],
    finish: "A cardigan and a small silver cross.",
  },
  "patrick-bateman": {
    look: "Patrick Bateman after the morning routine: poreless, glowing skin and slicked-back dark hair.",
    steps: [
      {
        title: "Poreless skin",
        howTo:
          "Cleanse, scrub, mask and moisturize, then add a little glow on the cheekbones and the bridge of the nose.",
        products: [
          "herb mint facial mask",
          "moisturizer",
          "liquid highlighter",
        ],
        render: makeup(smooth(80), glow("#FFF4E8", 50)),
      },
      {
        title: "Slicked-back hair",
        howTo: "Comb dark hair straight back with gel.",
        products: ["hair gel"],
        render: hair("#2E2018", 75, 80),
      },
    ],
    finish: "A business card in your breast pocket.",
  },
  tarman: {
    look: "Tarman: tar-black creeping in from the edges, black sockets and lips, and golden ochre on the cheekbones.",
    steps: [
      {
        title: "Creeping tar",
        howTo:
          "Sponge black-brown paint in from the edges of the face, into the hollows and down the nose, as if tar is swallowing it.",
        products: ["dark brown cream face paint", "black cream face paint"],
        render: makeup(
          shading("Bronzer3", "#1A140E", 75),
          contour("#0E0A08", 75)
        ),
      },
      {
        title: "Ochre and sockets",
        howTo:
          "Sponge golden ochre over the cheekbones, and fill the eye sockets with black.",
        products: ["ochre cream face paint", "black cream face paint"],
        render: makeup(
          blush("Oblique2", "#B5862E", 50),
          shadow("1color57", matte(BLACK, 95))
        ),
      },
      {
        title: "Black lips",
        howTo: "Paint the lips black.",
        products: ["black lipstick"],
        render: makeup(lips(matte("#14100C", 90))),
      },
    ],
    finish:
      "Drip glossy brown and black down the face with lip gloss or slime for the tar.",
  },
  "the-zombie": {
    look: "A 1968 zombie: ashen gray-green skin, sunken cheeks, bruised green-and-black eyes and gray lips.",
    steps: [
      {
        title: "Ashen skin",
        howTo:
          "Cover your face with a pale gray-green cream paint and sink the cheeks with darker gray.",
        products: ["gray cream face paint", "green cream face paint"],
        render: makeup(base("#B9BCAE", 90), contour("#6E7264", 65)),
      },
      {
        title: "Dead eyes",
        howTo:
          "Layer green over the lids and black-purple under the eyes, then line all around in black.",
        products: [
          "green eyeshadow",
          "dark purple eyeshadow",
          "black eyeliner",
        ],
        render: makeup(
          shadow("2colors25", matte("#5E7A4E", 65), matte("#2A1E2E", 85)),
          liner("FullRim7", matte(BLACK, 70))
        ),
      },
      {
        title: "Gray lips",
        howTo: "Cover the lips with gray.",
        products: ["gray lipstick"],
        render: makeup(lips(matte("#7E7A7A", 75))),
      },
    ],
    finish:
      "Dribble fake blood from the mouth and rub dirt on your face and clothes.",
  },
  "the-lipstick-face-demon": {
    look: "The Lipstick-Face Demon: a red face, black around the eyes, a black mouth and black hair.",
    steps: [
      {
        title: "Red face",
        howTo:
          "Glue your brows flat, then cover your face and brows with bright red paint.",
        products: ["brow glue stick", "red cream face paint"],
        render: makeup(base("#B3121B", 95), brows("#B3121B", 95)),
      },
      {
        title: "Black eyes",
        howTo: "Paint black all around the eyes and smudge it up and out.",
        products: ["black cream face paint"],
        render: makeup(
          shadow("1color57", matte(BLACK, 95)),
          liner("PandaSmudge11", matte(BLACK, 90))
        ),
      },
      {
        title: "Black mouth",
        howTo: "Paint the lips black and pull the color past the corners.",
        products: ["black lipstick"],
        render: makeup(
          lips(matte(BLACK, 95)),
          lipLine("Wider1", BLACK, 90, 70, 30)
        ),
      },
      {
        title: "Black hair",
        howTo: "Finish with long black hair.",
        products: ["long black wig"],
        render: hair("#111111", 90, 25),
      },
    ],
    finish:
      "Paint black flame-like marks up from the jaw and around the eyes. His yellow eyes are contact lenses, which need a prescription.",
  },
  "eric-draven": {
    look: "The Crow: a distressed white face, black smudged sunken eyes, black lips and black hair.",
    steps: [
      {
        title: "White face",
        howTo:
          "Cover your face with white cream or water-activated paint, a little distressed rather than clown-perfect, and set it with powder.",
        products: ["white cream face paint", "translucent setting powder"],
        render: makeup(base("#F1EEE8", 92)),
      },
      {
        title: "Black eyes",
        howTo:
          "Pack matte black shadow on the lids and under the eyes, past their natural shape, and smudge it for a tormented look.",
        products: ["matte black eyeshadow"],
        render: makeup(
          shadow("1color57", matte(BLACK, 90)),
          liner("PandaSmudge11", matte(BLACK, 90))
        ),
      },
      {
        title: "Black lips",
        howTo: "Paint the lips black.",
        products: ["black lipstick"],
        render: makeup(lips(matte(BLACK, 95))),
      },
      {
        title: "Black hair",
        howTo: "Finish with long black hair.",
        products: ["long black wig"],
        render: hair("#0F0F0F", 90, 35),
      },
    ],
    finish:
      "Draw a black line down through each eye, and one from each corner of the mouth.",
  },
  "pamela-voorhees": {
    look: "Mrs. Voorhees: a plain 1980 face with soft blue lids, coral lips and short light-brown hair.",
    steps: [
      {
        title: "Soft blue lids",
        howTo:
          "Wash a soft powder blue over the lids and add a little mascara.",
        products: ["powder blue eyeshadow", "mascara"],
        render: makeup(
          shadow("1color8", matte("#8EA6C8", 45)),
          lashes("Natural1", BLACK, 60)
        ),
      },
      {
        title: "Coral lips",
        howTo: "Add a touch of coral to the cheeks and lips.",
        products: ["coral blush", "coral lipstick"],
        render: makeup(
          blush("Round2", "#C88070", 25),
          lips(matte("#C86E62", 60))
        ),
      },
      {
        title: "Short hair",
        howTo: "Finish with short light-brown hair.",
        products: ["short light brown wig"],
        render: hair("#8A6A48", 80, 25),
      },
    ],
    finish:
      "Pull the hair back, wear the cardigan, and keep the hunting knife hidden.",
  },
  "the-invisible-man": {
    look: "The Invisible Man fading out: ghostly white skin, goggle-dark eyes and colorless lips, before the bandages go on.",
    steps: [
      {
        title: "Ghostly skin",
        howTo:
          "Cover your face with a white cream paint and shade it lightly gray at the edges.",
        products: ["white cream face paint"],
        render: makeup(base("#EFEFEC", 85), contour("#A8A8A4", 40)),
      },
      {
        title: "Goggle eyes",
        howTo: "Fill the eye sockets with black, round like goggles.",
        products: ["black cream face paint"],
        render: makeup(shadow("1color57", matte(BLACK, 95))),
      },
      {
        title: "Colorless lips",
        howTo: "Cover the lips with the white base.",
        products: ["white cream face paint"],
        render: makeup(lips(matte("#D8D6D0", 85))),
      },
    ],
    finish:
      "Wrap your head in white gauze over the paint, and add round dark goggles and a hat.",
  },
  "sweeney-todd": {
    look: "Sweeney: a pale death mask, heavy red-rimmed dark circles, dark lips and black hair.",
    steps: [
      {
        title: "Death mask",
        howTo:
          "Use a matte foundation two shades paler than your skin and shade under the cheekbones.",
        products: ["pale matte foundation", "gray contour"],
        render: makeup(paler(2, 85), contour("#7E746C", 50)),
      },
      {
        title: "Haunted eyes",
        howTo:
          "Shade the lids dark, put red under the eyes, and rim them in a dark red.",
        products: ["dark eyeshadow", "red eyeshadow", "dark red eyeliner"],
        render: makeup(
          shadow("2colors25", matte("#3A2E36", 80), matte("#7A2A2E", 75)),
          liner("FullRim7", matte("#5A1A1E", 60))
        ),
      },
      {
        title: "Dark lips",
        howTo: "Paint the lips a dark mauve-gray.",
        products: ["dark mauve lipstick"],
        render: makeup(lips(matte("#5A4048", 80))),
      },
      {
        title: "Black hair",
        howTo: "Finish with frizzy black hair.",
        products: ["sweeney todd wig"],
        render: hair("#151515", 85, 20),
      },
    ],
    finish:
      "Add the white streak at the front with white hair color spray, and frizz the hair up.",
  },
  "lestat-de-lioncourt": {
    look: "Lestat: luminous porcelain skin, blond brows, pale mauve lips and golden-blond hair.",
    steps: [
      {
        title: "Luminous skin",
        howTo:
          "Use a glowy foundation two shades paler than your skin, and add a soft highlight on the cheekbones and nose.",
        products: ["pale luminous foundation", "liquid highlighter"],
        render: makeup(paler(2, 80, 40), glow("#FFFFFF", 55)),
      },
      {
        title: "Blond brows, pale lips",
        howTo: "Tint the brows blond and wear a pale mauve satin lip.",
        products: ["blonde brow gel", "pale mauve lipstick"],
        render: makeup(brows("#D3B676", 75), lips(satin("#C79A9E", 55))),
      },
      {
        title: "Golden hair",
        howTo: "Finish with long golden-blond hair.",
        products: ["long golden blonde wig"],
        render: hair("#D8B66E", 85, 40),
      },
    ],
    finish:
      "Draw faint blue veins at the temples with a fine blue pencil, and add fangs.",
  },
  "georgie-denbrough": {
    look: "Georgie after the storm drain: soaked blue-gray skin, bruised yellow and purple sunken eyes and blue lips.",
    steps: [
      {
        title: "Soaked skin",
        howTo:
          "Cover your face with a pale blue-gray cream paint and shade the cheeks gray.",
        products: ["blue gray cream face paint"],
        render: makeup(base("#C4CDD0", 80), contour("#7E8A90", 50)),
      },
      {
        title: "Bruised eyes",
        howTo:
          "Blend a sickly yellow-green over the lids and purple under the eyes.",
        products: ["yellow green eyeshadow", "purple eyeshadow"],
        render: makeup(
          shadow("2colors25", matte("#A6A85E", 55), matte("#4A3E52", 75))
        ),
      },
      {
        title: "Blue lips",
        howTo: "Dab a cold blue onto the lips.",
        products: ["blue lipstick"],
        render: makeup(lips(matte("#6E7A94", 75))),
      },
    ],
    finish: "Wet your hair, wear the yellow raincoat and carry a paper boat.",
  },
  "the-leprechaun": {
    look: "The Leprechaun: ruddy cheeks, thick ginger brows, green lids and ginger hair.",
    steps: [
      {
        title: "Ruddy skin",
        howTo:
          "Rub a red blush wide over the cheeks and shade under the cheekbones with a warm brown.",
        products: ["red cream blush", "warm brown contour"],
        render: makeup(blush("Round2", "#C2443A", 60), contour("#7A5240", 45)),
      },
      {
        title: "Brows and lids",
        howTo:
          "Thicken the brows with a ginger pencil and wash green over the lids.",
        products: ["ginger brow pencil", "green eyeshadow"],
        render: makeup(
          brows("#A4421C", 90, { name: "Original5", thickness: 60 }),
          shadow("1color8", matte("#3E7A3A", 60))
        ),
      },
      {
        title: "Ginger hair",
        howTo: "Finish with curly ginger hair.",
        products: ["curly ginger wig"],
        render: hair("#B5541C", 85, 25),
      },
    ],
    finish:
      "Add a curly red beard, pointed ears, the green hat and a few gold coins.",
  },
  "mr-boogie-bughuul": {
    look: "Bughuul: a white face, darkened eyes, a black-filled mouth and long black hair.",
    steps: [
      {
        title: "White face",
        howTo:
          "Cover your face and neck with white paint and shade the hollows lightly gray.",
        products: ["white cream face paint"],
        render: makeup(base(WHITE, 95), contour("#8E8E8A", 45)),
      },
      {
        title: "Dark eyes",
        howTo: "Darken the lids and under the eyes with black.",
        products: ["black eyeshadow"],
        render: makeup(shadow("1color23", matte("#1E1E1E", 85))),
      },
      {
        title: "Black mouth",
        howTo:
          "Blend black over and around the mouth so it looks blurred open.",
        products: ["black cream face paint"],
        render: makeup(
          lips(matte(BLACK, 95)),
          lipLine("Large&Full1", BLACK, 90, 70, 40)
        ),
      },
      {
        title: "Long black hair",
        howTo: "Finish with long black hair.",
        products: ["long black wig"],
        render: hair("#111111", 90, 25),
      },
    ],
  },
  "ellen-ripley": {
    look: "Ripley on the Nostromo: a clean, tired face with shadowed eyes and dark curly hair.",
    steps: [
      {
        title: "Long-shift shadows",
        howTo:
          "Skip the makeup; just shade a little brown-gray under the eyes and at the edges of the face.",
        products: ["taupe eyeshadow"],
        render: makeup(
          shadow("1color23", matte("#6A5A54", 40)),
          shading("Bronzer3", "#7A6A5E", 35)
        ),
      },
      {
        title: "Curly hair",
        howTo: "Finish with dark-brown curly hair.",
        products: ["curly dark brown wig"],
        render: hair("#3A281C", 80, 25),
      },
    ],
    finish: "The olive flight suit, and a cat carrier.",
  },
  slappy: {
    look: "Slappy: a pale dummy face, shaded lids, thick arched black brows, rosy cheeks, a red grin and slick black hair.",
    steps: [
      {
        title: "Dummy base",
        howTo:
          "Use a foundation a shade paler than your skin and shade the lids up under the brows a darker tone.",
        products: ["pale foundation", "brown eyeshadow"],
        render: makeup(paler(1, 85), shadow("1color67", matte("#9A7A6A", 55))),
      },
      {
        title: "Brows and cheeks",
        howTo:
          "Draw thick, high-arched black brows and blend round rosy cheeks.",
        products: ["black brow pencil", "rose cream blush"],
        render: makeup(
          brows(BLACK, 95, { name: "HighArch4", curvature: 40, thickness: 50 }),
          blush("Circle2", "#D8505A", 65)
        ),
      },
      {
        title: "Red grin",
        howTo: "Paint a bright red grin, a little wider than your lips.",
        products: ["bright red lipstick"],
        render: makeup(
          lips(matte("#C21E2C", 90), "smile"),
          lipLine("Wider1", "#A01824", 85, 60, 50)
        ),
      },
      {
        title: "Slick black hair",
        howTo: "Finish with black hair slicked back.",
        products: ["black hair color spray", "hair gel"],
        render: hair("#121212", 85, 70),
      },
    ],
    finish:
      "Draw black lines from the corners of the mouth down to the chin for the dummy's jaw.",
  },
  "john-carver": {
    look: "John Carver's pilgrim mask in paint: orange skin, dead black eyes, painted brows and pursed lips.",
    steps: [
      {
        title: "Mask skin",
        howTo:
          "Cover your face with an orange cream paint and sponge a lighter orange around the edges.",
        products: ["orange cream face paint", "peach cream face paint"],
        render: makeup(base("#E08A4E", 85), shading("Bronzer3", "#E8B88E", 50)),
      },
      {
        title: "Dead black eyes",
        howTo:
          "Fill the eye sockets with black and paint flat, straight brows.",
        products: ["black cream face paint", "brown brow pencil"],
        render: makeup(
          shadow("1color57", matte(BLACK, 95)),
          brows("#6A3A20", 80, { name: "Straight2" })
        ),
      },
      {
        title: "Pursed lips",
        howTo: "Paint small, pursed lips in a muted orange-brown.",
        products: ["orange brown lipstick"],
        render: makeup(
          lips(matte("#B06A52", 80), "pouty"),
          lipLine("Small1", "#8A4A36", 80, 50, 70)
        ),
      },
    ],
    finish:
      "A black jumpsuit and the pilgrim hat; for the burnt mask, sponge black soot over one side.",
  },
  blade: {
    look: "The Daywalker: matte, sharply sculpted skin and clean, defined brows behind the shades.",
    steps: [
      {
        title: "Sculpted skin",
        howTo:
          "Mattify the skin and sculpt under the cheekbones, the temples and the jaw with a deep brown.",
        products: ["mattifying powder", "deep brown contour"],
        render: makeup(
          contour("#3A2418", 55),
          shading("Bronzer3", "#5A3A24", 40)
        ),
      },
      {
        title: "Sharp brows",
        howTo: "Define the brows clean and straight.",
        products: ["brow pencil"],
        render: makeup(
          brows(BLACK, 70, { name: "Straight2", thickness: 10, definition: 80 })
        ),
      },
    ],
    finish: "Narrow black sunglasses, the long coat and the sword.",
  },
  "danny-torrance": {
    look: "Danny after the Overlook: pale, scared and sleepless, with dark circles and a brown 70s shag.",
    steps: [
      {
        title: "Sleepless face",
        howTo:
          "Lighten the skin with a sheer foundation a shade paler than yours and shade dark circles under the eyes.",
        products: ["pale foundation", "gray purple eyeshadow"],
        render: makeup(paler(1, 55), shadow("1color23", matte("#5E4E58", 55))),
      },
      {
        title: "Brown shag",
        howTo: "Finish with a brown 70s shag.",
        products: ["brown shag wig"],
        render: hair("#6A4A2E", 80, 25),
      },
    ],
    finish: "The red rocket sweater, and a raised finger: 'Redrum.'",
  },
  "sidney-prescott": {
    look: "Sidney in '96: a minimal 90s face with mascara, a peachy-brown lip and dark-brown hair.",
    steps: [
      {
        title: "90s minimal",
        howTo:
          "Wash a soft brown over the lids, coat the lashes in black mascara, and wear a sheer peachy-brown lipstick.",
        products: [
          "soft brown eyeshadow",
          "black mascara",
          "peachy brown lipstick",
        ],
        render: makeup(
          shadow("1color8", matte("#A88270", 35)),
          lashes("Natural1", BLACK, 80),
          lips(satin("#A8645A", 65))
        ),
      },
      {
        title: "Dark-brown hair",
        howTo: "Finish with straight dark-brown hair.",
        products: ["dark brown wig"],
        render: hair("#2E2018", 80, 30),
      },
    ],
  },
  "ellen-hutter": {
    look: "Ellen Hutter: luminous pallor, hollow taupe-brown eyes, gray-shaded cheeks, muted brown lips and no blush.",
    steps: [
      {
        title: "Pallor",
        howTo:
          "Use a sheer, luminous foundation a shade paler than your skin, and shade under the cheekbones with a gray-ish cream contour.",
        products: ["pale luminous foundation", "cool gray contour"],
        render: makeup(paler(1, 60, 35), contour("#8E8378", 50)),
      },
      {
        title: "Hollow eyes",
        howTo:
          "Wash a taupe-brown over the lids and take it deep under the eyes, darker there, for the hollow look.",
        products: ["taupe eyeshadow", "cool brown eyeshadow"],
        render: makeup(
          shadow("2colors25", matte("#8B7B6B", 65), matte("#5A4840", 75))
        ),
      },
      {
        title: "Muted lips",
        howTo:
          "Line and fill the lips with a muted cool brown; no blush anywhere.",
        products: ["cool brown lip liner"],
        render: makeup(lips(matte("#8E6A62", 65))),
      },
      {
        title: "Brown hair",
        howTo: "Finish with brown hair.",
        products: ["brown wig"],
        render: hair("#5A4030", 80, 25),
      },
    ],
    finish:
      "Braid the hair into a rope updo, and dab lip oil on the skin for a fevered sweat.",
  },
  "billy-chapman-killer-santa": {
    look: "Santa gone wrong: a cold, pale face, rosy red cheeks, bloodshot red-rimmed eyes and snow-white hair.",
    steps: [
      {
        title: "Rosy cheeks",
        howTo:
          "Lighten the skin with a sheer foundation a shade paler than yours and paint round, rosy red cheeks.",
        products: ["pale foundation", "red cream blush"],
        render: makeup(paler(1, 60), blush("Circle2", "#C8323C", 70)),
      },
      {
        title: "Bloodshot eyes",
        howTo: "Rim the eyes in red and shade dark circles under them.",
        products: ["red eyeliner pencil", "dark eyeshadow"],
        render: makeup(
          liner("FullRim7", matte("#B8323A", 65)),
          shadow("1color23", matte("#4A3036", 55))
        ),
      },
      {
        title: "White hair",
        howTo: "Finish with snow-white hair.",
        products: ["white santa wig"],
        render: hair("#F0EEE8", 85, 20),
      },
    ],
    finish: "The white beard, the hat, and fake blood on the white fur trim.",
  },
  alice: {
    look: "Alice in the Hive: natural skin, soft brown eyes, a peachy-nude lip and choppy blonde hair.",
    steps: [
      {
        title: "Natural face",
        howTo:
          "Wash a soft brown over the lids, add mascara and wear a peachy-nude satin lip.",
        products: ["soft brown eyeshadow", "mascara", "peach nude lipstick"],
        render: makeup(
          shadow("1color8", matte("#A07E6A", 40)),
          lashes("Natural1", BLACK, 75),
          lips(satin("#C88070", 60))
        ),
      },
      {
        title: "Blonde hair",
        howTo: "Finish with choppy, shoulder-length dirty-blonde hair.",
        products: ["shoulder length blonde wig"],
        render: hair("#C2A06A", 80, 30),
      },
    ],
    finish:
      "The red dress, a thigh holster and boots, scuffed with a little dirt.",
  },
}
