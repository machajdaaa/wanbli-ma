// Pojmenované enumy — generátor je nedokáže vytvořit, dokud BE nepřidá x-enum-varnames do spec.
// Hodnoty je potřeba ověřit s backendem.

export enum UserRole {
  User = 0,
  Leader = 1,
  Admin = 2,
}

export enum Gender {
  Unknown = 0,
  Male = 1,
  Female = 2,
}

export enum OrganisationInviteStatus {
  Pending = 0,
  Accepted = 1,
  Declined = 2,
}
