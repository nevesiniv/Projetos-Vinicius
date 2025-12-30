import './PasswordStrength.css';

function PasswordStrength({ password }) {
  const getStrength = (pwd) => {
    let score = 0;
    const checks = {
      length: pwd.length >= 8,
      lowercase: /[a-z]/.test(pwd),
      uppercase: /[A-Z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    };

    if (checks.length) score++;
    if (checks.lowercase) score++;
    if (checks.uppercase) score++;
    if (checks.number) score++;
    if (checks.special) score++;

    return { score, checks };
  };

  const { score, checks } = getStrength(password);

  const getStrengthLabel = () => {
    if (password.length === 0) return '';
    if (score <= 2) return 'Fraca';
    if (score <= 3) return 'Média';
    if (score <= 4) return 'Boa';
    return 'Forte';
  };

  const getStrengthClass = () => {
    if (password.length === 0) return '';
    if (score <= 2) return 'weak';
    if (score <= 3) return 'medium';
    if (score <= 4) return 'good';
    return 'strong';
  };

  if (password.length === 0) return null;

  return (
    <div className="password-strength">
      <div className="strength-bar">
        <div className={`strength-fill ${getStrengthClass()}`} style={{ width: `${(score / 5) * 100}%` }}></div>
      </div>
      <span className={`strength-label ${getStrengthClass()}`}>{getStrengthLabel()}</span>

      <ul className="strength-requirements">
        <li className={checks.length ? 'valid' : ''}>
          {checks.length ? '✓' : '○'} Mínimo 8 caracteres
        </li>
        <li className={checks.lowercase ? 'valid' : ''}>
          {checks.lowercase ? '✓' : '○'} Letra minúscula
        </li>
        <li className={checks.uppercase ? 'valid' : ''}>
          {checks.uppercase ? '✓' : '○'} Letra maiúscula
        </li>
        <li className={checks.number ? 'valid' : ''}>
          {checks.number ? '✓' : '○'} Número
        </li>
        <li className={checks.special ? 'valid' : ''}>
          {checks.special ? '✓' : '○'} Caractere especial
        </li>
      </ul>
    </div>
  );
}

export function validatePassword(password) {
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
  };

  const isValid = checks.length && checks.lowercase && checks.uppercase && checks.number;

  return {
    isValid,
    message: !isValid ? 'A senha deve ter no mínimo 8 caracteres, incluindo maiúscula, minúscula e número' : ''
  };
}

export default PasswordStrength;
