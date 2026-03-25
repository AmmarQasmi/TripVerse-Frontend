export default function HotelBookingTermsPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Hotel Booking Terms and Conditions</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: March 25, 2026</p>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">1. Booking and Payment Methods</h2>
          <p className="text-gray-700 leading-7">
            Hotel bookings can be placed using wallet balance or cash payment. By confirming a booking,
            you authorize TripVerse to process the selected method according to the platform policy.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">2. Wallet Payment</h2>
          <p className="text-gray-700 leading-7">
            For wallet bookings, sufficient available wallet balance is required. If balance is insufficient,
            you must top up before placing the booking.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">3. Cash Booking Policy</h2>
          <p className="text-gray-700 leading-7 mb-2">
            If you select cash, you acknowledge the cash cancellation and debt policy before confirmation.
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>Cancellation is allowed only before 1 day prior to check-in.</li>
            <li>Cash cancellation creates customer debt equal to 25% of total booking amount.</li>
            <li>From that 25%, 10% is manager compensation and 15% is admin side allocation.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">4. Cancellation and Refund Handling</h2>
          <p className="text-gray-700 leading-7">
            Wallet cancellations follow wallet refund and settlement flow according to the active platform logic.
            Cash cancellations follow debt policy. Charges, if any, are recorded in wallet ledger for auditability.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">5. Provider and Platform Share</h2>
          <p className="text-gray-700 leading-7">
            Platform share is 15% and provider share is 85% where applicable under current commission rules.
            Internal platform accounting may split commission and tax reserve for compliance and reporting.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">6. Fraud, Misuse, and Enforcement</h2>
          <p className="text-gray-700 leading-7">
            TripVerse may suspend, limit, or review accounts involved in fraudulent bookings, abuse,
            or repeated policy violations. Debt and payment records are retained for operational and legal purposes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">7. Support and Disputes</h2>
          <p className="text-gray-700 leading-7">
            For booking-related disputes, use the in-app dispute or support channels. Resolution is handled using
            platform logs, booking records, and wallet transaction history.
          </p>
        </section>
      </div>
    </main>
  )
}
