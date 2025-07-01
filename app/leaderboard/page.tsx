"use client"

import { useEffect, useState } from "react"
import { db } from "@/lib/firebase"
import { collection, onSnapshot, query, orderBy } from "firebase/firestore"
import { format } from "date-fns"
import Link from "next/link"

interface ScoreEntry {
  uid: string
  name: string
  email: string
  score: number
  date: string
  board?: string[]
  markedSquares?: boolean[]
  lastUpdated?: string
}

export default function Leaderboard() {
  const [allScores, setAllScores] = useState<ScoreEntry[]>([])
  const [todayScores, setTodayScores] = useState<ScoreEntry[]>([])
  const [showAllTime, setShowAllTime] = useState(false)

  useEffect(() => {
    const today = format(new Date(), "yyyy-MM-dd")
    console.log("Today's date for leaderboard:", today)

    const unsubscribe = onSnapshot(
      query(collection(db, "scores"), orderBy("score", "desc")),
      (snapshot) => {
        const allData = snapshot.docs.map((doc) => {
          const data = doc.data() as ScoreEntry
          console.log("Score entry:", data)
          return data
        })

        console.log("All scores from database:", allData)

        // Filter for today's scores
        const todayData = allData.filter((entry) => entry.date === today)
        console.log("Today's scores:", todayData)

        setAllScores(allData)
        setTodayScores(todayData)
      },
      (error) => {
        console.error("Error fetching leaderboard data:", error)
        // Handle the case where collection doesn't exist yet
        if (error.code === "unavailable" || error.code === "not-found") {
          console.log("Scores collection doesn't exist yet - will be created when first score is saved")
          setAllScores([])
          setTodayScores([])
        }
      },
    )

    return () => unsubscribe()
  }, [])

  const displayScores = showAllTime ? allScores : todayScores
  const currentDate = format(new Date(), "MMMM d, yyyy")

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
        <h1>🏆 Leaderboard</h1>

        

        <h2 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>
          {showAllTime ? "All Time Scores" : `Today - ${currentDate}`}
        </h2>

        {displayScores.length === 0 ? (
          <div style={{ color: "white", textAlign: "center", margin: "2rem 0" }}>
            <p>No scores found {showAllTime ? "in the database" : "for today"}.</p>
            <p style={{ fontSize: "0.9rem", opacity: 0.8 }}>
              {showAllTime
                ? "The scores collection will be created when someone plays their first game!"
                : "Try switching to 'Show All Time' or play some games today."}
            </p>
            <p style={{ fontSize: "0.8rem", opacity: 0.6, marginTop: "1rem" }}>
              💡 Tip: Click some squares on the bingo board to save your first score!
            </p>
          </div>
        ) : (
          <table className="scores-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Name</th>
                <th>Score</th>
                <th>Date</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {displayScores.map((entry, i) => (
                <tr key={entry.uid + entry.date}>
                  <td>{i + 1}</td>
                  <td>
                    {entry.board && entry.markedSquares ? (
                      <Link
                        href={`/board/${entry.uid}/${entry.date}`}
                        style={{
                          color: "#5d273f",
                          textDecoration: "underline",
                          cursor: "pointer",
                        }}
                      >
                        {entry.name} 👁️
                      </Link>
                    ) : (
                      entry.name
                    )}
                  </td>
                  <td>{entry.score + 1}</td>
                  <td>{entry.date}</td>
                  <td style={{ fontSize: "0.8rem" }}>{entry.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div style={{ marginTop: "2rem", fontSize: "0.8rem", color: "white", opacity: 0.7 }}>
          <p>💡 Click on names with 👁️ to view their bingo boards!</p>
        </div>
      </div>
    </div>
  )
}
