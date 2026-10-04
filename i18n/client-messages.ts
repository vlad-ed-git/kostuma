import type { Messages } from "next-intl"

/**
 * The message namespaces client components use: all the browser is sent
 * (todo ENG-07). The rest, the Terms and the Privacy policy above all, is
 * rendered on the server only. i18n/client-messages.test.ts scans the
 * client code and fails when one it uses is missing here.
 */
export const CLIENT_NAMESPACES = [
  "Account",
  "App",
  "Auth",
  "AuthErrors",
  "Basket",
  "Costume",
  "Countdown",
  "CueMark",
  "Error",
  "Feedback",
  "FittingRoom",
  "Language",
  "Nav",
  "Pro",
  "Recaptcha",
] as const satisfies readonly (keyof Messages)[]

/** The part of a language's messages client components need. */
export function clientMessages(messages: Messages) {
  return Object.fromEntries(
    CLIENT_NAMESPACES.map((name) => [name, messages[name]])
  ) as Pick<Messages, (typeof CLIENT_NAMESPACES)[number]>
}
