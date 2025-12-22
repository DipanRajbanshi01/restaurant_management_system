import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import { ThemeContext } from '../context/ThemeContext';

const FAQ = () => {
  const { theme } = useContext(ThemeContext);
  const [openIndex, setOpenIndex] = React.useState(null);

  const faqs = [
    {
      question: 'How do I place an order?',
      answer: 'Simply browse our menu, add items to your cart, and proceed to checkout. You can place orders through our website or mobile app.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept cash, credit/debit cards, and online payments. You can choose your preferred payment method during checkout.',
    },
    {
      question: 'How long does delivery take?',
      answer: 'Delivery times vary based on your location and order size. Typically, orders are delivered within 30-45 minutes. You can track your order in real-time.',
    },
    {
      question: 'Can I cancel my order?',
      answer: 'You can cancel orders that are still pending (not yet being prepared). Once cooking has started, orders cannot be cancelled.',
    },
    {
      question: 'Do you offer vegetarian options?',
      answer: 'Yes! We have a wide variety of vegetarian dishes. Look for the "Veg" tag on menu items or use our filter options.',
    },
    {
      question: 'How can I track my order?',
      answer: 'After placing an order, you can track its status in the "Orders" section of your dashboard. You\'ll receive real-time updates as your order progresses.',
    },
    {
      question: 'What are your restaurant hours?',
      answer: 'We are open Monday through Sunday from 11:00 AM to 11:00 PM. We also offer special hours during holidays.',
    },
    {
      question: 'Can I modify my order after placing it?',
      answer: 'You can add notes or special instructions when placing your order. For modifications after ordering, please contact our support team through the chatbot.',
    },
    {
      question: 'Do you have a loyalty program?',
      answer: 'We\'re working on implementing a loyalty program! Stay tuned for updates on rewards and special offers.',
    },
    {
      question: 'How do I provide feedback?',
      answer: 'You can leave feedback on individual menu items or your overall order experience. Visit the "Feedback" section in your dashboard to share your thoughts.',
    },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

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
              <span className="text-6xl mr-4">❓</span>
              Frequently Asked Questions
            </h1>
            <p className={`text-xl ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Find answers to common questions about our restaurant and ordering system
            </p>
          </div>

          {/* FAQ Items */}
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={`rounded-lg shadow-lg overflow-hidden transition-all duration-300 ${
                  theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white'
                }`}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className={`w-full px-6 py-4 text-left flex justify-between items-center hover:bg-opacity-90 transition-colors ${
                    theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                  }`}
                >
                  <span className={`font-semibold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                    {faq.question}
                  </span>
                  <span className={`text-2xl transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''} ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    ▼
                  </span>
                </button>
                {openIndex === index && (
                  <div className={`px-6 py-4 border-t ${theme === 'dark' ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
                    <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contact Section */}
          <div className={`mt-12 p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-lg'}`}>
            <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              Still have questions?
            </h2>
            <p className={`mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Can't find what you're looking for? Our support team is here to help!
            </p>
            <div className="flex space-x-4">
              <Link
                to="/"
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  theme === 'dark'
                    ? 'bg-orange-600 text-white hover:bg-orange-700'
                    : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600'
                }`}
              >
                Contact Support
              </Link>
              <Link
                to="/terms"
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Terms & Conditions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;

