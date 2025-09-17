import React from "react";
import Avatar from "./Avatar";

// Test component to verify LinkedIn image proxy is working
const ImageTest: React.FC = () => {
  const testLinkedInUrl =
    "https://media.licdn.com/dms/image/v2/D5603AQFp3U1hagGhOQ/profile-displayphoto-shrink_100_100/B56ZcdCPj9GQAY-/0/1748538818506?e=1760572800&v=beta&t=bgtfWTCu4A0qyvemgFGolstC1xR2dVVpuyrM8pSjH3c";

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold text-white">LinkedIn Image Test</h2>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg text-white mb-2">
            Direct LinkedIn URL (will likely fail):
          </h3>
          <img
            src={testLinkedInUrl}
            alt="Direct LinkedIn"
            className="w-20 h-20 rounded-full object-cover"
            onError={(e) => {
              console.error("Direct image failed to load");
              e.currentTarget.style.border = "2px solid red";
            }}
            onLoad={() => console.log("Direct image loaded successfully")}
          />
        </div>

        <div>
          <h3 className="text-lg text-white mb-2">
            Using Avatar Component (should work):
          </h3>
          <Avatar src={testLinkedInUrl} name="Test User" size="lg" />
        </div>

        <div>
          <h3 className="text-lg text-white mb-2">Fallback Avatar (no src):</h3>
          <Avatar src="" name="Fallback User" size="lg" />
        </div>
      </div>
    </div>
  );
};

export default ImageTest;
