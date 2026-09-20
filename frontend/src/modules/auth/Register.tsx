import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Mail,
  Lock,
  User,
  ShoppingBag,
  Store,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

// Esquema de validación con Zod
const registerSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(2, 'El nombre debe tener al menos 2 caracteres'),
    lastName: z
      .string()
      .trim()
      .min(2, 'El apellido debe tener al menos 2 caracteres'),
    email: z
      .string()
      .trim()
      .email('Ingresa un correo electrónico válido'),
    password: z
      .string()
      .min(3, 'La contraseña debe tener al menos 3 caracteres'),
    confirmPassword: z
      .string()
      .min(3, 'Confirma tu contraseña'),
    role: z.enum(['Buyer', 'Seller'] as const, {
      message: 'Selecciona un rol',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export interface RegisterProps {
  onNavigateToLogin?: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onNavigateToLogin }) => {
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'Buyer',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setApiError(null);
    setSuccessMessage(null);

    try {
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        role: data.role,
      };

      // 1. Envío al endpoint solicitado /api/auth/register
      let response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      // 2. Fallback al backend de C# (/api/users) en caso de que auth/register devuelva 404
      if (response.status === 404) {
        response = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: `${data.firstName} ${data.lastName}`.trim(),
            email: data.email,
            password: data.password,
            role: data.role === 'Seller' ? 1 : 0, // 0: Buyer, 1: Seller
          }),
        });
      }

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMsg =
          result?.message ||
          result?.title ||
          'No se pudo registrar la cuenta. Verifica los datos e intenta nuevamente.';
        setApiError(errorMsg);
      } else {
        setSuccessMessage('¡Cuenta creada exitosamente! Redirigiendo al login...');
        setTimeout(() => {
          if (onNavigateToLogin) {
            onNavigateToLogin();
          }
        }, 1500);
      }
    } catch (err) {
      setApiError('Error al conectar con el servidor. Revisa tu conexión.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0B0B12] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Contenedor principal de 2 columnas con el mismo estilo de Login */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch my-6">
        
        {/* Columna Izquierda: Branding / Martillo (Reutilizada con la misma estética) */}
        <div className="relative overflow-hidden rounded-2xl bg-[#0E101A] border border-[#1C2030] p-8 sm:p-12 flex flex-col justify-between items-center text-center min-h-[500px]">
          
          {/* Elementos decorativos de fondo */}
          <div className="absolute inset-0 pointer-events-none opacity-40">
            <svg
              className="absolute bottom-0 left-0 w-full h-48"
              viewBox="0 0 400 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern id="regDotPattern" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1.2" fill="#2F8CFF" fillOpacity="0.25" />
                </pattern>
              </defs>
              <rect x="10" y="100" width="100" height="90" fill="url(#regDotPattern)" />
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
                <rect
                  x="28"
                  y="52"
                  width="11"
                  height="44"
                  rx="5.5"
                  transform="rotate(-45 28 52)"
                  fill="#2F8CFF"
                />
                <rect
                  x="48"
                  y="16"
                  width="36"
                  height="22"
                  rx="7"
                  transform="rotate(45 48 16)"
                  fill="#2F8CFF"
                />
                <rect
                  x="63"
                  y="9"
                  width="12"
                  height="26"
                  rx="4"
                  transform="rotate(45 63 9)"
                  fill="#54A2FF"
                />
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

            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-3">
              Gestor de Subastas
            </h1>
            <p className="text-slate-400 text-sm sm:text-base font-normal max-w-xs leading-relaxed">
              Compra, vende y puja en un solo lugar
            </p>
          </div>

          <div className="h-2 z-10"></div>
        </div>

        {/* Columna Derecha: Formulario de Registro */}
        <div className="rounded-2xl bg-[#0E101A] border border-[#1C2030] p-6 sm:p-10 flex flex-col justify-center shadow-xl">
          
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Crear cuenta
            </h2>
            <p className="text-slate-400 text-sm mt-1.5">
              Únete a la plataforma para comenzar
            </p>
          </div>

          {/* Feedback de errores */}
          {apiError && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-red-400 text-xs sm:text-sm">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{apiError}</span>
            </div>
          )}

          {/* Mensaje de éxito */}
          {successMessage && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5 text-emerald-400 text-xs sm:text-sm">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Fila Nombre y Apellido */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Input
                label="Nombre"
                placeholder="Juan"
                leftIcon={<User size={18} />}
                error={errors.firstName?.message}
                {...register('firstName')}
              />
              <Input
                label="Apellido"
                placeholder="Pérez"
                leftIcon={<User size={18} />}
                error={errors.lastName?.message}
                {...register('lastName')}
              />
            </div>

            {/* Input Correo electrónico */}
            <Input
              label="Correo electrónico"
              type="email"
              placeholder="tu@email.com"
              leftIcon={<Mail size={18} />}
              error={errors.email?.message}
              {...register('email')}
            />

            {/* Input Contraseña */}
            <Input
              label="Contraseña"
              placeholder="••••••••"
              isPassword
              leftIcon={<Lock size={18} />}
              error={errors.password?.message}
              {...register('password')}
            />

            {/* Input Confirmar Contraseña */}
            <Input
              label="Confirmar contraseña"
              placeholder="••••••••"
              isPassword
              leftIcon={<Lock size={18} />}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            {/* Selector de Rol: Comprador / Vendedor (Radio Group con 2 Cards) */}
            <div className="pt-1 flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-300">
                Selecciona tu rol
              </label>
              
              <div className="grid grid-cols-2 gap-3">
                {/* Card Comprador */}
                <button
                  type="button"
                  onClick={() => setValue('role', 'Buyer', { shouldValidate: true })}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                    selectedRole === 'Buyer'
                      ? 'border-[#2F8CFF] bg-[#2F8CFF]/10 text-white shadow-sm shadow-[#2F8CFF]/20 ring-1 ring-[#2F8CFF]'
                      : 'border-[#22283a] bg-[#131622] text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg mb-2 ${
                      selectedRole === 'Buyer'
                        ? 'bg-[#2F8CFF] text-white'
                        : 'bg-[#1a1f30] text-slate-400'
                    }`}
                  >
                    <ShoppingBag size={20} />
                  </div>
                  <span className="text-sm font-semibold">Comprador</span>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    Participa y puja
                  </span>
                </button>

                {/* Card Vendedor */}
                <button
                  type="button"
                  onClick={() => setValue('role', 'Seller', { shouldValidate: true })}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                    selectedRole === 'Seller'
                      ? 'border-[#2F8CFF] bg-[#2F8CFF]/10 text-white shadow-sm shadow-[#2F8CFF]/20 ring-1 ring-[#2F8CFF]'
                      : 'border-[#22283a] bg-[#131622] text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg mb-2 ${
                      selectedRole === 'Seller'
                        ? 'bg-[#2F8CFF] text-white'
                        : 'bg-[#1a1f30] text-slate-400'
                    }`}
                  >
                    <Store size={20} />
                  </div>
                  <span className="text-sm font-semibold">Vendedor</span>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    Publica y subasta
                  </span>
                </button>
              </div>

              {errors.role?.message && (
                <span className="text-xs text-red-400 mt-0.5">{errors.role.message}</span>
              )}
            </div>

            {/* Botón Principal Crear Cuenta */}
            <div className="pt-3">
              <Button type="submit" variant="primary" isLoading={isLoading}>
                Crear cuenta
              </Button>
            </div>

            {/* Footer de navegación a Login */}
            <div className="pt-3 text-center">
              <p className="text-xs sm:text-sm text-slate-400">
                ¿Ya tienes cuenta?{' '}
                <button
                  type="button"
                  onClick={onNavigateToLogin}
                  className="text-[#2F8CFF] hover:text-[#55a2ff] font-medium hover:underline transition-colors cursor-pointer"
                >
                  Inicia sesión
                </button>
              </p>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
};
