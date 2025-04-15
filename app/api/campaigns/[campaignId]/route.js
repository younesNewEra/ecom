import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const { campaignId } = params;
    
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        products: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                price: true
              }
            }
          }
        }
      }
    });
    
    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }
    
    // Format the response
    const formattedCampaign = {
      id: campaign.id,
      name: campaign.name,
      description: campaign.description,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      budget: campaign.budget,
      products: campaign.products.map(p => ({
        id: p.product.id,
        name: p.product.name,
        imageUrl: p.product.imageUrl,
        price: p.product.price,
        cost: p.cost
      })),
      status: getStatus(campaign.startDate, campaign.endDate),
    };
    
    return NextResponse.json(formattedCampaign);
  } catch (error) {
    console.error("Error fetching campaign:", error);
    return NextResponse.json({ error: "Failed to fetch campaign" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { campaignId } = params;
    const {
      name,
      description,
      startDate,
      endDate,
      budget,
      products
    } = await request.json();
    
    // First, delete all existing product associations
    await prisma.campaignProduct.deleteMany({
      where: { campaignId }
    });
    
    // Update campaign and create new product associations
    const updatedCampaign = await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        name,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        budget,
        products: {
          create: products.map(product => ({
            productId: product.id,
            cost: product.cost || budget / products.length
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
    
    return NextResponse.json(updatedCampaign);
  } catch (error) {
    console.error("Error updating campaign:", error);
    return NextResponse.json({ error: "Failed to update campaign" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { campaignId } = params;
    
    // Delete campaign (cascades to campaign products)
    await prisma.campaign.delete({
      where: { id: campaignId }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting campaign:", error);
    return NextResponse.json({ error: "Failed to delete campaign" }, { status: 500 });
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