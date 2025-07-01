"use client"

import { useEffect, useState } from "react"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import BingoSquare from "@/components/bingo-square"
import Link from "next/link"
import { useParams } from "next/navigation"

interface BoardData {
  uid: string
  name: string
  email: string
  score: number
  date: string
  board: string[]
  markedSquares: boolean[]
  lastUpdated: string
}

export default function ViewBoard() {
  const params = useParams()
  const [boardData, setBoardData] = useState<BoardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const uid = params.uid as string
        const date = params.date as string
        const docId = `${uid}_${date}`

        console.log("Fetching board:", docId)

        const docRef = doc(db, "scores", docId)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          const data = docSnap.data() as BoardData
          console.log("Board data:", data)
          setBoardData(data)
        } else {
          setError("Board not found")
        }
      } catch (err: any) {
        console.error("Error fetching board:", err)
        setError("Error loading board: " + err.message)
      } finally {
        setLoading(false)
      }
    }

    if (params.uid && params.date) {
      fetchBoard()
    }
  }, [params.uid, params.date])

  if (loading) {
    return <div className="spinner">Loading board...</div>
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <nav className="nav">
          <Link href="/" className="nav-link">
            🏠 Bingo
          </Link>
          <span className="nav-separator">|</span>
          <Link href="/leaderboard" className="nav-link">
            🏆 Leaderboard
          </Link>
        </nav>
        <div className="app">
          <h1>❌ Error</h1>
          <p style={{ color: "white" }}>{error}</p>
          <Link href="/leaderboard" className="auth-button" style={{ display: "inline-block", marginTop: "1rem" }}>
            ← Back to Leaderboard
          </Link>
        </div>
      </div>
    )
  }

  if (!boardData) {
    return <div className="spinner">No board data found</div>
  }

  const score = boardData.markedSquares.filter((m, i) => m && i !== 12).length + 1

  return (
    <div className="min-h-screen">
      <nav className="nav">
        <Link href="/" className="nav-link">
          🏠 Bingo
        </Link>
        <span className="nav-separator">|</span>
        <Link href="/leaderboard" className="nav-link">
          🏆 Leaderboard
        </Link>
      </nav>

      <div className="app">
        <h1>{boardData.name}'s Board</h1>
        <h2>
          Score: {score} | Date: {boardData.date}
        </h2>
        <p style={{ color: "white", fontSize: "0.9rem", marginBottom: "1rem" }}>
          Last updated: {new Date(boardData.lastUpdated).toLocaleString()}
        </p>

        <div className="container">
          {boardData.board.map((phrase, i) => (
            <BingoSquare
              key={i}
              phrase={phrase}
              isMarked={boardData.markedSquares[i]}
              onClick={() => {}} // Read-only, no clicking
              isLogo={i === 12}
              logoSrc="/logo.png"
            />
          ))}
        </div>

        <Link href="/leaderboard" className="auth-button" style={{ display: "inline-block", marginTop: "2rem" }}>
          ← Back to Leaderboard
        </Link>
      </div>
    </div>
  )
}
