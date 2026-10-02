import "server-only"

/**
 * A picture of the Fitting Room as a response: a JPEG that never changes
 * under its URL (photos are named by their content, step pictures carry
 * their version), kept by this browser only, never by a shared cache.
 */
export async function picture(load: () => Promise<Uint8Array | null>) {
  try {
    const image = await load()
    if (!image) return new Response(null, { status: 404 })
    return new Response(image.slice(), {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "private, max-age=31536000, immutable",
        "Content-Disposition": "inline",
      },
    })
  } catch (error) {
    console.error("A Fitting Room picture could not be read.", error)
    return new Response(null, { status: 503 })
  }
}
