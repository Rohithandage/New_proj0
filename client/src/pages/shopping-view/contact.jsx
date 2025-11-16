

// function ContactUs() {
//   return (

//     <div>
//         Hello All
//     </div>
//    );
// }
// export default ContactUs;
import React from "react";

export default function ContactUs() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12 text-center">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Contact Us</h2>

      <p className="text-lg text-gray-600 mb-4">
        We’d love to hear from you! Whether you’re a customer looking to place
        an order, or a business interested in dropshipping collaboration, reach
        out to us.
      </p>

      <div className="bg-pink-50 rounded-2xl shadow-md p-6 inline-block">
        <p className="text-lg text-gray-700 mb-2">
          📧 Email:{" "}
          <a
            href="mailto:shinecraft2002@gmail.com"
            className="text-pink-600 font-medium hover:underline"
          >
            shinecraft2002@gmail.com
          </a>
        </p>

        <p className="text-lg text-gray-700 mb-2">
          🌐 Order directly from our website
        </p>

        <p className="text-lg text-gray-700">
          🛍 For dropshipping partnerships, contact us and we’ll get back to you
          quickly.
        </p>
      </div>

      <p className="text-lg text-pink-600 font-semibold mt-6">
        ✨ Let’s shine together with jewelry that tells a story.
      </p>
    </div>
  );
}
