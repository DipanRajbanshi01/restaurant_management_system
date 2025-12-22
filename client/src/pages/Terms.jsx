import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import { ThemeContext } from '../context/ThemeContext';

const Terms = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50'}`}>
      {/* Header */}
      <header className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white/80'} backdrop-blur-lg shadow-xl border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'} sticky top-0 z-50`}>
        <div className="container mx-auto px-4 py-5">
          <div className="flex justify-between items-center">
            <Logo />
            <div className="flex space-x-3">
              <Link
                to="/"
                className={`px-6 py-2.5 rounded-full font-semibold transition-all duration-300 ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-gray-100 hover:bg-gray-600'
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-orange-400'
                }`}
              >
                Home
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className={`text-5xl font-bold mb-4 flex items-center justify-center ${
              theme === 'dark' ? 'text-white' : 'bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent'
            }`}>
              <span className="text-6xl mr-4">📜</span>
              Terms and Conditions
            </h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Content */}
          <div className={`space-y-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-8`}>
            <section>
              <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                1. Acceptance of Terms
              </h2>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
                By accessing and using this restaurant management system, you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                2. Ordering and Payment
              </h2>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} leading-relaxed mb-3`}>
                When placing an order:
              </p>
              <ul className={`list-disc list-inside space-y-2 ml-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>All prices are displayed in the local currency and are subject to change without notice.</li>
                <li>Payment must be completed before order preparation begins.</li>
                <li>We accept cash, credit/debit cards, and online payment methods.</li>
                <li>Orders can only be cancelled if they are still in "pending" status.</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                3. Delivery and Pickup
              </h2>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} leading-relaxed mb-3`}>
                Delivery terms:
              </p>
              <ul className={`list-disc list-inside space-y-2 ml-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>Delivery times are estimates and may vary based on traffic and order volume.</li>
                <li>We are not responsible for delays caused by factors beyond our control.</li>
                <li>You must provide accurate delivery address and contact information.</li>
                <li>If you are unavailable at the delivery address, we may attempt redelivery or contact you.</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                4. Refunds and Cancellations
              </h2>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
                Refunds will be processed for cancelled orders that have not yet entered the cooking phase. 
                Refunds may take 5-10 business days to appear in your account. For any issues with your order, 
                please contact our support team within 24 hours of delivery.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                5. User Accounts
              </h2>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} leading-relaxed mb-3`}>
                Account responsibilities:
              </p>
              <ul className={`list-disc list-inside space-y-2 ml-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                <li>You must provide accurate and complete information when creating an account.</li>
                <li>You are responsible for all activities that occur under your account.</li>
                <li>We reserve the right to suspend or terminate accounts that violate our terms.</li>
              </ul>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                6. Privacy Policy
              </h2>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
                Your privacy is important to us. We collect and use your personal information only as necessary 
                to provide our services. We do not sell or share your information with third parties except as 
                required by law or to fulfill your orders.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                7. Limitation of Liability
              </h2>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
                Our liability is limited to the value of the order. We are not liable for any indirect, 
                incidental, or consequential damages arising from the use of our service.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                8. Changes to Terms
              </h2>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
                We reserve the right to modify these terms at any time. Changes will be effective immediately 
                upon posting. Your continued use of the service constitutes acceptance of the modified terms.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                9. Contact Information
              </h2>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
                If you have any questions about these Terms and Conditions, please contact us through our 
                support chatbot or email us at support@colrestaurant.com.
              </p>
            </section>
          </div>

          {/* Footer Actions */}
          <div className="mt-8 flex justify-center space-x-4">
            <Link
              to="/faq"
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                theme === 'dark'
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              View FAQ
            </Link>
            <Link
              to="/"
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                theme === 'dark'
                  ? 'bg-orange-600 text-white hover:bg-orange-700'
                  : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600'
              }`}
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;

