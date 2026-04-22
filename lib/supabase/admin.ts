export function getAdminEmail() {
  return process.env.ADMIN_EMAIL?.trim().toLowerCase() ?? null
}

export function isAdminEmail(email?: string | null) {
  const adminEmail = getAdminEmail()

  if (!adminEmail) {
    return true
  }

  return email?.trim().toLowerCase() === adminEmail
}
