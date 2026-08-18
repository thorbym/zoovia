import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email, location, checkIn, checkOut } = await request.json()

    const emailContent = `
New Zoovia Waitlist Signup

Email: ${email}
Location: ${location}
Check-in Date: ${checkIn}
Check-out Date: ${checkOut}

Signed up at: ${new Date().toLocaleString("en-GB")}
    `.trim()

    const response = await resend.emails.send({
      from: "noreply@zoovia.pet",
      to: "markthorby@gmail.com",
      subject: "New Zoovia Waitlist Signup",
      text: emailContent,
    })

    console.log("[v0] Email sent successfully:", response)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Email sending failed:", error)
    return NextResponse.json({ success: false, error: "Failed to send email" }, { status: 500 })
  }
}
