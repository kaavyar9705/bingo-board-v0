"use client"

import type React from "react"

interface BingoSquareProps {
  phrase: string
  isMarked: boolean
  onClick: () => void
  isLogo: boolean
  logoSrc?: string
}

const BingoSquare: React.FC<BingoSquareProps> = ({ phrase, isMarked, onClick, isLogo, logoSrc }) => {
  return (
    <div onClick={onClick} className={`square ${isMarked ? "marked" : ""}`}>
      {isLogo ? (
        <img
          src={logoSrc || "/logo.png"}
          alt="Logo"
          style={{ maxWidth: "60px", maxHeight: "60px", objectFit: "contain" }}
        />
      ) : (
        phrase
      )}
    </div>
  )
}

export default BingoSquare
