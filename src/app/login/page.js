"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Poppins } from "next/font/google";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const BACKGROUND_IMG = "/images/Login.png";

export default function LoginPage() {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // ✅ Send OTP
  async function handleSendOtp() {
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!/^\d{10}$/.test(phoneNumber)) {
      toast.error("Enter a valid 10-digit phone number");
      return;
    }
    setLoading(true);
    const toastId = toast.loading("Sending OTP...");
    try {
      const res = await fetch("/api/v1/auth/register/SendOtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: phoneNumber, name }), // ✅ send name
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("OTP sent successfully!", { id: toastId });
        setOtpSent(true);
      } else {
        toast.error(data.message || "Failed to send OTP", { id: toastId });
      }
    } catch (err) {
      toast.error("Error sending OTP", { id: toastId });
    } finally {
      setLoading(false);
    }
  }

  // ✅ Verify OTP
  async function handleVerifyOtp(e) {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error("Enter valid 6-digit OTP");
      return;
    }
    setLoading(true);
    const toastId = toast.loading("Verifying OTP...");
    try {
      const res = await fetch("/api/v1/auth/register/VerifyOtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: phoneNumber, otp }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("OTP verified!", { id: toastId });
window.location.href = "/dashboard";
      } else {
        toast.error(data.message || "Invalid OTP", { id: toastId });
      }
    } catch (err) {
      toast.error("Error verifying OTP", { id: toastId });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`${poppins.className} min-h-screen relative`}>
      <Toaster />
      <div className="absolute inset-0 -z-10">
        <Image src={BACKGROUND_IMG} alt="bg" fill style={{ objectFit: "fill" }} />
        <div className="absolute inset-0 bg-black/55" />
      </div>

      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-[980px]">
          <div className="mx-auto max-w-lg">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 text-center md:text-left">
              Welcome Back!
            </h1>
            <p className="text-sm md:text-base text-white/80 mb-8 text-center md:text-left">
              Login with your phone number to continue.
            </p>

            <form
              onSubmit={handleVerifyOtp}
              className="mx-auto bg-white/6 backdrop-blur-md p-6 rounded-2xl max-w-lg"
              style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.45)" }}
            >
              {/* ✅ Name Input */}
              <label className="block text-sm text-white/85 mb-2">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full rounded-full px-5 py-3 mb-4 bg-white/20 text-white placeholder:text-white/60 outline-none border border-white/10 focus:ring-2 focus:ring-white/20 transition"
                disabled={otpSent} // disable after OTP sent
              />

              {/* Phone Input */}
              <label className="block text-sm text-white/85 mb-2">Phone Number</label>
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter 10-digit number"
                  className="w-full rounded-full px-5 py-3 bg-white/20 text-white placeholder:text-white/60 outline-none border border-white/10 focus:ring-2 focus:ring-white/20 transition"
                  disabled={otpSent}
                />
                {!otpSent && (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading}
                    className="text-amber-400 hover:text-amber-300 font-semibold text-sm whitespace-nowrap"
                  >
                    {loading ? "Sending..." : "Send OTP"}
                  </button>
                )}
              </div>

              {/* OTP Input + Log In button (only shown after OTP sent) */}
              {otpSent && (
                <>
                  <label className="block text-sm text-white/85 mb-2">OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter OTP"
                    className="w-full rounded-full px-5 py-3 mb-4 bg-white/20 text-white placeholder:text-white/60 outline-none border border-white/10 focus:ring-2 focus:ring-white/20 transition"
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-amber-500 hover:bg-amber-600 mt-3 text-white rounded-full py-3 font-semibold text-lg transition-shadow shadow-md"
                  >
                    {loading ? "Verifying..." : "Log In"}
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
