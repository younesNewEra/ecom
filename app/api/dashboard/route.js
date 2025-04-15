import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    // Calculate date ranges for current and previous month
    const today = new Date();
    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const previousMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const previousMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    // Get all orders for the current month
    const currentMonthOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: currentMonthStart,
        },
        status: {
          not: "CANCELED"
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    // Get all orders for the previous month
    const previousMonthOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: previousMonthStart,
          lt: currentMonthStart
        },
        status: {
          not: "CANCELED"
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    // Get all active campaigns in the current month
    const currentMonthCampaigns = await prisma.campaign.findMany({
      where: {
        OR: [
          {
            startDate: {
              lte: today
            },
            endDate: {
              gte: currentMonthStart
            }
          },
          {
            startDate: {
              gte: currentMonthStart,
              lte: today
            }
          }
        ]
      }
    });

    // Get all active campaigns in the previous month
    const previousMonthCampaigns = await prisma.campaign.findMany({
      where: {
        OR: [
          {
            startDate: {
              lte: previousMonthEnd
            },
            endDate: {
              gte: previousMonthStart
            }
          },
          {
            startDate: {
              gte: previousMonthStart,
              lte: previousMonthEnd
            }
          }
        ]
      }
    });

    // Calculate total sales for current month
    const currentMonthSales = currentMonthOrders.reduce((total, order) => 
      total + order.totalAmount, 0);

    // Calculate total sales for previous month
    const previousMonthSales = previousMonthOrders.reduce((total, order) => 
      total + order.totalAmount, 0);

    // Calculate sales change percentage
    const salesChangePercentage = previousMonthSales === 0 
      ? 100 
      : ((currentMonthSales - previousMonthSales) / previousMonthSales) * 100;

    // Calculate total profit for current month (revenue - cost - campaign costs)
    const currentMonthProfit = currentMonthOrders.reduce((total, order) => {
      // Calculate profit from each order (price - cost)
      const orderProfit = order.items.reduce((orderTotal, item) => {
        const costPrice = item.product.costPrice || 0;
        return orderTotal + (item.price - costPrice) * item.quantity;
      }, 0);
      return total + orderProfit;
    }, 0) - currentMonthCampaigns.reduce((total, campaign) => total + campaign.budget, 0);

    // Calculate total profit for previous month
    const previousMonthProfit = previousMonthOrders.reduce((total, order) => {
      const orderProfit = order.items.reduce((orderTotal, item) => {
        const costPrice = item.product.costPrice || 0;
        return orderTotal + (item.price - costPrice) * item.quantity;
      }, 0);
      return total + orderProfit;
    }, 0) - previousMonthCampaigns.reduce((total, campaign) => total + campaign.budget, 0);

    // Calculate profit change percentage
    const profitChangePercentage = previousMonthProfit === 0 
      ? 100 
      : ((currentMonthProfit - previousMonthProfit) / previousMonthProfit) * 100;

    // Calculate number of sales for current month
    const currentMonthNumSales = currentMonthOrders.length;

    // Calculate number of sales for previous month
    const previousMonthNumSales = previousMonthOrders.length;

    // Calculate number of sales change percentage
    const numSalesChangePercentage = previousMonthNumSales === 0 
      ? 100 
      : ((currentMonthNumSales - previousMonthNumSales) / previousMonthNumSales) * 100;

    // Get total stock value
    const products = await prisma.product.findMany();
    const stockValue = products.reduce((total, product) => 
      total + (product.stock * product.costPrice), 0);

    const previousMonthStockValue = stockValue * 0.9; // Estimate for demo purposes
    const stockChangePercentage = ((stockValue - previousMonthStockValue) / previousMonthStockValue) * 100;

    // Get orders by status for pie chart
    const ordersByStatus = await prisma.order.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    const pieChartData = ordersByStatus.map(item => ({
      name: item.status,
      value: item._count.status,
      fill: getStatusColor(item.status)
    }));

    // Get monthly traffic data
    const trafficData = [
      { name: "Jan", value: 400 },
      { name: "Feb", value: 300 },
      { name: "Mar", value: 500 },
      { name: "Apr", value: 200 },
      { name: "May", value: 450 },
      { name: "Jun", value: 600 },
      { name: "Jul", value: 350 },
    ]; // Placeholder data, would be from a traffic analytics service

    return NextResponse.json({
      stockEvaluation: {
        value: stockValue.toFixed(2),
        changePercentage: stockChangePercentage.toFixed(1)
      },
      totalSales: {
        value: currentMonthSales.toFixed(2),
        changePercentage: salesChangePercentage.toFixed(1)
      },
      totalProfit: {
        value: currentMonthProfit.toFixed(2),
        changePercentage: profitChangePercentage.toFixed(1)
      },
      numberOfSales: {
        value: currentMonthNumSales,
        changePercentage: numSalesChangePercentage.toFixed(1)
      },
      trafficData,
      pieChartData
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}

// Helper function to get color for each order status
function getStatusColor(status) {
  switch (status) {
    case "DELIVERED":
      return "#10b981"; // green
    case "DONE":
      return "#10b981"; // green
    case "CONFIRMED":
      return "#3b82f6"; // blue
    case "PENDING":
      return "#f59e0b"; // amber
    case "CANCELED":
      return "#ef4444"; // red
    default:
      return "#6b7280"; // gray
  }
}