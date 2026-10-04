/**
 * The visitor's consent to the photos' processing (todo SEC-03): ticked on
 * the confirm screen before each try-on starts, kept on the try-on with
 * its time and the version of the words agreed to
 * (FittingRoom.confirm.consent). A change to those words bumps the version.
 */
export const PHOTO_CONSENT_VERSION = "2026-10-04"

export type Consent = { version: string; at: number }
