"use client"

import { useState } from "react"
import { db } from "@/lib/firebase"
import { doc, setDoc } from "firebase/firestore"
import { format } from "date-fns"

interface ManualSaveButtonProps {
  user: any
  currentScore: number
}

export default function ManualSaveButton({ user, currentScore }: ManualSaveButtonProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState("")

  const manualSave = async () => {
    if (!user) {
      setMessage("❌ No user logged in")
      return
    }

    setIsSaving(true)
    setMessage("Saving...")

    try {
      const today = format(new Date(), "yyyy-MM-dd")
      const docId = `${user.uid}_${today}`

      console.log("Manual save attempt:", {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        score: currentScore,
        date: today,
        docId: docId,
      })

      await setDoc(doc(db, "scores", docId), {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        score: currentScore,
        date: today,
      })

      setMessage("✅ Score saved manually!")
      console.log("✅ Manual save successful!")
    } catch (error: any) {
      console.error("❌ Manual save error:", error)
      setMessage(`❌ Error: ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div style={{ margin: "0.5rem 0" }}>
      <button
        onClick={manualSave}
        disabled={isSaving}
        style={{
          backgroundColor: "#5d273f",
          color: "white",
          border: "none",
          padding: "0.4rem 0.8rem",
          borderRadius: "8px",
          cursor: isSaving ? "not-allowed" : "pointer",
          opacity: isSaving ? 0.6 : 1,
          fontSize: "0.8rem",
        }}
      >
        {isSaving ? "Saving..." : "Manual Save Score"}
      </button>
      {message && <p style={{ color: "white", fontSize: "0.8rem", marginTop: "0.3rem" }}>{message}</p>}
    </div>
  )
}
