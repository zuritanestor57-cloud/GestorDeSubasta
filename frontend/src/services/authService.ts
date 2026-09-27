import { isAxiosError } from 'axios';
import { api } from './api.ts';
import type { CreateUserDto, LoginDto, LoginResultDto, UserDto } from '../types/index.ts';

const USER_KEY = 'user';

// El backend no emite JWT: identifica al usuario por su id, así que la sesión
// se guarda como el UserDto que devuelve el login.
export const authService = {
  // POST /api/users
  async register(data: CreateUserDto): Promise<UserDto> {
    const res = await api.post<UserDto>('/api/users', data);
    return res.data;
  },

  // POST /api/users/login
  // Con credenciales inválidas el backend responde 400 con un LoginResultDto
  // (success: false); se devuelve tal cual en vez de lanzar el error.
  async login(credentials: LoginDto): Promise<LoginResultDto> {
    try {
      const res = await api.post<LoginResultDto>('/api/users/login', credentials);
      if (res.data.success && res.data.user) {
        localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
      }
      return res.data;
    } catch (error) {
      if (isAxiosError<LoginResultDto>(error) && error.response?.data?.success === false) {
        return error.response.data;
      }
      throw error;
    }
  },

  logout(): void {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('token');
  },

  getCurrentUser(): UserDto | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UserDto;
    } catch {
      return null;
    }
  },

  // Actualiza la copia guardada (ej. tras editar perfil o cambiar el saldo).
  setCurrentUser(user: UserDto): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  // Id del usuario en sesión; lanza si no hay sesión (lo usan los demás servicios).
  requireUserId(): number {
    const user = authService.getCurrentUser();
    if (!user) throw new Error('No hay un usuario autenticado.');
    return user.id;
  },

  isAuthenticated(): boolean {
    return authService.getCurrentUser() !== null;
  },
};
