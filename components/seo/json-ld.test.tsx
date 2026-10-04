import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { JsonLd } from "./json-ld"

describe("JsonLd", () => {
  it("can't be closed early by anything it holds", () => {
    const data = { name: "</script><script>alert(1)</script>" }
    const html = renderToStaticMarkup(<JsonLd data={data} />)
    // Its own end only.
    expect(html.match(/<\/script/gi)).toHaveLength(1)
    const [, body] =
      /^<script type="application\/ld\+json">([\s\S]*)<\/script>$/.exec(html) ??
      []
    expect(JSON.parse(body)).toEqual(data)
  })
})
