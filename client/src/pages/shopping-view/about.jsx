

// function AboutUs() {
//   return (

//     <div>
//         Hello All
//     </div>
//    );
// }
// export default AboutUs;
import React from "react";

export default function AboutUs() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12 text-center">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">About Us</h2>

      <p className="text-lg text-gray-600 leading-relaxed mb-4">
        At <span className="font-semibold text-pink-600">ShineCraft</span>, we
        believe jewelry is more than just an accessory—it’s a reflection of
        individuality, elegance, and artistry.
      </p>

      <p className="text-lg text-gray-600 leading-relaxed mb-4">
        We specialize in handcrafted jewelry including{" "}
        <span className="font-medium">
          earrings, necklaces, and unique designs
        </span>
        , created with love and care to bring out the sparkle in every person.
      </p>

      <p className="text-lg text-gray-600 leading-relaxed">
        Along with our own collections, we also work as trusted{" "}
        <span className="font-medium">dropshippers</span> for jewelry stores and
        resellers worldwide. Our mission is simple:{" "}
        <span className="font-semibold">
          deliver beautiful jewelry at affordable prices
        </span>
        , while making it easier for anyone to sell high-quality handcrafted
        pieces.
      </p>
    </div>
  );
}
