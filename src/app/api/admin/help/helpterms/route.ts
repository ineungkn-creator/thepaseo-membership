import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * GET: Fetch HelpTerms (singleton)
 */
export async function GET() {
  try {
    const term = await prisma.helpTerms.findFirst();

    return NextResponse.json(
      term ?? {
        description: "",
        email1: "",
        email2: "",
        email3: "",
        phone1: "",
        phone2: "",
        phone3: "",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching HelpTerms:", error);
    return NextResponse.json(
      { error: "Failed to fetch HelpTerms" },
      { status: 500 }
    );
  }
}

/**
 * PUT: Update HelpTerms (always update the same record)
 */
export async function PUT(request: Request) {
  try {
    const {
      description,
      email1,
      email2,
      email3,
      phone1,
      phone2,
      phone3,
    } = await request.json();

    const data = {
      description,
      email1,
      email2,
      email3,
      phone1,
      phone2,
      phone3,
    };

    const existing = await prisma.helpTerms.findFirst();

    const term = existing
      ? await prisma.helpTerms.update({
          where: { id: existing.id },
          data,
        })
      : await prisma.helpTerms.create({
          data,
        });

    return NextResponse.json(term, { status: 200 });
  } catch (error) {
    console.error("Error updating HelpTerms:", error);
    return NextResponse.json(
      { error: "Failed to update HelpTerms" },
      { status: 500 }
    );
  }
}
