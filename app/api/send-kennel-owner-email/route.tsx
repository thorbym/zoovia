import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

export async function POST(request: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  try {
    const { kennelName, location, email, phone } = await request.json()

    // Send email to mark@zoovia.pet with kennel owner details 
    const { data, error } = await resend.emails.send({
      from: "Zoovia <noreply@zoovia.pet>",
      to: ["mark@zoovia.pet"],
      subject: "New Kennel Owner Signup - Zoovia",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a; margin-bottom: 20px;">New Kennel Owner Signup</h2>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin-top: 0; color: #334155;">Kennel Details</h3>
            <p><strong>Kennel Name:</strong> ${kennelName}</p>
            <p><strong>Location:</strong> ${location}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
          </div>
          
          <p style="color: #64748b; font-size: 14px;">
            This kennel owner has expressed interest in joining Zoovia. Please follow up with them soon!
          </p>
        </div>
      `,
    })

    if (error) {
      console.error("Resend error:", error)
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
