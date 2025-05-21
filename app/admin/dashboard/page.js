"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Package, ShoppingCart, TrendingUp } from "lucide-react"
import { OrderStatusChart } from "@/components/ui/order-status-chart"
import { TrafficChart } from "@/components/ui/traffic-chart"

export default function Dashboard() {  // Dummy data for charts
  const dummyPieChartData = [
    { name: "DELIVERED", value: 45, fill: "#10b981" },
    { name: "PENDING", value: 20, fill: "#f59e0b" },
    { name: "CONFIRMED", value: 25, fill: "#3b82f6" },
    { name: "CANCELED", value: 10, fill: "#ef4444" }
  ]
  
  const dummyTrafficData = [
    { name: "Jan", value: 400 },
    { name: "Feb", value: 300 },
    { name: "Mar", value: 500 },
    { name: "Apr", value: 200 },
    { name: "May", value: 450 },
    { name: "Jun", value: 600 },
    { name: "Jul", value: 350 }
  ]

  const [dashboardData, setDashboardData] = useState({
    stockEvaluation: { value: "0.00", changePercentage: "0.0" },
    totalSales: { value: "0.00", changePercentage: "0.0" },
    totalProfit: { value: "0.00", changePercentage: "0.0" },
    numberOfSales: { value: 0, changePercentage: "0.0" },
    trafficData: dummyTrafficData,
    pieChartData: dummyPieChartData
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/dashboard')
      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)
      } else {
        console.error("Failed to fetch dashboard data")
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Evaluation</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${isLoading ? "..." : dashboardData.stockEvaluation.value}
            </div>
            <p className="text-xs text-muted-foreground">
              {isLoading 
                ? "Loading..." 
                : `${dashboardData.stockEvaluation.changePercentage > 0 ? "+" : ""}${dashboardData.stockEvaluation.changePercentage}% from last month`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${isLoading ? "..." : dashboardData.totalSales.value}
            </div>
            <p className="text-xs text-muted-foreground">
              {isLoading 
                ? "Loading..." 
                : `${dashboardData.totalSales.changePercentage > 0 ? "+" : ""}${dashboardData.totalSales.changePercentage}% from last month`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${isLoading ? "..." : dashboardData.totalProfit.value}
            </div>
            <p className="text-xs text-muted-foreground">
              {isLoading 
                ? "Loading..." 
                : `${dashboardData.totalProfit.changePercentage > 0 ? "+" : ""}${dashboardData.totalProfit.changePercentage}% from last month`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Number of Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : dashboardData.numberOfSales.value}
            </div>
            <p className="text-xs text-muted-foreground">
              {isLoading 
                ? "Loading..." 
                : `${dashboardData.numberOfSales.changePercentage > 0 ? "+" : ""}${dashboardData.numberOfSales.changePercentage}% from last month`}
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Website Traffic</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <TrafficChart data={[
              { name: "Jan", value: 400 },
              { name: "Feb", value: 300 },
              { name: "Mar", value: 500 },
              { name: "Apr", value: 200 },
              { name: "May", value: 450 },
              { name: "Jun", value: 600 },
              { name: "Jul", value: 350 }
            ]} />
          </CardContent>
        </Card><Card className="col-span-3">
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center items-center">
            <OrderStatusChart data={[
              { name: "DELIVERED", value: 45, color: "#10b981" },
              { name: "PENDING", value: 20, color: "#f59e0b" },
              { name: "CONFIRMED", value: 25, color: "#3b82f6" },
              { name: "CANCELED", value: 10, color: "#ef4444" }
            ]} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

