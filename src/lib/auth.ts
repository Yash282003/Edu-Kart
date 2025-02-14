import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { db } from "./db";
import { compare } from "bcrypt";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(db),
    session:{
        strategy:'jwt'
    },
    // pages:{
    //     signIn:"/login"
    // },
  providers: [
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        email: { label: "Email", type: "email", placeholder: "test@gmail.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
       if(!credentials?.email || !credentials?.password) {
        return null;
       }

       const existingUser = await db.principal.findUnique({
        where: {email: credentials?.email }
       });
       if (!existingUser){
        return null;
       }else{
        console.log("signed in successfully")
       }
       const passwordMatch = await compare(credentials.password,existingUser.password) 

       if(!passwordMatch){
        return null;
       }
       return{
        id: existingUser.id + '',
        email: existingUser.email
       }
      },
    }),
  ],
};
