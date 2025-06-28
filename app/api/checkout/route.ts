import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { courses } from "../../../lib/courses";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

export async function POST(req: NextRequest) {
  const { courseId, userEmail } = await req.json();
  const course = courses.find((c) => c.id === courseId);
  if (!course || !course.premium) {
    return NextResponse.json({ error: "Invalid course" }, { status: 400 });
  }
  // For demo, use a fixed price (e.g., $10)
  const price = 1000; // cents
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: userEmail,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: course.title,
              description: course.description,
            },
            unit_amount: price,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/courses/${course.slug}?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/courses/${course.slug}?canceled=1`,
    });
    return NextResponse.json({ url: session.url });
  } catch {
    return NextResponse.json({ error: "Stripe error" }, { status: 500 });
  }
}
