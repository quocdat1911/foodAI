import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Recipe from "@/models/Recipe";

export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();
  const recipe = await Recipe.create(body);
  return NextResponse.json({ success: true, recipe });
}

export async function GET() {
  await connectDB();
  const recipes = await Recipe.find().sort({ createdAt: -1 }).limit(20);
  return NextResponse.json({ recipes });
}

export async function DELETE(req: NextRequest) {
  await connectDB();
  const { id } = await req.json();
  await Recipe.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}