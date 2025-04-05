"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/context/AuthContext"

export type UserStats = {
  totalVisits: number
  hiddenGemsFound: number
  streak: number
  uniqueAreas: number
  visitsByMonth: { name: string; visits: number }[]
  visitsByCategory: { name: string; value: number }[]
  weeklyActivity: { day: string; visits: number }[]
  recentVisits: {
    locationName: string
    area: string
    visitedAt: string
    isGem: boolean
  }[]
  badges: {
    name: string
    description: string
    earnedAt: string
  }[]
}

export function useStats() {
  const { user, loading: authLoading } = useAuth()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return

    const fetchStats = async () => {
      if (!user) {
        setStats(null)
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // Fetch total visits and hidden gems
        const { data: visitsData, error: visitsError } = await supabase
          .from("location_visits")
          .select("*")
          .eq("user_id", user.id)

        if (visitsError) throw visitsError

        // Calculate monthly visits
        const monthlyVisits = new Map<string, number>()
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

        visitsData.forEach((visit) => {
          const date = new Date(visit.visited_at)
          const monthKey = months[date.getMonth()]
          monthlyVisits.set(monthKey, (monthlyVisits.get(monthKey) || 0) + 1)
        })

        const visitsByMonth = months.map((month) => ({
          name: month,
          visits: monthlyVisits.get(month) || 0,
        }))

        // Calculate streak (simplified version - can be enhanced)
        const streak = calculateStreak(visitsData.map((v) => new Date(v.visited_at)))

        // Fetch location details separately
        const locationIds = visitsData.map((v) => v.location_id)
        const { data: locationsData, error: locationsError } = await supabase
          .from("locations")
          .select("id, name, description")
          .in("id", locationIds)

        if (locationsError) throw locationsError

        // Create a map of location details
        const locationMap = new Map(
          locationsData.map((loc) => [loc.id, { name: loc.name, description: loc.description }]),
        )

        // Calculate unique areas
        const uniqueAreas = new Set(
          visitsData.map((v) => {
            const location = locationMap.get(v.location_id)
            return location?.description || "Unknown Area"
          }),
        ).size

        // Calculate weekly activity
        const weeklyActivity = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => ({
          day,
          visits: visitsData.filter(
            (v) => new Date(v.visited_at).getDay() === ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(day),
          ).length,
        }))

        // Get recent visits with location details
        const { data: recentVisitsData, error: recentError } = await supabase
          .from("location_visits")
          .select("*")
          .eq("user_id", user.id)
          .order("visited_at", { ascending: false })
          .limit(5)

        if (recentError) throw recentError

        const recentVisits = recentVisitsData.map((visit) => {
          const location = locationMap.get(visit.location_id)
          return {
            locationName: location?.name || "Unknown Location",
            area: location?.description || "No description",
            visitedAt: visit.visited_at,
            isGem: visit.is_gem,
          }
        })

        // Get category stats
        const { data: categoryData, error: categoryError } = await supabase
          .from("category_stats")
          .select("*")
          .eq("user_id", user.id)

        if (categoryError) throw categoryError

        // Fetch category details separately
        const categoryIds = categoryData.map((stat) => stat.category_id)
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("categories")
          .select("id, name")
          .in("id", categoryIds)

        if (categoriesError) throw categoriesError

        // Create a map of category names
        const categoryMap = new Map(categoriesData.map((cat) => [cat.id, cat.name]))

        const visitsByCategory = categoryData.map((stat) => ({
          name: categoryMap.get(stat.category_id) || "Unknown Category",
          value: stat.visit_count,
        }))

        // Get badges
        const { data: badgesData, error: badgesError } = await supabase
          .from("user_badges")
          .select(`
            earned_at,
            badges (
              name,
              description
            )
          `)
          .eq("user_id", user.id)

        if (badgesError) throw badgesError

        const badges = badgesData.map((badge) => ({
          name: badge.badges?.name || "Unknown Badge",
          description: badge.badges?.description || "",
          earnedAt: badge.earned_at,
        }))

        setStats({
          totalVisits: visitsData.length,
          hiddenGemsFound: visitsData.filter((v) => v.is_gem).length,
          streak,
          uniqueAreas,
          visitsByMonth,
          visitsByCategory,
          weeklyActivity,
          recentVisits,
          badges,
        })
      } catch (err) {
        console.error("Error fetching stats:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch stats")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [user, authLoading])

  return { stats, loading, error }
}

// Helper function to calculate streak
function calculateStreak(dates: Date[]): number {
  if (dates.length === 0) return 0

  // Sort dates in descending order
  const sortedDates = dates
    .map((date) => date.toISOString().split("T")[0])
    .sort()
    .reverse()

  let streak = 1
  const today = new Date().toISOString().split("T")[0]
  const lastDate = sortedDates[0]

  // If the last visit wasn't today or yesterday, streak is broken
  if (lastDate !== today && lastDate !== getYesterday()) {
    return 0
  }

  // Count consecutive days
  for (let i = 1; i < sortedDates.length; i++) {
    const currentDate = new Date(sortedDates[i])
    const previousDate = new Date(sortedDates[i - 1])

    const diffTime = Math.abs(previousDate.getTime() - currentDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      streak++
    } else {
      break
    }
  }

  return streak
}

function getYesterday(): string {
  const date = new Date()
  date.setDate(date.getDate() - 1)
  return date.toISOString().split("T")[0]
}