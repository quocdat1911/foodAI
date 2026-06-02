import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Recipe from "@/models/Recipe";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
  await connectDB();
  const session: any = await getServerSession(authOptions);
  const body = await req.json();
  
  if (session?.user?.id) {
    body.userId = session.user.id;
  }

  const recipe = await Recipe.create(body);
  return NextResponse.json({ success: true, recipe });
}

export async function GET() {
  await connectDB();
  const session: any = await getServerSession(authOptions);
  
  let query = {};
  if (session?.user?.id) {
    query = { userId: session.user.id };
  } else {
    // Nếu chưa đăng nhập, chỉ lấy các công thức ẩn danh (không có userId)
    query = { userId: { $exists: false } };
  }

  const recipes = await Recipe.find(query).sort({ createdAt: -1 }).limit(20);
  return NextResponse.json({ recipes });
}

export async function DELETE(req: NextRequest) {
  await connectDB();
  const session: any = await getServerSession(authOptions);
  const { id } = await req.json();
  
  const recipe = await Recipe.findById(id);
  if (!recipe) return NextResponse.json({ success: false, message: "Not found" });
  
  // Kiểm tra quyền (nếu recipe có userId thì phải đúng user mới được xóa)
  if (recipe.userId && recipe.userId.toString() !== session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
  }

  await Recipe.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}