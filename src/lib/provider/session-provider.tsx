"use client"

import { SessionProvider, useSession } from "next-auth/react"

export function Session({children}:{children:React.ReactNode}){

    return <SessionProvider>{children}</SessionProvider>
    
}

export function SessionStatus() {
    const { data: session, status } = useSession();
  
    if (status === "loading") {
      return <p>Loading...</p>; // You can customize this as per your UI.
    }
  
    if (status === "authenticated") {
      return <p>Session is ON: {JSON.stringify(session)}</p>; // Shows session details.
    }
  
    return <p>Session is OFF</p>; // No active session.
  }