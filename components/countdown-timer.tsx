'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'

interface CountdownTimerProps {
  endTime: string
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
  total: number
}

export function CountdownTimer({ endTime }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft(endTime))
  const [isEnded, setIsEnded] = useState(false)

  useEffect(() => {
    // Calculate initial time
    const initial = calculateTimeLeft(endTime)
    setTimeLeft(initial)
    setIsEnded(initial.total <= 0)

    // Set up interval to update every second
    const interval = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(endTime)
      setTimeLeft(newTimeLeft)
      
      if (newTimeLeft.total <= 0) {
        setIsEnded(true)
        clearInterval(interval)
      }
    }, 1000)

    // Cleanup interval on unmount
    return () => clearInterval(interval)
  }, [endTime])

  if (isEnded) {
    return (
      <Badge variant="destructive" className="text-sm font-semibold">
        Auction Ended
      </Badge>
    )
  }

  // Determine color based on time remaining
  const getColorClass = () => {
    if (timeLeft.days > 1) {
      return 'bg-green-100 text-green-800 border-green-200'
    } else if (timeLeft.days === 1 || timeLeft.hours > 1) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    } else {
      return 'bg-red-100 text-red-800 border-red-200'
    }
  }

  // Format display based on time remaining
  const formatDisplay = () => {
    if (timeLeft.days > 0) {
      return `${timeLeft.days}d ${timeLeft.hours}h left`
    } else if (timeLeft.hours > 0) {
      return `${timeLeft.hours}h ${timeLeft.minutes}m left`
    } else {
      return `${timeLeft.minutes}m ${timeLeft.seconds}s left`
    }
  }

  return (
    <Badge 
      variant="outline" 
      className={`text-sm font-semibold ${getColorClass()}`}
    >
      {formatDisplay()}
    </Badge>
  )
}

function calculateTimeLeft(endTime: string): TimeLeft {
  const end = new Date(endTime).getTime()
  const now = new Date().getTime()
  const difference = end - now

  if (difference <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      total: 0,
    }
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((difference % (1000 * 60)) / 1000),
    total: difference,
  }
}
