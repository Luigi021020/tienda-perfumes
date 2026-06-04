// Configuración de NextAuth para el panel administrativo
// Maneja el login y la sesión del administrador

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  // Usamos JWT para guardar la sesión (no necesita tabla extra en BD)
  session: {
    strategy: "jwt",
  },

  // Páginas personalizadas
  pages: {
    signIn: "/admin/login", // Redirige aquí cuando no está autenticado
  },

  providers: [
    Credentials({
      // Campos del formulario de login
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        // Verificar que vengan email y contraseña
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Buscar el usuario en la base de datos
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        // Si no existe el usuario, rechazar
        if (!user) return null;

        // Comparar la contraseña con el hash guardado en BD
        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        // Si la contraseña no coincide, rechazar
        if (!passwordMatch) return null;

        // Login exitoso — devolver datos del usuario
        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],

  callbacks: {
    // Agregar el id del usuario al token JWT
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    // Agregar el id del usuario a la sesión
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});