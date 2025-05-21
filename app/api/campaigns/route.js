import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminCache, cacheAdminResponse, clearAdminCache } from "@/lib/utils";

// GET all campaigns
export async function GET() {
  try {
    // Check if we have a cached version of the campaigns
    const cachedCampaigns = getAdminCache("campaigns");
    if (cachedCampaigns) {
      return NextResponse.json(cachedCampaigns);
    }
    
    const campaigns = await prisma.campaign.findMany({
      include: {
        products: {
          include: {
            product: {
              select: {
                name: true,
                id: true,
              },
            },
          },
        },
      },
    });

    // Format the response
    const formattedCampaigns = campaigns.map(campaign => ({
      id: campaign.id,
      name: campaign.name,
      description: campaign.description,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      cost: campaign.budget,
      products: campaign.products.map(p => ({
        id: p.product.id,
        name: p.product.name,
        cost: p.cost
      })),
      status: getStatus(campaign.startDate, campaign.endDate),
    }));
    
    // Cache the campaigns data
    cacheAdminResponse("campaigns", formattedCampaigns);

    return NextResponse.json(formattedCampaigns);
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });
  }
}

// POST new campaign
export async function POST(request) {
  try {
    const {
      name,
      description,
      startDate,
      endDate,
      budget,
      products
    } = await request.json();

    // Create campaign and campaign-product relationships
    const campaign = await prisma.campaign.create({
      data: {
        name,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        budget,
        products: {
          create: products.map(product => ({
            productId: product.id,
            cost: product.cost || budget / products.length // Divide budget equally if no specific cost
          }))
        }
      },
      include: {
        products: {
          include: {
            product: true
          }
        }
      }
    });

    // Clear the campaigns cache so future requests will fetch fresh data
    clearAdminCache("campaigns");

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    console.error("Error creating campaign:", error);
    return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 });
  }
}

// Helper function to determine campaign status
function getStatus(startDate, endDate) {
  const now = new Date();
  
  if (now < new Date(startDate)) {
    return "Upcoming";
  } else if (now > new Date(endDate)) {
    return "Completed";
  } else {
    return "Active";
  }
}