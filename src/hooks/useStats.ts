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

const initialStats: UserStats = {
  totalVisits: 0,
  hiddenGemsFound: 0,
  streak: 0,
  uniqueAreas: 0,
  visitsByMonth: Array(12).fill(0).map((_, i) => ({
    name: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i],
    visits: 0
  })),
  visitsByCategory: [],
  weeklyActivity: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => ({
    day,
    visits: 0
  })),
  recentVisits: [],
  badges: []
}

export function useStats() {
  const { user, loading: authLoading } = useAuth()
  const [stats, setStats] = useState<UserStats>(initialStats)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return

    const fetchStats = async () => {
      if (!user) {
        setStats(initialStats)
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

        if (visitsError) {
          console.error("Error fetching visits:", visitsError)
          throw new Error("Failed to fetch visit data")
        }

        // Calculate monthly visits
        const monthlyVisits = new Map<string, number>()
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

        visitsData?.forEach((visit) => {
          const date = new Date(visit.visited_at)
          const monthKey = months[date.getMonth()]
          monthlyVisits.set(monthKey, (monthlyVisits.get(monthKey) || 0) + 1)
        })

        const visitsByMonth = months.map((month) => ({
          name: month,
          visits: monthlyVisits.get(month) || 0,
        }))

        // Calculate streak
        const streak = calculateStreak(visitsData?.map((v) => new Date(v.visited_at)) || [])

        // Fetch location details separately
        const locationIds = visitsData?.map((v) => v.location_id) || []
        
        // Only fetch locations if we have location IDs
        let locationsData = []
        let locationMap = new Map()
        
        if (locationIds.length > 0) {
          const { data: fetchedLocations, error: locationsError } = await supabase
            .from("locations")
            .select("id, name, area, is_hidden_gem")
            .in("id", locationIds)

          if (locationsError) {
            console.error("Error fetching locations:", locationsError)
            // Don't throw here, just log the error and continue with empty data
            console.warn("Continuing with empty location data")
          } else {
            locationsData = fetchedLocations || []
            locationMap = new Map(
              locationsData.map((loc) => [
                loc.id,
                {
                  name: loc.name || "Unknown Location",
                  area: loc.area || "Unknown Area",
                  is_hidden_gem: loc.is_hidden_gem || false
                }
              ])
            )
          }
        }

        // Calculate unique areas
        const uniqueAreas = new Set(
          visitsData?.map((v) => {
            const location = locationMap.get(v.location_id)
            return location?.area || "Unknown Area"
          }) || []
        ).size

        // Calculate weekly activity
        const weeklyActivity = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => ({
          day,
          visits: visitsData?.filter(
            (v) => new Date(v.visited_at).getDay() === ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(day),
          ).length || 0,
        }))

        // Get recent visits with location details
        const { data: recentVisitsData, error: recentError } = await supabase
          .from("location_visits")
          .select(`
            *,
            locations (
              name,
              area,
              is_hidden_gem
            )
          `)
          .eq("user_id", user.id)
          .order("visited_at", { ascending: false })
          .limit(5)

        if (recentError) {
          console.error("Error fetching recent visits:", recentError)
          // Don't throw here, just log the error and continue with empty data
          console.warn("Continuing with empty recent visits data")
        }

        const recentVisits = recentVisitsData?.map((visit) => ({
          locationName: visit.locations?.name || "Unknown Location",
          area: visit.locations?.area || "Unknown Area",
          visitedAt: visit.visited_at,
          isGem: visit.locations?.is_hidden_gem || false,
        })) || []

        // Get category stats
        const { data: categoryData, error: categoryError } = await supabase
          .from("category_stats")
          .select("*")
          .eq("user_id", user.id)

        if (categoryError) {
          console.error("Error fetching category stats:", categoryError)
          throw new Error("Failed to fetch category stats")
        }

        // Fetch category details separately
        const categoryIds = categoryData?.map((stat) => stat.category_id) || []
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("categories")
          .select("id, name")
          .in("id", categoryIds)

        if (categoriesError) {
          console.error("Error fetching categories:", categoriesError)
          throw new Error("Failed to fetch categories")
        }

        // Create a map of category names
        const categoryMap = new Map(categoriesData?.map((cat) => [cat.id, cat.name]) || [])

        const visitsByCategory = categoryData?.map((stat) => ({
          name: categoryMap.get(stat.category_id) || "Unknown Category",
          value: stat.visit_count,
        })) || []

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

        if (badgesError) {
          console.error("Error fetching badges:", badgesError)
          throw new Error("Failed to fetch badges")
        }

        const badges = badgesData?.map((badge) => ({
          name: badge.badges?.name || "Unknown Badge",
          description: badge.badges?.description || "",
          earnedAt: badge.earned_at,
        })) || []

        setStats({
          totalVisits: visitsData?.length || 0,
          hiddenGemsFound: visitsData?.filter((v) => v.is_gem).length || 0,
          streak,
          uniqueAreas,
          visitsByMonth,
          visitsByCategory,
          weeklyActivity,
          recentVisits,
          badges,
        })
      } catch (err) {
        console.error("Error in fetchStats:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch stats")
        setStats(initialStats)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()

    // Set up real-time subscriptions
    let locationVisitsSubscription: any = null
    let categoryStatsSubscription: any = null

    if (user) {
      locationVisitsSubscription = supabase
        .channel('location_visits_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'location_visits',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            fetchStats()
          }
        )
        .subscribe()

      categoryStatsSubscription = supabase
        .channel('category_stats_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'category_stats',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            fetchStats()
          }
        )
        .subscribe()
    }

    // Cleanup subscriptions
    return () => {
      if (locationVisitsSubscription) {
        locationVisitsSubscription.unsubscribe()
      }
      if (categoryStatsSubscription) {
        categoryStatsSubscription.unsubscribe()
      }
    }
  }, [user, authLoading])

  return { stats, loading, error }
}

// Helper function to calculate streak
function calculateStreak(dates: Date[]): number {
  if (dates.length === 0) return 0

  // Sort dates in descending order
  const sortedDates = [...dates].sort((a, b) => b.getTime() - a.getTime())
  
  // Check if the most recent date is today or yesterday
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  const mostRecent = sortedDates[0]
  mostRecent.setHours(0, 0, 0, 0)
  
  if (mostRecent.getTime() !== today.getTime() && 
      mostRecent.getTime() !== yesterday.getTime()) {
    return 0
  }
  
  let streak = 1
  let currentDate = mostRecent
  
  for (let i = 1; i < sortedDates.length; i++) {
    const nextDate = sortedDates[i]
    nextDate.setHours(0, 0, 0, 0)
    
    const diffInDays = Math.floor(
      (currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24)
    )
    
    if (diffInDays === 1) {
      streak++
      currentDate = nextDate
    } else if (diffInDays > 1) {
      break
    }
  }
  
  return streak
}