'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-lg p-8 md:p-12"
        >
          <div className="mb-8">
            <Link href="/" className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-4 inline-block">
              Back to Home
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Terms of Service
            </h1>
            <p className="text-gray-600">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Agreement to Terms</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                By accessing or using TripVerse ("the Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our services.
              </p>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify these Terms at any time. Your continued use of the Platform after changes are posted constitutes acceptance of the modified Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Eligibility</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You must be at least 18 years old to use our services. By using TripVerse, you represent and warrant that:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>You are of legal age to form a binding contract</li>
                <li>You have the authority to enter into these Terms</li>
                <li>All information you provide is accurate and current</li>
                <li>You will maintain the security of your account credentials</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Account Registration</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                To access certain features, you must create an account. You agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Provide accurate, complete, and current information</li>
                <li>Maintain and update your account information promptly</li>
                <li>Keep your password secure and confidential</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Accept responsibility for all activities under your account</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Booking Services</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">Hotel Bookings</h3>
                  <p className="text-gray-700 leading-relaxed">
                    We act as an intermediary between you and hotel providers. All bookings are subject to the terms and conditions of the respective hotel. We are not responsible for the quality, safety, or availability of hotel services.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">Car Rentals</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Car rental bookings are subject to the rental company's terms. You must meet the rental company's age and license requirements. Additional fees may apply for insurance, fuel, and other services.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">Flight Bookings</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Flight bookings are processed through airline partners. All flights are subject to airline terms, baggage policies, and cancellation rules. We are not responsible for flight delays, cancellations, or changes made by airlines.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Payment Terms</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>All prices are displayed in the currency specified and are subject to change until booking is confirmed</li>
                <li>Payment must be made at the time of booking unless otherwise specified</li>
                <li>We accept major credit cards and other payment methods as displayed on the Platform</li>
                <li>Additional fees may apply for certain services or modifications</li>
                <li>Refunds are subject to the cancellation policy of the service provider</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Cancellation and Refunds</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Cancellation policies vary by service provider and booking type. You are responsible for reviewing and understanding the cancellation terms before completing your booking.
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Refund eligibility depends on the specific cancellation policy</li>
                <li>Processing fees may apply to cancellations</li>
                <li>Refunds will be processed to the original payment method</li>
                <li>Processing times may vary depending on the payment provider</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">User Conduct</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You agree not to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Use the Platform for any illegal or unauthorized purpose</li>
                <li>Violate any laws or regulations in your jurisdiction</li>
                <li>Infringe upon intellectual property rights</li>
                <li>Transmit viruses, malware, or harmful code</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with or disrupt the Platform's operation</li>
                <li>Use automated systems to access the Platform without permission</li>
                <li>Impersonate any person or entity</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Intellectual Property</h2>
              <p className="text-gray-700 leading-relaxed">
                All content on the Platform, including text, graphics, logos, images, and software, is the property of TripVerse or its licensors and is protected by copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, modify, or create derivative works without our express written permission.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                To the maximum extent permitted by law:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>TripVerse acts as an intermediary and is not responsible for the acts, errors, or omissions of service providers</li>
                <li>We are not liable for any indirect, incidental, special, or consequential damages</li>
                <li>Our total liability shall not exceed the amount you paid for the specific booking in question</li>
                <li>We do not guarantee the accuracy, completeness, or availability of information on the Platform</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Indemnification</h2>
              <p className="text-gray-700 leading-relaxed">
                You agree to indemnify and hold harmless TripVerse, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses arising from your use of the Platform, violation of these Terms, or infringement of any rights of another party.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Termination</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We reserve the right to suspend or terminate your account and access to the Platform at any time, with or without cause or notice, for any reason including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Violation of these Terms</li>
                <li>Fraudulent or illegal activity</li>
                <li>Misuse of the Platform</li>
                <li>At our sole discretion</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Dispute Resolution</h2>
              <p className="text-gray-700 leading-relaxed">
                Any disputes arising from these Terms or your use of the Platform shall be resolved through binding arbitration in accordance with applicable arbitration rules, except where prohibited by law. You waive any right to participate in a class-action lawsuit or class-wide arbitration.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Governing Law</h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which TripVerse operates, without regard to its conflict of law provisions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have questions about these Terms, please contact us:
              </p>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700 mb-2">
                  <strong>Email:</strong> legal@tripverse.com
                </p>
                <p className="text-gray-700 mb-2">
                  <strong>Phone:</strong> +1 (234) 567-890
                </p>
                <p className="text-gray-700">
                  <strong>Address:</strong> 123 Travel Street, City, Country
                </p>
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

