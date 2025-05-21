"use client"

import { OrderStatusChart } from "@/components/ui/order-status-chart"

export default function TestChart() {
  // Simple dummy data
  const dummyData = [
    { name: "DELIVERED", value: 45, color: "#10b981" },
    { name: "PENDING", value: 20, color: "#f59e0b" },
    { name: "CONFIRMED", value: 25, color: "#3b82f6" },
    { name: "CANCELED", value: 10, color: "#ef4444" }
  ]
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Pie Chart</h1>
      <div className="bg-white p-4 rounded-md" style={{ height: '400px' }}>
        <OrderStatusChart data={dummyData} />
      </div>
      <div className="mt-4">
        <h2>Data:</h2>
        <pre className="bg-gray-100 p-2 mt-2 overflow-auto">
          {JSON.stringify(dummyData, null, 2)}
        </pre>
      </div>
    </div>
  )
}
