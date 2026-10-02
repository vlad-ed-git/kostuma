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
  tint,
} from "@/lib/makeup"

const BLACK: Hex = "#111111"

/** Each costume's guide, by its slug (content/costumes.ts). */
export const makeupGuides: Record<string, MakeupGuide> = {
  ghostface: {
    look: "A Ghostface face: pale skin, dark hollow-looking eyes, gray-shaded cheeks and black lips.",
    steps: [
      {
        title: "Pale base",
        howTo:
          "Pat on a foundation two or three shades lighter than your skin, then set it with a white or translucent powder.",
        products: ["light foundation", "translucent setting powder"],
        render: makeup(paler(3)),
      },
      {
        title: "Dark eyes",
        howTo:
          "Sweep black eyeshadow all around the eyes, from the crease to under the lashes, and smudge black eyeliner into the lash lines so they look hollow.",
        products: ["black eyeshadow", "black kohl eyeliner"],
        render: makeup(
          shadow("1color57", matte(BLACK, 70)),
          liner("PandaSmudge1", matte(BLACK, 75))
        ),
      },
      {
        title: "Black lips",
        howTo:
          "Wear a black lipstick, and shade under the cheekbones and at the temples with a gray contour powder.",
        products: ["black lipstick", "gray contour powder"],
        render: makeup(lips(matte(BLACK, 85)), contour("#8E8E8A", 40)),
      },
    ],
    finish: "The black hooded robe, with the mask pushed up on your head.",
  },
  "michael-myers": {
    look: "A Michael Myers face: pale, blank skin, faded brows, shadowed eyes and messy dark-brown hair.",
    steps: [
      {
        title: "Blank pale skin",
        howTo:
          "Use a matte foundation two shades lighter than your skin, and brush a little of it through your brows so they fade.",
        products: ["light matte foundation"],
        render: makeup(paler(2), brows("#D9CDBE", 45)),
      },
      {
        title: "Shadowed eyes",
        howTo:
          "Smudge a dark-brown eyeshadow all around the eyes so they look sunken.",
        products: ["dark brown eyeshadow"],
        render: makeup(shadow("1color57", matte("#2A211C", 60))),
      },
      {
        title: "Dark-brown hair",
        howTo: "Finish with messy dark-brown hair: your own or a short wig.",
        products: ["short dark brown wig"],
        render: hair("#3B2A1E", 80, 15),
      },
    ],
    finish: "Navy coveralls and a plastic kitchen knife.",
  },
  "nikki-freaky-nikki-freeman": {
    look: "Nikki's uncanny-valley face: flat pale skin, eyes that look too big, a mouth that looks too long, and black hair.",
    steps: [
      {
        title: "Flat skin",
        howTo:
          "Pat a matte foundation a shade lighter than your skin over your face and lips, for a flat, mannequin-like finish.",
        products: ["matte foundation", "translucent setting powder"],
        render: makeup(paler(1)),
      },
      {
        title: "Too-big eyes",
        howTo:
          "Press brown eyeshadow into the under-eye hollows and up toward the brow, and line only the middle of the upper and lower lashes in black.",
        products: ["matte brown eyeshadow", "black kohl eyeliner"],
        render: makeup(
          shadow("2colors25", matte("#6B4E44", 60), matte("#4A332C", 65)),
          liner("FullRim7", matte(BLACK, 55))
        ),
      },
      {
        title: "Too-long mouth",
        howTo:
          "Fill the lips with a deep berry and take the lip liner a little past the corners.",
        products: ["deep berry lipstick", "lip liner"],
        render: makeup(
          lips(matte("#6E2A35", 80)),
          lipLine("Wider1", "#5A1F2A", 75, 40, 40)
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
    look: "An Art the Clown face: pale skin, smudged black eyes, high black brows and black lips.",
    steps: [
      {
        title: "Pale base",
        howTo:
          "Pat on a foundation two or three shades lighter than your skin and set it with a white or translucent powder.",
        products: ["light foundation", "white setting powder"],
        render: makeup(paler(3)),
      },
      {
        title: "Eyes and brows",
        howTo:
          "Smudge black eyeshadow on the lids and under the eyes and drag it up and out; messy is right for Art. Draw thin, high-arched brows with a black pencil.",
        products: ["black eyeshadow", "black brow pencil"],
        render: makeup(
          shadow("1color23", matte(BLACK, 65)),
          liner("PandaSmudge11", matte(BLACK, 75)),
          brows(BLACK, 80, { name: "HighArch4", curvature: 40, thickness: -10 })
        ),
      },
      {
        title: "Black lips",
        howTo:
          "Wear a black lipstick and take it a little past the corners with a black lip liner.",
        products: ["black lipstick", "black lip liner"],
        render: makeup(
          lips(matte(BLACK, 85), "smile"),
          lipLine("Wider1", BLACK, 80, 40, 40)
        ),
      },
    ],
    finish:
      "A dot of black eyeliner on the tip of your nose, and the little black hat.",
  },
  pennywise: {
    look: "A Pennywise face: pale skin, red-brown eyes, thin high brows, red lips and orange hair.",
    steps: [
      {
        title: "Pale base",
        howTo:
          "Pat on a foundation two or three shades lighter than your skin and set it with a white or translucent powder.",
        products: ["light foundation", "white setting powder"],
        render: makeup(paler(3)),
      },
      {
        title: "Eyes and brows",
        howTo:
          "Blend a red-brown eyeshadow over the lids and under the eyes, darken the outer corners, and draw thin, high, angular brows with a gray pencil.",
        products: ["red brown eyeshadow", "gray brow pencil"],
        render: makeup(
          shadow("2colors83", matte("#8B3A2E", 65), matte("#2A1A18", 55)),
          brows("#8D8D8D", 50, {
            name: "Arrow13",
            curvature: 40,
            thickness: -40,
          })
        ),
      },
      {
        title: "Red lips",
        howTo: "Wear a bright red lipstick.",
        products: ["bright red lipstick"],
        render: makeup(lips(matte("#B3141B", 85), "smile")),
      },
      {
        title: "Orange hair",
        howTo: "Finish with orange-red hair pushed back off the forehead.",
        products: ["orange clown wig"],
        render: hair("#C8501E", 85, 25),
      },
    ],
    finish:
      "With a red lip liner, draw a thin line from each corner of the mouth up toward the eyes.",
  },
  "aunt-gladys": {
    look: "An Aunt Gladys face: pale, worn-in makeup, odd thin brows, cyan-blue lids, smudged red lips and a red bob.",
    steps: [
      {
        title: "Pale base",
        howTo:
          "Pat on a foundation three shades lighter than your skin and leave it a little uneven, as if it has been on for days.",
        products: ["light foundation"],
        render: makeup(paler(3)),
      },
      {
        title: "Cyan lids, odd brows",
        howTo:
          "Sweep a bright cyan-blue eyeshadow over the lids up to the crease, and draw thin, oddly arched brows with a brown pencil.",
        products: ["cyan blue eyeshadow", "brown brow pencil"],
        render: makeup(
          shadow("1color22", matte("#1FA3D6", 75)),
          brows("#5A3A2A", 60, {
            name: "Arrow13",
            curvature: 50,
            thickness: -40,
          })
        ),
      },
      {
        title: "Smudged red lips",
        howTo:
          "Wear a blue-red matte lipstick (MAC Ruby Woo is the film's), a little past the lip line, and smudge the edges.",
        products: ["blue red matte lipstick"],
        render: makeup(
          lips(matte("#A3172B", 85)),
          lipLine("Large&Full1", "#A3172B", 80, 40, 30)
        ),
      },
      {
        title: "Red bob",
        howTo: "Finish with a bright red bob with blunt bangs.",
        products: ["red bob wig with bangs"],
        render: hair("#C8161D", 90, 35),
      },
    ],
    finish: "Big tinted glasses and dangly earrings.",
  },
  chucky: {
    look: "A Chucky face: a pale doll finish, round red cheeks and bright orange-red hair.",
    steps: [
      {
        title: "Doll base",
        howTo:
          "Use a foundation a shade lighter than your skin, then contour the cheeks, temples and jaw with a cool brown to round the face.",
        products: ["light foundation", "cool brown contour"],
        render: makeup(paler(1), contour("#8A6E62", 40)),
      },
      {
        title: "Cheeks and brows",
        howTo:
          "Blend red blush in circles on the apples of your cheeks, and tint the brows a light orange-brown.",
        products: ["red cream blush", "auburn brow gel"],
        render: makeup(blush("Circle2", "#D2343A", 55), brows("#B5652F", 55)),
      },
      {
        title: "Orange-red hair",
        howTo: "Finish with short, messy orange-red hair.",
        products: ["chucky wig"],
        render: hair("#D2561C", 85, 25),
      },
    ],
    finish:
      "Dot a few freckles with a brown pencil, and draw a couple of thin scars with a red lip liner.",
  },
  "freddy-krueger": {
    look: "A Freddy Krueger face: a patchy red-brown burned flush, purple shadows and dull red lips.",
    steps: [
      {
        title: "Burned flush",
        howTo:
          "Blend a red-brown cream blush over the cheeks and around the edges of the face, patchy on purpose.",
        products: ["red brown cream blush"],
        render: makeup(
          blush("Round2", "#A34A3A", 60),
          shading("Bronzer3", "#7A3A3A", 45)
        ),
      },
      {
        title: "Burn shadows",
        howTo:
          "Press a purple-brown eyeshadow under the cheekbones and all around the eyes.",
        products: ["purple brown eyeshadow"],
        render: makeup(
          contour("#5E2F45", 45),
          shadow("1color23", matte("#4B1F2E", 55))
        ),
      },
      {
        title: "Dull red lips",
        howTo: "Stain the lips a dull red-purple.",
        products: ["dark red lip stain"],
        render: makeup(lips(matte("#6A2D35", 60))),
      },
    ],
    finish: "The striped sweater, a brown fedora and the bladed glove.",
  },
  "jason-voorhees": {
    look: "A Jason face for under the mask: cold gray-blue skin, deep-set dark eyes and bluish lips.",
    steps: [
      {
        title: "Cold skin",
        howTo:
          "Mix a little blue color corrector into a light foundation and pat it on thinly.",
        products: ["light foundation", "blue color corrector"],
        render: makeup(tint("#A7B0AE")),
      },
      {
        title: "Sunken eyes",
        howTo:
          "Shade around the eyes with a deep gray-purple eyeshadow, and hollow the cheeks with a gray contour.",
        products: ["dark purple eyeshadow", "gray contour powder"],
        render: makeup(
          shadow("1color57", matte("#3E3442", 60)),
          contour("#6F7472", 45)
        ),
      },
      {
        title: "Bluish lips",
        howTo: "Dab a dull blue-gray lipstick onto the lips.",
        products: ["blue gray lipstick"],
        render: makeup(lips(matte("#6C7380", 60))),
      },
    ],
    finish:
      "Wear the hockey mask pushed up on your head, or draw its red chevrons on your cheeks with a red lip liner.",
  },
  beetlejuice: {
    look: "A Beetlejuice face: pale skin, lavender and purple tired eyes, mossy green shadows and green-tinged hair.",
    steps: [
      {
        title: "Pale base",
        howTo:
          "Use a foundation two shades lighter than your skin, and set it with a translucent powder.",
        products: ["light foundation", "translucent setting powder"],
        render: makeup(paler(2)),
      },
      {
        title: "Purple eyes",
        howTo:
          "Blend lavender over the lids up to the brows and dark purple under the eyes, then smudge black liner along the lashes.",
        products: [
          "lavender eyeshadow",
          "dark purple eyeshadow",
          "black eyeliner",
        ],
        render: makeup(
          shadow("2colors25", matte("#B79AD3", 65), matte("#3D1F47", 70)),
          liner("PandaSmudge1", matte(BLACK, 60))
        ),
      },
      {
        title: "Mossy shadows",
        howTo:
          "Dust a green eyeshadow along the temples, jaw and hairline like moss.",
        products: ["green eyeshadow"],
        render: makeup(contour("#5E7A35", 40)),
      },
      {
        title: "Green-tinged hair",
        howTo: "Finish with wild white hair tinted green.",
        products: ["beetlejuice wig"],
        render: hair("#C8D4A0", 80, 20),
      },
    ],
    finish: "The black-and-white striped suit.",
  },
  dracula: {
    look: "A Dracula face: pale skin, high dark brows, black-lined eyes, deep red lips and slick black hair.",
    steps: [
      {
        title: "Pale base",
        howTo:
          "Use a foundation two shades lighter than your skin, and shade lightly under the cheekbones.",
        products: ["light foundation", "gray contour powder"],
        render: makeup(paler(2), contour("#9A968A", 35)),
      },
      {
        title: "Hypnotic eyes",
        howTo:
          "Line the eyes in black, smudge a little dark eyeshadow on the lids, and arch the brows dark and high.",
        products: ["black kohl eyeliner", "black brow pencil"],
        render: makeup(
          liner("FullRim7", matte(BLACK, 70)),
          shadow("1color8", matte("#4A3F45", 45)),
          brows("#1A1A1A", 75, { name: "HighArch4", curvature: 40 })
        ),
      },
      {
        title: "Deep red lips",
        howTo: "Wear a deep blood-red lipstick.",
        products: ["deep red lipstick"],
        render: makeup(lips(matte("#6A0F1A", 85))),
      },
      {
        title: "Slick black hair",
        howTo: "Comb black hair straight back with gel.",
        products: ["black hair color spray", "hair gel"],
        render: hair("#121212", 85, 60),
      },
    ],
    finish:
      "Draw a small widow's peak with a brow pencil, and add plastic fangs and a cape.",
  },
  "frankensteins-monster": {
    look: "A Frankenstein's Monster face: a green-gray tint, hollow cheeks, heavy dark brows, dark lips and black hair.",
    steps: [
      {
        title: "Green-gray skin",
        howTo:
          "Mix a little green color corrector into a light foundation, pat it on thinly, and shade the cheeks and temples with a gray-green eyeshadow.",
        products: [
          "light foundation",
          "green color corrector",
          "gray eyeshadow",
        ],
        render: makeup(tint("#9EAA92"), contour("#5C6656", 50)),
      },
      {
        title: "Heavy eyes",
        howTo:
          "Shade the lids and under the eyes gray, and thicken the brows straight and dark with a pencil.",
        products: ["gray eyeshadow", "black brow pencil"],
        render: makeup(
          shadow("1color23", matte("#4A5245", 60)),
          brows("#1E1E1E", 80, { name: "Straight2", thickness: 30 })
        ),
      },
      {
        title: "Dark lips",
        howTo: "Wear a black or very dark gray lipstick.",
        products: ["dark gray lipstick"],
        render: makeup(lips(matte("#2A2A2A", 75))),
      },
      {
        title: "Black hair",
        howTo: "Finish with short black hair combed flat on top.",
        products: ["black hair color spray"],
        render: hair("#151515", 85, 20),
      },
    ],
    finish:
      "Draw a stitched scar on your forehead with black eyeliner, and wear a jacket a size too small.",
  },
  "bride-of-frankenstein": {
    look: "A Bride of Frankenstein face: pale skin, thin arched brows, smudged dark eyes, dark lips and tall black hair.",
    steps: [
      {
        title: "Pale base",
        howTo:
          "Pat on a foundation two or three shades lighter than your skin, down your neck too, and set it with a white powder.",
        products: ["light foundation", "white setting powder"],
        render: makeup(paler(3)),
      },
      {
        title: "Arched brows, dark eyes",
        howTo:
          "Brush concealer through your brows, draw thin high arches in black, smudge black eyeliner around the eyes and add false lashes.",
        products: ["black brow pencil", "black eyeliner", "false eyelashes"],
        render: makeup(
          brows(BLACK, 75, { name: "Thin1", curvature: 50, thickness: -30 }),
          liner("PandaSmudge1", matte(BLACK, 70)),
          lashes("UpperDense1")
        ),
      },
      {
        title: "Dark lips",
        howTo: "Wear a dark plum-red lipstick with a crisp lip liner.",
        products: ["dark plum lipstick", "dark lip liner"],
        render: makeup(
          lips(matte("#4A1020", 85)),
          lipLine("Natural1", "#2E0A14", 80, 40, 90)
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
      "Spray two white streaks into the hair with white hair color spray.",
  },
  sam: {
    look: "A Sam face: burlap-brown shading, round black eyes and a small dark mouth.",
    steps: [
      {
        title: "Burlap shading",
        howTo:
          "Brush a warm brown bronzer around the edges of your face, into the cheek hollows and down the nose.",
        products: ["warm brown bronzer"],
        render: makeup(shading("Bronzer3", "#8A6B48", 50)),
      },
      {
        title: "Button eyes",
        howTo: "Sweep black eyeshadow in a round shape all around each eye.",
        products: ["black eyeshadow"],
        render: makeup(shadow("1color57", matte(BLACK, 65))),
      },
      {
        title: "Small dark mouth",
        howTo: "Wear a dark-brown lipstick and keep the line small and neat.",
        products: ["dark brown lipstick", "brown lip liner"],
        render: makeup(
          lips(matte("#4A3020", 75)),
          lipLine("Small1", "#3A2416", 70, 40, 70)
        ),
      },
    ],
    finish:
      "Draw little stitches across your lips with a brown eyeliner, and wear the orange hood.",
  },
  leatherface: {
    look: "Leatherface's 'Pretty Woman' mask: brown-shadowed hollows, smeared blue lids, pink cheeks and smudged pink-red lips.",
    steps: [
      {
        title: "Shadowed hollows",
        howTo:
          "Brush a dull brown contour into the hollows of the cheeks, the temples and along the jaw.",
        products: ["brown contour powder"],
        render: makeup(contour("#7A5A3E", 45)),
      },
      {
        title: "Smeared blue lids",
        howTo:
          "Smear a bright blue eyeshadow over the lids and a little past the edges, as if a clumsy hand put it on.",
        products: ["bright blue eyeshadow"],
        render: makeup(shadow("1color22", matte("#2F6FD1", 70))),
      },
      {
        title: "Pink cheeks and lips",
        howTo:
          "Rub a dark pink blush into the cheeks and wear a pink-red lipstick a little past the lips.",
        products: ["pink cream blush", "pink red lipstick"],
        render: makeup(
          blush("Round2", "#C2456E", 50),
          lips(matte("#C2456E", 75)),
          lipLine("Large&Full1", "#B83A5E", 70, 40, 30)
        ),
      },
      {
        title: "Dark hair",
        howTo: "Finish with dark-brown hair, set but messy.",
        products: ["dark brown wig"],
        render: hair("#3A2A1E", 80, 20),
      },
    ],
    finish: "A butcher's apron with a little fake blood on it.",
  },
  pinhead: {
    look: "A Pinhead face: pale skin, blue-gray shadows, dark-lined eyes and black lips.",
    steps: [
      {
        title: "Pale base",
        howTo:
          "Pat on a foundation two or three shades lighter than your skin, then shade the hollows with a gray-blue eyeshadow.",
        products: ["light foundation", "gray eyeshadow"],
        render: makeup(paler(3), contour("#7E8796", 45)),
      },
      {
        title: "Dark eyes",
        howTo:
          "Shade the lids blue-gray and under the eyes dark, then line all around in black.",
        products: ["blue gray eyeshadow", "black eyeshadow", "black eyeliner"],
        render: makeup(
          shadow("2colors25", matte("#4F6280", 60), matte(BLACK, 65)),
          liner("FullRim7", matte(BLACK, 60))
        ),
      },
      {
        title: "Black lips",
        howTo: "Wear a black lipstick.",
        products: ["black lipstick"],
        render: makeup(lips(matte(BLACK, 80))),
      },
    ],
    finish:
      "Draw a fine grid of lines across your forehead with a black eyeliner, and wear a long black coat.",
  },
  "jigsaw-and-billy-the-puppet": {
    look: "A Billy the Puppet face: pale skin, black-ringed eyes and brows, round red cheeks, red lips and wild black hair.",
    steps: [
      {
        title: "Pale base",
        howTo:
          "Pat on a foundation two or three shades lighter than your skin and set it with a white powder.",
        products: ["light foundation", "white setting powder"],
        render: makeup(paler(3)),
      },
      {
        title: "Puppet eyes",
        howTo:
          "Fill in the brows black, ring the eyes with a black pencil, and soften it with black eyeshadow.",
        products: ["black eyeliner pencil", "black eyeshadow"],
        render: makeup(
          brows(BLACK, 80, { name: "Straight2", thickness: 20 }),
          liner("PandaSmudge1", matte(BLACK, 75)),
          shadow("1color23", matte(BLACK, 60))
        ),
      },
      {
        title: "Red cheeks and lips",
        howTo:
          "Blend round red circles of blush on the cheeks, and wear a red lipstick.",
        products: ["red cream blush", "red lipstick"],
        render: makeup(
          blush("Circle2", "#C8102E", 70),
          lips(matte("#C8102E", 85), "smile")
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
      "Turn the red circles into spirals with a red lip liner, and draw short black lines down from the corners of the mouth.",
  },
  m3gan: {
    look: "An M3GAN face: flawless porcelain skin, neat brows, lined doll eyes with lashes top and bottom, a cherry-red lip and brown hair.",
    steps: [
      {
        title: "Porcelain skin",
        howTo:
          "Use a full-coverage foundation two shades lighter than your skin, blend it until it looks poreless, and add a soft glow on the high points.",
        products: ["full coverage foundation", "liquid highlighter"],
        render: makeup(paler(2, 70, 30), glow("#FFF6EE", 45)),
      },
      {
        title: "Doll eyes",
        howTo:
          "Line the upper lashes in black, add false lashes on top and plenty of mascara on the bottom, and keep the brows neat.",
        products: ["black liquid eyeliner", "false eyelashes", "black mascara"],
        render: makeup(
          liner("Lower11", matte(BLACK, 75)),
          lashes("Upper&Lower1"),
          brows("#4A3528", 55, { name: "SoftArch1" })
        ),
      },
      {
        title: "Cherry lips",
        howTo:
          "Wear a cherry-red satin lipstick, and blush the cheeks the faintest pink.",
        products: ["cherry red lipstick", "pink blush"],
        render: makeup(
          lips(satin("#B0101E", 80)),
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
    finish: "A plaid dress, a bow and mary janes; move slowly.",
  },
  "samara-morgan": {
    look: "A Samara face: pale skin, gray hollows, dark-ringed eyes, colorless lips and long wet black hair.",
    steps: [
      {
        title: "Pale base",
        howTo:
          "Use a foundation two shades lighter than your skin, and shade the hollows of the cheeks with a gray contour.",
        products: ["light foundation", "gray contour powder"],
        render: makeup(paler(2), contour("#8B8E8C", 40)),
      },
      {
        title: "Dark eyes",
        howTo:
          "Smudge gray and black eyeshadow around the eyes and line them all around in black.",
        products: ["black eyeshadow", "black kohl eyeliner"],
        render: makeup(
          shadow("1color57", matte("#2E2C30", 60)),
          liner("FullRim7", matte(BLACK, 65))
        ),
      },
      {
        title: "Pale lips",
        howTo: "Cover the lips with a pale gray-nude lipstick so they fade.",
        products: ["pale nude lipstick"],
        render: makeup(lips(matte("#9C9796", 55))),
      },
      {
        title: "Black hair",
        howTo: "Finish with long black hair, wet with gel.",
        products: ["long black wig", "hair gel"],
        render: hair("#101010", 90, 70),
      },
    ],
    finish: "Let the wet hair hang over your face, and wear a white nightgown.",
  },
  "the-nun-valak": {
    look: "A Valak face: pale skin, faded brows, hollow cheeks, dark smoky eyes and dark lips.",
    steps: [
      {
        title: "Pale base",
        howTo:
          "Use a foundation three shades lighter than your skin, set it with white powder, and brush it through your brows to fade them.",
        products: ["light foundation", "white setting powder"],
        render: makeup(paler(3), brows("#E8DCCD", 45)),
      },
      {
        title: "Hollow cheeks, dark eyes",
        howTo:
          "Shade under the cheekbones with a gray contour, and sweep black eyeshadow all around the eyes.",
        products: ["gray contour powder", "black eyeshadow"],
        render: makeup(
          contour("#5E5E5E", 50),
          shadow("1color57", matte(BLACK, 70))
        ),
      },
      {
        title: "Dark lips",
        howTo: "Wear a dark gray-black lipstick.",
        products: ["black lipstick"],
        render: makeup(lips(matte("#2A2426", 80))),
      },
    ],
    finish: "A black veil or hood over your hair for the habit.",
  },
  annabelle: {
    look: "An Annabelle face: porcelain skin, round red cheeks, a small red cupid's-bow mouth and auburn braids.",
    steps: [
      {
        title: "Porcelain base",
        howTo:
          "Use a full-coverage foundation two shades lighter than your skin.",
        products: ["full coverage foundation"],
        render: makeup(paler(2, 70)),
      },
      {
        title: "Doll cheeks and lashes",
        howTo:
          "Blend red blush in circles on the apples of your cheeks, and add lashes top and bottom.",
        products: ["red cream blush", "false eyelashes"],
        render: makeup(blush("Circle2", "#C8323C", 60), lashes("Upper&Lower1")),
      },
      {
        title: "Small red mouth",
        howTo:
          "Fill a small red heart shape in the center of the lips, not out to the corners.",
        products: ["red lipstick", "red lip liner"],
        render: makeup(
          lips(matte("#B3122A", 85), "heart-shaped"),
          lipLine("Rosebud1", "#9C0F22", 80, 40, 80)
        ),
      },
      {
        title: "Auburn braids",
        howTo: "Finish with auburn hair in two braided pigtails.",
        products: ["auburn braided wig"],
        render: hair("#7A2E1F", 85, 25),
      },
    ],
    finish:
      "Draw a few thin cracks on one cheek and the forehead with a black eyeliner.",
  },
  "regan-macneil": {
    look: "A possessed Regan face: pale, sickly skin with green-gray shadows, bruised purple eyes, chapped lips and messy brown hair.",
    steps: [
      {
        title: "Sickly base",
        howTo:
          "Use a foundation two shades lighter than your skin, and shade under the cheekbones with a green-gray eyeshadow.",
        products: ["light foundation", "green gray eyeshadow"],
        render: makeup(paler(2), contour("#7E8A6E", 45)),
      },
      {
        title: "Bruised eyes",
        howTo:
          "Blend purple and dark plum around the eyes, darkest right under them, and rim them softly in red-brown.",
        products: ["purple eyeshadow", "red brown eyeliner"],
        render: makeup(
          shadow("2colors25", matte("#5B4A6E", 60), matte("#3B2C46", 70)),
          liner("FullRim7", matte("#5E2A2E", 50))
        ),
      },
      {
        title: "Chapped lips",
        howTo: "Dab a dull red-brown on the lips and leave them dry.",
        products: ["red brown lip stain"],
        render: makeup(lips(matte("#6B3A36", 60))),
      },
      {
        title: "Messy hair",
        howTo: "Finish with light-brown hair, matted and messy.",
        products: ["light brown wig"],
        render: hair("#6B4E36", 80, 15),
      },
    ],
    finish:
      "Draw a few thin scratches on the cheeks with a red-brown lip liner, and wear a white nightgown.",
  },
  "carrie-white": {
    look: "Carrie at the prom: soft pink 70s makeup and strawberry-blonde waves, before the blood.",
    steps: [
      {
        title: "Soft pink eyes",
        howTo: "Sweep a soft pink eyeshadow over the lids and add mascara.",
        products: ["soft pink eyeshadow", "mascara"],
        render: makeup(
          shadow("1color8", matte("#E2A2B0", 55)),
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
    finish: "Then the prom ends: fake blood over your hair, face and dress.",
  },
  "count-orlok": {
    look: "A Count Orlok face: pale skin, gray hollows, deep-shadowed eyes, bushy dark brows and thin dark lips.",
    steps: [
      {
        title: "Pale base",
        howTo:
          "Pat on a foundation three shades lighter than your skin, and sink the cheeks with a gray contour.",
        products: ["light foundation", "gray contour powder"],
        render: makeup(paler(3), contour("#77746C", 50)),
      },
      {
        title: "Deep-set eyes",
        howTo:
          "Shade all around the eyes with a gray-black eyeshadow, and thicken the brows bushy and dark with a pencil.",
        products: ["dark gray eyeshadow", "dark brow pencil"],
        render: makeup(
          shadow("1color57", matte("#2B2724", 65)),
          brows("#1E1A18", 80, { name: "Original5", thickness: 40 })
        ),
      },
      {
        title: "Thin dark lips",
        howTo: "Wear a dark gray-brown lipstick, kept thin.",
        products: ["dark brown lipstick", "lip liner"],
        render: makeup(
          lips(matte("#4A3A3A", 70)),
          lipLine("Small1", "#3A2A2A", 70, 30, 60)
        ),
      },
    ],
    finish: "Plastic rat fangs and a long black coat.",
  },
  pearl: {
    look: "A Pearl face: a sweet farm girl with rosy cheeks, bright red lips and blonde braids, smiling a little too wide.",
    steps: [
      {
        title: "Rosy cheeks",
        howTo:
          "Keep the skin fresh and blend a pink-red blush high on the cheeks.",
        products: ["pink cream blush"],
        render: makeup(blush("Round2", "#D9576A", 55)),
      },
      {
        title: "Red lips, fair brows",
        howTo:
          "Wear a bright red lipstick for the audition, and tint the brows fair.",
        products: ["bright red lipstick", "blonde brow gel"],
        render: makeup(lips(matte("#C21E2C", 80)), brows("#C9A46A", 50)),
      },
      {
        title: "Blonde braids",
        howTo: "Finish with blonde hair in braided pin curls.",
        products: ["blonde braided wig"],
        render: hair("#D9B77A", 80, 30),
      },
    ],
    finish:
      "A few spatters of fake blood on your face and dress for the farmhouse finale.",
  },
  "freddy-fazbear": {
    look: "A Freddy Fazbear face: warm brown fur shading, bold black brows, dark-rimmed eyes and brown hair under the top hat.",
    steps: [
      {
        title: "Fur shading",
        howTo:
          "Brush a warm brown bronzer around the edges of your face, into the cheek hollows and down the nose, like fur.",
        products: ["warm brown bronzer"],
        render: makeup(shading("Bronzer3", "#6A4228", 50)),
      },
      {
        title: "Bold brows and eyes",
        howTo:
          "Draw thick black brows with a pencil and darken around the eyes with black eyeshadow.",
        products: ["black brow pencil", "black eyeshadow"],
        render: makeup(
          brows(BLACK, 80, {
            name: "Straight2",
            thickness: 40,
            definition: 80,
          }),
          shadow("1color23", matte("#2A1A12", 60))
        ),
      },
      {
        title: "Brown hair",
        howTo: "Finish with brown hair under a little top hat.",
        products: ["brown hair color spray"],
        render: hair("#5A3820", 80, 20),
      },
    ],
    finish:
      "Draw a small black nose tip with eyeliner, and add the top hat and bow tie.",
  },
  "the-grady-twins": {
    look: "A Grady twins face: pale porcelain skin, softly shadowed eyes, a hint of pink on the cheeks, berry lips and light-brown hair.",
    steps: [
      {
        title: "Pale porcelain",
        howTo:
          "Use a foundation two shades lighter than your skin, set with translucent powder.",
        products: ["light foundation", "translucent setting powder"],
        render: makeup(paler(2, 65)),
      },
      {
        title: "Shadowed eyes",
        howTo:
          "Shade softly around the eyes with a gray-brown eyeshadow, and add mascara top and bottom.",
        products: ["gray brown eyeshadow", "mascara"],
        render: makeup(
          shadow("1color23", matte("#4A4446", 50)),
          lashes("Upper&Lower1", BLACK, 60)
        ),
      },
      {
        title: "Cheeks and lips",
        howTo: "Add a hint of pink blush and a berry lipstick.",
        products: ["pink blush", "berry lipstick"],
        render: makeup(
          blush("Circle2", "#E8A0A8", 35),
          lips(matte("#8A3A4E", 65))
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
    finish: "Matching pale-blue dresses: it works best with your twin.",
  },
  "jack-torrance": {
    look: "A frozen Jack Torrance face: pale skin with icy-blue hollows, frosted brows, pale lips and frosted hair.",
    steps: [
      {
        title: "Frozen skin",
        howTo:
          "Use a foundation two shades lighter than your skin and dust white powder over it.",
        products: ["light foundation", "white setting powder"],
        render: makeup(paler(2)),
      },
      {
        title: "Icy hollows",
        howTo:
          "Dust an icy-blue shimmer eyeshadow into the cheek hollows, beside the nose and around the eyes.",
        products: ["icy blue shimmer eyeshadow"],
        render: makeup(
          contour("#9FB3C4", 45),
          shadow("1color23", shimmer("#9DB6CC", 55))
        ),
      },
      {
        title: "Frosted brows and lips",
        howTo:
          "Brush white eyeshadow through the brows, and wear a pale gray-blue lipstick.",
        products: ["white eyeshadow", "pale blue lipstick"],
        render: makeup(brows("#F3F6F8", 55), lips(matte("#9AA6B2", 55))),
      },
      {
        title: "Frosted hair",
        howTo: "Finish with hair frosted gray-white.",
        products: ["white hair color spray"],
        render: hair("#B9BEC2", 75, 20),
      },
    ],
    finish:
      "A plaid shirt, and a little white powder on your shoulders like frost.",
  },
  "hannibal-lecter": {
    look: "A Hannibal Lecter face: prison-pale skin, cold shadowed eyes, pale lips and slicked-back dark hair.",
    steps: [
      {
        title: "Prison pallor",
        howTo:
          "Even out your skin with a foundation a shade or two lighter than yours.",
        products: ["light foundation"],
        render: makeup(paler(1, 55)),
      },
      {
        title: "Cold stare",
        howTo:
          "Shade just around the eyes with a cool gray-brown eyeshadow, and keep the lips pale.",
        products: ["cool brown eyeshadow", "nude lip balm"],
        render: makeup(
          shadow("1color23", matte("#7A6C66", 45)),
          lips(matte("#B89A90", 50))
        ),
      },
      {
        title: "Slicked-back hair",
        howTo: "Comb dark hair straight back with gel.",
        products: ["hair gel"],
        render: hair("#3A2C24", 75, 70),
      },
    ],
    finish: "An orange jumpsuit, or a sharp suit.",
  },
  "norman-bates": {
    look: "A 'Mother' face: pale skin, shadowed eyes and cheeks for age, under a gray bun.",
    steps: [
      {
        title: "Pale base",
        howTo: "Use a foundation a shade or two lighter than your skin.",
        products: ["light foundation"],
        render: makeup(paler(1, 55)),
      },
      {
        title: "Shadows of age",
        howTo:
          "Shade under the eyes and under the cheekbones with a gray-brown eyeshadow.",
        products: ["gray brown eyeshadow"],
        render: makeup(
          contour("#8A7A6E", 45),
          shadow("1color23", matte("#6E5E58", 50))
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
    look: "A Captain Spaulding face: pale skin, bright blue lids up to the brows, a big red mouth and wild gray-white hair.",
    steps: [
      {
        title: "Pale base",
        howTo:
          "Pat on a foundation two or three shades lighter than your skin and set it with a white powder.",
        products: ["light foundation", "white setting powder"],
        render: makeup(paler(3)),
      },
      {
        title: "Blue lids",
        howTo: "Sweep a bright blue eyeshadow from the lashes up to the brows.",
        products: ["bright blue eyeshadow"],
        render: makeup(shadow("1color67", matte("#2D5BD3", 70))),
      },
      {
        title: "Big red mouth",
        howTo:
          "Wear a red lipstick and take it a little past the corners with a red lip liner.",
        products: ["red lipstick", "red lip liner"],
        render: makeup(
          lips(matte("#C8102E", 85), "smile"),
          lipLine("Wider1", "#C8102E", 75, 40, 40)
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
      "A dab of red lipstick on the tip of your nose, and a Hawaiian shirt.",
  },
  "the-headless-horseman": {
    look: "A Headless Horseman face, from before he lost it: pale skin, black brows, dark-ringed eyes, pale lips and wild black hair.",
    steps: [
      {
        title: "Pale base",
        howTo:
          "Use a matte foundation two shades lighter than your skin, and shade the cheeks lightly gray.",
        products: ["light foundation", "gray contour powder"],
        render: makeup(paler(2), contour("#8E8A82", 40)),
      },
      {
        title: "Black brows and eyes",
        howTo:
          "Darken the brows into sharp shapes with a black pencil, and smudge black eyeliner all around the eyes.",
        products: ["black brow pencil", "black kohl eyeliner"],
        render: makeup(
          brows(BLACK, 80, { name: "Arrow13", thickness: 10 }),
          liner("PandaSmudge11", matte(BLACK, 70))
        ),
      },
      {
        title: "Pale lips",
        howTo: "Wear a pale nude lipstick.",
        products: ["pale nude lipstick"],
        render: makeup(lips(matte("#B5ADA6", 55))),
      },
      {
        title: "Wild black hair",
        howTo: "Finish with black hair, spiked up with gel.",
        products: ["black hair color spray", "hair gel"],
        render: hair("#111111", 85, 20),
      },
    ],
    finish: "A black cape and a jack-o'-lantern under your arm.",
  },
  candyman: {
    look: "A Candyman face: a honey-gold glow, gold and deep-brown eyes and dark lips.",
    steps: [
      {
        title: "Honey glow",
        howTo:
          "Warm the high points of the face with a gold highlighter, and sculpt under the cheekbones with a deep-brown contour.",
        products: ["gold highlighter", "deep brown contour"],
        render: makeup(glow("#D9A441", 60), contour("#4A3020", 40)),
      },
      {
        title: "Gold eyes",
        howTo:
          "Press a metallic gold eyeshadow on the lids and smoke the outer corners in a deep brown.",
        products: ["metallic gold eyeshadow", "deep brown eyeshadow"],
        render: makeup(
          shadow("2colors83", metallic("#C9A13B", 65), matte("#3A2414", 70))
        ),
      },
      {
        title: "Dark lips",
        howTo: "Wear a dark-brown lipstick.",
        products: ["dark brown lipstick"],
        render: makeup(lips(matte("#4A2A22", 65))),
      },
    ],
    finish:
      "A long coat with a fur collar, a toy hook, and a couple of fake bees on the collar.",
  },
  "the-babadook": {
    look: "A Babadook face: pale skin, a dark shape around the eyes, black lips and black hair.",
    steps: [
      {
        title: "Pale base",
        howTo: "Use a foundation two shades lighter than your skin.",
        products: ["light foundation"],
        render: makeup(paler(2)),
      },
      {
        title: "Dark eyes",
        howTo:
          "Smudge black eyeshadow in a wide shape around both eyes, and line them with black eyeliner.",
        products: ["black eyeshadow", "black eyeliner"],
        render: makeup(
          shadow("1color57", matte(BLACK, 70)),
          liner("PandaSmudge11", matte(BLACK, 70))
        ),
      },
      {
        title: "Black lips",
        howTo:
          "Wear a black lipstick and take it a little past the corners with a black lip liner.",
        products: ["black lipstick", "black lip liner"],
        render: makeup(
          lips(matte(BLACK, 85), "smile"),
          lipLine("Wider1", BLACK, 75, 40, 40)
        ),
      },
      {
        title: "Black hair",
        howTo: "Finish with black hair under the top hat.",
        products: ["black hair color spray"],
        render: hair("#121212", 85, 20),
      },
    ],
    finish:
      "A top hat and a long black coat; draw a few jagged teeth into the black lips with a white eyeliner.",
  },
  "pirate-clark": {
    look: "A Pirate Clark face in his mascot colors: pale, gaunt skin, teal and yellow eyes and a pink grin stretched a little too wide.",
    steps: [
      {
        title: "Gaunt skin",
        howTo:
          "Use a foundation a shade lighter than your skin, and shade under the cheekbones and at the temples to stretch the face.",
        products: ["light foundation", "gray brown contour"],
        render: makeup(paler(1, 55), contour("#8C7E70", 45)),
      },
      {
        title: "Mascot eyes",
        howTo:
          "Blend a teal eyeshadow over the lids and a yellow one under the eyes, the colors of his shirt and vest.",
        products: ["teal eyeshadow", "yellow eyeshadow"],
        render: makeup(
          shadow("2colors25", matte("#1E8A8A", 70), matte("#E3C21B", 65))
        ),
      },
      {
        title: "Stretched grin",
        howTo:
          "Wear a faded pink lipstick and take the liner a little past the corners.",
        products: ["pink lipstick", "pink lip liner"],
        render: makeup(
          lips(matte("#C8607A", 70)),
          lipLine("Wider1", "#B04A66", 70, 40, 40)
        ),
      },
    ],
    finish: "A tricorn hat with a white feather, an eyepatch and a pink sash.",
  },
  "ash-williams": {
    look: "An Ash Williams face after a long night: grimy, tired and shadowed, with messy dark-brown hair.",
    steps: [
      {
        title: "Grime",
        howTo:
          "Brush a brown-gray eyeshadow along the edges of the face, into the cheek hollows and down the nose.",
        products: ["brown gray eyeshadow"],
        render: makeup(shading("Bronzer3", "#6E5A4A", 45)),
      },
      {
        title: "Tired eyes",
        howTo: "Smudge a dark brown eyeshadow under and around the eyes.",
        products: ["dark brown eyeshadow"],
        render: makeup(shadow("1color23", matte("#4A3A32", 50))),
      },
      {
        title: "Messy hair",
        howTo: "Finish with dark-brown hair, messed up.",
        products: ["dark brown hair color spray"],
        render: hair("#3A2A1E", 80, 25),
      },
    ],
    finish:
      "A smear of fake blood across one cheekbone, and a blue shirt with the sleeves rolled up.",
  },
  "dani-the-may-queen": {
    look: "Dani crowned and crying: flushed red cheeks, red-rimmed teary eyes, bare lips and blonde hair.",
    steps: [
      {
        title: "Flushed cheeks",
        howTo: "Blend a red-pink cream blush wide across the cheeks.",
        products: ["red pink cream blush"],
        render: makeup(blush("Round2", "#D9505E", 55)),
      },
      {
        title: "Crying eyes",
        howTo:
          "Line the rims with a soft red pencil and smudge a pink-red eyeshadow around the eyes; keep the lips bare.",
        products: ["red eyeliner pencil", "pink eyeshadow"],
        render: makeup(
          liner("FullRim7", matte("#B8404A", 50)),
          shadow("1color23", matte("#C46A70", 45)),
          lips(matte("#C99088", 40))
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
      "A tall flower crown and a white dress; a dab of lip oil on the cheeks reads as tears.",
  },
  "red-and-the-tethered": {
    look: "A Red face: worn shadows, bleached brows, gold lids for the golden glove and a deep red lip for the jumpsuit.",
    steps: [
      {
        title: "Worn shadows",
        howTo:
          "Shade around the eyes, the cheeks and the temples with a deep-brown eyeshadow, so the face looks worn.",
        products: ["deep brown eyeshadow"],
        render: makeup(shading("Bronzer2", "#5A4030", 45)),
      },
      {
        title: "Bleached brows",
        howTo: "Lighten the brows to a pale blonde with a tinted brow gel.",
        products: ["blonde brow gel"],
        render: makeup(brows("#E3D2A8", 70)),
      },
      {
        title: "Gold and red",
        howTo:
          "Press a metallic gold eyeshadow on the lids, and wear a deep red lipstick.",
        products: ["metallic gold eyeshadow", "deep red lipstick"],
        render: makeup(
          shadow("1color8", metallic("#C9A13B", 70)),
          lips(matte("#8E1420", 80))
        ),
      },
    ],
    finish: "A red jumpsuit, one golden glove and toy gold scissors.",
  },
  "grace-the-bride": {
    look: "A Grace face on her wedding night: soft bridal glam with warm brown eyes, pink lips and blonde hair, until the blood.",
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
          "Blend a warm brown eyeshadow on the lids, deeper at the outer corners, add lashes, and wear a pink satin lipstick.",
        products: ["warm brown eyeshadow", "false eyelashes", "pink lipstick"],
        render: makeup(
          shadow("2colors83", matte("#C79A7E", 55), matte("#6E4A3A", 55)),
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
      "A torn wedding dress and sneakers, with dirt and fake blood on your face, arms and gown.",
  },
  "lydia-deetz": {
    look: "A Lydia Deetz face: pale skin, peach-washed eyes with dark smudges underneath, dark lips and jet-black hair.",
    steps: [
      {
        title: "Pale base",
        howTo: "Use a foundation two shades lighter than your skin.",
        products: ["light foundation"],
        render: makeup(paler(2)),
      },
      {
        title: "Peach and dark eyes",
        howTo:
          "Sweep a peach eyeshadow over the lids up under the brows, smudge a dark one under the eyes, and line all around in black.",
        products: ["peach eyeshadow", "dark eyeshadow", "black kohl eyeliner"],
        render: makeup(
          shadow("2colors25", matte("#E8A882", 60), matte("#3A2A2E", 60)),
          liner("FullRim7", matte(BLACK, 60))
        ),
      },
      {
        title: "Dark lips",
        howTo: "Wear a dark wine lipstick.",
        products: ["dark wine lipstick"],
        render: makeup(lips(matte("#4A1C26", 75))),
      },
      {
        title: "Jet-black hair",
        howTo: "Finish with jet-black hair and long bangs.",
        products: ["black wig with bangs"],
        render: hair("#0F0F0F", 90, 30),
      },
    ],
    finish: "Pin the bangs into short spiky points, and wear a black dress.",
  },
  "tiffany-valentine": {
    look: "A Tiffany Valentine face: a plum smoky eye with a sharp black wing, big lashes, red lips and platinum hair.",
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
          shadow("2colors164", matte("#B48AC4", 65), matte("#4A1E4E", 75)),
          liner("OpenWings3", matte(BLACK, 75)),
          lashes("Winged1")
        ),
      },
      {
        title: "Red lips",
        howTo:
          "Line the lips with a darker red, then fill them with a bright classic red.",
        products: ["bright red lipstick", "dark red lip liner"],
        render: makeup(
          lips(matte("#C21A2C", 85)),
          lipLine("Natural1", "#6E1A1E", 80, 40, 80)
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
      "Dot a beauty mark above the lip with eyeliner, and wear a black leather jacket.",
  },
  "the-craft-coven": {
    look: "A Nancy face from The Craft: pale skin, black kohl smudged around plum-brown eyes and a vampy dark berry lip.",
    steps: [
      {
        title: "Pale skin",
        howTo:
          "Use a foundation a shade lighter than your skin for a slightly sickly, ethereal look.",
        products: ["light foundation"],
        render: makeup(paler(1, 55)),
      },
      {
        title: "Smudged kohl",
        howTo:
          "Blend a plum-brown eyeshadow over the lids and outer corners, then smudge black kohl all around the eye.",
        products: ["plum eyeshadow", "black kohl pencil"],
        render: makeup(
          shadow("2colors83", matte("#7A3A4E", 60), matte("#2E1626", 70)),
          liner("FullRim7", matte(BLACK, 75))
        ),
      },
      {
        title: "Vampy lips",
        howTo: "Line the lips in purple and fill them with a deep matte berry.",
        products: ["dark berry lipstick", "purple lip liner"],
        render: makeup(
          lips(matte("#4B1630", 85)),
          lipLine("Natural1", "#3A1030", 80, 40, 80)
        ),
      },
      {
        title: "Dark hair",
        howTo: "Finish with dark-brown hair, a little messy.",
        products: ["dark brown wig"],
        render: hair("#2A1E1A", 85, 25),
      },
    ],
    finish: "A plaid skirt, a black choker and a candle.",
  },
  "jennifer-check": {
    look: "A Jennifer Check face: luminous skin, grungy smoky eyes, a glossy berry-pink pout and long dark hair.",
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
          "Smoke a gray-mauve eyeshadow around the eyes, deeper at the corners, smudge black liner into the lashes and add lashes.",
        products: ["smoky eyeshadow palette", "black kohl eyeliner"],
        render: makeup(
          shadow("2colors83", matte("#6E5A62", 55), matte("#2A2228", 65)),
          liner("PandaSmudge1", matte(BLACK, 65)),
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
    finish:
      "A cheerleader uniform; for the demon, a little fake blood at the corners of the mouth.",
  },
  "frank-the-rabbit": {
    look: "A Frank the Rabbit face: cool gray shading, dark hollow eyes ringed in silver, and pale gray lips.",
    steps: [
      {
        title: "Gray shading",
        howTo:
          "Brush a cool gray eyeshadow around the edges of your face, into the cheek hollows and down the nose.",
        products: ["cool gray eyeshadow"],
        render: makeup(
          shading("Bronzer3", "#8E8E8C", 45),
          contour("#5A5A58", 40)
        ),
      },
      {
        title: "Hollow eyes",
        howTo:
          "Sweep black eyeshadow all around the eyes and ring them with a silver eyeliner.",
        products: ["black eyeshadow", "metallic silver eyeliner"],
        render: makeup(
          shadow("1color57", matte(BLACK, 70)),
          liner("FullRim7", metallic("#C8CCD0", 70))
        ),
      },
      {
        title: "Pale gray lips",
        howTo: "Wear a pale gray lipstick.",
        products: ["gray lipstick"],
        render: makeup(lips(matte("#C9C8C4", 55))),
      },
    ],
    finish:
      "Gray bunny ears on a headband; draw square teeth over the lips with a white eyeliner.",
  },
  "the-gill-man": {
    look: "A Gill-man face: a green tint, darker green hollows, metallic teal-green eyes and green lips.",
    steps: [
      {
        title: "Green skin",
        howTo:
          "Mix a little green color corrector into your foundation and pat it on thinly, then shade the hollows with a dark green eyeshadow.",
        products: ["green color corrector", "dark green eyeshadow"],
        render: makeup(tint("#5F8A5A"), contour("#2E4A2E", 45)),
      },
      {
        title: "Swamp eyes",
        howTo:
          "Press a metallic teal-green eyeshadow on the lids, darken the corners with deep green, and line all around.",
        products: ["metallic green eyeshadow", "dark green eyeliner"],
        render: makeup(
          shadow("2colors83", metallic("#3FA08A", 70), matte("#1E3A28", 65)),
          liner("FullRim7", matte("#14261A", 65))
        ),
      },
      {
        title: "Green lips",
        howTo: "Wear a green lipstick.",
        products: ["green lipstick"],
        render: makeup(lips(matte("#3E5E3C", 70))),
      },
    ],
    finish:
      "Dab a darker green eyeshadow through a piece of fishnet on your cheeks for scales.",
  },
  "the-phantom-of-the-opera": {
    look: "A Phantom of the Opera face: pale skin, sunken cheeks, dark skull-like eyes, dark lips and slick black hair.",
    steps: [
      {
        title: "Pale base",
        howTo:
          "Use a foundation two shades lighter than your skin, and sink the cheeks with a gray-brown contour.",
        products: ["light foundation", "gray brown contour"],
        render: makeup(paler(2), contour("#4E4A44", 50)),
      },
      {
        title: "Dark eyes",
        howTo: "Sweep black eyeshadow all around the eyes.",
        products: ["black eyeshadow"],
        render: makeup(shadow("1color57", matte(BLACK, 70))),
      },
      {
        title: "Dark lips",
        howTo: "Wear a dark gray-brown lipstick.",
        products: ["dark brown lipstick"],
        render: makeup(lips(matte("#3A2E2C", 75))),
      },
      {
        title: "Slick black hair",
        howTo: "Finish with black hair slicked back.",
        products: ["black hair color spray", "hair gel"],
        render: hair("#121212", 85, 60),
      },
    ],
    finish: "A white half mask over one side of your face, and a cape.",
  },
  krampus: {
    look: "A Krampus face: dark, sculpted shadows in brown and blood red, black eyes and brows, dark red lips and black hair.",
    steps: [
      {
        title: "Demon shadows",
        howTo:
          "Contour the cheeks, temples and jaw with a deep brown, and sweep a dark red eyeshadow around the eyes and cheeks.",
        products: ["deep brown contour", "dark red eyeshadow"],
        render: makeup(
          contour("#2A1A14", 55),
          shading("Bronzer2", "#4A1A14", 45)
        ),
      },
      {
        title: "Black eyes",
        howTo:
          "Blend dark red into black around the eyes, smudge black liner up and out, and draw sharp black brows.",
        products: ["black eyeshadow", "black eyeliner", "black brow pencil"],
        render: makeup(
          shadow("2colors83", matte("#6A1414", 60), matte(BLACK, 70)),
          liner("PandaSmudge11", matte(BLACK, 70)),
          brows(BLACK, 80, { name: "Arrow13" })
        ),
      },
      {
        title: "Dark red lips",
        howTo: "Wear a red lipstick so dark it's almost black.",
        products: ["dark red lipstick"],
        render: makeup(lips(matte("#5A0A10", 85))),
      },
      {
        title: "Black hair",
        howTo: "Finish with shaggy black hair.",
        products: ["black hair color spray"],
        render: hair("#121212", 85, 20),
      },
    ],
    finish: "Horns on a headband, a fur stole and a little bell.",
  },
  "damien-thorn": {
    look: "A Damien face: pale and solemn, with faintly shadowed eyes and dark hair.",
    steps: [
      {
        title: "Solemn pallor",
        howTo:
          "Use a sheer foundation a shade lighter than your skin, and shade softly under the eyes.",
        products: ["light foundation", "taupe eyeshadow"],
        render: makeup(paler(1, 50), shadow("1color23", matte("#6E5E5A", 40))),
      },
      {
        title: "Dark hair",
        howTo: "Finish with dark, slightly curly hair.",
        products: ["black hair color spray"],
        render: hair("#151210", 85, 25),
      },
    ],
    finish:
      "A school uniform, and 666 written small behind your ear with eyeliner.",
  },
  "kayako-saeki": {
    look: "A Kayako face: pale skin, dark hollow-looking eyes, gray lips and long black hair.",
    steps: [
      {
        title: "Pale base",
        howTo:
          "Pat on a foundation three shades lighter than your skin and set it with a white powder.",
        products: ["light foundation", "white setting powder"],
        render: makeup(paler(3)),
      },
      {
        title: "Hollow eyes",
        howTo:
          "Smudge a dark eyeshadow all around the eyes and line them in black.",
        products: ["dark gray eyeshadow", "black kohl eyeliner"],
        render: makeup(
          shadow("1color57", matte("#24202A", 65)),
          liner("FullRim7", matte(BLACK, 65))
        ),
      },
      {
        title: "Gray lips",
        howTo: "Wear a gray lipstick.",
        products: ["gray lipstick"],
        render: makeup(lips(matte("#8E8A8A", 60))),
      },
      {
        title: "Long black hair",
        howTo: "Finish with long black hair.",
        products: ["long black wig"],
        render: hair("#101010", 90, 40),
      },
    ],
    finish: "Let the hair fall over your face, and wear a long white dress.",
  },
  "victor-crowley": {
    look: "A Victor Crowley face: blotchy red-purple skin, sunken shadows, dark hollow eyes and long black hair.",
    steps: [
      {
        title: "Blotchy skin",
        howTo:
          "Dab a red-purple cream blush onto the cheekbones and a dark-brown contour into the hollows, blotchy on purpose.",
        products: ["red purple cream blush", "dark brown contour"],
        render: makeup(
          blush("Oblique2", "#8A3A4A", 55),
          contour("#5A4A40", 50)
        ),
      },
      {
        title: "Sunken eyes",
        howTo: "Shade all around the eyes with a dark red-brown eyeshadow.",
        products: ["dark red brown eyeshadow"],
        render: makeup(shadow("1color57", matte("#3A2228", 65))),
      },
      {
        title: "Long black hair",
        howTo: "Finish with long, stringy black hair.",
        products: ["long black wig"],
        render: hair("#141414", 85, 20),
      },
    ],
    finish: "Denim overalls and a toy hatchet.",
  },
  "laurie-strode": {
    look: "A Laurie Strode face from '78: natural 70s makeup with soft lids, mascara, rosy lips and short light waves.",
    steps: [
      {
        title: "Soft 70s eyes",
        howTo: "Wash a soft taupe eyeshadow over the lids and add mascara.",
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
    finish:
      "A light-blue shirt and jeans, with a little fake blood for the closet scene.",
  },
  dollface: {
    look: "A Dollface face: porcelain skin, round pink cheeks, thin painted brows, a small red mouth and blonde hair.",
    steps: [
      {
        title: "Porcelain base",
        howTo:
          "Use a foundation two shades lighter than your skin, blended smooth.",
        products: ["light foundation"],
        render: makeup(paler(2, 65)),
      },
      {
        title: "Doll features",
        howTo:
          "Blend round pink cheeks, draw thin arched brows with a brown pencil, and add doll lashes top and bottom.",
        products: ["pink cream blush", "brown brow pencil", "false eyelashes"],
        render: makeup(
          blush("Circle2", "#E58A9A", 55),
          brows("#6A4A3A", 70, { name: "Thin1", curvature: 50 }),
          lashes("Upper&Lower1")
        ),
      },
      {
        title: "Small red mouth",
        howTo: "Fill a small red heart shape in the center of the lips.",
        products: ["red lipstick", "red lip liner"],
        render: makeup(
          lips(matte("#B3122A", 85), "heart-shaped"),
          lipLine("Small1", "#9C0F22", 80, 40, 80)
        ),
      },
      {
        title: "Blonde hair",
        howTo: "Finish with blonde hair.",
        products: ["blonde wig"],
        render: hair("#D8BE8E", 80, 30),
      },
    ],
    finish:
      "Dark clothes, and keep your face still and blank: the stare does the rest.",
  },
  "the-purge-anarchists": {
    look: "A Lady Liberty face from The Purge: a teal tint, dark eyes and a pale teal smile.",
    steps: [
      {
        title: "Teal tint",
        howTo:
          "Mix a little teal face paint into your foundation, pat it on thinly, and shade the hollows with a dark teal eyeshadow.",
        products: ["teal face paint", "dark teal eyeshadow"],
        render: makeup(tint("#3E8E86", 25), contour("#2A5E58", 45)),
      },
      {
        title: "Dark eyes",
        howTo: "Sweep a dark eyeshadow all around each eye.",
        products: ["dark eyeshadow"],
        render: makeup(shadow("1color57", matte("#1A2E2C", 65))),
      },
      {
        title: "Pale teal smile",
        howTo:
          "Wear a pale teal lipstick and take the liner a little past the corners.",
        products: ["teal lipstick", "lip liner"],
        render: makeup(
          lips(matte("#9ED6CC", 75), "smile"),
          lipLine("Wider1", "#7CC0B6", 70, 40, 50)
        ),
      },
    ],
    finish: "Draw small X marks over the eyelids with a dark eyeliner.",
  },
  "killer-klowns": {
    look: "A Killer Klowns face: a candy-pink tint, bright blue and pink eyes, a big red mouth and bright green hair.",
    steps: [
      {
        title: "Candy-pink tint",
        howTo:
          "Mix a little pink face paint into your foundation, pat it on thinly, and blend a bright pink blush over the cheeks.",
        products: ["pink face paint", "bright pink blush"],
        render: makeup(tint("#F2C6CF"), blush("Round2", "#E58FB0", 50)),
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
          shadow("2colors164", matte("#2DB3E0", 75), matte("#E0218A", 75)),
          brows("#2A1A3A", 80, { name: "HighArch4" })
        ),
      },
      {
        title: "Big red mouth",
        howTo:
          "Wear a red lipstick, lined a little past the edges for a fuller mouth.",
        products: ["red lipstick", "red lip liner"],
        render: makeup(
          lips(matte("#D0102C", 85), "plump"),
          lipLine("Large&Full1", "#D0102C", 75, 45, 40)
        ),
      },
      {
        title: "Green hair",
        howTo: "Finish with bright green hair.",
        products: ["green clown wig"],
        render: hair("#3FB83F", 90, 30),
      },
    ],
    finish: "Plastic fangs and a pointed party hat.",
  },
  remmick: {
    look: "A Remmick face: pale 1930s skin, hungry shadowed eyes, bloodless lips and light-brown hair.",
    steps: [
      {
        title: "Pale skin",
        howTo:
          "Use a foundation a shade or two lighter than your skin, and shade under the cheekbones.",
        products: ["light foundation", "contour powder"],
        render: makeup(paler(1, 55), contour("#8A7A6E", 40)),
      },
      {
        title: "Hungry eyes",
        howTo:
          "Shade softly around the eyes with a red-brown eyeshadow, and keep the lips pale.",
        products: ["red brown eyeshadow", "nude lip balm"],
        render: makeup(
          shadow("1color23", matte("#6A4A48", 50)),
          lips(matte("#A06A68", 50))
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
      "A little fake blood at the corners of the mouth, plastic fangs, and suspenders.",
  },
  longlegs: {
    look: "A Longlegs face: pale cold-cream skin, red lips and long, stringy white-blond hair.",
    steps: [
      {
        title: "Cold-cream pale",
        howTo:
          "Pat on a foundation three shades lighter than your skin and set it with a white powder.",
        products: ["light foundation", "white setting powder"],
        render: makeup(paler(3)),
      },
      {
        title: "Red lips",
        howTo: "Wear a red lipstick, a little past the lip line.",
        products: ["red lipstick", "red lip liner"],
        render: makeup(
          lips(matte("#C2343C", 75)),
          lipLine("Large&Full1", "#B02A32", 70, 40, 40)
        ),
      },
      {
        title: "White-blond hair",
        howTo: "Finish with long, stringy white-blond hair.",
        products: ["long white blonde wig"],
        render: hair("#E7DFC8", 85, 20),
      },
    ],
    finish: "Round glasses and a pale suit.",
  },
  david: {
    look: "A David face from The Lost Boys: pale skin, smudged 80s punk eyes and a platinum mullet.",
    steps: [
      {
        title: "Pale skin",
        howTo:
          "Use a foundation a shade lighter than your skin, and shade under the cheekbones.",
        products: ["light foundation", "contour powder"],
        render: makeup(paler(1, 55), contour("#8C7A6E", 40)),
      },
      {
        title: "Punk eyes",
        howTo:
          "Smudge black eyeliner all around the eyes and a dark eyeshadow under them.",
        products: ["black kohl eyeliner", "dark eyeshadow"],
        render: makeup(
          liner("PandaSmudge1", matte(BLACK, 70)),
          shadow("1color23", matte("#3A2E34", 50))
        ),
      },
      {
        title: "Platinum mullet",
        howTo: "Finish with a spiky platinum-blonde mullet.",
        products: ["platinum blonde mullet wig"],
        render: hair("#ECE4CF", 85, 30),
      },
    ],
    finish: "Plastic fangs, an earring and a long black coat.",
  },
  "the-creeper": {
    look: "A Creeper face: dark olive shadows, a heavy brow, sunken black eyes and muted lips.",
    steps: [
      {
        title: "Leathery shadows",
        howTo:
          "Shade the edges of the face, the cheek hollows and the nose with an olive-brown eyeshadow, deepest in the hollows.",
        products: ["olive brown eyeshadow", "dark brown contour"],
        render: makeup(
          shading("Bronzer3", "#4E5A3A", 45),
          contour("#2E2A20", 50)
        ),
      },
      {
        title: "Sunken eyes",
        howTo:
          "Sweep black eyeshadow all around the eyes, and thicken the brows into a heavy, low line.",
        products: ["black eyeshadow", "black brow pencil"],
        render: makeup(
          shadow("1color57", matte(BLACK, 70)),
          brows("#1E1C14", 80, { name: "Straight2", thickness: 40 })
        ),
      },
      {
        title: "Muted lips",
        howTo: "Cover the lips with a muted olive-brown so they fade.",
        products: ["brown lipstick"],
        render: makeup(lips(matte("#6E6650", 55))),
      },
    ],
    finish: "A wide-brim hat and a long coat.",
  },
  "stripe-and-gizmo": {
    look: "A Stripe face: a green tint, dark green hollows, dark eyes rimmed in red, and white hair.",
    steps: [
      {
        title: "Gremlin tint",
        howTo:
          "Mix a little green color corrector into your foundation, pat it on thinly, and shade the hollows with a dark green eyeshadow.",
        products: ["green color corrector", "dark green eyeshadow"],
        render: makeup(tint("#6E8F4A"), contour("#3A5228", 45)),
      },
      {
        title: "Gremlin eyes",
        howTo:
          "Shade around the eyes with a dark brown eyeshadow and rim them with a red pencil.",
        products: ["dark brown eyeshadow", "red eyeliner pencil"],
        render: makeup(
          shadow("1color57", matte("#2A1A10", 60)),
          liner("FullRim7", matte("#8A1A1A", 55))
        ),
      },
      {
        title: "White hair",
        howTo: "Finish with white hair.",
        products: ["white hair color spray"],
        render: hair("#F2F2EE", 85, 20),
      },
    ],
    finish: "Spike the white hair into a mohawk with gel.",
  },
  "dr-frank-n-furter": {
    look: "A Frank-N-Furter face: dramatic dark brows, a black-and-purple cat eye, big lashes, deep red lips and black curls.",
    steps: [
      {
        title: "Base and brows",
        howTo:
          "Use a foundation a shade lighter than your skin, and draw the brows very dark, long and arched.",
        products: ["light foundation", "black brow pencil"],
        render: makeup(
          paler(1, 55),
          brows(BLACK, 80, { name: "Arrow13", curvature: 50, thickness: 20 })
        ),
      },
      {
        title: "Cat eye",
        howTo:
          "Blend purple under and inside the eye, sweep black eyeshadow up into a cat eye, line it sharp and add big lashes.",
        products: ["purple eyeshadow", "black eyeshadow", "false eyelashes"],
        render: makeup(
          shadow("2colors164", matte("#5A2A6A", 70), matte(BLACK, 75)),
          liner("OpenWings3", matte(BLACK, 75)),
          lashes("Winged1")
        ),
      },
      {
        title: "Deep red lips",
        howTo: "Line the lips dark and fill them with a deep red.",
        products: ["deep red lipstick", "dark lip liner"],
        render: makeup(
          lips(matte("#6E0E1E", 85)),
          lipLine("Natural1", "#3E0A12", 80, 40, 80)
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
    look: "An Annie Wilkes face: plain and no-nonsense, a touch of warmth on the cheeks, muted rose lips and a brown bob.",
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
    look: "A Patrick Bateman face after the morning routine: poreless, glowing skin and slicked-back dark hair.",
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
    finish: "A sharp suit, and a business card in your breast pocket.",
  },
  tarman: {
    look: "A Tarman face: tar-dark shadows creeping in from the edges, black eyes and lips, and ochre on the cheekbones.",
    steps: [
      {
        title: "Creeping tar",
        howTo:
          "Brush a black-brown eyeshadow in from the edges of the face, into the hollows and down the nose, as if tar is creeping in.",
        products: ["black brown eyeshadow", "dark contour"],
        render: makeup(
          shading("Bronzer3", "#1A140E", 55),
          contour("#0E0A08", 50)
        ),
      },
      {
        title: "Ochre and black eyes",
        howTo:
          "Dust a golden ochre eyeshadow over the cheekbones, and sweep black eyeshadow all around the eyes.",
        products: ["ochre eyeshadow", "black eyeshadow"],
        render: makeup(
          blush("Oblique2", "#B5862E", 45),
          shadow("1color57", matte(BLACK, 70))
        ),
      },
      {
        title: "Black lips",
        howTo: "Wear a black lipstick.",
        products: ["black lipstick"],
        render: makeup(lips(matte("#14100C", 80))),
      },
    ],
    finish:
      "Dab clear lip gloss over the dark patches so they look wet and sticky.",
  },
  "the-zombie": {
    look: "A 1968 zombie face: an ashen gray-green tint, sunken cheeks, bruised eyes and gray lips.",
    steps: [
      {
        title: "Ashen skin",
        howTo:
          "Mix a little green color corrector into a light foundation, pat it on thinly, and sink the cheeks with a gray eyeshadow.",
        products: [
          "light foundation",
          "green color corrector",
          "gray eyeshadow",
        ],
        render: makeup(tint("#B9BCAE"), contour("#6E7264", 50)),
      },
      {
        title: "Dead eyes",
        howTo:
          "Layer a green eyeshadow over the lids and a black-purple one under the eyes, then line all around in black.",
        products: [
          "green eyeshadow",
          "dark purple eyeshadow",
          "black eyeliner",
        ],
        render: makeup(
          shadow("2colors25", matte("#5E7A4E", 55), matte("#2A1E2E", 70)),
          liner("FullRim7", matte(BLACK, 60))
        ),
      },
      {
        title: "Gray lips",
        howTo: "Wear a gray lipstick.",
        products: ["gray lipstick"],
        render: makeup(lips(matte("#7E7A7A", 60))),
      },
    ],
    finish:
      "A trickle of fake blood from the corner of the mouth, and some dirt on torn clothes.",
  },
  "the-lipstick-face-demon": {
    look: "A Lipstick-Face Demon face: a red tint and red cheeks, black around the eyes, black lips and black hair.",
    steps: [
      {
        title: "Red face",
        howTo:
          "Mix a little red face paint into your foundation, pat it on thinly, and blend a strong red blush over the cheeks.",
        products: ["red face paint", "red cream blush"],
        render: makeup(tint("#B3121B"), blush("Round2", "#B3121B", 55)),
      },
      {
        title: "Black eyes",
        howTo:
          "Sweep black eyeshadow all around the eyes and smudge it up and out.",
        products: ["black eyeshadow"],
        render: makeup(
          shadow("1color57", matte(BLACK, 70)),
          liner("PandaSmudge11", matte(BLACK, 70))
        ),
      },
      {
        title: "Black lips",
        howTo:
          "Wear a black lipstick and take it a little past the corners with a black lip liner.",
        products: ["black lipstick", "black lip liner"],
        render: makeup(
          lips(matte(BLACK, 85)),
          lipLine("Wider1", BLACK, 75, 40, 40)
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
      "Draw a few black flame shapes up from the jaw with a black eyeliner, and wear black clothes.",
  },
  "eric-draven": {
    look: "An Eric Draven face from The Crow: pale skin, black smudged eyes, black lips and black hair.",
    steps: [
      {
        title: "Pale base",
        howTo:
          "Pat on a foundation two or three shades lighter than your skin, a little uneven, and set it with a white powder.",
        products: ["light foundation", "white setting powder"],
        render: makeup(paler(3)),
      },
      {
        title: "Black eyes",
        howTo:
          "Pack a matte black eyeshadow on the lids and under the eyes, past their natural shape, and smudge it.",
        products: ["matte black eyeshadow", "black kohl eyeliner"],
        render: makeup(
          shadow("1color57", matte(BLACK, 70)),
          liner("PandaSmudge11", matte(BLACK, 75))
        ),
      },
      {
        title: "Black lips",
        howTo: "Wear a black lipstick.",
        products: ["black lipstick"],
        render: makeup(lips(matte(BLACK, 85))),
      },
      {
        title: "Black hair",
        howTo: "Finish with long black hair.",
        products: ["long black wig"],
        render: hair("#0F0F0F", 90, 35),
      },
    ],
    finish:
      "With a liquid eyeliner, draw a thin line down through each eye and one from each corner of the mouth.",
  },
  "pamela-voorhees": {
    look: "A Pamela Voorhees face: plain 1980 makeup with soft blue lids, coral lips and short light-brown hair.",
    steps: [
      {
        title: "Soft blue lids",
        howTo:
          "Wash a soft powder-blue eyeshadow over the lids and add a little mascara.",
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
    finish: "Pull the hair back and wear a cardigan.",
  },
  "the-invisible-man": {
    look: "An Invisible Man face, fading out: pale skin, dark goggle-like eyes and colorless lips, before the bandages.",
    steps: [
      {
        title: "Fading skin",
        howTo:
          "Pat on a foundation three shades lighter than your skin, and shade it lightly gray at the edges.",
        products: ["light foundation", "gray contour powder"],
        render: makeup(paler(3), contour("#A8A8A4", 35)),
      },
      {
        title: "Goggle eyes",
        howTo: "Sweep black eyeshadow in a round shape all around each eye.",
        products: ["black eyeshadow"],
        render: makeup(shadow("1color57", matte(BLACK, 70))),
      },
      {
        title: "Colorless lips",
        howTo: "Dab a little of your foundation over the lips.",
        products: ["light foundation"],
        render: makeup(lips(matte("#D8CEC6", 45))),
      },
    ],
    finish:
      "Wrap white gauze loosely around your head, and add round dark sunglasses and a hat.",
  },
  "sweeney-todd": {
    look: "A Sweeney Todd face: pale skin, heavy red-rimmed dark circles, dark lips and black hair.",
    steps: [
      {
        title: "Pale base",
        howTo:
          "Use a matte foundation two shades lighter than your skin, and shade under the cheekbones.",
        products: ["light matte foundation", "gray contour powder"],
        render: makeup(paler(2), contour("#7E746C", 45)),
      },
      {
        title: "Haunted eyes",
        howTo:
          "Shade the lids dark, put a red eyeshadow under the eyes, and rim them in a dark red.",
        products: ["dark eyeshadow", "red eyeshadow", "dark red eyeliner"],
        render: makeup(
          shadow("2colors25", matte("#3A2E36", 70), matte("#7A2A2E", 65)),
          liner("FullRim7", matte("#5A1A1E", 55))
        ),
      },
      {
        title: "Dark lips",
        howTo: "Wear a dark mauve-gray lipstick.",
        products: ["dark mauve lipstick"],
        render: makeup(lips(matte("#5A4048", 70))),
      },
      {
        title: "Black hair",
        howTo: "Finish with frizzy black hair.",
        products: ["sweeney todd wig"],
        render: hair("#151515", 85, 20),
      },
    ],
    finish:
      "Spray a white streak into the front of your hair with white hair color spray.",
  },
  "lestat-de-lioncourt": {
    look: "A Lestat face: luminous pale skin, blond brows, pale mauve lips and golden-blond hair.",
    steps: [
      {
        title: "Luminous skin",
        howTo:
          "Use a glowy foundation two shades lighter than your skin, and add a soft highlight on the cheekbones and nose.",
        products: ["luminous foundation", "liquid highlighter"],
        render: makeup(paler(2, 65, 40), glow("#FFFFFF", 50)),
      },
      {
        title: "Blond brows, pale lips",
        howTo: "Tint the brows blond, and wear a pale mauve satin lipstick.",
        products: ["blonde brow gel", "pale mauve lipstick"],
        render: makeup(brows("#D3B676", 70), lips(satin("#C79A9E", 55))),
      },
      {
        title: "Golden hair",
        howTo: "Finish with long golden-blond hair.",
        products: ["long golden blonde wig"],
        render: hair("#D8B66E", 85, 40),
      },
    ],
    finish:
      "Draw faint blue veins at the temples with a blue eyeliner, and add plastic fangs.",
  },
  "georgie-denbrough": {
    look: "A Georgie face after the storm drain: a cold blue-gray tint, bruised yellow and purple eyes and bluish lips.",
    steps: [
      {
        title: "Cold skin",
        howTo:
          "Mix a little blue color corrector into a light foundation, pat it on thinly, and shade the cheeks with a gray eyeshadow.",
        products: [
          "light foundation",
          "blue color corrector",
          "gray eyeshadow",
        ],
        render: makeup(tint("#C4CDD0"), contour("#7E8A90", 40)),
      },
      {
        title: "Bruised eyes",
        howTo:
          "Blend a sickly yellow-green eyeshadow over the lids and a purple one under the eyes.",
        products: ["yellow green eyeshadow", "purple eyeshadow"],
        render: makeup(
          shadow("2colors25", matte("#A6A85E", 55), matte("#4A3E52", 65))
        ),
      },
      {
        title: "Bluish lips",
        howTo: "Dab a cold blue lipstick onto the lips.",
        products: ["blue lipstick"],
        render: makeup(lips(matte("#6E7A94", 60))),
      },
    ],
    finish: "Wet your hair, wear a yellow raincoat and carry a paper boat.",
  },
  "the-leprechaun": {
    look: "A Leprechaun face: ruddy cheeks, thick ginger brows, green lids and ginger hair.",
    steps: [
      {
        title: "Ruddy cheeks",
        howTo:
          "Rub a red blush wide over the cheeks, and shade under the cheekbones with a warm brown.",
        products: ["red cream blush", "warm brown contour"],
        render: makeup(blush("Round2", "#C2443A", 55), contour("#7A5240", 40)),
      },
      {
        title: "Brows and lids",
        howTo:
          "Thicken the brows with a ginger pencil, and wash a green eyeshadow over the lids.",
        products: ["ginger brow pencil", "green eyeshadow"],
        render: makeup(
          brows("#A4421C", 80, { name: "Original5", thickness: 40 }),
          shadow("1color8", matte("#3E7A3A", 55))
        ),
      },
      {
        title: "Ginger hair",
        howTo: "Finish with curly ginger hair.",
        products: ["curly ginger wig"],
        render: hair("#B5541C", 85, 25),
      },
    ],
    finish: "A fake red beard, the green hat and a few chocolate gold coins.",
  },
  "mr-boogie-bughuul": {
    look: "A Bughuul face: pale skin, darkened eyes, black lips and long black hair.",
    steps: [
      {
        title: "Pale base",
        howTo:
          "Pat on a foundation three shades lighter than your skin, down your neck too, and shade the hollows lightly gray.",
        products: ["light foundation", "gray contour powder"],
        render: makeup(paler(3), contour("#8E8E8A", 40)),
      },
      {
        title: "Dark eyes",
        howTo: "Darken the lids and under the eyes with a black eyeshadow.",
        products: ["black eyeshadow"],
        render: makeup(shadow("1color23", matte("#1E1E1E", 70))),
      },
      {
        title: "Black lips",
        howTo:
          "Wear a black lipstick, lined a little past the edges and blurred.",
        products: ["black lipstick", "black lip liner"],
        render: makeup(
          lips(matte(BLACK, 85)),
          lipLine("Large&Full1", BLACK, 75, 40, 40)
        ),
      },
      {
        title: "Long black hair",
        howTo: "Finish with long black hair.",
        products: ["long black wig"],
        render: hair("#111111", 90, 25),
      },
    ],
    finish: "A long black coat.",
  },
  "ellen-ripley": {
    look: "A Ripley face on the Nostromo: clean and tired, with shadowed eyes and dark curly hair.",
    steps: [
      {
        title: "Long-shift shadows",
        howTo:
          "Skip the makeup; just shade a little brown-gray under the eyes and at the edges of the face.",
        products: ["taupe eyeshadow"],
        render: makeup(
          shadow("1color23", matte("#6A5A54", 40)),
          shading("Bronzer3", "#7A6A5E", 30)
        ),
      },
      {
        title: "Curly hair",
        howTo: "Finish with dark-brown curly hair.",
        products: ["curly dark brown wig"],
        render: hair("#3A281C", 80, 25),
      },
    ],
    finish: "An olive flight suit and a cat carrier.",
  },
  slappy: {
    look: "A Slappy face: a pale dummy finish, shaded lids, thick arched black brows, rosy cheeks, a red grin and slick black hair.",
    steps: [
      {
        title: "Dummy base",
        howTo:
          "Use a foundation a shade lighter than your skin, and shade the lids up under the brows with a brown eyeshadow.",
        products: ["light foundation", "brown eyeshadow"],
        render: makeup(paler(1), shadow("1color67", matte("#9A7A6A", 50))),
      },
      {
        title: "Brows and cheeks",
        howTo:
          "Draw thick, high-arched black brows and blend round rosy cheeks.",
        products: ["black brow pencil", "rose cream blush"],
        render: makeup(
          brows(BLACK, 80, { name: "HighArch4", curvature: 40, thickness: 40 }),
          blush("Circle2", "#D8505A", 60)
        ),
      },
      {
        title: "Red grin",
        howTo: "Wear a bright red lipstick, a little wider than your lips.",
        products: ["bright red lipstick", "red lip liner"],
        render: makeup(
          lips(matte("#C21E2C", 85), "smile"),
          lipLine("Wider1", "#A01824", 75, 40, 50)
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
      "Draw a black line from each corner of the mouth down to the chin with eyeliner.",
  },
  "john-carver": {
    look: "A John Carver face in the pilgrim mask's colors: a warm orange tint, dark eyes, flat brows and small pursed lips.",
    steps: [
      {
        title: "Orange tint",
        howTo:
          "Mix a little orange face paint into your foundation and pat it on thinly.",
        products: ["orange face paint"],
        render: makeup(tint("#E08A4E", 25)),
      },
      {
        title: "Dark eyes",
        howTo:
          "Sweep black eyeshadow all around the eyes, and draw flat, straight brows with a brown pencil.",
        products: ["black eyeshadow", "brown brow pencil"],
        render: makeup(
          shadow("1color57", matte(BLACK, 70)),
          brows("#6A3A20", 70, { name: "Straight2" })
        ),
      },
      {
        title: "Pursed lips",
        howTo: "Wear a muted orange-brown lipstick, kept small.",
        products: ["orange brown lipstick", "lip liner"],
        render: makeup(
          lips(matte("#B06A52", 70), "pouty"),
          lipLine("Small1", "#8A4A36", 70, 40, 70)
        ),
      },
    ],
    finish: "A pilgrim hat and a black jumpsuit.",
  },
  blade: {
    look: "A Blade face: matte, sharply sculpted skin and clean, defined brows behind the shades.",
    steps: [
      {
        title: "Sculpted skin",
        howTo:
          "Mattify the skin, and sculpt under the cheekbones, the temples and the jaw with a deep-brown contour.",
        products: ["mattifying powder", "deep brown contour"],
        render: makeup(
          contour("#3A2418", 45),
          shading("Bronzer3", "#5A3A24", 35)
        ),
      },
      {
        title: "Sharp brows",
        howTo: "Define the brows clean and straight.",
        products: ["brow pencil"],
        render: makeup(
          brows(BLACK, 65, { name: "Straight2", thickness: 10, definition: 80 })
        ),
      },
    ],
    finish: "Narrow black sunglasses and a long black coat.",
  },
  "danny-torrance": {
    look: "A Danny Torrance face: pale, scared and sleepless, with dark circles and a brown 70s shag.",
    steps: [
      {
        title: "Sleepless face",
        howTo:
          "Use a sheer foundation a shade lighter than your skin, and shade dark circles under the eyes.",
        products: ["light foundation", "gray purple eyeshadow"],
        render: makeup(paler(1, 50), shadow("1color23", matte("#5E4E58", 50))),
      },
      {
        title: "Brown shag",
        howTo: "Finish with a brown 70s shag.",
        products: ["brown shag wig"],
        render: hair("#6A4A2E", 80, 25),
      },
    ],
    finish: "A red rocket sweater, and a raised finger: 'Redrum.'",
  },
  "sidney-prescott": {
    look: "A Sidney Prescott face from '96: minimal 90s makeup with mascara, a peachy-brown lip and dark-brown hair.",
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
          lips(satin("#A8645A", 60))
        ),
      },
      {
        title: "Dark-brown hair",
        howTo: "Finish with straight dark-brown hair.",
        products: ["dark brown wig"],
        render: hair("#2E2018", 80, 30),
      },
    ],
    finish: "A denim jacket and a cordless phone.",
  },
  "ellen-hutter": {
    look: "An Ellen Hutter face: luminous pallor, hollow taupe-brown eyes, gray-shaded cheeks, muted brown lips and no blush.",
    steps: [
      {
        title: "Pallor",
        howTo:
          "Use a sheer, luminous foundation a shade lighter than your skin, and shade under the cheekbones with a gray-ish contour.",
        products: ["luminous foundation", "cool gray contour"],
        render: makeup(paler(1, 55, 35), contour("#8E8378", 45)),
      },
      {
        title: "Hollow eyes",
        howTo:
          "Wash a taupe-brown eyeshadow over the lids and take it deep under the eyes, darker there.",
        products: ["taupe eyeshadow", "cool brown eyeshadow"],
        render: makeup(
          shadow("2colors25", matte("#8B7B6B", 60), matte("#5A4840", 65))
        ),
      },
      {
        title: "Muted lips",
        howTo:
          "Line and fill the lips with a muted cool brown, and skip the blush.",
        products: ["cool brown lip liner"],
        render: makeup(lips(matte("#8E6A62", 60))),
      },
      {
        title: "Brown hair",
        howTo: "Finish with brown hair.",
        products: ["brown wig"],
        render: hair("#5A4030", 80, 25),
      },
    ],
    finish:
      "Braid the hair into a rope updo and wear a white nightgown; a dab of lip oil on the skin reads as fever.",
  },
  "billy-chapman-killer-santa": {
    look: "A Killer Santa face: pale and cold, rosy red cheeks, red-rimmed eyes and snow-white hair.",
    steps: [
      {
        title: "Rosy cheeks",
        howTo:
          "Use a sheer foundation a shade lighter than your skin, and blend round, rosy red cheeks.",
        products: ["light foundation", "red cream blush"],
        render: makeup(paler(1, 50), blush("Circle2", "#C8323C", 60)),
      },
      {
        title: "Red-rimmed eyes",
        howTo:
          "Rim the eyes with a red pencil and shade dark circles under them.",
        products: ["red eyeliner pencil", "dark eyeshadow"],
        render: makeup(
          liner("FullRim7", matte("#B8323A", 55)),
          shadow("1color23", matte("#4A3036", 50))
        ),
      },
      {
        title: "White hair",
        howTo: "Finish with snow-white hair.",
        products: ["white santa wig"],
        render: hair("#F0EEE8", 85, 20),
      },
    ],
    finish:
      "A Santa suit and beard, with a little fake blood on the white fur trim.",
  },
  alice: {
    look: "An Alice face from Resident Evil: natural skin, soft brown eyes, a peachy-nude lip and choppy blonde hair.",
    steps: [
      {
        title: "Natural face",
        howTo:
          "Wash a soft brown over the lids, add mascara, and wear a peachy-nude satin lipstick.",
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
    finish: "A red dress and boots, scuffed with a little dirt.",
  },
}
