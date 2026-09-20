import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';

interface LoginFormValues {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginProps {
  onNavigateToRegister?: () => void;
  onLoginSuccess?: () => void;
}

export const Login: React.FC<LoginProps> = ({ onNavigateToRegister, onLoginSuccess }) => {
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setApiError(null);
    setSuccessMessage(null);

    try {
      // Intenta primero el endpoint especificado /api/auth/login
      let response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      // Si el backend expone /api/users/login en vez de /api/auth/login, intentar como fallback
      if (response.status === 404) {
        response = await fetch('/api/users/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: data.email,
            password: data.password,
          }),
        });
      }

      const result = await response.json().catch(() => null);

      if (!response.ok || (result && result.success === false)) {
        const errorMsg =
          result?.message ||
          result?.title ||
          'Credenciales inválidas. Por favor verifica tu correo y contraseña.';
        setApiError(errorMsg);
      } else {
        setSuccessMessage('¡Inicio de sesión exitoso! Redirigiendo...');
        if (result?.user) {
          localStorage.setItem('user', JSON.stringify(result.user));
        }
        setTimeout(() => {
          if (onLoginSuccess) {
            onLoginSuccess();
          }
        }, 800);
      }
    } catch (err) {
      setApiError('Error al conectar con el servidor. Revisa tu conexión.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0B0B12] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Contenedor principal de 2 columnas */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        
        {/* Columna Izquierda: Branding / Martillo */}
        <div className="relative overflow-hidden rounded-2xl bg-[#0E101A] border border-[#1C2030] p-8 sm:p-12 flex flex-col justify-between items-center text-center min-h-[460px]">
          
          {/* Elementos decorativos de fondo (líneas geométricas y puntos sutiles) */}
          <div className="absolute inset-0 pointer-events-none opacity-40">
            <svg
              className="absolute bottom-0 left-0 w-full h-48"
              viewBox="0 0 400 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern id="dotPattern" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1.2" fill="#2F8CFF" fillOpacity="0.25" />
                </pattern>
              </defs>
              <rect x="10" y="100" width="100" height="90" fill="url(#dotPattern)" />
              <path d="M0 160 L70 120 L150 170 L220 110" stroke="#2F8CFF" strokeWidth="1" strokeOpacity="0.4" />
              <path d="M30 190 L90 145 L170 185" stroke="#2F8CFF" strokeWidth="1" strokeOpacity="0.2" />
              <circle cx="70" cy="120" r="3" fill="#2F8CFF" />
              <circle cx="150" cy="170" r="2.5" fill="#2F8CFF" />
            </svg>
          </div>

          <div className="my-auto flex flex-col items-center z-10 w-full">
            {/* Ícono de martillo de subastas azul #2F8CFF */}
            <div className="mb-8 transform -rotate-12 transition-transform duration-300 hover:scale-105">
              <svg
                width="120"
                height="120"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-[0_10px_25px_rgba(47,140,255,0.35)]"
              >
                {/* Mango del martillo */}
                <rect
                  x="28"
                  y="52"
                  width="11"
                  height="44"
                  rx="5.5"
                  transform="rotate(-45 28 52)"
                  fill="#2F8CFF"
                />
                {/* Cabeza del martillo */}
                <rect
                  x="48"
                  y="16"
                  width="36"
                  height="22"
                  rx="7"
                  transform="rotate(45 48 16)"
                  fill="#2F8CFF"
                />
                {/* Extremo izquierdo/superior del cabezal */}
                <rect
                  x="63"
                  y="9"
                  width="12"
                  height="26"
                  rx="4"
                  transform="rotate(45 63 9)"
                  fill="#54A2FF"
                />
                {/* Extremo derecho/inferior del cabezal */}
                <rect
                  x="39"
                  y="33"
                  width="12"
                  height="26"
                  rx="4"
                  transform="rotate(45 39 33)"
                  fill="#1C6ED6"
                />
              </svg>
            </div>

            {/* Texto descriptivo */}
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-3">
              Gestor de Subastas
            </h1>
            <p className="text-slate-400 text-sm sm:text-base font-normal max-w-xs leading-relaxed">
              Compra, vende y puja en un solo lugar
            </p>
          </div>

          {/* Espacio para balancear el layout */}
          <div className="h-2 z-10"></div>
        </div>

        {/* Columna Derecha: Formulario de Login */}
        <div className="rounded-2xl bg-[#0E101A] border border-[#1C2030] p-6 sm:p-10 flex flex-col justify-center shadow-xl">
          
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Iniciar sesión
            </h2>
            <p className="text-slate-400 text-sm mt-1.5">
              Accede a tu cuenta para continuar
            </p>
          </div>

          {/* Feedback de errores de la API */}
          {apiError && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-red-400 text-xs sm:text-sm">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{apiError}</span>
            </div>
          )}

          {/* Mensaje de éxito */}
          {successMessage && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Input Correo electrónico */}
            <Input
              label="Correo electrónico"
              type="email"
              placeholder="tu@email.com"
              leftIcon={<Mail size={18} />}
              error={errors.email?.message}
              {...register('email', {
                required: 'El correo electrónico es requerido',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Ingresa un correo electrónico válido',
                },
              })}
            />

            {/* Input Contraseña */}
            <Input
              label="Contraseña"
              placeholder="••••••••"
              isPassword
              leftIcon={<Lock size={18} />}
              error={errors.password?.message}
              {...register('password', {
                required: 'La contraseña es requerida',
                minLength: {
                  value: 3,
                  message: 'La contraseña debe tener al menos 3 caracteres',
                },
              })}
            />

            {/* Fila Recordarme / Olvidaste contraseña */}
            <div className="flex items-center justify-between pt-1">
              <Checkbox
                label="Recordarme"
                {...register('rememberMe')}
              />
              <a
                href="#forgot-password"
                className="text-xs sm:text-sm text-[#2F8CFF] hover:text-[#55a2ff] hover:underline transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {/* Botón Principal Azul Brillante */}
            <div className="pt-2">
              <Button type="submit" variant="primary" isLoading={isLoading}>
                Iniciar sesión
              </Button>
            </div>

            {/* Separador */}
            <div className="relative my-6 flex items-center justify-center">
              <div className="w-full border-t border-[#1C2030]" />
              <span className="absolute bg-[#0E101A] px-3 text-xs text-slate-500">
                o continúa con
              </span>
            </div>

            {/* Botones de Terceros (Google & Apple) */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#131622] border border-[#22283a] text-xs sm:text-sm font-medium text-slate-200 hover:bg-[#1a1f30] hover:border-slate-700 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.54 0 2.92.54 4.01 1.43l3-3C17.2 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.4l3.7 2.9C6.5 7.4 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5.1 3.7-8.8z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.7c-.2-.7-.4-1.5-.4-2.7s.1-2 .4-2.7L1.9 6.4C.7 8.8 0 10.4 0 12s.7 3.2 1.9 5.6l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.3L1.9 15.9C3.7 19.7 7.5 23 12 23z"
                  />
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#131622] border border-[#22283a] text-xs sm:text-sm font-medium text-slate-200 hover:bg-[#1a1f30] hover:border-slate-700 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.92-3.37-7.93-8.1-12.02-14.19-5.91-8.7-10.4-18.72-13.48-30.07-3.08-11.35-4.62-22.18-4.62-32.49 0-14.7 3.59-26.69 10.77-35.98 7.18-9.29 16.27-13.98 27.27-14.07 5.1 0 10.86 1.34 17.29 4.03 6.43 2.68 10.27 4.1 11.51 4.24 1.54-.2 5.56-1.74 12.06-4.63 6.5-2.88 12.18-4.22 17.03-4.03 12.87.67 22.84 5.37 29.91 14.1-11.41 6.84-17.01 16.38-16.79 28.61.22 9.58 3.96 17.65 11.22 24.2 7.26 6.56 15.86 10.13 25.8 10.72-2.12 6.34-4.67 12.65-7.66 18.93zM119.22 31.84c0-7.39 2.63-14.39 7.89-21 5.26-6.61 11.83-10.55 19.7-11.84.14 1.13.21 2.14.21 3.03 0 7.33-2.73 14.4-8.19 21.22-5.46 6.82-12.14 10.66-20.04 11.51-.23-1.04-.35-2.01-.35-2.92z" />
                </svg>
                <span>Apple</span>
              </button>
            </div>

            {/* Footer de registro */}
            <div className="pt-4 text-center">
              <p className="text-xs sm:text-sm text-slate-400">
                ¿No tienes cuenta?{' '}
                <button
                  type="button"
                  onClick={onNavigateToRegister}
                  className="text-[#2F8CFF] hover:text-[#55a2ff] font-medium hover:underline transition-colors cursor-pointer"
                >
                  Regístrate
                </button>
              </p>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
};
