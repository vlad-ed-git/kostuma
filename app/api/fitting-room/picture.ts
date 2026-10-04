import "server-only"

/** A saved picture's name: Kostuma's own, nothing that could break a header. */
const FILE_NAME = /^[a-z0-9-]+\.jpg$/

/**
 * A picture of the Fitting Room as a response: a JPEG that never changes
 * under its URL (photos are named by their content, step pictures carry
 * their version), kept by this browser only, never by a shared cache.
 * Given a name (`named`), the same JPEG comes as a file to keep (todo
 * OPP-11); no name found, no picture.
 */
export async function picture(
  load: () => Promise<Uint8Array | null>,
  named?: () => Promise<string | null>
) {
  try {
    const [image, name] = await Promise.all([load(), named?.() ?? null])
    if (!image || (named && !name)) return new Response(null, { status: 404 })
    return new Response(image.slice(), {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "private, max-age=31536000, immutable",
        "Content-Disposition":
          name && FILE_NAME.test(name)
            ? `attachment; filename="${name}"`
            : named
              ? 'attachment; filename="kostuma.jpg"'
              : "inline",
      },
    })
  } catch (error) {
    console.error("A Fitting Room picture could not be read.", error)
    return new Response(null, { status: 503 })
  }
}
