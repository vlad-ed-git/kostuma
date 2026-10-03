// The makeup guides: for each costume, everyday makeup that brings a face
// close to the character (or, for a mask or a costume-only character, a face
// that goes with the costume). Researched online per character (makeup
// tutorials, interviews with the films' makeup departments, costume guides),
// 2026-10-02, then brought down to what a visitor can do at home, with their
// face still theirs:
// - face paint (white) → a foundation a few shades lighter, set with white
//   or translucent powder (`paler`);
// - colored skin (green, gray, red) → a little color corrector or face paint
//   mixed into foundation (`tint`), the color carried by contour and
//   eyeshadow;
// - black sockets → a smoky black eye; mouths painted past the lips →
//   lipstick, lined a little past the edge at most;
// - prosthetics, latex, bald caps and lenses → left out; the extras
//   (`finish`) are things anyone can do: fake blood, eyeliner lines,
//   accessories.
// Every step is a real instruction plus what YouCam renders for it
// (lib/makeup.ts), one unit per step. content/makeup.test.ts checks every
// guide.
import {
  blush,
  brows,
  contour,
  dot,
  facePaint,
  gloss,
  glow,
  hair,
  type Hex,
  lashes,
  line,
  liner,
  lipLine,
  lips,
  makeup,
  type MakeupGuide,
  matte,
  metallic,
  paint,
  paler,
  satin,
  shading,
  shadow,
  shimmer,
  smooth,
  spiral,
  stitches,
  tint,
} from "@/lib/makeup"

const BLACK: Hex = "#111111"

/** Each costume's guide, by its slug (content/costumes.ts). */
export const makeupGuides: Record<string, MakeupGuide> = {
  ghostface: {
    look: "A Ghostface face: drained white skin, gray-shaded hollows, black sockets, faded brows and black lips, like the mask come to life.",
    steps: [
      {
        title: "White face paint",
        howTo:
          "Cover the whole face and lips with white cream face paint, then press white powder over it so it sets.",
        products: ["white cream face paint", "white setting powder"],
        render: makeup(facePaint("#FFFFFF")),
      },
      {
        title: "Gray hollows",
        howTo:
          "Shade from the cheekbones down to the jaw and at the temples with a cool gray eyeshadow, blended long and soft like the mask's folds.",
        products: ["cool gray eyeshadow"],
        render: makeup(contour("#6E6E6C", 90, "TriangleFace5")),
      },
      {
        title: "Black sockets",
        howTo:
          "Pack black eyeshadow all around each eye, from the brow bone to under the lashes, and smudge black kohl into the lash lines.",
        products: ["black eyeshadow", "black kohl eyeliner"],
        render: makeup(
          shadow("1color30", matte(BLACK, 90)),
          liner("FullRim7", matte(BLACK, 90))
        ),
      },
      {
        title: "Faded brows",
        howTo:
          "Brush the pale foundation through your brows and powder them so they almost disappear.",
        products: ["brow concealer"],
        render: makeup(brows("#D9CFC4", 85)),
      },
      {
        title: "Black lips",
        howTo:
          "Wear a matte black lipstick, kept inside your natural lip line.",
        products: ["black lipstick"],
        render: makeup(lips(matte("#1E1E1E", 92))),
      },
    ],
    finish: "The black hooded robe, with the mask pushed up on your head.",
  },
  "michael-myers": {
    look: "A Michael Myers face: blank white skin, flat gray edges, eyes lost in shadow, faded brows, colorless lips and messy dark-brown hair.",
    steps: [
      {
        title: "Mask-white face",
        howTo:
          "Cover the whole face and lips with white cream face paint, then press white powder over it so it sets.",
        products: ["white cream face paint", "white setting powder"],
        render: makeup(facePaint("#F2EEE8")),
      },
      {
        title: "Flat gray edges",
        howTo:
          "Shade the edges of your face, the cheek hollows and the sides of the nose with a soft gray, so the face looks molded and flat.",
        products: ["soft gray eyeshadow"],
        render: makeup(shading("Bronzer3", "#8A857E", 90)),
      },
      {
        title: "Eyes lost in shadow",
        howTo:
          "Pack a dark brown-black eyeshadow all around each eye so it sinks into shadow, like the mask's eyeholes, and line the lashes in black.",
        products: ["dark brown eyeshadow", "black kohl eyeliner"],
        render: makeup(
          shadow("1color30", matte("#1F1A17", 90)),
          liner("FullRim7", matte("#1A1714", 90))
        ),
      },
      {
        title: "Faded brows",
        howTo:
          "Brush the foundation through your brows, then a little white powder, so they fade.",
        products: ["brow concealer"],
        render: makeup(brows("#D2C6B8", 85)),
      },
      {
        title: "Colorless lips",
        howTo:
          "Cover your lips with the foundation and a pale nude lipstick, so the mouth has no color.",
        products: ["pale nude lipstick"],
        render: makeup(lips(matte("#CDB9AE", 92))),
      },
      {
        title: "Dark-brown hair",
        howTo: "Finish with messy dark-brown hair: your own or a short wig.",
        products: ["short dark brown wig"],
        render: hair("#3B2A1E", 90, 15),
      },
    ],
    finish: "Navy coveralls and a plastic kitchen knife.",
  },
  "nikki-freaky-nikki-freeman": {
    look: "Nikki's uncanny-valley face: flat plastic skin, too-sculpted cheeks, eyes that look too big, flat brows, a mouth too long and black hair.",
    steps: [
      {
        title: "Flat plastic skin",
        howTo:
          "Pat a matte foundation two shades lighter than your skin over the face and lips, and powder it for a flat, mannequin-like finish.",
        products: ["matte foundation", "translucent setting powder"],
        render: makeup(smooth(60), paler(2, 90)),
      },
      {
        title: "Too-sculpted cheeks",
        howTo:
          "Shade under the cheekbones and at the temples with a cool brown, a little too sharp to be natural.",
        products: ["cool brown contour powder"],
        render: makeup(contour("#7A5E55", 90)),
      },
      {
        title: "Too-big eyes",
        howTo:
          "Press brown eyeshadow up toward the brow and into the under-eye hollows, line all around the eye in black, and add lashes top and bottom.",
        products: [
          "matte brown eyeshadow",
          "black kohl eyeliner",
          "false lashes",
        ],
        render: makeup(
          shadow("2colors25", matte("#6B4E44", 90), matte("#4A332C", 90)),
          liner("FullRim7", matte(BLACK, 90)),
          lashes("Upper&Lower1")
        ),
      },
      {
        title: "Flat brows",
        howTo: "Fill your brows straight and even with a dark pencil.",
        products: ["dark brow pencil"],
        render: makeup(
          brows("#1E1A18", 85, { name: "Straight2", thickness: 10 })
        ),
      },
      {
        title: "Too-long mouth",
        howTo:
          "Fill the lips with a deep berry and take the lip liner a little past the corners of the mouth.",
        products: ["deep berry lipstick", "lip liner"],
        render: makeup(
          lips(matte("#7E3040", 92)),
          lipLine("Wider1", "#5A1F2A", 90, 55, 40)
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
      "For the finale, a little fake blood on the face and her friend's tattoos drawn on your arms with eyeliner.",
  },
  "art-the-clown": {
    look: "An Art the Clown face: clown-white skin, gray hollows, wide black eyes, high painted brows and black lips.",
    steps: [
      {
        title: "White face paint",
        howTo:
          "Cover the whole face and lips with white cream face paint, then press white powder over it so it sets.",
        products: ["white cream face paint", "white setting powder"],
        render: makeup(facePaint("#FFFFFF")),
      },
      {
        title: "Gray hollows",
        howTo:
          "Shade under the eyes and at the temples with a gray eyeshadow so the white face looks hollow.",
        products: ["gray eyeshadow"],
        render: makeup(shading("Bronzer2", "#5A5754", 90)),
      },
      {
        title: "Wide black eyes",
        howTo:
          "Pack black eyeshadow in a wide shape all around each eye, swept up at the outer corners, and smudge black kohl along the lashes.",
        products: ["black eyeshadow", "black kohl eyeliner"],
        render: makeup(
          shadow("1color30", matte(BLACK, 92)),
          liner("PandaSmudge11", matte(BLACK, 90))
        ),
      },
      {
        title: "High painted brows",
        howTo:
          "Draw thick, high-arched black brows over your own with a black brow pencil.",
        products: ["black brow pencil"],
        render: makeup(
          brows(BLACK, 90, {
            name: "HighArch4",
            curvature: 40,
            thickness: 20,
            definition: 80,
          })
        ),
      },
      {
        title: "Black lips",
        howTo: "Paint the lips matte black and line them sharply.",
        products: ["black lipstick", "black lip liner"],
        render: makeup(
          lips(matte("#1A1A1A", 92)),
          lipLine("Natural1", BLACK, 90, 50, 60)
        ),
      },
      {
        title: "Black nose",
        howTo: "Paint the tip of your nose with a black cream paint.",
        products: ["black cream face paint"],
        render: paint(dot({ at: "nose", dy: 0.02 }, 0.08, BLACK)),
      },
    ],
    finish: "The little black hat and a black-and-white clown suit.",
  },
  pennywise: {
    look: "A Pennywise face: white face paint, red-rimmed eyes, red streaks through the eyes, thin high brows, a red heart mouth, a red nose and orange hair.",
    steps: [
      {
        title: "White face paint",
        howTo:
          "Cover the whole face and lips with white cream face paint, then press white powder over it so it sets.",
        products: ["white cream face paint", "white setting powder"],
        render: makeup(facePaint("#FFFFFF")),
      },
      {
        title: "Soft shadows",
        howTo:
          "Shade the edges of the face and under the cheekbones with a soft taupe so the white base looks sculpted.",
        products: ["taupe eyeshadow"],
        render: makeup(shading("Bronzer3", "#B39E95", 90)),
      },
      {
        title: "Red-rimmed eyes",
        howTo:
          "Blend a red-brown eyeshadow over the lids up to the brows and a bright red under the eyes, then line the lashes in dark red-brown.",
        products: ["red brown eyeshadow", "red eyeshadow", "brown eyeliner"],
        render: makeup(
          shadow("2colors25", matte("#8A3A2E", 90), matte("#B03A2E", 90)),
          liner("FullRim7", matte("#5A1A14", 90))
        ),
      },
      {
        title: "Thin high brows",
        howTo:
          "Cover your brows with the base, then draw thin, high arches with a red-brown pencil.",
        products: ["red brown brow pencil"],
        render: makeup(
          brows("#8A3A22", 85, {
            name: "Thin1",
            curvature: 40,
            thickness: -40,
            definition: 70,
          })
        ),
      },
      {
        title: "Red heart mouth",
        howTo:
          "Paint the lips bright red and overline the top lip into a heart.",
        products: ["bright red lipstick", "red lip liner"],
        render: makeup(
          lips(matte("#C21E1E", 92), "heart-shaped"),
          lipLine("Large&Full1", "#A0141A", 90, 60, 50)
        ),
      },
      {
        title: "Red streaks and nose",
        howTo:
          "With a red cream paint, draw a line from the forehead down through each eye, curve a line up from each corner of the mouth to meet it, and paint the tip of the nose red.",
        products: ["red cream face paint", "red lip liner"],
        render: paint(
          line({ at: "eye", dy: -1.0 }, { at: "eye", dy: 0.42 }, "#C0141C", {
            width: 0.06,
            mirror: true,
          }),
          line(
            { at: "mouthCorner", dx: 0.02 },
            { at: "eye", dy: 0.42 },
            "#C0141C",
            {
              width: 0.05,
              via: { at: "mouthCorner", dx: -0.1, dy: -0.4 },
              mirror: true,
            }
          ),
          dot({ at: "nose", dy: 0.02 }, 0.11, "#C0141C")
        ),
      },
      {
        title: "Orange hair",
        howTo: "Finish with orange hair, teased out at the sides.",
        products: ["orange clown wig"],
        render: hair("#C8501E", 90, 25),
      },
    ],
    finish: "A frilly gray clown suit with red pompoms, and a red balloon.",
  },
  "aunt-gladys": {
    look: "An Aunt Gladys face: pale, cakey makeup, worn shadows, bright cyan lids, odd thin brows, smudged red lips and a red bob.",
    steps: [
      {
        title: "Pale powdered base",
        howTo:
          "Pat on a foundation three shades lighter than your skin and press a lot of powder over it, a little cakey.",
        products: ["light foundation", "setting powder"],
        render: makeup(paler(3, 90)),
      },
      {
        title: "Worn shadows",
        howTo:
          "Shade under the eyes and at the temples with a soft taupe so the face looks tired.",
        products: ["taupe eyeshadow"],
        render: makeup(shading("Bronzer2", "#7A6A64", 90)),
      },
      {
        title: "Cyan lids",
        howTo:
          "Sweep a bright cyan-blue eyeshadow from the lashes up to the brows, and smudge a dark liner around the eyes.",
        products: ["cyan eyeshadow", "dark gray eyeliner"],
        render: makeup(
          shadow("1color67", matte("#29A3C8", 90)),
          liner("FullRim7", matte("#2A2A2A", 90))
        ),
      },
      {
        title: "Odd thin brows",
        howTo:
          "Cover your brows with concealer and draw thin, high, slightly uneven arches.",
        products: ["brow pencil", "concealer"],
        render: makeup(
          brows("#5A3A2A", 85, {
            name: "Thin1",
            curvature: 50,
            thickness: -50,
            definition: 80,
          })
        ),
      },
      {
        title: "Smudged red lips",
        howTo:
          "Wear a bright red lipstick drawn past the lip line and smudged at the edges.",
        products: ["red lipstick", "red lip liner"],
        render: makeup(
          lips(matte("#C0141E", 92), "plump"),
          lipLine("Large&Full1", "#A01018", 90, 60, 25)
        ),
      },
      {
        title: "Red bob",
        howTo: "Finish with a bright red chin-length bob.",
        products: ["red bob wig"],
        render: hair("#C8161D", 90, 30),
      },
    ],
    finish: "Big tinted glasses and dangly earrings.",
  },
  chucky: {
    look: "A Chucky face: a smooth doll finish, round red cheeks, wide lashed eyes, orange brows, rosy lips and bright orange-red hair.",
    steps: [
      {
        title: "Doll base",
        howTo:
          "Pat on a foundation two shades lighter than your skin and powder it for a smooth, plastic doll finish.",
        products: ["light foundation", "translucent setting powder"],
        render: makeup(smooth(50), paler(2, 90)),
      },
      {
        title: "Round red cheeks",
        howTo: "Blend a round red-pink blush on the apples of the cheeks.",
        products: ["red cream blush"],
        render: makeup(blush("Circle2", "#D9443A", 82)),
      },
      {
        title: "Wide doll eyes",
        howTo:
          "Wash a light brown over the lids, line the upper lashes in brown, and add lashes top and bottom.",
        products: ["light brown eyeshadow", "brown eyeliner", "false lashes"],
        render: makeup(
          shadow("1color8", matte("#B98A6E", 90)),
          liner("Lower11", matte("#5A3A2A", 90)),
          lashes("Upper&Lower1", "#4A2A1A", 90)
        ),
      },
      {
        title: "Orange brows",
        howTo: "Fill your brows with an orange-brown pencil.",
        products: ["auburn brow pencil"],
        render: makeup(
          brows("#C2602A", 85, { name: "SoftArch1", thickness: 10 })
        ),
      },
      {
        title: "Rosy lips",
        howTo: "Wear a rosy coral lipstick.",
        products: ["coral lipstick"],
        render: makeup(lips(satin("#C2584E", 92))),
      },
      {
        title: "Freckles and scars",
        howTo:
          "Dot freckles over the nose and cheeks with a brown pencil, and draw a stitched scar on one cheek with a red lip liner.",
        products: ["brown eyeliner", "red lip liner"],
        render: paint(
          dot({ at: "nose", dx: -0.2, dy: -0.12 }, 0.02, "#8A5A3A", true),
          dot({ at: "nose", dx: -0.32, dy: -0.02 }, 0.018, "#8A5A3A", true),
          dot({ at: "nose", dx: -0.12, dy: -0.25 }, 0.016, "#8A5A3A", true),
          stitches(
            { at: "eye", dx: -0.15, dy: 0.6 },
            { at: "eye", dx: 0.15, dy: 0.95 },
            5,
            "#8A2A24"
          )
        ),
      },
      {
        title: "Orange-red hair",
        howTo: "Finish with bright orange-red hair, a little messy.",
        products: ["orange red wig"],
        render: hair("#D2561C", 90, 30),
      },
    ],
    finish: "Overalls over a striped shirt, and red sneakers.",
  },
  "freddy-krueger": {
    look: "A Freddy Krueger face: a patchy burned red, purple-red blotches, raw cheeks, sore red eyes and dry brick-red lips.",
    steps: [
      {
        title: "Burned paint",
        howTo:
          "Cover the face and brows with a burned-red cream face paint, patted on unevenly.",
        products: ["red cream face paint"],
        render: makeup(facePaint("#B4574A", 88), brows("#B4574A", 90)),
      },
      {
        title: "Burn blotches",
        howTo:
          "Press a deep purple-red eyeshadow into the temples, cheek hollows and jaw, uneven and blotchy.",
        products: ["plum eyeshadow", "burgundy eyeshadow"],
        render: makeup(
          shading("Bronzer5", "#6E2E3A", 90),
          contour("#5A2A2E", 90, "TriangleFace5")
        ),
      },
      {
        title: "Raw cheeks",
        howTo:
          "Dab a red blush in patches over the cheeks so the skin looks raw.",
        products: ["red blush"],
        render: makeup(blush("Round2", "#B8322E", 85)),
      },
      {
        title: "Sore eyes",
        howTo:
          "Smudge a red-purple eyeshadow close around the eyes and line the waterlines in dark red.",
        products: ["red purple eyeshadow", "burgundy eyeliner"],
        render: makeup(
          shadow("1color23", matte("#7A2A3A", 90)),
          liner("FullRim7", matte("#4A1A22", 90))
        ),
      },
      {
        title: "Dry brick-red lips",
        howTo:
          "Blot a dull brick-red lipstick and powder over it so the lips look dry.",
        products: ["brick red lipstick"],
        render: makeup(lips(matte("#8A3A3A", 92))),
      },
    ],
    finish: "The striped sweater, a brown fedora and the bladed glove.",
  },
  "jason-voorhees": {
    look: "A Jason face for under the mask: cold gray-blue skin, swollen shadows, deep-set dark eyes, faded brows and bluish lips.",
    steps: [
      {
        title: "Cold gray paint",
        howTo:
          "Cover the face and lips with a cold gray-blue cream face paint.",
        products: ["gray cream face paint"],
        render: makeup(facePaint("#9AA3A8", 90)),
      },
      {
        title: "Swollen shadows",
        howTo:
          "Shade the temples, cheek hollows and jaw with a dark blue-gray eyeshadow.",
        products: ["blue gray eyeshadow"],
        render: makeup(shading("Bronzer5", "#55606A", 90)),
      },
      {
        title: "Deep-set eyes",
        howTo:
          "Pack a charcoal eyeshadow all around each eye so they sink, and smudge black liner into the lashes.",
        products: ["charcoal eyeshadow", "black kohl eyeliner"],
        render: makeup(
          shadow("1color30", matte("#2E3236", 90)),
          liner("PandaSmudge1", matte(BLACK, 90))
        ),
      },
      {
        title: "Faded brows",
        howTo: "Brush gray powder through your brows so they fade.",
        products: ["gray brow powder"],
        render: makeup(brows("#8E949A", 85)),
      },
      {
        title: "Bluish lips",
        howTo: "Blot a gray-blue lipstick over the lips.",
        products: ["blue gray lipstick"],
        render: makeup(lips(matte("#7C8696", 92))),
      },
      {
        title: "Mask chevrons",
        howTo:
          "Draw the hockey mask's red chevrons on your cheeks and forehead with a red lip liner.",
        products: ["red lip liner"],
        render: paint(
          line(
            { at: "eye", dx: -0.25, dy: 0.55 },
            { at: "eye", dx: 0.02, dy: 0.85 },
            "#C0141C",
            { width: 0.05, mirror: true }
          ),
          line(
            { at: "eye", dx: 0.02, dy: 0.85 },
            { at: "eye", dx: 0.28, dy: 0.55 },
            "#C0141C",
            { width: 0.05, mirror: true }
          ),
          line(
            { at: "forehead", dx: -0.3, dy: -0.05 },
            { at: "forehead", dx: 0, dy: 0.22 },
            "#C0141C",
            { width: 0.05 }
          ),
          line(
            { at: "forehead", dx: 0, dy: 0.22 },
            { at: "forehead", dx: 0.3, dy: -0.05 },
            "#C0141C",
            { width: 0.05 }
          )
        ),
      },
    ],
    finish:
      "Wear the hockey mask pushed up on your head, and a worn work jacket.",
  },
  beetlejuice: {
    look: "A Beetlejuice face: corpse-pale skin, moldy green hollows, bruised purple eyes, grubby brows, gray-green lips and green-tinged white hair.",
    steps: [
      {
        title: "Corpse-pale base",
        howTo:
          "Pat on a foundation four shades lighter than your skin all over the face and lips, then press white powder over it until the skin looks drained.",
        products: ["very light foundation", "white setting powder"],
        render: makeup(paler(4, 92)),
      },
      {
        title: "Moldy hollows",
        howTo:
          "Shade under the eyes and at the temples with a gray-brown eyeshadow, then press mossy green into the cheek hollows, temples and jaw.",
        products: ["gray brown eyeshadow", "moss green eyeshadow"],
        render: makeup(
          shading("Bronzer2", "#4E4A3C", 90),
          contour("#55702F", 90)
        ),
      },
      {
        title: "Bruised purple eyes",
        howTo:
          "Sweep lavender over the lids up to the brows, pack dark purple all around and under the eyes, and smudge black kohl into the lashes.",
        products: [
          "lavender eyeshadow",
          "dark purple eyeshadow",
          "black kohl eyeliner",
        ],
        render: makeup(
          shadow("2colors25", matte("#9A78B8", 90), matte("#3A1C45", 90)),
          liner("PandaSmudge1", matte(BLACK, 90))
        ),
      },
      {
        title: "Grubby brows",
        howTo:
          "Brush a dark brown-gray brow pencil through your brows, thick and a little messy.",
        products: ["dark brow pencil"],
        render: makeup(
          brows("#3A352C", 85, { name: "Original5", thickness: 25 })
        ),
      },
      {
        title: "Gray-green lips",
        howTo:
          "Cover your lips with the foundation, then dab on a gray-green lipstick and blot it so it looks dry.",
        products: ["gray green lipstick"],
        render: makeup(lips(matte("#8A8F72", 92))),
      },
      {
        title: "Green-tinged hair",
        howTo: "Finish with wild white hair tinted green.",
        products: ["beetlejuice wig"],
        render: hair("#C8D4A0", 90, 20),
      },
    ],
    finish: "The black-and-white striped suit.",
  },
  dracula: {
    look: "A Dracula face: pale skin, sharp cheekbones, hypnotic black-lined eyes, high dark brows, deep red lips and slick black hair.",
    steps: [
      {
        title: "Pale base",
        howTo:
          "Pat on a foundation three shades lighter than your skin and set it with a translucent powder.",
        products: ["light foundation", "translucent setting powder"],
        render: makeup(paler(3, 90)),
      },
      {
        title: "Sharp cheekbones",
        howTo:
          "Shade under the cheekbones, at the temples and along the jaw with a cool taupe, sharp and high.",
        products: ["cool taupe contour powder"],
        render: makeup(contour("#8E7A72", 90)),
      },
      {
        title: "Hypnotic eyes",
        howTo:
          "Shade the lids up to the brow bones with a dark mauve-brown and line the upper lashes in black, flicked out a little.",
        products: ["mauve brown eyeshadow", "black liquid eyeliner"],
        render: makeup(
          shadow("1color57", matte("#4A3A40", 90)),
          liner("OpenWings3", matte(BLACK, 90))
        ),
      },
      {
        title: "High dark brows",
        howTo: "Draw your brows high and arched with a black pencil.",
        products: ["black brow pencil"],
        render: makeup(
          brows("#151515", 88, {
            name: "HighArch4",
            curvature: 40,
            thickness: 10,
            definition: 80,
          })
        ),
      },
      {
        title: "Deep red lips",
        howTo: "Wear a deep blood-red lipstick with a satin finish.",
        products: ["deep red lipstick"],
        render: makeup(lips(satin("#7A1220", 92))),
      },
      {
        title: "A drop of blood",
        howTo: "Let a drop of fake blood run from one corner of the mouth.",
        products: ["fake blood"],
        render: paint(
          line(
            { at: "mouthCorner", dx: 0.02 },
            { at: "mouthCorner", dx: -0.01, dy: 0.4 },
            "#6E0A10",
            { width: 0.035 }
          ),
          dot({ at: "mouthCorner", dx: -0.01, dy: 0.42 }, 0.03, "#6E0A10")
        ),
      },
      {
        title: "Slick black hair",
        howTo: "Finish with black hair slicked straight back.",
        products: ["black hair color spray", "hair gel"],
        render: hair("#121212", 92, 45),
      },
    ],
    finish:
      "Plastic fangs and a cape; draw a small widow's peak with a brow pencil.",
  },
  "frankensteins-monster": {
    look: "A Frankenstein's Monster face: green-gray skin, gaunt hollows, heavy shadowed eyes, thick flat brows, dark gray lips and black hair.",
    steps: [
      {
        title: "Green-gray paint",
        howTo: "Cover the face and lips with a gray-green cream face paint.",
        products: ["green cream face paint"],
        render: makeup(facePaint("#9DAA8C", 95)),
      },
      {
        title: "Gaunt hollows",
        howTo:
          "Shade from the cheekbones down to the jaw and at the temples with a gray-green eyeshadow, deep and long.",
        products: ["gray green eyeshadow"],
        render: makeup(contour("#4F5C48", 90, "TriangleFace5")),
      },
      {
        title: "Heavy eyes",
        howTo:
          "Shade all around the eyes with a dark gray-green, heaviest on the lids, and smudge black kohl along the lashes.",
        products: ["dark gray eyeshadow", "black kohl eyeliner"],
        render: makeup(
          shadow("1color30", matte("#3E463A", 90)),
          liner("FullRim7", matte(BLACK, 90))
        ),
      },
      {
        title: "Thick flat brows",
        howTo: "Thicken the brows straight and dark with a black pencil.",
        products: ["black brow pencil"],
        render: makeup(
          brows("#1E1E1E", 85, { name: "Straight2", thickness: 35 })
        ),
      },
      {
        title: "Dark gray lips",
        howTo: "Wear a dark gray lipstick, blotted matte.",
        products: ["dark gray lipstick"],
        render: makeup(lips(matte("#4A4A48", 92))),
      },
      {
        title: "Forehead stitches",
        howTo:
          "Draw a stitched scar across your forehead with a black eyeliner.",
        products: ["black eyeliner"],
        render: paint(
          stitches(
            { at: "forehead", dx: -0.6, dy: 0.05 },
            { at: "forehead", dx: 0.5, dy: -0.08 },
            7,
            BLACK
          )
        ),
      },
      {
        title: "Black hair",
        howTo: "Finish with short black hair combed flat on top.",
        products: ["black hair color spray"],
        render: hair("#151515", 90, 20),
      },
    ],
    finish: "A jacket a size too small, and heavy boots.",
  },
  "bride-of-frankenstein": {
    look: "A Bride of Frankenstein face: porcelain pallor, sculpted cheekbones, smoky dark eyes with lashes, thin arched brows, dark lips and tall black hair.",
    steps: [
      {
        title: "Porcelain pallor",
        howTo:
          "Pat on a foundation three shades lighter than your skin and set it with translucent powder for a flawless 1930s finish.",
        products: ["light foundation", "translucent setting powder"],
        render: makeup(paler(3, 90)),
      },
      {
        title: "Sculpted cheekbones",
        howTo:
          "Shade under the cheekbones and at the temples with a cool gray-brown for a sharp, statuesque face.",
        products: ["cool brown contour powder"],
        render: makeup(contour("#8A7670", 90)),
      },
      {
        title: "Smoky dark eyes",
        howTo:
          "Shade the lids up to the creases with dark gray, line the upper lashes in black, and add full upper lashes.",
        products: ["dark gray eyeshadow", "black eyeliner", "false lashes"],
        render: makeup(
          shadow("1color57", matte("#3A3638", 90)),
          liner("Lower11", matte(BLACK, 90)),
          lashes("UpperDense1")
        ),
      },
      {
        title: "Thin arched brows",
        howTo:
          "Cover your brows with concealer and draw thin, sharply arched brows in black.",
        products: ["black brow pencil", "concealer"],
        render: makeup(
          brows("#151515", 88, {
            name: "Thin1",
            curvature: 60,
            thickness: -40,
            definition: 85,
          })
        ),
      },
      {
        title: "Dark lips",
        howTo: "Wear a dark plum-red lipstick with a crisp cupid's bow.",
        products: ["dark plum lipstick", "lip liner"],
        render: makeup(
          lips(matte("#5A1E28", 92)),
          lipLine("Rosebud1", "#3E1218", 90, 50, 70)
        ),
      },
      {
        title: "Tall black hair",
        howTo: "Finish with black hair teased tall and high.",
        products: ["black hair color spray", "teasing comb"],
        render: hair("#141414", 90, 30),
      },
    ],
    finish:
      "Spray two white streaks into the hair with white hair color spray.",
  },
  sam: {
    look: "A Sam face in the sack mask's colors: a burlap-brown tint, stitched shadows, round black button eyes and a small dark mouth.",
    steps: [
      {
        title: "Burlap paint",
        howTo:
          "Cover the face, brows and lips with a burlap-tan cream face paint.",
        products: ["tan cream face paint"],
        render: makeup(facePaint("#B08A5E", 92), brows("#B08A5E", 90)),
      },
      {
        title: "Sack shadows",
        howTo:
          "Shade the edges of the face, the cheek hollows and the sides of the nose with a dark brown eyeshadow, like the folds of a sack.",
        products: ["dark brown eyeshadow"],
        render: makeup(shading("Bronzer3", "#5A4028", 90)),
      },
      {
        title: "Button eyes",
        howTo:
          "Pack black eyeshadow in a round shape all around each eye and smudge black kohl along the lashes.",
        products: ["black eyeshadow", "black kohl eyeliner"],
        render: makeup(
          shadow("1color30", matte(BLACK, 92)),
          liner("FullRim7", matte(BLACK, 90))
        ),
      },
      {
        title: "Small dark mouth",
        howTo:
          "Cover the lips with the base and draw a small dark-brown mouth in the middle.",
        products: ["dark brown lipstick", "brown lip liner"],
        render: makeup(
          lips(matte("#4A3020", 92), "pouty"),
          lipLine("Small1", "#2E1E14", 90, 50, 50)
        ),
      },
      {
        title: "Stitched mouth",
        howTo: "Draw stitches across your lips with a brown eyeliner.",
        products: ["brown eyeliner"],
        render: paint(
          stitches(
            { at: "mouth", dx: -0.4 },
            { at: "mouth", dx: 0.4 },
            6,
            "#2E1E14"
          )
        ),
      },
    ],
    finish: "The orange hood, with the sack mask pushed up, and a lollipop.",
  },
  leatherface: {
    look: "Leatherface's 'Pretty Woman' mask: a sallow leathery base, brown-shadowed hollows, smeared blue lids, pink cheeks, smudged pink-red lips and dark hair.",
    steps: [
      {
        title: "Leathery paint",
        howTo:
          "Cover the face with a sallow tan cream face paint, patted on unevenly like old skin.",
        products: ["tan cream face paint"],
        render: makeup(facePaint("#C9A27A", 88)),
      },
      {
        title: "Shadowed hollows",
        howTo:
          "Shade under the eyes, the temples and the cheek hollows with a brown eyeshadow.",
        products: ["brown eyeshadow"],
        render: makeup(shading("Bronzer2", "#6A4A34", 90)),
      },
      {
        title: "Smeared blue lids",
        howTo:
          "Smear a powder-blue eyeshadow over the lids up to the brows, unevenly, and smudge a dark liner around the eyes.",
        products: ["powder blue eyeshadow", "dark brown eyeliner"],
        render: makeup(
          shadow("1color67", matte("#6E9CC8", 90)),
          liner("PandaSmudge1", matte("#3A2A20", 90))
        ),
      },
      {
        title: "Heavy brows",
        howTo: "Darken your brows with a brown pencil, thick and shapeless.",
        products: ["brown brow pencil"],
        render: makeup(
          brows("#3A2A1E", 85, { name: "Original5", thickness: 30 })
        ),
      },
      {
        title: "Pink cheeks and lips",
        howTo:
          "Dab a hot-pink blush on the cheeks and a pink-red lipstick smudged past the lips.",
        products: ["pink blush", "pink red lipstick"],
        render: makeup(
          blush("Round2", "#D8507A", 82),
          lips(matte("#C83A5A", 92), "plump")
        ),
      },
      {
        title: "Dark hair",
        howTo: "Finish with dark, messy hair.",
        products: ["dark brown wig"],
        render: hair("#3A2A1E", 90, 15),
      },
    ],
    finish: "A butcher's apron with a little fake blood on it.",
  },
  pinhead: {
    look: "A Pinhead face: bloodless white skin, blue-gray hollows, black-ringed eyes, no brows and black lips.",
    steps: [
      {
        title: "Bloodless white face",
        howTo:
          "Cover the whole face, brows and lips with white cream face paint, then press white powder over it so it sets.",
        products: ["white cream face paint", "white setting powder"],
        render: makeup(facePaint("#F0ECEA"), brows("#E8E4E0", 90)),
      },
      {
        title: "Blue-gray hollows",
        howTo:
          "Shade the temples, under the eyes and the cheek hollows with a cold blue-gray eyeshadow.",
        products: ["blue gray eyeshadow"],
        render: makeup(
          shading("Bronzer2", "#5E6672", 90),
          contour("#6E7480", 90, "TriangleFace5")
        ),
      },
      {
        title: "Black-ringed eyes",
        howTo:
          "Shade all around the eyes with charcoal and line them all around in black.",
        products: ["charcoal eyeshadow", "black kohl eyeliner"],
        render: makeup(
          shadow("1color23", matte("#2A2A30", 90)),
          liner("FullRim7", matte(BLACK, 90))
        ),
      },
      {
        title: "Black lips",
        howTo: "Paint the lips matte black.",
        products: ["black lipstick"],
        render: makeup(lips(matte("#1A1A1C", 92))),
      },
      {
        title: "Nail grid",
        howTo:
          "Draw a fine grid across your forehead with a black eyeliner, with a silver dot where the lines cross.",
        products: ["black eyeliner", "silver eyeliner"],
        render: paint(
          line(
            { at: "forehead", dx: -0.85, dy: -0.3 },
            { at: "forehead", dx: 0.85, dy: -0.3 },
            BLACK,
            { width: 0.015 }
          ),
          line(
            { at: "forehead", dx: -0.85, dy: -0.05 },
            { at: "forehead", dx: 0.85, dy: -0.05 },
            BLACK,
            { width: 0.015 }
          ),
          line(
            { at: "forehead", dx: -0.85, dy: 0.2 },
            { at: "forehead", dx: 0.85, dy: 0.2 },
            BLACK,
            { width: 0.015 }
          ),
          line(
            { at: "forehead", dx: -0.6, dy: -0.42 },
            { at: "forehead", dx: -0.6, dy: 0.32 },
            BLACK,
            { width: 0.015 }
          ),
          line(
            { at: "forehead", dx: -0.2, dy: -0.42 },
            { at: "forehead", dx: -0.2, dy: 0.32 },
            BLACK,
            { width: 0.015 }
          ),
          line(
            { at: "forehead", dx: 0.2, dy: -0.42 },
            { at: "forehead", dx: 0.2, dy: 0.32 },
            BLACK,
            { width: 0.015 }
          ),
          line(
            { at: "forehead", dx: 0.6, dy: -0.42 },
            { at: "forehead", dx: 0.6, dy: 0.32 },
            BLACK,
            { width: 0.015 }
          ),
          dot({ at: "forehead", dx: -0.6, dy: -0.3 }, 0.03, "#3A3A3A"),
          dot({ at: "forehead", dx: -0.6, dy: -0.05 }, 0.03, "#3A3A3A"),
          dot({ at: "forehead", dx: -0.6, dy: 0.2 }, 0.03, "#3A3A3A"),
          dot({ at: "forehead", dx: -0.2, dy: -0.3 }, 0.03, "#3A3A3A"),
          dot({ at: "forehead", dx: -0.2, dy: -0.05 }, 0.03, "#3A3A3A"),
          dot({ at: "forehead", dx: -0.2, dy: 0.2 }, 0.03, "#3A3A3A"),
          dot({ at: "forehead", dx: 0.2, dy: -0.3 }, 0.03, "#3A3A3A"),
          dot({ at: "forehead", dx: 0.2, dy: -0.05 }, 0.03, "#3A3A3A"),
          dot({ at: "forehead", dx: 0.2, dy: 0.2 }, 0.03, "#3A3A3A"),
          dot({ at: "forehead", dx: 0.6, dy: -0.3 }, 0.03, "#3A3A3A"),
          dot({ at: "forehead", dx: 0.6, dy: -0.05 }, 0.03, "#3A3A3A"),
          dot({ at: "forehead", dx: 0.6, dy: 0.2 }, 0.03, "#3A3A3A")
        ),
      },
    ],
    finish: "A long black leather coat.",
  },
  "jigsaw-and-billy-the-puppet": {
    look: "A Billy the Puppet face: white skin, black-ringed eyes, round red cheeks, heavy black brows, red lips and wild black hair.",
    steps: [
      {
        title: "White puppet paint",
        howTo:
          "Cover the whole face and lips with white cream face paint, then powder it to a hard, painted finish.",
        products: ["white cream face paint", "white setting powder"],
        render: makeup(smooth(50), facePaint("#FFFFFF")),
      },
      {
        title: "Red cheek circles",
        howTo: "Blend a bright red, round blush high on the cheeks.",
        products: ["red cream blush"],
        render: makeup(blush("Circle2", "#D0201E", 88)),
      },
      {
        title: "Black-ringed eyes",
        howTo:
          "Pack black eyeshadow all around each eye and line the eyes all around in black.",
        products: ["black eyeshadow", "black kohl eyeliner"],
        render: makeup(
          shadow("1color30", matte(BLACK, 90)),
          liner("FullRim7", matte(BLACK, 90))
        ),
      },
      {
        title: "Heavy black brows",
        howTo: "Draw thick, angled black brows.",
        products: ["black brow pencil"],
        render: makeup(
          brows(BLACK, 92, { name: "Arrow13", thickness: 35, definition: 85 })
        ),
      },
      {
        title: "Red lips",
        howTo: "Paint the lips bright red.",
        products: ["bright red lipstick"],
        render: makeup(lips(matte("#C8141A", 92))),
      },
      {
        title: "Spirals and lines",
        howTo:
          "Paint a red spiral on each cheek, and draw a black line down from each corner of the mouth.",
        products: ["red cream face paint", "black eyeliner"],
        render: paint(
          spiral({ at: "eye", dx: -0.12, dy: 0.85 }, 0.3, "#C8141A", true),
          line(
            { at: "mouthCorner" },
            { at: "mouthCorner", dx: 0.02, dy: 0.5 },
            BLACK,
            { width: 0.035, mirror: true }
          )
        ),
      },
      {
        title: "Wild black hair",
        howTo: "Finish with wild black hair sticking out at the sides.",
        products: ["black wig"],
        render: hair("#141414", 90, 20),
      },
    ],
    finish: "A black suit, a red bow tie and a tiny tricycle.",
  },
  m3gan: {
    look: "An M3GAN face: flawless porcelain skin, soft sculpting, lined doll eyes with lashes top and bottom, neat brows, a cherry lip and brown hair.",
    steps: [
      {
        title: "Porcelain skin",
        howTo:
          "Pat on a foundation two shades lighter than your skin, buff it until poreless, and add a touch of highlighter.",
        products: ["light foundation", "liquid highlighter"],
        render: makeup(smooth(75), paler(2, 90, 20)),
      },
      {
        title: "Soft sculpting",
        howTo:
          "Shade under the cheekbones with a soft taupe and dab a pink blush on the apples of the cheeks.",
        products: ["taupe contour powder", "pink blush"],
        render: makeup(contour("#A8887C", 90), blush("Round2", "#E89A9A", 82)),
      },
      {
        title: "Doll eyes",
        howTo:
          "Wash a soft peach over the lids, line the upper and lower lashes in brown, and add lashes top and bottom.",
        products: ["peach eyeshadow", "brown eyeliner", "false lashes"],
        render: makeup(
          shadow("1color8", matte("#D8A08A", 90)),
          liner("FullRim7", matte("#4A3020", 90)),
          lashes("Upper&Lower1", "#2A1A14", 90)
        ),
      },
      {
        title: "Neat brows",
        howTo: "Fill your brows neatly with a soft brown pencil.",
        products: ["brown brow pencil"],
        render: makeup(
          brows("#5A3A26", 85, { name: "SoftArch1", definition: 80 })
        ),
      },
      {
        title: "Cherry lips",
        howTo: "Wear a glossy cherry-red lipstick.",
        products: ["cherry red lip gloss"],
        render: makeup(lips(gloss("#B0202E", 92))),
      },
      {
        title: "Brown hair",
        howTo: "Finish with smooth brown hair, perfectly straight.",
        products: ["brown wig"],
        render: hair("#5A3A26", 90, 40),
      },
    ],
    finish: "A plaid dress, a bow and mary janes; move slowly.",
  },
  "samara-morgan": {
    look: "A Samara face: drowned-pale skin, gray hollows, dark bruised rings around the eyes, colorless lips and long wet black hair.",
    steps: [
      {
        title: "Drowned gray-white",
        howTo:
          "Cover the face and lips with a gray-white cream face paint, thin enough to look like skin.",
        products: ["cream face paint", "setting powder"],
        render: makeup(facePaint("#D8DCDC", 95)),
      },
      {
        title: "Gray hollows",
        howTo:
          "Shade under the eyes, the temples and the cheek hollows with a cold gray eyeshadow.",
        products: ["cool gray eyeshadow"],
        render: makeup(
          shading("Bronzer2", "#5C6066", 90),
          contour("#787C80", 90, "TriangleFace5")
        ),
      },
      {
        title: "Bruised dark eyes",
        howTo:
          "Smudge a dark gray-purple eyeshadow all around the eyes and line them all around in black.",
        products: ["dark purple eyeshadow", "black kohl eyeliner"],
        render: makeup(
          shadow("1color30", matte("#3A3240", 90)),
          liner("FullRim7", matte(BLACK, 90))
        ),
      },
      {
        title: "Faded brows",
        howTo: "Brush the foundation through your brows so they fade.",
        products: ["brow concealer"],
        render: makeup(brows("#8A8580", 85)),
      },
      {
        title: "Colorless lips",
        howTo: "Cover the lips with a pale gray-mauve lipstick and blot it.",
        products: ["pale mauve lipstick"],
        render: makeup(lips(matte("#A89AA0", 92))),
      },
      {
        title: "Wet black hair",
        howTo: "Finish with long black hair, wet and hanging forward.",
        products: ["long black wig", "hair gel"],
        render: hair("#101010", 92, 55),
      },
    ],
    finish: "Let the wet hair hang over your face, and wear a white nightgown.",
  },
  "the-nun-valak": {
    look: "A Valak face: corpse-white skin, hollow cheeks, black sunken eyes, faded brows and dark lips, under a black veil.",
    steps: [
      {
        title: "Corpse-white face",
        howTo:
          "Cover the whole face, brows and lips with white cream face paint, then press white powder over it so it sets.",
        products: ["white cream face paint", "white setting powder"],
        render: makeup(facePaint("#F4F2F0"), brows("#E8E4E0", 90)),
      },
      {
        title: "Hollow cheeks",
        howTo:
          "Shade deep hollows from the cheekbones to the jaw and at the temples with a gray-brown eyeshadow.",
        products: ["gray brown eyeshadow"],
        render: makeup(
          contour("#5E5652", 90, "TriangleFace5"),
          shading("Bronzer2", "#4A4442", 90)
        ),
      },
      {
        title: "Black sunken eyes",
        howTo:
          "Pack black eyeshadow all around the eyes, wide and smudged, and line them all around in black.",
        products: ["black eyeshadow", "black kohl eyeliner"],
        render: makeup(
          shadow("1color30", matte(BLACK, 92)),
          liner("PandaSmudge11", matte(BLACK, 90))
        ),
      },
      {
        title: "Dark lips",
        howTo: "Wear a near-black plum lipstick with a sharp edge.",
        products: ["black plum lipstick"],
        render: makeup(lips(matte("#2E1A22", 92))),
      },
    ],
    finish: "A black veil or hood over your hair for the habit.",
  },
  annabelle: {
    look: "An Annabelle face: porcelain skin, sallow doll shading, round red cheeks, painted lashes, thin brows, a small red cupid's-bow mouth and auburn braids.",
    steps: [
      {
        title: "Porcelain base",
        howTo:
          "Pat on a foundation three shades lighter than your skin and powder it for a hard, porcelain finish.",
        products: ["light foundation", "translucent setting powder"],
        render: makeup(smooth(50), paler(3, 90)),
      },
      {
        title: "Doll shading",
        howTo:
          "Shade the temples, under the eyes and the cheek hollows with a sallow gray-brown, so the doll looks old.",
        products: ["gray brown eyeshadow"],
        render: makeup(shading("Bronzer2", "#7A6858", 90)),
      },
      {
        title: "Painted doll eyes",
        howTo:
          "Line the eyes in dark brown, top and bottom, and add lashes top and bottom.",
        products: ["dark brown eyeliner", "false lashes"],
        render: makeup(
          liner("FullRim7", matte("#3A2418", 90)),
          lashes("Upper&Lower1", "#2A1A14", 90)
        ),
      },
      {
        title: "Thin brows, red cheeks",
        howTo:
          "Draw thin, rounded brows in auburn, and blend a round red blush high on the cheeks.",
        products: ["auburn brow pencil", "red cream blush"],
        render: makeup(
          brows("#7A3420", 85, {
            name: "Thin1",
            curvature: 30,
            thickness: -30,
          }),
          blush("Circle2", "#C83A34", 85)
        ),
      },
      {
        title: "Small red mouth",
        howTo:
          "Cover the edges of the lips with foundation and paint a small red cupid's bow in the middle.",
        products: ["red lipstick", "red lip liner"],
        render: makeup(
          lips(matte("#B01E22", 92), "heart-shaped"),
          lipLine("Rosebud1", "#8A1418", 90, 50, 70)
        ),
      },
      {
        title: "Cracks",
        howTo:
          "Draw a few thin cracks on one cheek and the forehead with a black eyeliner.",
        products: ["black eyeliner"],
        render: paint(
          line(
            { at: "eye", dx: -0.1, dy: 0.5 },
            { at: "eye", dx: -0.05, dy: 1.0 },
            "#2A2420",
            { width: 0.016, via: { at: "eye", dx: 0.08, dy: 0.75 } }
          ),
          line(
            { at: "eye", dx: 0.04, dy: 0.75 },
            { at: "eye", dx: 0.22, dy: 0.88 },
            "#2A2420",
            { width: 0.012 }
          ),
          line(
            { at: "forehead", dx: 0.2, dy: -0.25 },
            { at: "forehead", dx: 0.25, dy: 0.3 },
            "#2A2420",
            { width: 0.014, via: { at: "forehead", dx: 0.38, dy: 0.05 } }
          )
        ),
      },
      {
        title: "Auburn braids",
        howTo: "Finish with auburn hair in two braids.",
        products: ["auburn braided wig"],
        render: hair("#7A2E1F", 90, 30),
      },
    ],
    finish: "A white lace dress, and a stare that never moves.",
  },
  "regan-macneil": {
    look: "A possessed Regan face: sickly pale-green skin, green-gray hollows, bruised purple eyes, ragged brows, chapped red-brown lips and messy brown hair.",
    steps: [
      {
        title: "Sickly paint",
        howTo:
          "Cover the face and lips with a pale sickly-green cream face paint.",
        products: ["green cream face paint"],
        render: makeup(facePaint("#C4C8A8", 88)),
      },
      {
        title: "Green-gray hollows",
        howTo:
          "Shade the temples, under the eyes and the cheek hollows with a green-gray eyeshadow.",
        products: ["green gray eyeshadow"],
        render: makeup(
          shading("Bronzer2", "#5E6448", 90),
          contour("#6E7058", 90, "TriangleFace5")
        ),
      },
      {
        title: "Bruised eyes",
        howTo:
          "Smudge a dark purple-red eyeshadow all around the eyes and line them in dark red.",
        products: ["dark purple eyeshadow", "red brown eyeliner"],
        render: makeup(
          shadow("1color30", matte("#4A2238", 90)),
          liner("FullRim7", matte("#5A1A1E", 90))
        ),
      },
      {
        title: "Ragged brows",
        howTo: "Fill the brows unevenly with a gray-brown pencil.",
        products: ["gray brown brow pencil"],
        render: makeup(
          brows("#5A4A3E", 85, { name: "Original5", definition: 30 })
        ),
      },
      {
        title: "Chapped lips",
        howTo:
          "Dab a dark red-brown lipstick in the middle of the lips and blot it so it looks cracked.",
        products: ["red brown lipstick"],
        render: makeup(lips(matte("#7A3A34", 92))),
      },
      {
        title: "Scratches",
        howTo:
          "Draw a few thin scratches on the cheeks and forehead with a red-brown lip liner.",
        products: ["red brown lip liner"],
        render: paint(
          line(
            { at: "eye", dx: -0.2, dy: 0.62 },
            { at: "eye", dx: 0.05, dy: 1.0 },
            "#8A2A24",
            { width: 0.02, mirror: true }
          ),
          line(
            { at: "eye", dx: -0.05, dy: 0.65 },
            { at: "eye", dx: 0.15, dy: 0.95 },
            "#8A2A24",
            { width: 0.018, mirror: true }
          ),
          line(
            { at: "forehead", dx: -0.2, dy: -0.2 },
            { at: "forehead", dx: 0.15, dy: 0.15 },
            "#8A2A24",
            { width: 0.018 }
          )
        ),
      },
      {
        title: "Messy hair",
        howTo: "Finish with messy brown hair, matted and tangled.",
        products: ["messy brown wig"],
        render: hair("#6B4E36", 90, 10),
      },
    ],
    finish: "A white nightgown.",
  },
  "carrie-white": {
    look: "Carrie at the prom: a soft fair base, pink-washed eyes, rosy cheeks, soft brows, pink lips and strawberry-blonde waves, before the blood.",
    steps: [
      {
        title: "Soft fair base",
        howTo:
          "Pat on a foundation a shade lighter than your skin for a soft, fresh finish.",
        products: ["light foundation"],
        render: makeup(paler(1, 80)),
      },
      {
        title: "Pink eyes",
        howTo:
          "Wash a shimmery pink over the lids, line the upper lashes in brown, and add mascara.",
        products: ["pink eyeshadow", "brown eyeliner", "mascara"],
        render: makeup(
          shadow("1color67", shimmer("#E0A0B0", 90)),
          liner("Lower11", matte("#4A3020", 90)),
          lashes("Natural1", "#2A1A14", 90)
        ),
      },
      {
        title: "Rosy cheeks",
        howTo: "Sweep a pink blush along the cheekbones.",
        products: ["pink blush"],
        render: makeup(blush("Oblique2", "#E07A8A", 82)),
      },
      {
        title: "Soft brows",
        howTo: "Brush your brows up with a light brown gel.",
        products: ["light brown brow gel"],
        render: makeup(brows("#9A6A4A", 85)),
      },
      {
        title: "Pink lips",
        howTo: "Wear a soft pink lipstick.",
        products: ["soft pink lipstick"],
        render: makeup(lips(satin("#D27A8A", 92))),
      },
      {
        title: "Pig's blood",
        howTo:
          "When the prom ends: pour fake blood over your hair and let it run down your face.",
        products: ["fake blood"],
        render: paint(
          line(
            { at: "forehead", dx: -0.7, dy: -0.3 },
            { at: "forehead", dx: -0.6599999999999999, dy: 1.1 },
            "#8A0A10",
            { width: 0.07 }
          ),
          dot(
            { at: "forehead", dx: -0.6599999999999999, dy: 1.1 },
            0.05,
            "#8A0A10"
          ),
          line(
            { at: "forehead", dx: -0.3, dy: -0.45 },
            { at: "forehead", dx: -0.26, dy: 0.6 },
            "#8A0A10",
            { width: 0.07 }
          ),
          dot({ at: "forehead", dx: -0.26, dy: 0.6 }, 0.05, "#8A0A10"),
          line(
            { at: "forehead", dx: 0.15, dy: -0.4 },
            { at: "forehead", dx: 0.19, dy: 1.35 },
            "#8A0A10",
            { width: 0.07 }
          ),
          dot({ at: "forehead", dx: 0.19, dy: 1.35 }, 0.05, "#8A0A10"),
          line(
            { at: "forehead", dx: 0.55, dy: -0.3 },
            { at: "forehead", dx: 0.5900000000000001, dy: 0.85 },
            "#8A0A10",
            { width: 0.07 }
          ),
          dot(
            { at: "forehead", dx: 0.5900000000000001, dy: 0.85 },
            0.05,
            "#8A0A10"
          )
        ),
      },
      {
        title: "Strawberry-blonde waves",
        howTo: "Finish with long strawberry-blonde waves.",
        products: ["strawberry blonde wig"],
        render: hair("#D69A6A", 90, 35),
      },
    ],
    finish: "A pink prom dress, soaked in fake blood too.",
  },
  "count-orlok": {
    look: "A Count Orlok face: bloodless pale skin, a skull's gray hollows, deep-shadowed eyes, bushy dark brows and thin dark lips.",
    steps: [
      {
        title: "Bloodless face",
        howTo:
          "Cover the face and lips with an ivory-gray cream face paint, then powder it.",
        products: ["cream face paint", "setting powder"],
        render: makeup(facePaint("#E2DED6", 95)),
      },
      {
        title: "Skull hollows",
        howTo:
          "Shade the temples, the cheek hollows and the jaw with a cool gray-brown, deep, like a skull showing through.",
        products: ["gray brown eyeshadow"],
        render: makeup(
          shading("Bronzer5", "#5A5250", 90),
          contour("#6E6662", 90, "TriangleFace5")
        ),
      },
      {
        title: "Deep-set eyes",
        howTo:
          "Pack a dark gray-brown all around the eyes, deepest at the inner corners, and line them all around in black.",
        products: ["dark gray eyeshadow", "black kohl eyeliner"],
        render: makeup(
          shadow("1color30", matte("#2E2826", 90)),
          liner("FullRim7", matte(BLACK, 90))
        ),
      },
      {
        title: "Bushy dark brows",
        howTo: "Thicken the brows into bushy, slanted black brows.",
        products: ["black brow pencil"],
        render: makeup(
          brows("#1A1818", 88, {
            name: "Arrow13",
            thickness: 40,
            definition: 50,
          })
        ),
      },
      {
        title: "Thin dark lips",
        howTo:
          "Cover the lips with the base and draw a thin, dark gray-brown mouth.",
        products: ["dark gray lipstick", "lip liner"],
        render: makeup(
          lips(matte("#4A3E3C", 92)),
          lipLine("Small1", "#2E2624", 90, 50, 60)
        ),
      },
    ],
    finish: "Plastic rat fangs and a long black coat.",
  },
  pearl: {
    look: "A Pearl face: sweet farm-girl skin, rosy cheeks, soft wide eyes, fair brows, bright red lips and blonde braids, smiling a little too wide.",
    steps: [
      {
        title: "Fresh farm skin",
        howTo:
          "Pat on a foundation your own shade or a little lighter, for a fresh, even finish.",
        products: ["light foundation"],
        render: makeup(paler(1, 80)),
      },
      {
        title: "Rosy cheeks",
        howTo: "Blend a pink-red cream blush high on the cheeks.",
        products: ["pink cream blush"],
        render: makeup(blush("Round2", "#E0525A", 82)),
      },
      {
        title: "Wide sweet eyes",
        howTo:
          "Wash a soft peach over the lids, line the lashes in light brown, and curl the lashes.",
        products: ["peach eyeshadow", "brown eyeliner", "mascara"],
        render: makeup(
          shadow("1color8", matte("#E0A88A", 90)),
          liner("Lower11", matte("#6A4A30", 90)),
          lashes("Natural1", "#3A2A1E", 90)
        ),
      },
      {
        title: "Fair brows",
        howTo: "Tint the brows light blonde.",
        products: ["blonde brow gel"],
        render: makeup(brows("#C8A070", 85)),
      },
      {
        title: "Red lips",
        howTo:
          "Wear a bright red lipstick, lined a little past the corners for the too-wide smile.",
        products: ["bright red lipstick"],
        render: makeup(lips(matte("#C81E2A", 92), "smile")),
      },
      {
        title: "Blood spatter",
        howTo:
          "Flick a few spatters of fake blood over your face with a toothbrush.",
        products: ["fake blood"],
        render: paint(
          dot({ at: "eye", dx: -0.55, dy: 0.6 }, 0.025, "#7A0A10"),
          dot({ at: "eye", dx: -0.4, dy: 0.75 }, 0.018, "#7A0A10"),
          dot({ at: "eye", dx: -0.65, dy: 0.85 }, 0.02, "#7A0A10"),
          dot({ at: "eye", dx: 0.45, dy: 0.65 }, 0.022, "#7A0A10"),
          dot({ at: "eye", dx: 0.6, dy: 0.9 }, 0.016, "#7A0A10"),
          dot({ at: "eye", dx: 0.3, dy: 0.85 }, 0.014, "#7A0A10"),
          dot({ at: "forehead", dx: -0.1, dy: -0.2 }, 0.02, "#7A0A10"),
          dot({ at: "forehead", dx: 0.25, dy: -0.3 }, 0.016, "#7A0A10")
        ),
      },
      {
        title: "Blonde braids",
        howTo: "Finish with blonde hair in two braids.",
        products: ["blonde braided wig"],
        render: hair("#D9B77A", 90, 35),
      },
    ],
    finish: "Overalls over a red dress, and an axe for the farmhouse finale.",
  },
  "freddy-fazbear": {
    look: "A Freddy Fazbear face in the animatronic's colors: a warm brown tint, fur-dark edges, dark-rimmed eyes, bold black brows, a brown muzzle mouth and brown hair.",
    steps: [
      {
        title: "Bear-brown paint",
        howTo: "Cover the face with a warm bear-brown cream face paint.",
        products: ["brown cream face paint"],
        render: makeup(facePaint("#A07450", 90)),
      },
      {
        title: "Fur shading",
        howTo:
          "Shade the edges of the face, the cheek hollows and the nose with a dark brown eyeshadow, like the bear's fur.",
        products: ["dark brown eyeshadow"],
        render: makeup(shading("Bronzer3", "#5A3A1E", 90)),
      },
      {
        title: "Dark-rimmed eyes",
        howTo:
          "Shade all around the eyes with a dark brown and line them all around in black.",
        products: ["dark brown eyeshadow", "black kohl eyeliner"],
        render: makeup(
          shadow("1color23", matte("#3A2414", 90)),
          liner("FullRim7", matte(BLACK, 90))
        ),
      },
      {
        title: "Bold black brows",
        howTo: "Draw thick, slanted black brows.",
        products: ["black brow pencil"],
        render: makeup(
          brows(BLACK, 92, { name: "Arrow13", thickness: 40, definition: 90 })
        ),
      },
      {
        title: "Muzzle mouth",
        howTo: "Wear a dark brown lipstick for the bear's muzzle.",
        products: ["dark brown lipstick"],
        render: makeup(lips(matte("#5A3A24", 92))),
      },
      {
        title: "Black nose",
        howTo: "Paint the tip of your nose black.",
        products: ["black cream face paint"],
        render: paint(dot({ at: "nose", dy: 0.02 }, 0.11, BLACK)),
      },
      {
        title: "Brown hair",
        howTo: "Finish with brown hair under the top hat.",
        products: ["brown wig"],
        render: hair("#5A3820", 90, 20),
      },
    ],
    finish: "The top hat and a black bow tie.",
  },
  "the-grady-twins": {
    look: "A Grady twins face: pale porcelain skin, a soft gray shadow under the eyes, lashed doll eyes, soft brows, pink cheeks, berry lips and light-brown hair.",
    steps: [
      {
        title: "Pale porcelain",
        howTo:
          "Pat on a foundation three shades lighter than your skin and powder it smooth.",
        products: ["light foundation", "translucent setting powder"],
        render: makeup(smooth(50), paler(3, 88)),
      },
      {
        title: "Hollow stare",
        howTo:
          "Shade softly under the eyes and at the temples with a cool gray, for a sleepless stare.",
        products: ["cool gray eyeshadow"],
        render: makeup(shading("Bronzer2", "#7A7478", 90)),
      },
      {
        title: "Lashed doll eyes",
        howTo:
          "Shade the lids with a soft gray-brown, line the lashes in brown, and add lashes top and bottom.",
        products: ["gray brown eyeshadow", "brown eyeliner", "false lashes"],
        render: makeup(
          shadow("1color57", matte("#8A7470", 90)),
          liner("FullRim7", matte("#4A3428", 90)),
          lashes("Upper&Lower1", "#2A1A14", 90)
        ),
      },
      {
        title: "Soft brows, pink cheeks",
        howTo:
          "Brush the brows soft and light brown, and dab a pink blush on the apples of the cheeks.",
        products: ["light brown brow gel", "pink blush"],
        render: makeup(brows("#8A6A50", 85), blush("Circle2", "#E08A92", 82)),
      },
      {
        title: "Berry lips",
        howTo: "Wear a soft berry lipstick.",
        products: ["berry lipstick"],
        render: makeup(lips(satin("#A8405A", 92), "petal")),
      },
      {
        title: "Light-brown hair",
        howTo: "Finish with light-brown hair, straight with a side part.",
        products: ["light brown wig"],
        render: hair("#9A7A58", 90, 30),
      },
    ],
    finish: "Matching pale-blue dresses: it works best with your twin.",
  },
  "jack-torrance": {
    look: "A frozen Jack Torrance face: frost-pale skin, icy-blue hollows, frozen red-rimmed eyes, frosted brows, bluish lips and frosted hair.",
    steps: [
      {
        title: "Frozen skin",
        howTo:
          "Pat on a foundation four shades lighter than your skin with a touch of blue, over the face and lips.",
        products: ["very light foundation", "blue color corrector"],
        render: makeup(paler(4, 90)),
      },
      {
        title: "Icy hollows",
        howTo:
          "Shade the temples, under the eyes and the cheek hollows with an icy blue-gray eyeshadow.",
        products: ["icy blue eyeshadow"],
        render: makeup(
          shading("Bronzer2", "#6A7E92", 90),
          contour("#7E8C9A", 90, "TriangleFace5")
        ),
      },
      {
        title: "Frozen eyes",
        howTo:
          "Smudge a blue-gray eyeshadow around the eyes and line the waterlines in a dull red, as if frozen open.",
        products: ["blue gray eyeshadow", "red eyeliner"],
        render: makeup(
          shadow("1color23", matte("#5A6A7A", 90)),
          liner("FullRim7", matte("#8A3A3A", 90))
        ),
      },
      {
        title: "Frosted brows",
        howTo: "Brush white powder through the brows until they look frosted.",
        products: ["white brow gel"],
        render: makeup(brows("#D8DDE2", 85)),
      },
      {
        title: "Bluish lips",
        howTo: "Blot a pale blue-gray lipstick over the lips.",
        products: ["pale blue lipstick"],
        render: makeup(lips(matte("#8A9AAE", 92))),
      },
      {
        title: "Frosted hair",
        howTo: "Finish with hair dusted icy white.",
        products: ["white hair color spray"],
        render: hair("#B9BEC2", 90, 25),
      },
    ],
    finish:
      "A plaid shirt, and a little white powder on your shoulders like frost.",
  },
  "hannibal-lecter": {
    look: "A Hannibal Lecter face: prison-pale skin, sharp hollow cheeks, a cold unblinking stare, groomed brows, pale lips and slicked-back dark hair.",
    steps: [
      {
        title: "Prison pallor",
        howTo:
          "Pat on a foundation two shades lighter than your skin and powder it matte.",
        products: ["light matte foundation"],
        render: makeup(paler(2, 88)),
      },
      {
        title: "Sharp cheeks",
        howTo:
          "Shade under the cheekbones and at the temples with a cool taupe, sharp and lean.",
        products: ["cool taupe contour powder"],
        render: makeup(contour("#8A786E", 90)),
      },
      {
        title: "Cold stare",
        howTo:
          "Shade softly around the eyes with a cool taupe and line the upper lashes thinly in dark brown.",
        products: ["taupe eyeshadow", "dark brown eyeliner"],
        render: makeup(
          shadow("1color23", matte("#6A5A54", 90)),
          liner("Lower11", matte("#2E2420", 90))
        ),
      },
      {
        title: "Groomed brows, pale lips",
        howTo:
          "Comb the brows neat with a clear gel, and blot a pale nude lipstick over the lips.",
        products: ["clear brow gel", "pale nude lipstick"],
        render: makeup(
          brows("#5A4A40", 85, { name: "Straight2", definition: 80 }),
          lips(matte("#B89A90", 92))
        ),
      },
      {
        title: "Slicked-back hair",
        howTo: "Finish with dark hair slicked straight back.",
        products: ["hair gel"],
        render: hair("#3A2C24", 90, 45),
      },
    ],
    finish: "An orange jumpsuit, or a sharp suit.",
  },
  "norman-bates": {
    look: "A 'Mother' face: powdery pale skin, the shadows of age, sunken eyes, thin gray brows, faded rose lips under a gray bun.",
    steps: [
      {
        title: "Powdery pale base",
        howTo:
          "Pat on a foundation three shades lighter than your skin and press a lot of powder over it.",
        products: ["light foundation", "setting powder"],
        render: makeup(paler(3, 88)),
      },
      {
        title: "Shadows of age",
        howTo:
          "Shade under the eyes, at the temples and in the cheek hollows with a soft gray-brown.",
        products: ["gray brown eyeshadow"],
        render: makeup(
          shading("Bronzer2", "#7A6A62", 90),
          contour("#8A7A70", 90, "TriangleFace5")
        ),
      },
      {
        title: "Sunken eyes",
        howTo:
          "Shade all around the eyes with a muted brown and line them softly in dark brown.",
        products: ["muted brown eyeshadow", "dark brown eyeliner"],
        render: makeup(
          shadow("1color30", matte("#5A4A42", 90)),
          liner("PandaSmudge1", matte("#3A2A22", 90))
        ),
      },
      {
        title: "Thin brows, faded lips",
        howTo:
          "Thin the brows with gray pencil, and dab a faded rose lipstick on the lips.",
        products: ["gray brow pencil", "faded rose lipstick"],
        render: makeup(
          brows("#8A8580", 85, { name: "Thin1", thickness: -30 }),
          lips(matte("#A8787A", 92))
        ),
      },
      {
        title: "Gray hair",
        howTo: "Finish with gray hair pinned into a bun.",
        products: ["gray bun wig"],
        render: hair("#A3A19B", 90, 20),
      },
    ],
    finish:
      "Pin the hair into a bun and wrap a shawl around your shoulders. For Norman himself, skip the gray and wear a cardigan.",
  },
  "captain-spaulding": {
    look: "A Captain Spaulding face: clown-white skin, gray creases, bright blue lids up to the brows, arched black brows, a big red mouth and wild gray-white hair.",
    steps: [
      {
        title: "White face paint",
        howTo:
          "Cover the whole face and lips with white cream face paint, then press white powder over it so it sets.",
        products: ["white cream face paint", "white setting powder"],
        render: makeup(facePaint("#FFFFFF")),
      },
      {
        title: "Gray creases",
        howTo:
          "Shade the temples, under the eyes and the cheek hollows with a gray eyeshadow, so the white base looks worn.",
        products: ["gray eyeshadow"],
        render: makeup(shading("Bronzer2", "#7A7672", 90)),
      },
      {
        title: "Blue lids",
        howTo:
          "Sweep a bright blue eyeshadow from the lashes up to the brows, and line the eyes in black.",
        products: ["bright blue eyeshadow", "black eyeliner"],
        render: makeup(
          shadow("1color67", matte("#2E6ED0", 90)),
          liner("FullRim7", matte(BLACK, 90))
        ),
      },
      {
        title: "Arched black brows",
        howTo: "Draw high, arched black brows over your own.",
        products: ["black brow pencil"],
        render: makeup(
          brows(BLACK, 88, { name: "HighArch4", curvature: 45, thickness: 15 })
        ),
      },
      {
        title: "Big red mouth",
        howTo:
          "Paint a big red mouth, drawn well past the lips at the corners.",
        products: ["bright red lipstick", "red lip liner"],
        render: makeup(
          lips(matte("#C8141E", 92), "smile"),
          lipLine("Wider1", "#A01018", 90, 65, 40)
        ),
      },
      {
        title: "Red nose",
        howTo: "Dab red lipstick on the tip of your nose.",
        products: ["red lipstick"],
        render: paint(dot({ at: "nose", dy: 0.02 }, 0.1, "#C0141C")),
      },
      {
        title: "Wild gray hair",
        howTo: "Finish with wild gray-white hair.",
        products: ["gray clown wig"],
        render: hair("#D8D6CE", 90, 20),
      },
    ],
    finish: "A Hawaiian shirt, a top hat and a lot of attitude.",
  },
  "the-headless-horseman": {
    look: "A Headless Horseman face, from before he lost it: deathly pale skin, gaunt shadows, dark-ringed eyes, black brows, pale lips and wild black hair.",
    steps: [
      {
        title: "Deathly pale base",
        howTo:
          "Pat on a foundation four shades lighter than your skin over the face and lips.",
        products: ["very light foundation"],
        render: makeup(paler(4, 90)),
      },
      {
        title: "Gaunt shadows",
        howTo:
          "Shade from the cheekbones to the jaw and at the temples with a gray-brown eyeshadow.",
        products: ["gray brown eyeshadow"],
        render: makeup(contour("#6A5E58", 90, "TriangleFace5")),
      },
      {
        title: "Dark-ringed eyes",
        howTo:
          "Shade all around the eyes with charcoal and line them all around in black.",
        products: ["charcoal eyeshadow", "black kohl eyeliner"],
        render: makeup(
          shadow("1color30", matte("#2A2626", 90)),
          liner("FullRim7", matte(BLACK, 90))
        ),
      },
      {
        title: "Black brows",
        howTo: "Darken the brows into fierce, angled black brows.",
        products: ["black brow pencil"],
        render: makeup(
          brows(BLACK, 88, { name: "Arrow13", thickness: 25, definition: 80 })
        ),
      },
      {
        title: "Pale lips",
        howTo: "Cover the lips with the base and a pale gray lipstick.",
        products: ["pale gray lipstick"],
        render: makeup(lips(matte("#A89C98", 92))),
      },
      {
        title: "Wild black hair",
        howTo: "Finish with wild, matted black hair.",
        products: ["black wig"],
        render: hair("#111111", 90, 15),
      },
    ],
    finish: "A black cape and a jack-o'-lantern under your arm.",
  },
  candyman: {
    look: "A Candyman face: a honey-gold glow, sculpted bronze shadows, gold and deep-brown eyes, strong brows and deep plum-brown lips.",
    steps: [
      {
        title: "Honey glow",
        howTo:
          "Pat on a foundation your own shade with a golden glow, then a touch of gold highlighter on the high points.",
        products: ["golden foundation", "gold highlighter"],
        render: makeup(paler(0, 75, 40), glow("#D8A84A", 70)),
      },
      {
        title: "Bronze shadows",
        howTo:
          "Shade under the cheekbones, at the temples and along the jaw with a deep bronze.",
        products: ["bronze contour powder"],
        render: makeup(contour("#5A3A20", 90)),
      },
      {
        title: "Gold eyes",
        howTo:
          "Sweep a metallic gold over the lids, a deep brown in the outer corners, and line the eyes in dark brown.",
        products: ["gold eyeshadow", "deep brown eyeshadow", "brown eyeliner"],
        render: makeup(
          shadow("2colors83", metallic("#C89A3A", 90), matte("#3A2414", 90)),
          liner("FullRim7", matte("#2A1A10", 90))
        ),
      },
      {
        title: "Strong brows",
        howTo: "Fill the brows dark and full.",
        products: ["dark brown brow pencil"],
        render: makeup(
          brows("#1E140E", 85, { name: "Straight2", thickness: 25 })
        ),
      },
      {
        title: "Dark lips",
        howTo: "Wear a deep plum-brown lipstick.",
        products: ["plum brown lipstick"],
        render: makeup(lips(matte("#4A2228", 92))),
      },
    ],
    finish:
      "A long coat with a fur collar, a toy hook, and a couple of fake bees on the collar.",
  },
  "the-babadook": {
    look: "A Babadook face: chalk-white skin, sunken gray hollows, wide black sockets, no brows, black lips and black hair.",
    steps: [
      {
        title: "White face paint",
        howTo:
          "Cover the whole face and lips with white cream face paint, then press white powder over it so it sets.",
        products: ["white cream face paint", "white setting powder"],
        render: makeup(facePaint("#FFFFFF")),
      },
      {
        title: "Sunken hollows",
        howTo:
          "Shade deep hollows from the cheekbones to the jaw and at the temples with a dark gray.",
        products: ["dark gray eyeshadow"],
        render: makeup(
          contour("#4E4C4C", 90, "TriangleFace5"),
          shading("Bronzer5", "#5A5858", 90)
        ),
      },
      {
        title: "Black sockets",
        howTo:
          "Pack black eyeshadow wide around each eye and smudge black kohl all around.",
        products: ["black eyeshadow", "black kohl eyeliner"],
        render: makeup(
          shadow("1color30", matte(BLACK, 92)),
          liner("PandaSmudge11", matte(BLACK, 90))
        ),
      },
      {
        title: "Black lips",
        howTo: "Paint the lips matte black, a little wider than your own.",
        products: ["black lipstick", "black lip liner"],
        render: makeup(
          lips(matte("#1A1A1A", 92)),
          lipLine("Wider1", BLACK, 90, 55, 50)
        ),
      },
      {
        title: "Black hair",
        howTo: "Finish with black hair, flat under the top hat.",
        products: ["black wig"],
        render: hair("#121212", 92, 20),
      },
    ],
    finish:
      "A top hat and a long black coat; draw a few jagged teeth into the black lips with a white eyeliner.",
  },
  "pirate-clark": {
    look: "A Pirate Clark face in his mascot colors: pale, gaunt skin, hollow cheeks, teal and yellow eyes, painted brows and a pink grin stretched a little too wide.",
    steps: [
      {
        title: "Gaunt pale skin",
        howTo:
          "Pat on a foundation three shades lighter than your skin over the face and lips.",
        products: ["light foundation"],
        render: makeup(paler(3, 90)),
      },
      {
        title: "Hollow cheeks",
        howTo:
          "Shade from the cheekbones to the jaw and at the temples with a cool gray-brown.",
        products: ["gray brown eyeshadow"],
        render: makeup(contour("#7A6A64", 90, "TriangleFace5")),
      },
      {
        title: "Mascot eyes",
        howTo:
          "Sweep teal over the lids up to the brows and bright yellow under the eyes, and line the lashes in black.",
        products: ["teal eyeshadow", "yellow eyeshadow", "black eyeliner"],
        render: makeup(
          shadow("2colors25", matte("#1E9A9A", 90), matte("#E8C82A", 90)),
          liner("FullRim7", matte(BLACK, 90))
        ),
      },
      {
        title: "Painted brows",
        howTo: "Draw high, arched black brows.",
        products: ["black brow pencil"],
        render: makeup(
          brows(BLACK, 85, { name: "HighArch4", curvature: 40, thickness: 10 })
        ),
      },
      {
        title: "Stretched grin",
        howTo:
          "Wear a hot-pink lipstick, lined past the corners of the mouth into a grin.",
        products: ["hot pink lipstick", "pink lip liner"],
        render: makeup(
          lips(matte("#E0408A", 92), "smile"),
          lipLine("Wider1", "#C02070", 90, 60, 40)
        ),
      },
    ],
    finish: "A tricorn hat with a white feather, an eyepatch and a pink sash.",
  },
  "ash-williams": {
    look: "An Ash Williams face after a long night: grimy skin, dirty shadows, tired red-rimmed eyes, messy brows, dry lips and messy dark-brown hair.",
    steps: [
      {
        title: "Grimy base",
        howTo:
          "Pat on a foundation your own shade, then a little tan cream color in patches so the skin looks dirty.",
        products: ["foundation", "tan cream color"],
        render: makeup(tint("#A88A6A", 75)),
      },
      {
        title: "Dirt and shadows",
        howTo:
          "Smudge a brown-gray eyeshadow at the temples, under the cheekbones and along the jaw, like dirt and stubble.",
        products: ["brown gray eyeshadow"],
        render: makeup(shading("Bronzer5", "#5A4A3A", 90)),
      },
      {
        title: "Tired eyes",
        howTo:
          "Smudge a gray-brown under and around the eyes and a little red along the lower lashes.",
        products: ["gray brown eyeshadow", "red eyeliner"],
        render: makeup(
          shadow("1color23", matte("#5A4A42", 90)),
          liner("FullRim7", matte("#8A3A34", 90))
        ),
      },
      {
        title: "Messy brows",
        howTo: "Brush the brows up messy with a brown pencil.",
        products: ["brown brow pencil"],
        render: makeup(
          brows("#3A2A20", 85, { name: "Original5", definition: 30 })
        ),
      },
      {
        title: "Dry lips",
        howTo: "Blot a dry nude-brown lipstick over the lips.",
        products: ["nude brown lipstick"],
        render: makeup(lips(matte("#9A7468", 92))),
      },
      {
        title: "Blood smear",
        howTo: "Smear fake blood across one cheekbone.",
        products: ["fake blood"],
        render: paint(
          line(
            { at: "eye", dx: -0.35, dy: 0.55 },
            { at: "eye", dx: 0.25, dy: 0.8 },
            "#6E0A10",
            { width: 0.09 }
          )
        ),
      },
      {
        title: "Messy hair",
        howTo: "Finish with messy dark-brown hair.",
        products: ["dark brown wig"],
        render: hair("#3A2A1E", 90, 15),
      },
    ],
    finish: "A blue shirt with the sleeves rolled up.",
  },
  "dani-the-may-queen": {
    look: "Dani crowned and crying: a fair flushed base, burning red cheeks, red-rimmed teary eyes, soft blonde brows, bare pink lips and blonde hair.",
    steps: [
      {
        title: "Fair base",
        howTo: "Pat on a foundation a shade lighter than your skin, sheer.",
        products: ["light foundation"],
        render: makeup(paler(1, 80)),
      },
      {
        title: "Flushed cheeks",
        howTo:
          "Blend a red-pink cream blush across the cheeks and nose, as if from crying in the sun.",
        products: ["red pink cream blush"],
        render: makeup(blush("Round2", "#D84A50", 85)),
      },
      {
        title: "Crying eyes",
        howTo:
          "Smudge a pink-red eyeshadow close around the eyes and along the waterlines, swollen and teary.",
        products: ["pink red eyeshadow", "red eyeliner"],
        render: makeup(
          shadow("1color23", matte("#C85A60", 90)),
          liner("FullRim7", matte("#B03A40", 90))
        ),
      },
      {
        title: "Blonde brows, bare lips",
        howTo:
          "Brush the brows with a blonde gel and leave the lips a bare, flushed pink.",
        products: ["blonde brow gel", "pink lip balm"],
        render: makeup(brows("#B89A70", 85), lips(satin("#C87A7A", 92))),
      },
      {
        title: "Blonde hair",
        howTo: "Finish with long blonde hair, loose under the crown.",
        products: ["blonde wig"],
        render: hair("#D6BC86", 90, 35),
      },
    ],
    finish:
      "A tall flower crown and a white dress; a dab of lip oil on the cheeks reads as tears.",
  },
  "red-and-the-tethered": {
    look: "A Red face: a sallow base, worn hollow shadows, gold lids for the golden glove, bleached brows and a deep red lip for the jumpsuit.",
    steps: [
      {
        title: "Sallow base",
        howTo:
          "Pat on a foundation your own shade with a little yellow corrector, flat and matte.",
        products: ["matte foundation", "yellow color corrector"],
        render: makeup(paler(0, 80)),
      },
      {
        title: "Worn shadows",
        howTo:
          "Shade under the eyes, the temples and the cheek hollows with a deep brown.",
        products: ["deep brown eyeshadow"],
        render: makeup(
          shading("Bronzer2", "#3A2A24", 90),
          contour("#4A3428", 90, "TriangleFace5")
        ),
      },
      {
        title: "Gold lids",
        howTo:
          "Press a metallic gold over the lids up to the creases, and line the eyes in black.",
        products: ["gold eyeshadow", "black eyeliner"],
        render: makeup(
          shadow("1color57", metallic("#C8A040", 90)),
          liner("FullRim7", matte(BLACK, 90))
        ),
      },
      {
        title: "Bleached brows",
        howTo:
          "Brush a light concealer through the brows so they look bleached.",
        products: ["brow concealer"],
        render: makeup(brows("#C8B8A0", 85)),
      },
      {
        title: "Deep red lip",
        howTo: "Wear a deep red lipstick.",
        products: ["deep red lipstick"],
        render: makeup(lips(matte("#8A1420", 92))),
      },
    ],
    finish: "A red jumpsuit, one golden glove and toy gold scissors.",
  },
  "grace-the-bride": {
    look: "A Grace face on her wedding night: a dewy bridal base, soft sculpting, warm brown eyes with lashes, groomed brows, pink lips and blonde hair, until the blood.",
    steps: [
      {
        title: "Bridal glow",
        howTo:
          "Pat on a dewy foundation your own shade and add a little highlighter on the cheekbones.",
        products: ["dewy foundation", "liquid highlighter"],
        render: makeup(paler(0, 75, 40), glow("#F2D8C8", 70)),
      },
      {
        title: "Soft sculpting",
        howTo:
          "Shade softly under the cheekbones and sweep a peachy-pink blush above it.",
        products: ["soft contour powder", "peach blush"],
        render: makeup(
          contour("#A88070", 90),
          blush("Oblique2", "#E8908A", 82)
        ),
      },
      {
        title: "Warm brown eyes",
        howTo:
          "Blend warm brown into the creases and a lighter shimmer on the lids, line the lashes in brown, and add lashes.",
        products: ["warm brown eyeshadow", "brown eyeliner", "false lashes"],
        render: makeup(
          shadow("2colors83", shimmer("#D8B090", 90), matte("#7A5038", 90)),
          liner("Lower11", matte("#3A2418", 90)),
          lashes("UpperDense1", "#1A1210", 90)
        ),
      },
      {
        title: "Soft brows",
        howTo: "Fill the brows softly.",
        products: ["brow pencil"],
        render: makeup(brows("#7A5A3E", 85, { name: "SoftArch1" })),
      },
      {
        title: "Pink lips",
        howTo: "Wear a soft pink lipstick with a little gloss.",
        products: ["pink lipstick"],
        render: makeup(lips(gloss("#D07888", 92))),
      },
      {
        title: "Blood and dirt",
        howTo: "Smear fake blood across one cheek and the forehead.",
        products: ["fake blood"],
        render: paint(
          line(
            { at: "eye", dx: -0.4, dy: 0.6 },
            { at: "eye", dx: 0.15, dy: 0.9 },
            "#6E0A10",
            { width: 0.08 }
          ),
          line(
            { at: "forehead", dx: 0.1, dy: -0.1 },
            { at: "forehead", dx: 0.55, dy: 0.2 },
            "#6E0A10",
            { width: 0.06 }
          )
        ),
      },
      {
        title: "Blonde hair",
        howTo: "Finish with long blonde hair in loose waves.",
        products: ["blonde wig"],
        render: hair("#D9BE8A", 90, 40),
      },
    ],
    finish:
      "A torn wedding dress and sneakers, with fake blood on your arms and gown.",
  },
  "lydia-deetz": {
    look: "A Lydia Deetz face: goth-pale skin, soft gray hollows, peach-washed eyes with dark smudges beneath, strong dark brows, dark plum lips and jet-black hair.",
    steps: [
      {
        title: "Goth-pale base",
        howTo:
          "Pat on a foundation three shades lighter than your skin and set it with translucent powder.",
        products: ["light foundation", "translucent setting powder"],
        render: makeup(paler(3, 90)),
      },
      {
        title: "Soft hollows",
        howTo:
          "Shade under the eyes and at the temples with a soft gray-mauve, for a sleepless look.",
        products: ["gray mauve eyeshadow"],
        render: makeup(shading("Bronzer2", "#7A6670", 90)),
      },
      {
        title: "Peach and dark eyes",
        howTo:
          "Wash a peach eyeshadow over the lids up to the brows and smudge a dark gray-brown under the eyes, with black liner on the lashes.",
        products: ["peach eyeshadow", "dark gray eyeshadow", "black eyeliner"],
        render: makeup(
          shadow("2colors25", matte("#E0A07A", 90), matte("#3A3034", 90)),
          liner("FullRim7", matte(BLACK, 90))
        ),
      },
      {
        title: "Strong dark brows",
        howTo: "Fill the brows dark and straight with a black pencil.",
        products: ["black brow pencil"],
        render: makeup(
          brows("#141212", 85, { name: "Straight2", thickness: 20 })
        ),
      },
      {
        title: "Dark plum lips",
        howTo: "Wear a dark plum lipstick.",
        products: ["dark plum lipstick"],
        render: makeup(lips(matte("#4A1E30", 92))),
      },
      {
        title: "Jet-black hair",
        howTo: "Finish with jet-black hair and short spiky bangs.",
        products: ["black wig with bangs"],
        render: hair("#0F0F0F", 92, 30),
      },
    ],
    finish: "Pin the bangs into short spiky points, and wear a black dress.",
  },
  "tiffany-valentine": {
    look: "A Tiffany Valentine face: a matte doll base, sculpted cheeks, a plum smoky eye with a sharp black wing and big lashes, thin brows, red lips and platinum hair.",
    steps: [
      {
        title: "Doll base",
        howTo:
          "Pat on a matte foundation a shade lighter than your skin and powder it smooth.",
        products: ["matte foundation", "setting powder"],
        render: makeup(smooth(50), paler(1, 88)),
      },
      {
        title: "Sculpted cheeks",
        howTo:
          "Shade under the cheekbones with a cool brown and sweep a rosy blush above it.",
        products: ["contour powder", "rose blush"],
        render: makeup(
          contour("#8A6A60", 90),
          blush("Oblique2", "#D06A7A", 82)
        ),
      },
      {
        title: "Plum smoky eye",
        howTo:
          "Smoke a plum eyeshadow over the lids into the outer corners, draw a sharp black wing, and add big lashes.",
        products: ["plum eyeshadow", "black liquid eyeliner", "false lashes"],
        render: makeup(
          shadow("2colors83", matte("#7A3A6A", 90), matte("#3A1A34", 90)),
          liner("OpenWings3", matte(BLACK, 92)),
          lashes("Winged1", BLACK, 92)
        ),
      },
      {
        title: "Thin brows",
        howTo: "Draw thin, arched brows a shade darker than the hair.",
        products: ["brow pencil"],
        render: makeup(
          brows("#8A7258", 85, { name: "Thin1", curvature: 40, thickness: -30 })
        ),
      },
      {
        title: "Red lips",
        howTo: "Wear a bright red lipstick, lined full.",
        products: ["red lipstick", "red lip liner"],
        render: makeup(
          lips(matte("#B0141E", 92), "plump"),
          lipLine("Large&Full1", "#8A0E16", 90, 55, 70)
        ),
      },
      {
        title: "Beauty mark",
        howTo: "Dot a beauty mark above the lip with a brown eyeliner.",
        products: ["brown eyeliner"],
        render: paint(
          dot({ at: "mouthCorner", dx: 0.1, dy: -0.28 }, 0.028, "#2A1A14")
        ),
      },
      {
        title: "Platinum hair",
        howTo: "Finish with platinum-blonde hair, big and curled.",
        products: ["platinum blonde wig"],
        render: hair("#ECE3CF", 90, 40),
      },
    ],
    finish: "A black leather jacket and a wedding veil.",
  },
  "the-craft-coven": {
    look: "A Nancy face from The Craft: pale skin, gaunt 90s contour, black kohl smudged around plum-brown eyes, thin dark brows, a vampy dark berry lip and dark hair.",
    steps: [
      {
        title: "Pale skin",
        howTo:
          "Pat on a foundation two shades lighter than your skin and powder it matte.",
        products: ["light matte foundation"],
        render: makeup(paler(2, 90)),
      },
      {
        title: "Gaunt contour",
        howTo:
          "Shade under the cheekbones and at the temples with a cool brown, sharp and 90s.",
        products: ["cool brown contour powder"],
        render: makeup(contour("#6E5650", 90)),
      },
      {
        title: "Smudged kohl",
        howTo:
          "Smudge plum-brown eyeshadow all around the eyes and black kohl all around the lash lines.",
        products: ["plum brown eyeshadow", "black kohl eyeliner"],
        render: makeup(
          shadow("1color30", matte("#4A2A34", 90)),
          liner("PandaSmudge11", matte(BLACK, 90))
        ),
      },
      {
        title: "Thin dark brows",
        howTo: "Thin the brows and darken them with a dark pencil.",
        products: ["dark brow pencil"],
        render: makeup(
          brows("#1E1616", 85, { name: "Thin1", curvature: 30, thickness: -20 })
        ),
      },
      {
        title: "Vampy lips",
        howTo:
          "Line the lips in near-black and fill them with a dark berry lipstick.",
        products: ["dark berry lipstick", "black lip liner"],
        render: makeup(
          lips(matte("#4A1428", 92)),
          lipLine("Natural1", "#1E0A12", 90, 50, 60)
        ),
      },
      {
        title: "Dark hair",
        howTo: "Finish with dark hair, messy and teased.",
        products: ["dark brown wig"],
        render: hair("#2A1E1A", 90, 20),
      },
    ],
    finish: "A plaid skirt, a black choker and a candle.",
  },
  "jennifer-check": {
    look: "A Jennifer Check face: luminous skin, sculpted cheeks, grungy smoky eyes with lashes, groomed dark brows, a glossy berry-pink pout and long dark hair.",
    steps: [
      {
        title: "Luminous skin",
        howTo:
          "Pat on a glowy foundation your own shade and add highlighter on the cheekbones.",
        products: ["glowy foundation", "liquid highlighter"],
        render: makeup(paler(0, 78, 45), glow("#F0D0C0", 70)),
      },
      {
        title: "Sculpted cheeks",
        howTo:
          "Shade under the cheekbones with a soft brown and sweep a berry-pink blush above it.",
        products: ["contour powder", "berry blush"],
        render: makeup(
          contour("#8A6458", 90),
          blush("Oblique2", "#C8507A", 82)
        ),
      },
      {
        title: "Grungy smoky eyes",
        howTo:
          "Smoke a charcoal-brown eyeshadow over the lids and under the eyes, smudge black liner into the lashes, and add lashes.",
        products: ["charcoal eyeshadow", "black kohl eyeliner", "false lashes"],
        render: makeup(
          shadow("2colors25", matte("#4A3A36", 90), matte("#2A2020", 90)),
          liner("PandaSmudge1", matte(BLACK, 90)),
          lashes("UpperDense1", BLACK, 90)
        ),
      },
      {
        title: "Groomed brows",
        howTo: "Fill the brows dark and groomed.",
        products: ["dark brow pencil"],
        render: makeup(
          brows("#2A1C16", 85, { name: "SoftArch1", definition: 80 })
        ),
      },
      {
        title: "Berry gloss",
        howTo: "Wear a glossy berry-pink lip, full and pouty.",
        products: ["berry pink lip gloss"],
        render: makeup(lips(gloss("#B0386A", 92), "pouty")),
      },
      {
        title: "Blood",
        howTo:
          "For the demon, let fake blood run from the corners of the mouth.",
        products: ["fake blood"],
        render: paint(
          line(
            { at: "mouthCorner", dx: 0.03 },
            { at: "mouthCorner", dx: -0.02, dy: 0.55 },
            "#6E0A10",
            { width: 0.045, mirror: true }
          )
        ),
      },
      {
        title: "Dark hair",
        howTo: "Finish with long dark hair.",
        products: ["long dark brown wig"],
        render: hair("#2A1C16", 90, 40),
      },
    ],
    finish: "A cheerleader uniform.",
  },
  "frank-the-rabbit": {
    look: "A Frank the Rabbit face in the mask's colors: a cool gray tint, dark gray hollows, sunken eyes ringed in silver, faded brows and pale gray lips.",
    steps: [
      {
        title: "Gray paint",
        howTo:
          "Cover the face, brows and lips with a gray cream face paint, like the rabbit mask.",
        products: ["gray cream face paint"],
        render: makeup(facePaint("#9C9A9C", 92), brows("#9C9A9C", 90)),
      },
      {
        title: "Gray hollows",
        howTo:
          "Shade deep hollows from the cheekbones to the jaw and at the temples with a dark gray.",
        products: ["dark gray eyeshadow"],
        render: makeup(
          contour("#4E4C50", 90, "TriangleFace5"),
          shading("Bronzer2", "#3E3C40", 90)
        ),
      },
      {
        title: "Silver-ringed eyes",
        howTo:
          "Pack a dark charcoal all around the eyes and line the lashes with a metallic silver.",
        products: ["charcoal eyeshadow", "silver eyeliner"],
        render: makeup(
          shadow("1color30", matte("#2A2A2E", 90)),
          liner("FullRim7", metallic("#C8C8D0", 90))
        ),
      },
      {
        title: "Pale gray lips",
        howTo: "Cover the lips with a pale gray lipstick.",
        products: ["pale gray lipstick"],
        render: makeup(lips(matte("#A8A6AA", 92))),
      },
    ],
    finish:
      "Gray bunny ears on a headband; draw square teeth over the lips with a white eyeliner.",
  },
  "the-gill-man": {
    look: "A Gill-man face: a green tint, deep swamp-green hollows, metallic teal-green eyes, dark green brows and green lips.",
    steps: [
      {
        title: "Green paint",
        howTo: "Cover the face and lips with a swamp-green cream face paint.",
        products: ["green cream face paint"],
        render: makeup(facePaint("#6E9A6A", 95)),
      },
      {
        title: "Swamp hollows",
        howTo:
          "Shade the temples, the cheek hollows and the jaw with a deep swamp-green eyeshadow.",
        products: ["dark green eyeshadow"],
        render: makeup(
          shading("Bronzer5", "#2E4A30", 90),
          contour("#3A5A3A", 90, "TriangleFace5")
        ),
      },
      {
        title: "Swamp eyes",
        howTo:
          "Press a metallic teal-green all around the eyes and line them in dark green.",
        products: ["teal green eyeshadow", "dark green eyeliner"],
        render: makeup(
          shadow("1color30", metallic("#2A8A78", 90)),
          liner("FullRim7", matte("#1A3A28", 90))
        ),
      },
      {
        title: "Green brows",
        howTo: "Brush a dark green eyeshadow through the brows.",
        products: ["dark green eyeshadow"],
        render: makeup(brows("#2A4A30", 85)),
      },
      {
        title: "Green lips",
        howTo: "Wear a dark green lipstick, glossed so it looks wet.",
        products: ["dark green lipstick", "clear lip gloss"],
        render: makeup(lips(gloss("#3A6A44", 92))),
      },
    ],
    finish:
      "Dab a darker green eyeshadow through a piece of fishnet on your cheeks for scales.",
  },
  "the-phantom-of-the-opera": {
    look: "A Phantom of the Opera face: deathly pale skin, a skull's sunken cheeks, dark skull-like sockets, thin brows, dark lips and slick black hair.",
    steps: [
      {
        title: "Skull-white face",
        howTo:
          "Cover the face and lips with an old-ivory cream face paint, then powder it.",
        products: ["cream face paint", "setting powder"],
        render: makeup(facePaint("#ECE6DC", 95)),
      },
      {
        title: "Sunken cheeks",
        howTo:
          "Shade deep hollows from the cheekbones to the jaw, the temples and the sides of the nose with a gray-brown.",
        products: ["gray brown eyeshadow"],
        render: makeup(
          contour("#5A504C", 90, "TriangleFace5"),
          shading("Bronzer5", "#4A4240", 90)
        ),
      },
      {
        title: "Skull sockets",
        howTo:
          "Pack a near-black eyeshadow wide around each eye and line them all around in black.",
        products: ["black eyeshadow", "black kohl eyeliner"],
        render: makeup(
          shadow("1color30", matte("#1A1616", 92)),
          liner("FullRim7", matte(BLACK, 90))
        ),
      },
      {
        title: "Thin brows",
        howTo: "Thin the brows and darken them sharply.",
        products: ["black brow pencil"],
        render: makeup(
          brows("#1A1616", 85, { name: "Thin1", curvature: 30, thickness: -30 })
        ),
      },
      {
        title: "Dark lips",
        howTo: "Wear a near-black brown lipstick.",
        products: ["black brown lipstick"],
        render: makeup(lips(matte("#2E2020", 92))),
      },
      {
        title: "Slick black hair",
        howTo: "Finish with black hair slicked back.",
        products: ["black hair color spray", "hair gel"],
        render: hair("#121212", 92, 45),
      },
    ],
    finish: "A white half mask over one side of your face, and a cape.",
  },
  krampus: {
    look: "A Krampus face: a dark ashen base, brown and blood-red demon shadows, black eyes, heavy black brows, dark red lips and black hair.",
    steps: [
      {
        title: "Ashen paint",
        howTo: "Cover the face with an ashen gray-brown cream face paint.",
        products: ["gray brown cream face paint"],
        render: makeup(facePaint("#7A6A62", 90)),
      },
      {
        title: "Demon shadows",
        howTo:
          "Shade the temples, the cheek hollows and the jaw with a deep brown, then press a blood-red eyeshadow into the hollows.",
        products: ["deep brown eyeshadow", "blood red eyeshadow"],
        render: makeup(
          shading("Bronzer5", "#3A2420", 90),
          contour("#7A1A1E", 90, "TriangleFace5")
        ),
      },
      {
        title: "Black eyes",
        howTo:
          "Pack black eyeshadow all around the eyes, with red in the inner corners, and line them in black.",
        products: ["black eyeshadow", "red eyeshadow", "black kohl eyeliner"],
        render: makeup(
          shadow("2colors25", matte(BLACK, 92), matte("#8A1A1E", 90)),
          liner("PandaSmudge11", matte(BLACK, 90))
        ),
      },
      {
        title: "Heavy black brows",
        howTo: "Draw heavy, angled black brows.",
        products: ["black brow pencil"],
        render: makeup(
          brows(BLACK, 92, { name: "Arrow13", thickness: 40, definition: 85 })
        ),
      },
      {
        title: "Dark red lips",
        howTo: "Wear a near-black red lipstick.",
        products: ["dark red lipstick"],
        render: makeup(lips(matte("#4A0E14", 92))),
      },
      {
        title: "Black hair",
        howTo: "Finish with wild black hair.",
        products: ["black wig"],
        render: hair("#121212", 92, 20),
      },
    ],
    finish: "Horns on a headband, a fur stole and a little bell.",
  },
  "damien-thorn": {
    look: "A Damien face: pale and solemn, faintly hollow, with a cold shadowed stare, dark brows, colorless lips and dark hair.",
    steps: [
      {
        title: "Solemn pallor",
        howTo:
          "Pat on a foundation two shades lighter than your skin and powder it matte.",
        products: ["light matte foundation"],
        render: makeup(paler(2, 88)),
      },
      {
        title: "Faint hollows",
        howTo:
          "Shade softly under the eyes and at the temples with a cool gray-brown.",
        products: ["cool gray eyeshadow"],
        render: makeup(shading("Bronzer2", "#7A6E6A", 90)),
      },
      {
        title: "Cold stare",
        howTo:
          "Shade close around the eyes with a gray-brown and line the upper lashes thinly in dark brown.",
        products: ["gray brown eyeshadow", "dark brown eyeliner"],
        render: makeup(
          shadow("1color23", matte("#5E524E", 90)),
          liner("Lower11", matte("#2A2220", 90))
        ),
      },
      {
        title: "Dark brows, pale lips",
        howTo:
          "Darken the brows a little, straight, and blot a pale nude lipstick over the lips.",
        products: ["dark brow pencil", "pale nude lipstick"],
        render: makeup(
          brows("#2A2018", 85, { name: "Straight2" }),
          lips(matte("#B8988E", 92))
        ),
      },
      {
        title: "Dark hair",
        howTo: "Finish with neat dark hair.",
        products: ["dark brown hair color spray"],
        render: hair("#151210", 90, 30),
      },
    ],
    finish:
      "A school uniform, and 666 written small behind your ear with eyeliner.",
  },
  "kayako-saeki": {
    look: "A Kayako face: ghost-white skin, gray-blue hollows, dark hollow eyes, no brows, gray lips and long black hair.",
    steps: [
      {
        title: "Ghost-white face",
        howTo:
          "Cover the whole face, brows and lips with white cream face paint, then press white powder over it so it sets.",
        products: ["white cream face paint", "white setting powder"],
        render: makeup(facePaint("#F2F2F0"), brows("#E8E4E0", 90)),
      },
      {
        title: "Gray-blue hollows",
        howTo:
          "Shade under the eyes, the temples and the cheek hollows with a cold gray-blue.",
        products: ["gray blue eyeshadow"],
        render: makeup(
          shading("Bronzer2", "#5A6270", 90),
          contour("#6E7480", 90, "TriangleFace5")
        ),
      },
      {
        title: "Hollow eyes",
        howTo:
          "Pack a dark gray all around the eyes and line them all around in black.",
        products: ["dark gray eyeshadow", "black kohl eyeliner"],
        render: makeup(
          shadow("1color30", matte("#2A2C32", 90)),
          liner("FullRim7", matte(BLACK, 90))
        ),
      },
      {
        title: "Gray lips",
        howTo: "Cover the lips with a gray lipstick.",
        products: ["gray lipstick"],
        render: makeup(lips(matte("#8A8890", 92))),
      },
      {
        title: "Long black hair",
        howTo: "Finish with long black hair hanging forward.",
        products: ["long black wig"],
        render: hair("#101010", 92, 35),
      },
    ],
    finish: "Let the hair fall over your face, and wear a long white dress.",
  },
  "victor-crowley": {
    look: "A Victor Crowley face: blotchy red-purple skin, deep sunken shadows, dark hollow eyes, ragged brows, dark lips and long black hair.",
    steps: [
      {
        title: "Blotchy paint",
        howTo:
          "Cover the face with a red-purple cream face paint, patted on unevenly.",
        products: ["red purple cream face paint"],
        render: makeup(facePaint("#A0606A", 88)),
      },
      {
        title: "Sunken shadows",
        howTo:
          "Shade the temples, under the eyes, the cheek hollows and the jaw with a deep purple-brown.",
        products: ["purple brown eyeshadow"],
        render: makeup(
          shading("Bronzer5", "#4A2A34", 90),
          contour("#5A3038", 90, "TriangleFace5")
        ),
      },
      {
        title: "Hollow eyes",
        howTo:
          "Pack a dark purple-black all around the eyes and line them in black.",
        products: ["dark purple eyeshadow", "black kohl eyeliner"],
        render: makeup(
          shadow("1color30", matte("#2A1A22", 90)),
          liner("FullRim7", matte(BLACK, 90))
        ),
      },
      {
        title: "Ragged brows, dark lips",
        howTo:
          "Darken the brows unevenly, and wear a dark red-brown lipstick blotted dry.",
        products: ["dark brow pencil", "dark red brown lipstick"],
        render: makeup(
          brows("#2A1E1E", 85, { name: "Original5", definition: 25 }),
          lips(matte("#5A2A2A", 92))
        ),
      },
      {
        title: "Long black hair",
        howTo: "Finish with long, stringy black hair.",
        products: ["long black wig"],
        render: hair("#141414", 90, 15),
      },
    ],
    finish: "Denim overalls and a toy hatchet.",
  },
  "laurie-strode": {
    look: "A Laurie Strode face from '78: an even, natural base, soft lids, mascara, brushed brows, rosy cheeks and lips, and short light waves.",
    steps: [
      {
        title: "Natural base",
        howTo: "Pat on a light foundation your own shade.",
        products: ["light foundation"],
        render: makeup(paler(0, 72)),
      },
      {
        title: "Soft 70s eyes",
        howTo: "Wash a soft brown over the lids and add brown mascara.",
        products: ["soft brown eyeshadow", "brown mascara"],
        render: makeup(
          shadow("1color8", matte("#A88068", 90)),
          liner("Lower11", matte("#5A3E2E", 90)),
          lashes("Natural1", "#3A2A1E", 90)
        ),
      },
      {
        title: "Rosy cheeks",
        howTo: "Sweep a rosy blush on the apples of the cheeks.",
        products: ["rose blush"],
        render: makeup(blush("Round2", "#D88080", 82)),
      },
      {
        title: "Brows and rosy lips",
        howTo:
          "Brush the brows with a light brown gel, and wear a rosy lipstick.",
        products: ["light brown brow gel", "rose lipstick"],
        render: makeup(brows("#9A7A58", 85), lips(satin("#C07070", 92))),
      },
      {
        title: "Light waves",
        howTo: "Finish with short, light-brown waves.",
        products: ["short light brown wig"],
        render: hair("#C9A570", 90, 35),
      },
    ],
    finish:
      "A light-blue shirt and jeans, with a little fake blood for the closet scene.",
  },
  dollface: {
    look: "A Dollface face: a porcelain doll mask, cracked gray shading, round pink cheeks, wide painted lashes, thin painted brows, a small red mouth and blonde hair.",
    steps: [
      {
        title: "Porcelain base",
        howTo:
          "Pat on a foundation three shades lighter than your skin and powder it to a hard, porcelain finish.",
        products: ["light foundation", "translucent setting powder"],
        render: makeup(smooth(55), paler(3, 92)),
      },
      {
        title: "Aged shading",
        howTo:
          "Shade the edges of the face and the cheek hollows with a soft gray, like an old doll's mask.",
        products: ["soft gray eyeshadow"],
        render: makeup(shading("Bronzer3", "#8A8480", 90)),
      },
      {
        title: "Painted doll eyes",
        howTo:
          "Line the eyes thinly in black, top and bottom, and add wide lashes top and bottom.",
        products: ["black eyeliner", "false lashes"],
        render: makeup(
          liner("FullRim7", matte(BLACK, 90)),
          lashes("Upper&Lower1", BLACK, 90)
        ),
      },
      {
        title: "Painted brows, pink cheeks",
        howTo:
          "Draw thin, high painted brows, and blend a round pink blush on the cheeks.",
        products: ["brow pencil", "pink cream blush"],
        render: makeup(
          brows("#6A4A30", 85, {
            name: "Thin1",
            curvature: 50,
            thickness: -40,
          }),
          blush("Circle2", "#E07A8A", 82)
        ),
      },
      {
        title: "Small red mouth",
        howTo: "Paint a small red mouth in the middle of the lips.",
        products: ["red lipstick", "red lip liner"],
        render: makeup(
          lips(matte("#B8202A", 92), "heart-shaped"),
          lipLine("Small1", "#8A1820", 90, 50, 70)
        ),
      },
      {
        title: "Blonde hair",
        howTo: "Finish with blonde hair, curled and parted in the middle.",
        products: ["blonde wig"],
        render: hair("#D8BE8E", 90, 30),
      },
    ],
    finish:
      "Dark clothes, and keep your face still and blank: the stare does the rest.",
  },
  "the-purge-anarchists": {
    look: "A Lady Liberty face from The Purge: a teal tint, dark teal shadows, black-ringed eyes, teal brows and a pale teal smile.",
    steps: [
      {
        title: "Teal paint",
        howTo:
          "Cover the face, brows and lips with a teal cream face paint, like the Lady Liberty mask.",
        products: ["teal cream face paint"],
        render: makeup(facePaint("#6FAFA6", 95), brows("#6FAFA6", 90)),
      },
      {
        title: "Teal shadows",
        howTo:
          "Shade the edges of the face, the cheek hollows and the nose with a deep teal.",
        products: ["deep teal eyeshadow"],
        render: makeup(shading("Bronzer3", "#2A5A54", 90)),
      },
      {
        title: "Dark eyes",
        howTo:
          "Pack black eyeshadow all around the eyes, like the mask's eyeholes, and line them in black.",
        products: ["black eyeshadow", "black kohl eyeliner"],
        render: makeup(
          shadow("1color30", matte(BLACK, 90)),
          liner("FullRim7", matte(BLACK, 90))
        ),
      },
      {
        title: "Pale teal smile",
        howTo: "Wear a pale teal lipstick, lined into a small fixed smile.",
        products: ["pale teal lipstick", "teal lip liner"],
        render: makeup(
          lips(matte("#8AC0B8", 92), "smile"),
          lipLine("Natural1", "#4A8078", 90, 50, 60)
        ),
      },
    ],
    finish: "Draw small X marks over the eyelids with a dark eyeliner.",
  },
  "killer-klowns": {
    look: "A Killer Klowns face: a candy-pink tint, hot-pink shading, bright blue and pink eyes, high painted brows, a big red mouth and bright green hair.",
    steps: [
      {
        title: "Candy-pink paint",
        howTo: "Cover the face and lips with a candy-pink cream face paint.",
        products: ["pink cream face paint"],
        render: makeup(facePaint("#F2A6C2", 95)),
      },
      {
        title: "Hot-pink shading",
        howTo:
          "Shade the edges of the face and the cheek hollows with a hot pink, and dab round pink cheeks.",
        products: ["hot pink eyeshadow", "pink blush"],
        render: makeup(
          shading("Bronzer3", "#D04A8A", 90),
          blush("Circle2", "#E0408A", 85)
        ),
      },
      {
        title: "Clown eyes",
        howTo:
          "Sweep bright blue over the lids up to the brows and hot pink under the eyes, and line them in black.",
        products: [
          "bright blue eyeshadow",
          "hot pink eyeshadow",
          "black eyeliner",
        ],
        render: makeup(
          shadow("2colors25", matte("#2A70E0", 90), matte("#E0408A", 90)),
          liner("FullRim7", matte(BLACK, 90))
        ),
      },
      {
        title: "High painted brows",
        howTo: "Draw high, arched black brows.",
        products: ["black brow pencil"],
        render: makeup(
          brows(BLACK, 88, { name: "HighArch4", curvature: 50, thickness: 10 })
        ),
      },
      {
        title: "Big red mouth",
        howTo: "Paint a big red mouth, drawn past the lips.",
        products: ["bright red lipstick", "red lip liner"],
        render: makeup(
          lips(matte("#D0141E", 92), "smile"),
          lipLine("Large&Full1", "#A01018", 90, 65, 50)
        ),
      },
      {
        title: "Big red nose",
        howTo: "Paint a big round red nose with red cream paint.",
        products: ["red cream face paint"],
        render: paint(dot({ at: "nose", dy: 0.02 }, 0.17, "#D0141E")),
      },
      {
        title: "Green hair",
        howTo: "Finish with bright green clown hair.",
        products: ["green clown wig"],
        render: hair("#3FB83F", 90, 25),
      },
    ],
    finish: "Plastic fangs and a pointed party hat.",
  },
  remmick: {
    look: "A Remmick face: pale 1930s skin, hungry hollow shadows, red-rimmed eyes, brushed brows, bloodless lips and light-brown hair.",
    steps: [
      {
        title: "Pale skin",
        howTo:
          "Pat on a foundation three shades lighter than your skin and powder it.",
        products: ["light foundation"],
        render: makeup(paler(3, 90)),
      },
      {
        title: "Hungry hollows",
        howTo:
          "Shade under the eyes, the temples and the cheek hollows with a cool gray-brown.",
        products: ["gray brown eyeshadow"],
        render: makeup(
          shading("Bronzer2", "#6A5A56", 90),
          contour("#7A6A64", 90, "TriangleFace5")
        ),
      },
      {
        title: "Red-rimmed eyes",
        howTo:
          "Smudge a red-brown eyeshadow close around the eyes and line the waterlines in red.",
        products: ["red brown eyeshadow", "red eyeliner"],
        render: makeup(
          shadow("1color23", matte("#7A3A36", 90)),
          liner("FullRim7", matte("#A0282E", 90))
        ),
      },
      {
        title: "Light brows",
        howTo: "Brush the brows with a light brown gel.",
        products: ["light brown brow gel"],
        render: makeup(brows("#7A5A40", 85)),
      },
      {
        title: "Bloodless lips",
        howTo: "Blot a pale mauve lipstick over the lips.",
        products: ["pale mauve lipstick"],
        render: makeup(lips(matte("#B0989A", 92))),
      },
      {
        title: "Blood",
        howTo: "Let a little fake blood run from the corners of the mouth.",
        products: ["fake blood"],
        render: paint(
          line(
            { at: "mouthCorner", dx: 0.03 },
            { at: "mouthCorner", dx: 0.0, dy: 0.45 },
            "#6E0A10",
            { width: 0.035, mirror: true }
          )
        ),
      },
      {
        title: "Light-brown hair",
        howTo: "Finish with light-brown hair, combed back.",
        products: ["light brown wig"],
        render: hair("#8A6A4A", 90, 35),
      },
    ],
    finish: "Plastic fangs and suspenders.",
  },
  longlegs: {
    look: "A Longlegs face: cold-cream pale, puffy waxen shading, pink-rimmed eyes, colorless brows, smeared red lips and long stringy white-blond hair.",
    steps: [
      {
        title: "Cold-cream pale",
        howTo:
          "Pat on a foundation four shades lighter than your skin over the face and brows, thick and shiny like cold cream.",
        products: ["very light foundation", "cold cream"],
        render: makeup(paler(4, 92, 35), brows("#E0D8CC", 85)),
      },
      {
        title: "Waxen shading",
        howTo:
          "Shade the edges of the face, the cheek hollows and the nose with a soft pink-beige, so it looks puffy and waxen.",
        products: ["pink beige eyeshadow"],
        render: makeup(shading("Bronzer3", "#C8A098", 90)),
      },
      {
        title: "Pink-rimmed eyes",
        howTo:
          "Smudge a pink eyeshadow close around the eyes and line the waterlines in red.",
        products: ["pink eyeshadow", "red eyeliner"],
        render: makeup(
          shadow("1color23", matte("#D88A90", 90)),
          liner("FullRim7", matte("#B0383E", 90))
        ),
      },
      {
        title: "Smeared red lips",
        howTo: "Wear a bright red lipstick, smeared past the lip line.",
        products: ["red lipstick"],
        render: makeup(
          lips(matte("#C8202A", 92), "plump"),
          lipLine("Large&Full1", "#A81820", 90, 55, 20)
        ),
      },
      {
        title: "White-blond hair",
        howTo: "Finish with long, stringy white-blond hair.",
        products: ["long white blonde wig"],
        render: hair("#E7DFC8", 90, 20),
      },
    ],
    finish: "Round glasses and a pale suit.",
  },
  david: {
    look: "A David face from The Lost Boys: pale skin, sharp hollow cheeks, smudged 80s punk eyes, light brows, pale lips and a platinum mullet.",
    steps: [
      {
        title: "Pale skin",
        howTo:
          "Pat on a foundation three shades lighter than your skin and powder it matte.",
        products: ["light matte foundation"],
        render: makeup(paler(3, 90)),
      },
      {
        title: "Sharp cheeks",
        howTo:
          "Shade under the cheekbones and at the temples with a cool gray-brown, sharp and gaunt.",
        products: ["gray brown contour powder"],
        render: makeup(contour("#6E625E", 90, "TriangleFace5")),
      },
      {
        title: "Punk eyes",
        howTo:
          "Smudge a charcoal eyeshadow all around the eyes and black kohl along the lash lines, messy.",
        products: ["charcoal eyeshadow", "black kohl eyeliner"],
        render: makeup(
          shadow("1color30", matte("#2E2A2A", 90)),
          liner("PandaSmudge1", matte(BLACK, 90))
        ),
      },
      {
        title: "Light brows, pale lips",
        howTo:
          "Lighten the brows with a blonde gel, and blot a pale nude lipstick over the lips.",
        products: ["blonde brow gel", "pale nude lipstick"],
        render: makeup(brows("#C8B898", 85), lips(matte("#B8A098", 92))),
      },
      {
        title: "Platinum mullet",
        howTo: "Finish with a spiky platinum-blonde mullet.",
        products: ["platinum mullet wig"],
        render: hair("#ECE4CF", 90, 30),
      },
    ],
    finish: "Plastic fangs, an earring and a long black coat.",
  },
  "the-creeper": {
    look: "A Creeper face: dark olive skin, leathery olive-black shadows, sunken black eyes, a heavy brow and muted dark lips.",
    steps: [
      {
        title: "Olive paint",
        howTo: "Cover the face with a dark olive cream face paint.",
        products: ["olive cream face paint"],
        render: makeup(facePaint("#6E6A4A", 92)),
      },
      {
        title: "Leathery shadows",
        howTo:
          "Shade the temples, the cheek hollows and the jaw with an olive-black eyeshadow, deep and creased.",
        products: ["olive black eyeshadow"],
        render: makeup(
          shading("Bronzer5", "#2E2E1E", 90),
          contour("#3A3824", 90, "TriangleFace5")
        ),
      },
      {
        title: "Sunken black eyes",
        howTo:
          "Pack black eyeshadow all around the eyes and smudge black kohl all around.",
        products: ["black eyeshadow", "black kohl eyeliner"],
        render: makeup(
          shadow("1color30", matte(BLACK, 92)),
          liner("PandaSmudge11", matte(BLACK, 90))
        ),
      },
      {
        title: "Heavy brow, muted lips",
        howTo:
          "Darken the brows heavy and low, and wear a muted olive-brown lipstick.",
        products: ["black brow pencil", "olive brown lipstick"],
        render: makeup(
          brows("#1A1A12", 88, { name: "Straight2", thickness: 40 }),
          lips(matte("#4A4232", 92))
        ),
      },
    ],
    finish: "A wide-brim hat and a long coat.",
  },
  "stripe-and-gizmo": {
    look: "A Stripe face: a green tint, dark green hollows, dark eyes rimmed in red, dark brows, a dark green mouth and white hair.",
    steps: [
      {
        title: "Gremlin-green paint",
        howTo:
          "Cover the face and lips with a bright gremlin-green cream face paint.",
        products: ["green cream face paint"],
        render: makeup(facePaint("#7FA060", 95)),
      },
      {
        title: "Gremlin hollows",
        howTo:
          "Shade the temples, the cheek hollows and the jaw with a dark green eyeshadow.",
        products: ["dark green eyeshadow"],
        render: makeup(
          shading("Bronzer5", "#2E4A24", 90),
          contour("#3A5A2E", 90, "TriangleFace5")
        ),
      },
      {
        title: "Gremlin eyes",
        howTo:
          "Pack a dark green-black all around the eyes and line the waterlines in red.",
        products: ["dark green eyeshadow", "red eyeliner"],
        render: makeup(
          shadow("1color30", matte("#1E2A18", 90)),
          liner("FullRim7", matte("#B0202A", 90))
        ),
      },
      {
        title: "Brows and mouth",
        howTo:
          "Darken the brows with dark green, and wear a dark green lipstick.",
        products: ["dark green eyeshadow", "dark green lipstick"],
        render: makeup(
          brows("#1E2E18", 85, { name: "Arrow13", thickness: 20 }),
          lips(matte("#2E4A28", 92))
        ),
      },
      {
        title: "White hair",
        howTo: "Finish with spiky white hair.",
        products: ["white hair color spray"],
        render: hair("#F2F2EE", 90, 20),
      },
    ],
    finish: "Spike the white hair into a mohawk with gel.",
  },
  "dr-frank-n-furter": {
    look: "A Frank-N-Furter face: a pale matte base, sharp cheekbones and blush, a black-and-purple cat eye with big lashes, dramatic brows, deep red lips and black curls.",
    steps: [
      {
        title: "Pale matte base",
        howTo:
          "Pat on a matte foundation two shades lighter than your skin and powder it.",
        products: ["light matte foundation", "setting powder"],
        render: makeup(paler(2, 90)),
      },
      {
        title: "Sharp cheekbones",
        howTo:
          "Shade under the cheekbones with a cool brown and sweep a rosy-red blush high above it.",
        products: ["contour powder", "rose red blush"],
        render: makeup(
          contour("#7A5A58", 90),
          blush("Oblique2", "#C8405A", 82)
        ),
      },
      {
        title: "Cat eye",
        howTo:
          "Sweep purple over the lids up to the brows, black in the outer corners, draw a long black wing, and add big lashes.",
        products: ["purple eyeshadow", "black liquid eyeliner", "false lashes"],
        render: makeup(
          shadow("2colors164", matte("#3A1A3A", 90), matte("#7A3A9A", 90)),
          liner("OpenWings3", matte(BLACK, 92)),
          lashes("Winged1", BLACK, 92)
        ),
      },
      {
        title: "Dramatic brows",
        howTo: "Draw high, sharply arched black brows.",
        products: ["black brow pencil"],
        render: makeup(
          brows(BLACK, 90, {
            name: "HighArch4",
            curvature: 50,
            thickness: 10,
            definition: 90,
          })
        ),
      },
      {
        title: "Deep red lips",
        howTo: "Wear a deep red lipstick, lined into a full cupid's bow.",
        products: ["deep red lipstick", "red lip liner"],
        render: makeup(
          lips(satin("#8A0E1E", 92), "m-shaped"),
          lipLine("Large&Full1", "#5A0A14", 90, 55, 70)
        ),
      },
      {
        title: "Black curls",
        howTo: "Finish with short, glossy black curls.",
        products: ["black curly wig"],
        render: hair("#121212", 92, 45),
      },
    ],
    finish: "Pearls, a corset and a lot of attitude.",
  },
  "annie-wilkes": {
    look: "An Annie Wilkes face: plain and no-nonsense, a matte base, a hint of shadow, small tired eyes, plain brows, muted rose lips and a brown bob.",
    steps: [
      {
        title: "Plain base",
        howTo: "Pat on a matte foundation your own shade.",
        products: ["matte foundation"],
        render: makeup(paler(0, 75)),
      },
      {
        title: "A hint of shadow",
        howTo:
          "Shade softly under the eyes and at the temples with a soft brown, and a little warmth on the cheeks.",
        products: ["soft brown eyeshadow", "rose blush"],
        render: makeup(
          shading("Bronzer2", "#8A6E62", 90),
          blush("Round2", "#C88078", 82)
        ),
      },
      {
        title: "Small tired eyes",
        howTo:
          "Shade close around the eyes with a soft taupe and line the lashes thinly in brown.",
        products: ["taupe eyeshadow", "brown eyeliner"],
        render: makeup(
          shadow("1color23", matte("#8A7068", 90)),
          liner("Lower11", matte("#4A3428", 90))
        ),
      },
      {
        title: "Plain brows, rose lips",
        howTo: "Brush the brows into place, and wear a muted rose lipstick.",
        products: ["clear brow gel", "muted rose lipstick"],
        render: makeup(brows("#5A4030", 85), lips(satin("#A86E6E", 92))),
      },
      {
        title: "Brown bob",
        howTo: "Finish with a plain brown bob with bangs.",
        products: ["brown bob wig"],
        render: hair("#5A4030", 90, 25),
      },
    ],
    finish: "A cardigan and a small silver cross.",
  },
  "patrick-bateman": {
    look: "A Patrick Bateman face after the morning routine: poreless glowing skin, a chiseled jaw, a cold stare, groomed brows, nude lips and slicked-back hair.",
    steps: [
      {
        title: "Poreless skin",
        howTo:
          "Smooth on a primer and a light foundation your own shade, then a dab of highlighter on the cheekbones.",
        products: ["face primer", "light foundation", "highlighter"],
        render: makeup(smooth(80), paler(0, 75, 40), glow("#F0D8C8", 70)),
      },
      {
        title: "Chiseled contour",
        howTo:
          "Shade under the cheekbones and along the jaw with a cool brown, sharp and clean.",
        products: ["contour powder"],
        render: makeup(contour("#8A6A5E", 90, "OvalFace6")),
      },
      {
        title: "Cold stare",
        howTo:
          "Shade the lids lightly with a taupe and line the upper lashes thinly in dark brown.",
        products: ["taupe eyeshadow", "dark brown eyeliner"],
        render: makeup(
          shadow("1color8", matte("#8A7068", 90)),
          liner("Lower11", matte("#2E2420", 90))
        ),
      },
      {
        title: "Groomed brows, nude lips",
        howTo:
          "Comb the brows neat with a clear gel, and wear a nude lip balm.",
        products: ["clear brow gel", "nude lip balm"],
        render: makeup(
          brows("#3A2A20", 85, { name: "Straight2", definition: 90 }),
          lips(satin("#B88A80", 92))
        ),
      },
      {
        title: "Slicked-back hair",
        howTo: "Finish with dark hair slicked straight back.",
        products: ["hair gel"],
        render: hair("#2E2018", 90, 50),
      },
    ],
    finish: "A sharp suit, and a business card in your breast pocket.",
  },
  tarman: {
    look: "A Tarman face: a tar-gray base, black tar creeping in from the edges, ochre on the cheekbones, sunken black eyes and black lips.",
    steps: [
      {
        title: "Tar-gray paint",
        howTo:
          "Cover the face and brows with a dark gray-brown cream face paint.",
        products: ["brown cream face paint"],
        render: makeup(facePaint("#6E6252", 90), brows("#6E6252", 90)),
      },
      {
        title: "Creeping tar",
        howTo:
          "Press black eyeshadow in from the edges of the face, the temples and the jaw, then dab ochre on the cheekbones.",
        products: ["black eyeshadow", "ochre eyeshadow"],
        render: makeup(
          shading("Bronzer3", "#1A1612", 92),
          contour("#A87A2A", 90, "OvalFace6")
        ),
      },
      {
        title: "Sunken black eyes",
        howTo:
          "Pack black eyeshadow all around the eyes and smudge black kohl all around.",
        products: ["black eyeshadow", "black kohl eyeliner"],
        render: makeup(
          shadow("1color30", matte(BLACK, 92)),
          liner("PandaSmudge11", matte(BLACK, 90))
        ),
      },
      {
        title: "Black lips",
        howTo: "Paint the lips black, glossed so they look wet.",
        products: ["black lipstick", "clear lip gloss"],
        render: makeup(lips(gloss("#1A1612", 92))),
      },
    ],
    finish:
      "Dab clear lip gloss over the dark patches so they look wet and sticky.",
  },
  "the-zombie": {
    look: "A 1968 zombie face: an ashen gray-green tint, sunken gray hollows, bruised dead eyes, faded brows and gray lips.",
    steps: [
      {
        title: "Ashen gray paint",
        howTo:
          "Cover the face, brows and lips with an ashen gray-green cream face paint.",
        products: ["gray cream face paint"],
        render: makeup(facePaint("#A4A898", 90), brows("#A4A898", 90)),
      },
      {
        title: "Sunken hollows",
        howTo:
          "Shade under the eyes, the temples, the cheek hollows and the jaw with a dark gray.",
        products: ["dark gray eyeshadow"],
        render: makeup(
          shading("Bronzer2", "#4A4C46", 90),
          contour("#5A5C54", 90, "TriangleFace5")
        ),
      },
      {
        title: "Dead eyes",
        howTo:
          "Smudge a dark gray-purple all around the eyes and line them in dark gray.",
        products: ["gray purple eyeshadow", "dark gray eyeliner"],
        render: makeup(
          shadow("1color30", matte("#3A3440", 90)),
          liner("FullRim7", matte("#2A2A2A", 90))
        ),
      },
      {
        title: "Gray lips",
        howTo: "Cover the lips with a gray lipstick and blot it.",
        products: ["gray lipstick"],
        render: makeup(lips(matte("#7A7A76", 92))),
      },
      {
        title: "Blood",
        howTo: "Let a trickle of fake blood run from the corner of the mouth.",
        products: ["fake blood"],
        render: paint(
          line(
            { at: "mouthCorner", dx: 0.03 },
            { at: "mouthCorner", dx: -0.02, dy: 0.55 },
            "#6E0A10",
            { width: 0.04 }
          ),
          dot({ at: "mouthCorner", dx: -0.02, dy: 0.57 }, 0.035, "#6E0A10")
        ),
      },
    ],
    finish: "Some dirt on torn clothes.",
  },
  "the-lipstick-face-demon": {
    look: "A Lipstick-Face Demon face: a blood-red tint, black-red shadows, black around the eyes, heavy black brows, black lips and black hair.",
    steps: [
      {
        title: "Red face paint",
        howTo: "Cover the face with a blood-red cream face paint.",
        products: ["red cream face paint"],
        render: makeup(facePaint("#B8201E", 95)),
      },
      {
        title: "Demon shadows",
        howTo:
          "Shade the temples, the cheek hollows and the jaw with a black-red eyeshadow, and press red blush high on the cheeks.",
        products: ["black red eyeshadow", "red blush"],
        render: makeup(
          shading("Bronzer5", "#3A0A0E", 90),
          blush("Oblique2", "#C81E24", 85)
        ),
      },
      {
        title: "Black eyes",
        howTo:
          "Pack black eyeshadow all around the eyes and smudge black kohl all around.",
        products: ["black eyeshadow", "black kohl eyeliner"],
        render: makeup(
          shadow("1color30", matte(BLACK, 92)),
          liner("PandaSmudge11", matte(BLACK, 90))
        ),
      },
      {
        title: "Heavy black brows",
        howTo: "Draw heavy, angled black brows.",
        products: ["black brow pencil"],
        render: makeup(
          brows(BLACK, 92, { name: "Arrow13", thickness: 40, definition: 85 })
        ),
      },
      {
        title: "Black lips",
        howTo: "Paint the lips matte black.",
        products: ["black lipstick"],
        render: makeup(lips(matte("#141010", 92))),
      },
      {
        title: "Black claws",
        howTo:
          "With a black cream paint, draw flame shapes up from the jaw onto the cheeks.",
        products: ["black cream face paint"],
        render: paint(
          line(
            { at: "mouthCorner", dx: -0.42, dy: 0.5 },
            { at: "eye", dx: -0.3, dy: 0.42 },
            BLACK,
            { width: 0.07, via: { at: "eye", dx: -0.2, dy: 0.9 }, mirror: true }
          ),
          line(
            { at: "mouthCorner", dx: -0.15, dy: 0.55 },
            { at: "eye", dx: 0.0, dy: 0.62 },
            BLACK,
            {
              width: 0.06,
              via: { at: "eye", dx: 0.05, dy: 1.05 },
              mirror: true,
            }
          )
        ),
      },
      {
        title: "Black hair",
        howTo: "Finish with long black hair.",
        products: ["long black wig"],
        render: hair("#111111", 92, 25),
      },
    ],
    finish: "Black clothes and long black nails.",
  },
  "eric-draven": {
    look: "An Eric Draven face from The Crow: white skin, gray hollows, black smudged eyes, black brows, black lips and black hair.",
    steps: [
      {
        title: "White face paint",
        howTo:
          "Cover the whole face and lips with white cream face paint, then press white powder over it so it sets.",
        products: ["white cream face paint", "white setting powder"],
        render: makeup(facePaint("#FFFFFF")),
      },
      {
        title: "Gray hollows",
        howTo: "Shade the temples and the cheek hollows with a gray eyeshadow.",
        products: ["gray eyeshadow"],
        render: makeup(contour("#6A6866", 90, "TriangleFace5")),
      },
      {
        title: "Black eyes",
        howTo:
          "Pack black eyeshadow all around the eyes and smudge black kohl all around.",
        products: ["black eyeshadow", "black kohl eyeliner"],
        render: makeup(
          shadow("1color30", matte(BLACK, 92)),
          liner("PandaSmudge11", matte(BLACK, 90))
        ),
      },
      {
        title: "Black brows",
        howTo: "Darken the brows with black.",
        products: ["black brow pencil"],
        render: makeup(brows(BLACK, 85, { name: "Straight2", thickness: 15 })),
      },
      {
        title: "Black lips",
        howTo: "Paint the lips black, kept to the lip line.",
        products: ["black lipstick"],
        render: makeup(lips(matte("#141414", 92))),
      },
      {
        title: "Crow lines",
        howTo:
          "With a black liquid eyeliner, draw a line straight up and down through each eye, and one out from each corner of the mouth.",
        products: ["black liquid eyeliner"],
        render: paint(
          line({ at: "eye", dy: -0.8 }, { at: "eye", dy: 0.65 }, BLACK, {
            width: 0.035,
            mirror: true,
          }),
          line(
            { at: "mouthCorner" },
            { at: "mouthCorner", dx: -0.32, dy: -0.12 },
            BLACK,
            { width: 0.035, mirror: true }
          )
        ),
      },
      {
        title: "Black hair",
        howTo: "Finish with long, wet-look black hair.",
        products: ["long black wig"],
        render: hair("#0F0F0F", 92, 45),
      },
    ],
    finish: "A long black coat, black gloves and a crow on your shoulder.",
  },
  "pamela-voorhees": {
    look: "A Pamela Voorhees face: plain 1980 makeup, a soft natural base, soft blue lids, light brows, coral cheeks and lips, and short light-brown hair.",
    steps: [
      {
        title: "Natural base",
        howTo: "Pat on a light foundation your own shade.",
        products: ["light foundation"],
        render: makeup(paler(0, 72)),
      },
      {
        title: "Soft blue lids",
        howTo: "Sweep a soft powder blue over the lids and add mascara.",
        products: ["powder blue eyeshadow", "mascara"],
        render: makeup(
          shadow("1color67", matte("#8AAAD0", 90)),
          liner("Lower11", matte("#4A3A30", 90)),
          lashes("Natural1", "#2A1E18", 90)
        ),
      },
      {
        title: "Coral cheeks",
        howTo: "Sweep a coral blush along the cheekbones.",
        products: ["coral blush"],
        render: makeup(blush("Oblique2", "#E08A6A", 82)),
      },
      {
        title: "Brows and coral lips",
        howTo: "Brush the brows into place, and wear a coral lipstick.",
        products: ["clear brow gel", "coral lipstick"],
        render: makeup(brows("#8A6A48", 85), lips(satin("#D8705A", 92))),
      },
      {
        title: "Short hair",
        howTo: "Finish with short light-brown hair, pulled back.",
        products: ["short light brown wig"],
        render: hair("#8A6A48", 90, 30),
      },
    ],
    finish: "Pull the hair back and wear a cardigan.",
  },
  "the-invisible-man": {
    look: "An Invisible Man face, fading out: washed-out white skin, gray edges, dark goggle-like eyes, faded brows and colorless lips, before the bandages.",
    steps: [
      {
        title: "Fading white face",
        howTo:
          "Cover the whole face, brows and lips with white cream face paint, then press white powder over it so it sets.",
        products: ["white cream face paint", "white setting powder"],
        render: makeup(facePaint("#F4F4F4"), brows("#E8E4E0", 90)),
      },
      {
        title: "Gray edges",
        howTo:
          "Shade the edges of the face and the sides of the nose with a soft gray, as if the face fades into the air.",
        products: ["soft gray eyeshadow"],
        render: makeup(shading("Bronzer3", "#8A8A8C", 90)),
      },
      {
        title: "Goggle eyes",
        howTo:
          "Pack a dark gray in round shapes all around the eyes and line them all around in black.",
        products: ["dark gray eyeshadow", "black kohl eyeliner"],
        render: makeup(
          shadow("1color30", matte("#2A2A2E", 92)),
          liner("FullRim7", matte(BLACK, 90))
        ),
      },
      {
        title: "Colorless lips",
        howTo: "Cover the lips with the base and a pale gray-nude lipstick.",
        products: ["pale nude lipstick"],
        render: makeup(lips(matte("#C8BCB8", 92))),
      },
    ],
    finish:
      "Wrap white gauze loosely around your head, and add round dark sunglasses and a hat.",
  },
  "sweeney-todd": {
    look: "A Sweeney Todd face: ghostly pale skin, gaunt gray hollows, heavy red-rimmed dark circles, dark brows, dark lips and black hair with a white streak.",
    steps: [
      {
        title: "Ghostly pale base",
        howTo:
          "Pat on a foundation four shades lighter than your skin and set it with white powder.",
        products: ["very light foundation", "white setting powder"],
        render: makeup(paler(4, 92)),
      },
      {
        title: "Gaunt hollows",
        howTo:
          "Shade from the cheekbones to the jaw and at the temples with a gray-brown.",
        products: ["gray brown eyeshadow"],
        render: makeup(contour("#5E5452", 90, "TriangleFace5")),
      },
      {
        title: "Haunted eyes",
        howTo:
          "Smudge a dark purple-brown all around the eyes, deepest underneath, and line the waterlines in dark red.",
        products: ["dark purple eyeshadow", "dark red eyeliner"],
        render: makeup(
          shadow("1color30", matte("#3A2228", 90)),
          liner("FullRim7", matte("#6A1A22", 90))
        ),
      },
      {
        title: "Dark brows",
        howTo: "Darken the brows heavy and low.",
        products: ["black brow pencil"],
        render: makeup(
          brows("#141212", 88, { name: "Straight2", thickness: 30 })
        ),
      },
      {
        title: "Dark lips",
        howTo: "Wear a dark gray-brown lipstick.",
        products: ["dark brown lipstick"],
        render: makeup(lips(matte("#4A3836", 92))),
      },
      {
        title: "Black hair",
        howTo: "Finish with wild black hair.",
        products: ["black wig"],
        render: hair("#151515", 92, 25),
      },
    ],
    finish:
      "Spray a white streak into the front of your hair with white hair color spray.",
  },
  "lestat-de-lioncourt": {
    look: "A Lestat face: luminous pale skin, sculpted cheekbones, soft shadowed eyes, blond brows, pale mauve lips and golden-blond hair.",
    steps: [
      {
        title: "Luminous skin",
        howTo:
          "Pat on a foundation three shades lighter than your skin and add a pearly highlighter on the cheekbones.",
        products: ["light foundation", "pearl highlighter"],
        render: makeup(paler(3, 88, 40), glow("#F4EEF0", 70)),
      },
      {
        title: "Sculpted cheekbones",
        howTo:
          "Shade under the cheekbones and at the temples with a soft cool taupe.",
        products: ["cool taupe contour powder"],
        render: makeup(contour("#9A8682", 90)),
      },
      {
        title: "Shadowed eyes",
        howTo:
          "Shade the lids and under the eyes with a soft mauve-gray and line the lashes thinly in brown.",
        products: ["mauve gray eyeshadow", "brown eyeliner"],
        render: makeup(
          shadow("2colors25", matte("#9A8290", 90), matte("#7A6670", 90)),
          liner("Lower11", matte("#5A4438", 90))
        ),
      },
      {
        title: "Blond brows",
        howTo: "Lighten the brows with a blond gel.",
        products: ["blonde brow gel"],
        render: makeup(brows("#C8A870", 85)),
      },
      {
        title: "Mauve lips",
        howTo: "Wear a pale mauve lipstick.",
        products: ["pale mauve lipstick"],
        render: makeup(lips(satin("#B8909A", 92))),
      },
      {
        title: "Blue veins",
        howTo: "Draw faint blue veins at the temples with a blue eyeliner.",
        products: ["blue eyeliner"],
        render: paint(
          line(
            { at: "eye", dx: -0.55, dy: -0.55 },
            { at: "eye", dx: -0.58, dy: 0.05 },
            "#5A6A9A",
            {
              width: 0.014,
              via: { at: "eye", dx: -0.7, dy: -0.25 },
              mirror: true,
            }
          )
        ),
      },
      {
        title: "Golden hair",
        howTo: "Finish with long, wavy golden-blond hair.",
        products: ["long golden blonde wig"],
        render: hair("#D8B66E", 90, 40),
      },
    ],
    finish: "Plastic fangs and a frilled shirt.",
  },
  "georgie-denbrough": {
    look: "A Georgie face after the storm drain: a cold blue-gray tint, drowned shadows, bruised yellow and purple eyes, faded brows and bluish lips.",
    steps: [
      {
        title: "Drowned blue paint",
        howTo:
          "Cover the face, brows and lips with a cold blue-gray cream face paint.",
        products: ["blue gray cream face paint"],
        render: makeup(facePaint("#A8B0BA", 88), brows("#A8B0BA", 90)),
      },
      {
        title: "Drowned shadows",
        howTo:
          "Shade under the eyes, the temples and the cheek hollows with a dark blue-gray.",
        products: ["blue gray eyeshadow"],
        render: makeup(
          shading("Bronzer2", "#4E5A6A", 90),
          contour("#5E6A78", 90, "TriangleFace5")
        ),
      },
      {
        title: "Bruised eyes",
        howTo:
          "Smudge purple over the lids and a sickly yellow under the eyes, and line them in dark purple.",
        products: ["purple eyeshadow", "yellow eyeshadow", "purple eyeliner"],
        render: makeup(
          shadow("2colors25", matte("#5A3A6A", 90), matte("#B0A040", 90)),
          liner("FullRim7", matte("#3A2240", 90))
        ),
      },
      {
        title: "Bluish lips",
        howTo: "Blot a blue-gray lipstick over the lips.",
        products: ["blue gray lipstick"],
        render: makeup(lips(matte("#6A7A90", 92))),
      },
    ],
    finish: "Wet your hair, wear a yellow raincoat and carry a paper boat.",
  },
  "the-leprechaun": {
    look: "A Leprechaun face: a ruddy weathered base, deep wrinkle shadows, green lids, thick ginger brows, red cheeks, a muddy red mouth and ginger hair.",
    steps: [
      {
        title: "Ruddy base",
        howTo:
          "Mix a little red cream color into your foundation and pat it over the face, heavier on the nose and cheeks.",
        products: ["foundation", "red cream color"],
        render: makeup(tint("#C88068", 75)),
      },
      {
        title: "Weathered shadows",
        howTo:
          "Shade the temples, under the eyes and the cheek hollows with a brown eyeshadow, and dab red blush on the cheeks.",
        products: ["brown eyeshadow", "red blush"],
        render: makeup(
          shading("Bronzer2", "#5A3A28", 90),
          blush("Round2", "#C83A30", 82)
        ),
      },
      {
        title: "Green lids",
        howTo:
          "Sweep a moss-green eyeshadow over the lids and line the eyes in dark brown.",
        products: ["moss green eyeshadow", "dark brown eyeliner"],
        render: makeup(
          shadow("1color57", matte("#4A7A3A", 90)),
          liner("FullRim7", matte("#3A2418", 90))
        ),
      },
      {
        title: "Thick ginger brows",
        howTo: "Thicken the brows with a ginger pencil, bushy and wild.",
        products: ["ginger brow pencil"],
        render: makeup(
          brows("#B5541C", 88, {
            name: "Original5",
            thickness: 40,
            definition: 30,
          })
        ),
      },
      {
        title: "Muddy red mouth",
        howTo: "Wear a muddy brick-red lipstick.",
        products: ["brick red lipstick"],
        render: makeup(lips(matte("#8A3A30", 92))),
      },
      {
        title: "Ginger hair",
        howTo: "Finish with wild ginger hair.",
        products: ["ginger wig"],
        render: hair("#B5541C", 90, 20),
      },
    ],
    finish: "A fake red beard, the green hat and a few chocolate gold coins.",
  },
  "mr-boogie-bughuul": {
    look: "A Bughuul face: bone-white skin, smeared black hollows, dark eyes, no brows, black lips and long black hair.",
    steps: [
      {
        title: "Bone-white face",
        howTo:
          "Cover the whole face, brows and lips with white cream face paint, then press white powder over it so it sets.",
        products: ["white cream face paint", "white setting powder"],
        render: makeup(facePaint("#F4F2EE"), brows("#E8E4E0", 90)),
      },
      {
        title: "Smeared hollows",
        howTo:
          "Smear black-gray eyeshadow into the temples, the cheek hollows and the jaw, so the face looks melted.",
        products: ["black gray eyeshadow"],
        render: makeup(
          shading("Bronzer5", "#2E2C2C", 90),
          contour("#3E3C3C", 90, "TriangleFace5")
        ),
      },
      {
        title: "Dark eyes",
        howTo:
          "Pack black eyeshadow all around the eyes, wide and smeared, and smudge black kohl all around.",
        products: ["black eyeshadow", "black kohl eyeliner"],
        render: makeup(
          shadow("1color30", matte(BLACK, 92)),
          liner("PandaSmudge11", matte(BLACK, 90))
        ),
      },
      {
        title: "Black lips",
        howTo: "Paint the lips black, smudged a little past the edges.",
        products: ["black lipstick"],
        render: makeup(
          lips(matte("#141414", 92), "plump"),
          lipLine("Wider1", BLACK, 90, 55, 25)
        ),
      },
      {
        title: "Long black hair",
        howTo: "Finish with long black hair.",
        products: ["long black wig"],
        render: hair("#111111", 92, 25),
      },
    ],
    finish: "A long black coat.",
  },
  "ellen-ripley": {
    look: "A Ripley face on the Nostromo: clean, tired skin, long-shift shadows, unfussy eyes, natural brows, bare lips and dark curly hair.",
    steps: [
      {
        title: "Clean base",
        howTo: "Pat on a light foundation your own shade, sheer.",
        products: ["light foundation"],
        render: makeup(paler(0, 68)),
      },
      {
        title: "Long-shift shadows",
        howTo:
          "Shade softly under the eyes and in the cheek hollows with a cool brown, as after a long shift.",
        products: ["cool brown eyeshadow"],
        render: makeup(shading("Bronzer2", "#7A6458", 90)),
      },
      {
        title: "Unfussy eyes",
        howTo:
          "Smudge a brown pencil along the upper lashes and add a little mascara.",
        products: ["brown eyeliner", "mascara"],
        render: makeup(
          liner("Lower11", matte("#3A2A20", 90)),
          lashes("Natural1", "#2A1E18", 90)
        ),
      },
      {
        title: "Brows and bare lips",
        howTo: "Brush the brows up, and wear a bare nude lip balm.",
        products: ["clear brow gel", "nude lip balm"],
        render: makeup(
          brows("#3A281C", 85, { name: "Original5" }),
          lips(satin("#B88A82", 92))
        ),
      },
      {
        title: "Curly hair",
        howTo: "Finish with dark, curly shoulder-length hair.",
        products: ["dark curly wig"],
        render: hair("#3A281C", 90, 25),
      },
    ],
    finish: "An olive flight suit and a cat carrier.",
  },
  slappy: {
    look: "A Slappy face: a glossy dummy finish, painted wood shading, shaded lids with lashes, thick arched black brows, rosy cheeks, a red grin and slick black hair.",
    steps: [
      {
        title: "Dummy base",
        howTo:
          "Pat on a foundation a shade lighter than your skin and buff it to a smooth, painted finish.",
        products: ["light foundation"],
        render: makeup(smooth(65), paler(1, 92, 30)),
      },
      {
        title: "Painted shading",
        howTo:
          "Shade the edges of the face and the nose with a warm brown, like painted wood, and dab rosy cheeks.",
        products: ["warm brown eyeshadow", "rose blush"],
        render: makeup(
          shading("Bronzer3", "#8A5A3A", 90),
          blush("Circle2", "#D8605A", 82)
        ),
      },
      {
        title: "Dummy eyes",
        howTo:
          "Shade the lids with a soft brown, line the upper lashes in black, and add lashes.",
        products: ["soft brown eyeshadow", "black eyeliner", "false lashes"],
        render: makeup(
          shadow("1color67", matte("#8A6450", 90)),
          liner("Lower11", matte(BLACK, 90)),
          lashes("UpperDense1", BLACK, 90)
        ),
      },
      {
        title: "Thick arched brows",
        howTo: "Draw thick, high-arched black brows.",
        products: ["black brow pencil"],
        render: makeup(
          brows(BLACK, 92, {
            name: "HighArch4",
            curvature: 50,
            thickness: 35,
            definition: 90,
          })
        ),
      },
      {
        title: "Red grin",
        howTo: "Paint a red mouth, lined into a wide grin.",
        products: ["red lipstick", "red lip liner"],
        render: makeup(
          lips(matte("#B82028", 92), "smile"),
          lipLine("Wider1", "#8A141C", 90, 55, 60)
        ),
      },
      {
        title: "Dummy lines",
        howTo:
          "Draw a black line from each corner of the mouth down to the chin.",
        products: ["black eyeliner"],
        render: paint(
          line(
            { at: "mouthCorner" },
            { at: "mouthCorner", dx: 0.04, dy: 0.55 },
            BLACK,
            { width: 0.03, mirror: true }
          )
        ),
      },
      {
        title: "Slick black hair",
        howTo: "Finish with black hair slicked flat with a side part.",
        products: ["black hair color spray", "hair gel"],
        render: hair("#121212", 92, 55),
      },
    ],
    finish: "A gray suit and a bow tie, and a stiff, jerky walk.",
  },
  "john-carver": {
    look: "A John Carver face in the pilgrim mask's colors: a warm orange tint, carved brown shadows, dark eyes, flat dark brows and small pursed lips.",
    steps: [
      {
        title: "Orange paint",
        howTo:
          "Cover the face with an orange cream face paint, like the pilgrim mask.",
        products: ["orange cream face paint"],
        render: makeup(facePaint("#D8955A", 92)),
      },
      {
        title: "Carved shadows",
        howTo:
          "Shade the edges of the face, the cheek hollows and the nose with a deep brown, like a carved mask.",
        products: ["deep brown eyeshadow"],
        render: makeup(shading("Bronzer3", "#5A3418", 90)),
      },
      {
        title: "Dark eyes",
        howTo:
          "Pack a dark brown-black all around the eyes, like the mask's eyeholes, and line them in black.",
        products: ["dark brown eyeshadow", "black kohl eyeliner"],
        render: makeup(
          shadow("1color30", matte("#2A1A10", 90)),
          liner("FullRim7", matte(BLACK, 90))
        ),
      },
      {
        title: "Flat brows",
        howTo: "Draw flat, straight dark-brown brows.",
        products: ["dark brown brow pencil"],
        render: makeup(
          brows("#3A2414", 85, { name: "Straight2", thickness: 25 })
        ),
      },
      {
        title: "Pursed lips",
        howTo:
          "Cover the edges of the lips with the base and paint a small, pursed brown-red mouth.",
        products: ["brown red lipstick", "lip liner"],
        render: makeup(
          lips(matte("#7A3A28", 92), "pouty"),
          lipLine("Small1", "#5A2818", 90, 50, 60)
        ),
      },
    ],
    finish: "A pilgrim hat and a black jumpsuit.",
  },
  blade: {
    look: "A Blade face: a matte even base, sharply sculpted cheekbones and jaw, a hard stare, clean defined brows and dark nude lips behind the shades.",
    steps: [
      {
        title: "Matte base",
        howTo: "Pat on a matte foundation your own shade and powder it.",
        products: ["matte foundation", "setting powder"],
        render: makeup(paler(0, 78)),
      },
      {
        title: "Sculpted skin",
        howTo:
          "Shade under the cheekbones, the jaw and the sides of the nose with a deep contour, sharp and clean.",
        products: ["deep contour powder"],
        render: makeup(contour("#3A2418", 90, "OvalFace6")),
      },
      {
        title: "Hard stare",
        howTo:
          "Shade close around the eyes with a deep brown and line the upper lashes in black.",
        products: ["deep brown eyeshadow", "black eyeliner"],
        render: makeup(
          shadow("1color23", matte("#2E1E14", 90)),
          liner("Lower11", matte(BLACK, 90))
        ),
      },
      {
        title: "Sharp brows",
        howTo: "Groom the brows into clean, sharp lines.",
        products: ["dark brow pencil", "clear brow gel"],
        render: makeup(
          brows("#140E0A", 85, { name: "Arrow13", definition: 90 })
        ),
      },
      {
        title: "Dark nude lips",
        howTo: "Wear a matte dark nude lip balm.",
        products: ["dark nude lip balm"],
        render: makeup(lips(matte("#6A4434", 92))),
      },
    ],
    finish: "Narrow black sunglasses and a long black coat.",
  },
  "danny-torrance": {
    look: "A Danny Torrance face: pale, scared and sleepless, gray hollows, dark circles, wide eyes, soft brows, pale lips and a brown 70s shag.",
    steps: [
      {
        title: "Scared pallor",
        howTo:
          "Pat on a foundation two shades lighter than your skin over the face and lips.",
        products: ["light foundation"],
        render: makeup(paler(2, 88)),
      },
      {
        title: "Sleepless hollows",
        howTo:
          "Shade under the eyes and at the temples with a cool gray-purple.",
        products: ["gray purple eyeshadow"],
        render: makeup(shading("Bronzer2", "#6A5E6A", 90)),
      },
      {
        title: "Wide eyes",
        howTo:
          "Smudge a gray-brown close around the eyes and add a little mascara top and bottom.",
        products: ["gray brown eyeshadow", "mascara"],
        render: makeup(
          shadow("1color23", matte("#6A5A58", 90)),
          lashes("Upper&Lower1", "#3A2A20", 90)
        ),
      },
      {
        title: "Soft brows, pale lips",
        howTo:
          "Brush the brows with a light brown gel, and blot a pale nude lip balm.",
        products: ["light brown brow gel", "pale nude lip balm"],
        render: makeup(brows("#7A5A40", 85), lips(matte("#B89C94", 92))),
      },
      {
        title: "Brown shag",
        howTo: "Finish with a brown 70s shag haircut.",
        products: ["brown shag wig"],
        render: hair("#6A4A2E", 90, 25),
      },
    ],
    finish: "A red rocket sweater, and a raised finger: 'Redrum.'",
  },
  "sidney-prescott": {
    look: "A Sidney Prescott face from '96: a fresh 90s base, a soft brown contour, brown-lined eyes with mascara, groomed brows, a peachy-brown lip and dark-brown hair.",
    steps: [
      {
        title: "90s base",
        howTo: "Pat on a matte foundation your own shade.",
        products: ["matte foundation"],
        render: makeup(paler(0, 72)),
      },
      {
        title: "Soft contour",
        howTo:
          "Shade softly under the cheekbones with a brown powder, the 90s way.",
        products: ["brown contour powder"],
        render: makeup(contour("#8A6050", 90)),
      },
      {
        title: "Brown-lined eyes",
        howTo:
          "Wash a soft brown over the lids, line the eyes in brown pencil, and add mascara.",
        products: ["soft brown eyeshadow", "brown eyeliner", "mascara"],
        render: makeup(
          shadow("1color57", matte("#8A6858", 90)),
          liner("FullRim7", matte("#4A3020", 90)),
          lashes("Natural1", "#1E1410", 90)
        ),
      },
      {
        title: "Brows and lips",
        howTo:
          "Groom the brows thin, and wear a peachy-brown lipstick with a brown liner.",
        products: ["brow pencil", "peach brown lipstick", "brown lip liner"],
        render: makeup(
          brows("#3A2418", 85, { name: "SoftArch1", thickness: -10 }),
          lips(satin("#A8685A", 92)),
          lipLine("Natural1", "#7A4436", 90, 50, 70)
        ),
      },
      {
        title: "Dark-brown hair",
        howTo: "Finish with dark-brown hair, straight with a middle part.",
        products: ["dark brown wig"],
        render: hair("#2E2018", 90, 35),
      },
    ],
    finish: "A denim jacket and a cordless phone.",
  },
  "ellen-hutter": {
    look: "An Ellen Hutter face: feverish pallor, gray-shaded cheeks, hollow taupe-brown eyes rimmed in red, faint brows, muted brown lips and brown hair.",
    steps: [
      {
        title: "Feverish pallor",
        howTo:
          "Pat on a foundation three shades lighter than your skin, with a little sheen.",
        products: ["light foundation"],
        render: makeup(paler(3, 88, 30)),
      },
      {
        title: "Gray-shaded cheeks",
        howTo:
          "Shade the cheek hollows, the temples and under the eyes with a cool gray.",
        products: ["cool gray eyeshadow"],
        render: makeup(
          shading("Bronzer2", "#6E6866", 90),
          contour("#7E7674", 90, "TriangleFace5")
        ),
      },
      {
        title: "Hollow eyes",
        howTo:
          "Smudge a taupe-brown all around the eyes and line the waterlines in a dull red.",
        products: ["taupe brown eyeshadow", "red eyeliner"],
        render: makeup(
          shadow("1color30", matte("#6A5450", 90)),
          liner("FullRim7", matte("#8A3A3A", 90))
        ),
      },
      {
        title: "Faint brows, muted lips",
        howTo:
          "Soften the brows with a light concealer, and blot a muted brown lipstick.",
        products: ["brow concealer", "muted brown lipstick"],
        render: makeup(brows("#9A8270", 85), lips(matte("#8A6A62", 92))),
      },
      {
        title: "Brown hair",
        howTo: "Finish with long brown hair, braided up.",
        products: ["long brown wig"],
        render: hair("#5A4030", 90, 25),
      },
    ],
    finish:
      "Braid the hair into a rope updo and wear a white nightgown; a dab of lip oil on the skin reads as fever.",
  },
  "billy-chapman-killer-santa": {
    look: "A Killer Santa face: pale and cold, gray hollows, red-rimmed eyes, rosy red cheeks, white brows, cold red lips and snow-white hair.",
    steps: [
      {
        title: "Cold pale base",
        howTo:
          "Pat on a foundation three shades lighter than your skin and powder it.",
        products: ["light foundation"],
        render: makeup(paler(3, 90)),
      },
      {
        title: "Cold hollows, red cheeks",
        howTo:
          "Shade under the eyes and at the temples with a cool gray, then blend a bright red blush on the cheeks.",
        products: ["cool gray eyeshadow", "red blush"],
        render: makeup(
          shading("Bronzer2", "#6A6A70", 90),
          blush("Round2", "#D0303A", 85)
        ),
      },
      {
        title: "Red-rimmed eyes",
        howTo:
          "Smudge a red-brown close around the eyes and line the waterlines in red.",
        products: ["red brown eyeshadow", "red eyeliner"],
        render: makeup(
          shadow("1color23", matte("#8A3A3A", 90)),
          liner("FullRim7", matte("#B0202A", 90))
        ),
      },
      {
        title: "White brows, red lips",
        howTo:
          "Brush white mascara through the brows, and wear a cold red lipstick.",
        products: ["white mascara", "red lipstick"],
        render: makeup(brows("#F0EEE8", 85), lips(matte("#A82030", 92))),
      },
      {
        title: "White hair",
        howTo: "Finish with snow-white hair.",
        products: ["white hair color spray"],
        render: hair("#F0EEE8", 90, 25),
      },
    ],
    finish:
      "A Santa suit and beard, with a little fake blood on the white fur trim.",
  },
  alice: {
    look: "An Alice face from Resident Evil: a natural even base, a soft contour, soft brown eyes, natural brows, a peachy-nude lip and choppy blonde hair.",
    steps: [
      {
        title: "Natural base",
        howTo: "Pat on a light foundation your own shade.",
        products: ["light foundation"],
        render: makeup(paler(0, 70)),
      },
      {
        title: "Soft contour",
        howTo: "Shade softly under the cheekbones with a soft brown.",
        products: ["soft contour powder"],
        render: makeup(contour("#9A7462", 90)),
      },
      {
        title: "Soft brown eyes",
        howTo:
          "Wash a soft brown over the lids, smudge brown pencil along the lashes, and add mascara.",
        products: ["soft brown eyeshadow", "brown eyeliner", "mascara"],
        render: makeup(
          shadow("1color57", matte("#9A7462", 90)),
          liner("Lower11", matte("#4A3020", 90)),
          lashes("Natural1", "#2A1E18", 90)
        ),
      },
      {
        title: "Brows and lips",
        howTo: "Brush the brows into place, and wear a peachy-nude lipstick.",
        products: ["clear brow gel", "peach nude lipstick"],
        render: makeup(brows("#8A6A48", 85), lips(satin("#C88A78", 92))),
      },
      {
        title: "Blonde hair",
        howTo: "Finish with choppy, shoulder-length blonde hair.",
        products: ["blonde wig"],
        render: hair("#C2A06A", 90, 30),
      },
    ],
    finish: "A red dress and boots, scuffed with a little dirt.",
  },
}
