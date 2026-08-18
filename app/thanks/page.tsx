"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Heart, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function ThanksPage() {
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
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="font-serif text-4xl font-bold text-gray-900 mb-4">Thank You for Joining!</h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              You'll be the first to know when Zoovia arrives to take the stress out of finding the perfect stay for your dog. But before you go...    
            </p>
          </div>

          {/* Questionnaire CTA Card */}
          <Card className="mb-8 border-green-200 shadow-lg">
            <CardContent className="p-8">
              <div className="mb-6">
                <h2 className="font-serif text-2xl font-semibold text-gray-900 mb-3">Help Us Build the Best Zoovia</h2>
                <p className="text-gray-600 leading-relaxed">
                  Your insights are invaluable! Just 2 or 3 minutes of your time can help us understand what truly matters most to dog owners like you. 
                </p>
              </div>

              <Button
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-full transition-all duration-200 transform hover:scale-105 shadow-lg"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href='https://forms.fillout.com/t/97HzvsEdpvus';
                }}
              >
                Complete Questionnaire
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100">
            <h3 className="font-semibold text-gray-900 mb-3">What happens next?</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>✅ You'll receive email updates on our progress</p>
              <p>✅ Get early access when we launch</p>
              <p>✅ Exclusive beta testing opportunities</p>
              <p>✅ Special launch day discounts</p>
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
