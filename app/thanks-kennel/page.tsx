"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, ArrowRight, Building2 } from "lucide-react"
import Link from "next/link"

export default function ThanksKennelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <Heart className="h-8 w-8 text-green-600 mr-3" />
            <span className="font-serif font-bold text-2xl text-green-800">Zoovia</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <Building2 className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="font-serif text-4xl font-bold text-gray-900 mb-4">Welcome to Zoovia!</h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Thank you for your interest in joining our kennel network. We're excited to help you connect with more dog
              owners in your area. But before you go...
            </p>
          </div>

          {/* Questionnaire CTA Card */}
          <Card className="mb-8 border-green-200 shadow-lg">
            <CardContent className="p-8">
              <div className="mb-6">
                <h2 className="font-serif text-2xl font-semibold text-gray-900 mb-3">
                  Help Us Build the Perfect Platform
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Your expertise as a kennel owner is invaluable! Share your insights to help us create a platform that
                  truly works for both kennels and pet owners.
                </p>
              </div>

              <Button
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-full transition-all duration-200 transform hover:scale-105 shadow-lg"
                onClick={(e) => {
                  e.preventDefault()
                  window.location.href = "https://forms.fillout.com/t/ebTxcQKrKLus"
                }}
              >
                Complete Kennel Owner Survey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100">
            <h3 className="font-semibold text-gray-900 mb-3">What happens next?</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>✅ We'll review your kennel information</p>
              <p>✅ Get priority access to our kennel dashboard</p>
              <p>✅ Early onboarding when we launch</p>
              <p>✅ Direct support from our team</p>
              <p>✅ No listing fees during our beta period</p>
            </div>
          </div>

          {/* Back to Home */}
          <div className="mt-8">
            <Link href="/" className="text-green-600 hover:text-green-700 font-medium transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
