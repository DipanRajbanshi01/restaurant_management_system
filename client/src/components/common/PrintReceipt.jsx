import React from 'react';

const PrintReceipt = ({ order, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 print:p-8 print:shadow-none print:max-w-none">
        {/* Print Button - Hidden when printing */}
        <div className="flex justify-end mb-4 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 mr-2"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            🖨️ Print Receipt
          </button>
        </div>

        {/* Receipt Content */}
        <div className="print:border-2 print:border-gray-300 print:p-8">
          {/* Header */}
          <div className="text-center mb-6 border-b-2 border-gray-300 pb-4">
            <h2 className="text-3xl font-bold mb-2">COL Restaurant</h2>
            <p className="text-gray-600">Thank you for your order!</p>
          </div>

          {/* Order Info */}
          <div className="mb-6 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Order ID:</span>
              <span className="font-semibold">#{order._id.slice(-6)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-semibold">
                {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="font-semibold capitalize">{order.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment:</span>
              <span className="font-semibold capitalize">{order.paymentStatus}</span>
            </div>
          </div>

          {/* Items */}
          <div className="mb-6 border-t-2 border-b-2 border-gray-300 py-4">
            <h3 className="font-bold mb-3">Items:</h3>
            {order.items?.map((item, idx) => (
              <div key={idx} className="mb-3">
                <div className="flex justify-between mb-1">
                  <span className="font-semibold">{item.item?.name || 'N/A'}</span>
                  <span className="font-semibold">Rs. {item.price * item.quantity}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Qty: {item.quantity} x Rs. {item.price}</span>
                </div>
                {item.specialInstructions && (
                  <div className="text-xs text-gray-500 mt-1 italic">
                    Note: {item.specialInstructions}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <p className="text-sm font-semibold text-gray-700">Order Notes:</p>
              <p className="text-sm text-gray-600">{order.notes}</p>
            </div>
          )}

          {/* Estimated Time */}
          {order.estimatedTime && (
            <div className="mb-4 p-3 bg-blue-50 rounded">
              <p className="text-sm font-semibold text-blue-700">Estimated Wait Time:</p>
              <p className="text-sm text-blue-600">{order.estimatedTime} minutes</p>
            </div>
          )}

          {/* Total */}
          <div className="border-t-2 border-gray-300 pt-4 mb-6">
            <div className="flex justify-between text-xl font-bold">
              <span>Total:</span>
              <span>Rs. {order.totalPrice}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-600 border-t-2 border-gray-300 pt-4">
            <p>Thank you for choosing COL Restaurant!</p>
            <p className="mt-2">Visit us again soon!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintReceipt;

