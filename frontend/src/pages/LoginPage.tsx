import { useEffect, useState, type FormEvent } from 'react';
import { isAxiosError } from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService.ts';
import { UserRoleValue, type UserRoleValue as UserRoleValueType } from '../types/index.ts';
import FormField from '../components/auth/FormField.tsx';
import PasswordField from '../components/auth/PasswordField.tsx';
import PasswordStrengthMeter from '../components/auth/PasswordStrengthMeter.tsx';
import LiveAuctionShowcase from '../components/auth/LiveAuctionShowcase.tsx';
import { AlertTriangleIcon, ArrowRightIcon, ClockIcon, HammerIcon, MailIcon, ShieldIcon, UserIcon, WalletIcon } from '../components/icons.tsx';
import styles from './LoginPage.module.css';

type Tab = 'login' | 'register';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ROLE_OPTIONS: { value: UserRoleValueType; label: string }[] = [
  { value: UserRoleValue.Buyer, label: 'Comprador' },
  { value: UserRoleValue.Seller, label: 'Vendedor' },
  { value: UserRoleValue.BuyerAndSeller, label: 'Ambos' },
];

function getErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError<{ message?: string }>(err)) {
    return err.response?.data?.message ?? fallback;
  }
  return fallback;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [tab, setTab] = useState<Tab>('login');

  // Si ya hay sesión, esta pantalla no debería verse.
  useEffect(() => {
    if (authService.isAuthenticated()) {
      navigate('/', { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function switchTab(next: Tab) {
    setTab(next);
    setLoginError(null);
    setRegisterError(null);
  }

  // ---------- Login ----------
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginSubmitting, setLoginSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [justRegistered, setJustRegistered] = useState(false);

  async function handleLoginSubmit(e: FormEvent) {
    e.preventDefault();
    setLoginError(null);

    if (!loginEmail.trim() || !loginPassword) {
      setLoginError('Completá tu correo y contraseña.');
      return;
    }
    if (!EMAIL_REGEX.test(loginEmail.trim())) {
      setLoginError('Ingresá un correo válido.');
      return;
    }
    if (loginPassword.length < 3) {
      setLoginError('La contraseña debe tener al menos 3 caracteres.');
      return;
    }

    setLoginSubmitting(true);
    try {
      const result = await authService.login({ email: loginEmail.trim(), password: loginPassword });
      if (!result.success) {
        setLoginError(result.message || 'No se pudo iniciar sesión. Intentá de nuevo.');
        return;
      }
      // Vuelve a la ruta que pidió el login (si vino de una redirección de
      // ruta protegida) o al catálogo.
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from ?? '/', { replace: true });
    } catch (err) {
      setLoginError(getErrorMessage(err, 'No se pudo iniciar sesión. Intentá de nuevo.'));
    } finally {
      setLoginSubmitting(false);
    }
  }

  function fillDemoAccount() {
    setLoginEmail('comprador1@test.com');
    setLoginPassword('123');
    setJustRegistered(false);
  }

  // ---------- Registro ----------
  const [name, setName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [role, setRole] = useState<UserRoleValueType>(UserRoleValue.Buyer);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [registerSubmitting, setRegisterSubmitting] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);

  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const canSubmitRegister =
    name.trim().length > 0 &&
    registerEmail.trim().length > 0 &&
    password.length >= 3 &&
    password === confirmPassword &&
    acceptedTerms;

  async function handleRegisterSubmit(e: FormEvent) {
    e.preventDefault();
    setRegisterError(null);

    if (!name.trim() || !registerEmail.trim() || !password) {
      setRegisterError('Completá todos los campos obligatorios.');
      return;
    }
    if (!EMAIL_REGEX.test(registerEmail.trim())) {
      setRegisterError('Ingresá un correo válido.');
      return;
    }
    if (password.length < 3) {
      setRegisterError('La contraseña debe tener al menos 3 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setRegisterError('Las contraseñas no coinciden.');
      return;
    }
    if (!acceptedTerms) {
      setRegisterError('Tenés que aceptar los Términos y Condiciones.');
      return;
    }

    setRegisterSubmitting(true);
    try {
      await authService.register({ name: name.trim(), email: registerEmail.trim(), password, role });
      // No inicia sesión automáticamente: pasa a login con el correo precargado.
      setTab('login');
      setLoginEmail(registerEmail.trim());
      setLoginPassword('');
      setJustRegistered(true);
      setName('');
      setRegisterEmail('');
      setPassword('');
      setConfirmPassword('');
      setAcceptedTerms(false);
      setRole(UserRoleValue.Buyer);
    } catch (err) {
      setRegisterError(getErrorMessage(err, 'No se pudo crear la cuenta. Intentá de nuevo.'));
    } finally {
      setRegisterSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.leftPanel} aria-hidden="true">
        <div>
          <div className={styles.brandRow}>
            <div className={styles.logoRow}>
              <span className={styles.logoIcon}>
                <HammerIcon width={18} height={18} />
              </span>
              <span className={styles.logoText}>
                Subasta<span>Ya</span>
              </span>
            </div>
            <span className={styles.livePill}>
              <span className={styles.pulseDot} />
              Pujas en vivo
            </span>
          </div>
          <h1 className={styles.heroTitle}>Subastas en tiempo real con respaldo seguro</h1>
          <p className={styles.heroSubtitle}>
            Pujá desde tu billetera digital. Tus fondos quedan retenidos en garantía hasta que la entrega se
            confirma.
          </p>
        </div>

        <LiveAuctionShowcase />

        <div className={styles.benefits}>
          <div className={styles.benefitItem}>
            <span className={styles.benefitIcon}>
              <ClockIcon width={20} height={20} />
            </span>
            <span className={styles.benefitTitle}>Tiempo real</span>
            <span className={styles.benefitText}>Contadores y pujas actualizados al instante.</span>
          </div>
          <div className={styles.benefitItem}>
            <span className={styles.benefitIcon}>
              <WalletIcon width={20} height={20} />
            </span>
            <span className={styles.benefitTitle}>Billetera digital</span>
            <span className={styles.benefitText}>Cargá saldo y pujá sin demoras.</span>
          </div>
          <div className={styles.benefitItem}>
            <span className={styles.benefitIcon}>
              <ShieldIcon width={20} height={20} />
            </span>
            <span className={styles.benefitTitle}>Pago en garantía</span>
            <span className={styles.benefitText}>Escrow que protege a comprador y vendedor.</span>
          </div>
        </div>
      </div>

      <div>
        <div className={styles.mobileLogo}>
          <span className={styles.logoIcon}>
            <HammerIcon width={18} height={18} />
          </span>
          <span className={styles.logoText} style={{ marginLeft: 10 }}>
            Subasta<span>Ya</span>
          </span>
        </div>

        <div className={styles.rightPanel}>
          <div className={styles.tabs}>
            <button
              type="button"
              className={`${styles.tabButton} ${tab === 'login' ? styles.tabButtonActive : ''}`}
              onClick={() => switchTab('login')}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              className={`${styles.tabButton} ${tab === 'register' ? styles.tabButtonActive : ''}`}
              onClick={() => switchTab('register')}
            >
              Registrarse
            </button>
          </div>

          {tab === 'login' ? (
            <>
              <h2 className={styles.formTitle}>Bienvenido de nuevo</h2>
              <p className={styles.formSubtitle}>Ingresá para seguir tus subastas y tu billetera.</p>

              <form className={styles.form} onSubmit={handleLoginSubmit}>
                {justRegistered && (
                  <div className={styles.banner}>Cuenta creada. Ya podés iniciar sesión.</div>
                )}
                {loginError && (
                  <div className={styles.errorBox}>
                    <AlertTriangleIcon width={16} height={16} />
                    <span>{loginError}</span>
                  </div>
                )}

                <FormField
                  id="login-email"
                  label="Correo electrónico"
                  icon={<MailIcon width={18} height={18} />}
                  type="email"
                  placeholder="tu@correo.com"
                  autoComplete="email"
                  value={loginEmail}
                  disabled={loginSubmitting}
                  onChange={(e) => {
                    setLoginEmail(e.target.value);
                    setJustRegistered(false);
                  }}
                />

                <PasswordField
                  id="login-password"
                  label="Contraseña"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={loginPassword}
                  disabled={loginSubmitting}
                  visible={showLoginPassword}
                  onToggleVisible={() => setShowLoginPassword((v) => !v)}
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                    setJustRegistered(false);
                  }}
                />

                <button
                  type="submit"
                  className={`${styles.submitButton} ${styles.submitPrimary}`}
                  disabled={loginSubmitting}
                >
                  {loginSubmitting ? (
                    <>
                      <span className={styles.spinner} />
                      Ingresando…
                    </>
                  ) : (
                    <>
                      Ingresar
                      <ArrowRightIcon width={16} height={16} />
                    </>
                  )}
                </button>

                <div className={styles.demoBox}>
                  <span>Probar con una cuenta de ejemplo</span>
                  <button type="button" className={styles.demoLink} onClick={fillDemoAccount}>
                    Usar demo
                  </button>
                </div>
              </form>

              <p className={styles.footerText}>
                ¿No tenés cuenta?{' '}
                <button type="button" className={styles.footerLink} onClick={() => switchTab('register')}>
                  Creá una gratis
                </button>
              </p>
            </>
          ) : (
            <>
              <h2 className={styles.formTitle}>Crear cuenta</h2>
              <p className={styles.formSubtitle}>Empezá a pujar en minutos.</p>

              <form className={styles.form} onSubmit={handleRegisterSubmit}>
                {registerError && (
                  <div className={styles.errorBox}>
                    <AlertTriangleIcon width={16} height={16} />
                    <span>{registerError}</span>
                  </div>
                )}

                <FormField
                  id="register-name"
                  label="Nombre completo"
                  icon={<UserIcon width={18} height={18} />}
                  placeholder="Ej. Juan Pérez"
                  autoComplete="name"
                  value={name}
                  disabled={registerSubmitting}
                  onChange={(e) => setName(e.target.value)}
                />

                <FormField
                  id="register-email"
                  label="Correo electrónico"
                  icon={<MailIcon width={18} height={18} />}
                  type="email"
                  placeholder="tu@correo.com"
                  autoComplete="email"
                  value={registerEmail}
                  disabled={registerSubmitting}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                />

                <div>
                  <label className={styles.formSubtitle} style={{ display: 'block', marginBottom: 6 }}>
                    ¿Cómo vas a usar SubastaYa?
                  </label>
                  <div className={styles.roleSelector}>
                    {ROLE_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={`${styles.roleOption} ${role === option.value ? styles.roleOptionActive : ''}`}
                        onClick={() => setRole(option.value)}
                        disabled={registerSubmitting}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <PasswordField
                    id="register-password"
                    label="Contraseña"
                    placeholder="Mínimo 3 caracteres"
                    autoComplete="new-password"
                    value={password}
                    disabled={registerSubmitting}
                    visible={showRegisterPassword}
                    onToggleVisible={() => setShowRegisterPassword((v) => !v)}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <div style={{ marginTop: 8 }}>
                    <PasswordStrengthMeter password={password} />
                  </div>
                </div>

                <PasswordField
                  id="register-confirm-password"
                  label="Confirmar contraseña"
                  placeholder="Repetí tu contraseña"
                  autoComplete="new-password"
                  value={confirmPassword}
                  disabled={registerSubmitting}
                  visible={showRegisterPassword}
                  onToggleVisible={() => setShowRegisterPassword((v) => !v)}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={passwordsMismatch}
                  helperText={passwordsMismatch ? 'Las contraseñas no coinciden.' : undefined}
                />

                <label className={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    disabled={registerSubmitting}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                  />
                  <span>
                    Acepto los <a href="#">Términos y Condiciones</a> y la <a href="#">Política de Privacidad</a>
                  </span>
                </label>

                <button
                  type="submit"
                  className={`${styles.submitButton} ${canSubmitRegister ? styles.submitSuccess : styles.submitDisabled}`}
                  disabled={!canSubmitRegister || registerSubmitting}
                >
                  {registerSubmitting ? (
                    <>
                      <span className={styles.spinner} />
                      Creando cuenta…
                    </>
                  ) : (
                    'Crear Cuenta'
                  )}
                </button>
              </form>

              <p className={styles.footerText}>
                ¿Ya tenés cuenta?{' '}
                <button type="button" className={styles.footerLink} onClick={() => switchTab('login')}>
                  Iniciá sesión aquí
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
