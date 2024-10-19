"use client";
import { useState } from "react";
import TransgateConnect from "@zkpass/transgate-js-sdk";
import { ethers } from "ethers";
import { Res } from "./lib/types";
import verifyEvmBasedResult from "./verifyEvmBasedResult";
import verifySecondResult from "./verifySecondResult"; // Import second verification function

declare global {
  interface Window {
    ethereum: any;
  }
}

export default function Home() {
  const [appid1, setAppid1] = useState<string>(
    "e4f3f86f-57dd-4e5a-b640-a1e80e181575"
  );
  const [value1, setValue1] = useState<string>(
    "95e967845924499bb926fa790ae063cb"
  );
  const [value2, setValue2] = useState<string>(
    "01a2c958c36948e3b125ed9fd5e55dd3"
  );

  const [result, setResult] = useState<any>();
  const [isVerified1, setIsVerified1] = useState(false);
  const [isVerified2, setIsVerified2] = useState(false);

  const start = async (schemaId: string, appid: string, setVerified: (val: boolean) => void) => {
    try {
      const connector = new TransgateConnect(appid);
      const isAvailable = await connector.isTransgateAvailable();
      if (!isAvailable) {
        return alert("Please install zkPass TransGate");
      }

      const res = (await connector.launch(schemaId)) as Res;
      setResult(res);

      const isVerified = schemaId === "95e967845924499bb926fa790ae063cb" 
        ? verifyEvmBasedResult(res, schemaId) 
        : verifySecondResult(res, schemaId);

      if (!isVerified) {
        return alert("Invalid result");
      }

      const taskId = ethers.hexlify(ethers.toUtf8Bytes(res.taskId));
      schemaId = ethers.hexlify(ethers.toUtf8Bytes(schemaId));

      setVerified(true); // Update the corresponding verification state
    } catch (err) {
      alert(JSON.stringify(err));
      console.log("error", err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-purple-500 to-blue-500 text-white">
      {isVerified1 && isVerified2 ? (
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Thank You for Verifying!</h1>
          <p className="text-xl">
            You have completed both verifications. You are confirmed as a DataCamp user from Ghana. This is a simple demonstration of zkPass.
          </p>
        </div>
      ) : (
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Verify Your DataCamp Account (For Ghanaian participants)</h1>
          <a
            href="https://datacamp.com"
            target="_blank"
            className="bg-black px-6 py-2 rounded-md text-xl hover:bg-gray-800"
          >
            Go to DataCamp
          </a>
          <p className="mt-4">Once you have a DataCamp account, click below to verify:</p>

          {/* First Verification Button */}
          <button
            onClick={() => start(value1, appid1, setIsVerified1)}
            className={`mt-4 px-4 py-2 bg-green-500 rounded-md text-lg hover:bg-green-600 ${isVerified1 ? "opacity-50" : ""}`}
            disabled={isVerified1}
          >
            Verify Ghanaian {isVerified1 && "✔"}
          </button>

          {/* Second Verification Button */}
          <button
            onClick={() => start(value2, appid1, setIsVerified2)}
            className={`mt-4 px-4 py-2 bg-blue-500 rounded-md text-lg hover:bg-blue-600 ${isVerified2 ? "opacity-50" : ""}`}
            disabled={isVerified2}
          >
            Verify Second Check {isVerified2 && "✔"}
          </button>

          {/* Show ticks for individual verifications */}
          <div className="mt-4">
            <p className="text-xl">Verification Status:</p>
            <p>First Verification: {isVerified1 ? "✔ Verified" : "❌ Not Verified"}</p>
            <p>Second Verification: {isVerified2 ? "✔ Verified" : "❌ Not Verified"}</p>
          </div>
        </div>
      )}
    </div>
  );
}
