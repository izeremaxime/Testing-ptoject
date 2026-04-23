const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=[\]{};':"\\|,.<>\/])[A-Za-z\d@$!%*?&#^()_+\-=[\]{};':"\\|,.<>\/]{8,}$/;

export function validatePasswordStrength(password) {
  if (typeof password !== 'string') return false;
  return PASSWORD_REGEX.test(password);
}
