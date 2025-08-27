import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import { config } from '../../config/environment';
import { User } from '../../models/user/user.model';

// Inicializar cliente de Supabase
const supabase = createClient(
  config.supabase.url || '',
  config.supabase.anonKey || ''
);

// Funciones de autenticación local
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const generateToken = (user: User, expiresIn: string | number = '24h'): string => {
  const payload = { 
    id: user.id, 
    email: user.email,
    full_name: user.full_name,
    avatar_url: user.avatar_url,
    role: user.role
  };
  const options: SignOptions = { expiresIn: expiresIn as any };
  
  return jwt.sign(payload, config.jwtSecret, options);
};

// 🔐 MEJORA: Generar refresh token diferente con menos información
export const generateRefreshToken = (user: User): string => {
  const payload = { 
    id: user.id,
    type: 'refresh'  // Marcador para identificar refresh tokens
  };
  const options: SignOptions = { expiresIn: '7d' };
  
  return jwt.sign(payload, config.jwtSecret, options);
};

export const verifyToken = (token: string): any => {
  return jwt.verify(token, config.jwtSecret);
};

// Funciones de autenticación con Supabase
export const loginWithSupabase = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  return data;
};

export const registerWithSupabase = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) throw error;
  return data;
};

export const logoutWithSupabase = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const resetPasswordWithSupabase = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
}; 