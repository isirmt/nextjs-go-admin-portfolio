'use client'

import { backendBaseUrl } from "@/lib/config";
import { useEffect, useState } from "react"

export default function ClientPage() {
  const [serverStatus, setServerStatus] = useState<number>();
  useEffect(() => {
    const getResponse = async () => {
      try {
        const response = await fetch(`${backendBaseUrl}/healthz`);
        setServerStatus(response.status)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        setServerStatus(500)
      }
    }

    getResponse()
  }, [])

  return <main>
    Status: {serverStatus}
  </main>
}