"use client";
import { useState } from "react";
import TransgateConnect from "@zkpass/transgate-js-sdk";
import { ethers } from "ethers";
import AttestationABI from "./AttestationABI.json";
import { Res } from "./lib/types";
import verifyEvmBasedResult from "./verifyEvmBasedResult";


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
  const [result, setResult] = useState<any>();
  const [attestAtationTx, setAttestAtationTx] = useState<string>();

  const start = async (schemaId: string, appid: string) => {
    try {
      const connector = new TransgateConnect(appid);
      const isAvailable = await connector.isTransgateAvailable();
      if (!isAvailable) {
        return alert("Please install zkPass TransGate");
      }


      const contractAddress = "0x79208010a972D0C0a978a9073bd0dcb659152072";
      const contract = new ethers.Contract(
        contractAddress,
        AttestationABI,
      );



      const res = await connector.launch(schemaId) as Res ;
      setResult(res);

      const isVerified = verifyEvmBasedResult(res, schemaId)

      if (!isVerified) {
        return alert("Invalid result");
      }

      const taskId = ethers.hexlify(ethers.toUtf8Bytes(res.taskId));
      schemaId = ethers.hexlify(ethers.toUtf8Bytes(schemaId));

      const chainParams = {
        taskId,
        schemaId,
        uHash: res.uHash,
        publicFieldsHash: res.publicFieldsHash,
        validator: res.validatorAddress,
        allocatorSignature: res.allocatorSignature,
        validatorSignature: res.validatorSignature,
      };

      const t = await contract.attest(chainParams);
      setAttestAtationTx(t.hash);
      setFollowed(true);
    } catch (err) {
      alert(JSON.stringify(err));
      console.log("error", err);
    }
  };

  const [followed, setFollowed] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-purple-500 to-blue-500 text-white">
    {!followed ? (
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Verify Your DataCamp Account(For Ghanaian participants)</h1>
        <a
          href="https://datacamp.com"
          target="_blank"
          className="bg-black px-6 py-2 rounded-md text-xl hover:bg-gray-800"
        >
          Go to DataCamp
        </a>
        <p className="mt-4">Once you have a DataCamp account, click below to verify:</p>
        <button
          onClick={()=> start(value1, appid1)}
          className="mt-4 px-4 py-2 bg-green-500 rounded-md text-lg hover:bg-green-600"
        >
          Verify DataCamp User
        </button>
      </div>
    ) : (
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Thank You for Verifying!</h1>
        <p className="text-xl">You are confirmed as a DataCamp user from Ghana. This is a simple demonstration of zkPass.</p>
      </div>
    )}
  </div>
  );
}
