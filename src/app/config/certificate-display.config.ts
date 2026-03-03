/**
 * Single source of truth for certificate document display:
 * place name, seal text, and format labels used on /shared/certificate/* and /shared/indigency/*
 * Change these values to update all certificate views at once.
 */
export const CERTIFICATE_DISPLAY = {
  /** Full place name in header and footer (e.g. "Barangay Poblacion, Cebu City") */
  placeName: 'Barangay Poblacion, Cebu City',
  /** Short name for body text (e.g. "Barangay Poblacion") */
  placeShortName: 'Barangay Poblacion',
  /** City/municipality for seal and issuance line (e.g. "Cebu City") */
  sealCity: 'Cebu City',
  /** Issuance line: "at the Barangay Hall of [placeShortName], [sealCity]" */
  get issuancePlace(): string {
    return `Barangay Hall of ${this.placeShortName}, ${this.sealCity}`;
  },
  /** Footer text */
  get footerText(): string {
    return `${this.placeName} — Official Document`;
  },
  /** Seal line 1 */
  sealLine1: 'ASSOCIATION OF BARANGAY SECRETARIES',
  /** Seal line 2 (city in uppercase) */
  get sealLine2(): string {
    return this.sealCity.toUpperCase();
  },
};
