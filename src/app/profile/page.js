
// "use client";

// import { useEffect, useState } from "react";
// import { Poppins } from "next/font/google";
// import { signOut, useSession } from "next-auth/react";
// import toast, { Toaster } from "react-hot-toast";


// const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600", "700"], display: "swap" });

// export default function SettingsPage() {
//   // profile form state
//   const [profile, setProfile] = useState({
//     name: "",
//     phone: "",
//     email: "",
//     boutiqueName: "",
//     boutiqueType: "",
//     address: "",
//   });

//   // password form state
//   const [passwords, setPasswords] = useState({
//     current: "",
//     newPass: "",
//     confirm: "",
//   });

//   // show/hide toggles for password inputs
//   const [showCurrent, setShowCurrent] = useState(false);
//   const [showNew, setShowNew] = useState(false);
//   const [showConfirm, setShowConfirm] = useState(false);
//   const[loading,setLoading]=useState(false)
//   const{data:session}=useSession()
//   console.log("session::",session?.user?.id)
//   let userId=session?.user?.id

//   const getUserDetails = async () => {
//     if(!session?.user?.id) return
//     const toastId = toast.loading("Fetching user details...");
//     setLoading(true);

//     try {
//       const id = session?.user?.id;
//       if (!id) throw new Error("No user id in session");

//       const res = await fetch(`/api/v1/user/get-user-details?id=${encodeURIComponent(id)}`);
//       const data = await res.json();

//       if (!res.ok) {
//         // show server-provided message if present
//         toast.error(data?.error || "Failed to fetch user details", { id: toastId });
//         throw new Error(data?.error || "Failed to fetch user details");
//       }

//       const returnedUser = data.user;

     

    

//       toast.success("User details loaded", { id: toastId });
//       setLoading(false);
//        console.log("returnedUser::",returnedUser)
//        setProfile(returnedUser)
//       return returnedUser;
     
//     } catch (err) {
//       console.error("getUserDetails error:", err);
//       toast.error(err.message || "Could not fetch user details", { id: toastId });
//       setLoading(false);
//       return null;
//     }
//   };


//   useEffect(()=>{
//     if(!session?.user?.id) return
//     getUserDetails()
//   },[userId])
//   // sample devices
//   const [devices] = useState([
//     { id: 1, title: "Windows 11", meta: "Vjd, AP - 12th June, 12:30pm" },
//     { id: 2, title: "Desktop", meta: "Vjd, AP - 10th June, 12:30pm" },
//   ]);

//   // simple handlers (replace with API calls)
//   const handleProfileChange = (e) => {
//     const { name, value } = e.target;
//     setProfile((p) => ({ ...p, [name]: value }));
//   };

//   const handlePasswordChange = (e) => {
//     const { name, value } = e.target;
//     setPasswords((p) => ({ ...p, [name]: value }));
//   };

//   // replace the existing saveProfile in src/app/settings/page.jsx with this:
// const saveProfile = async (e) => {
//   e.preventDefault();

//   if (!session?.user?.id) {
//     toast.error("You must be signed in to save profile.");
//     return;
//   }

//   // basic validation example (optional)
//   if (!profile.name || !profile.email) {
//     toast.error("Name and email are required.");
//     return;
//   }

//   const toastId = toast.loading("Saving profile...");
//   setLoading(true);

//   try {
//     const payload = {
//       id: session.user.id,
//       name: profile.name ?? "",
//       email: profile.email ?? "",
//       phone: profile.phone ?? "",
//       boutiqueName: profile.boutiqueName ?? "",
//       boutiqueType: profile.boutiqueType ?? "",
//       address: profile.address ?? "",
//     };

//     const res = await fetch("/api/v1/user/update-user-details", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(payload),
//     });

//     const data = await res.json();

//     if (!res.ok) {
//       // prefer server message, fallback to generic
//       throw new Error(data?.error || "Failed to update profile");
//     }

//     // update local state with returned user (API returns { user })
//     const updatedUser = data.user ?? data;
//     setProfile((prev) => ({ ...prev, ...updatedUser }));

//     toast.success("Profile updated", { id: toastId });
//   } catch (err) {
//     console.error("saveProfile error:", err);
//     toast.error(err?.message || "Could not save profile", { id: toastId });
//   } finally {
//     setLoading(false);
//   }
// };


//   const savePassword = async (e) => {
//     e.preventDefault();
//     if (passwords.newPass !== passwords.confirm) {
//       toast.error("New password and confirm password do not match.");
//       return;
//     }
    
//   const toastId = toast.loading("Saving password...");
//   setLoading(true);
//     try {
//       const res = await fetch("/api/v1/user/update-user-password", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ id: session.user.id, 
//           currentPassword: passwords.current,
//            newPassword: passwords.newPass 
//           }),
//       });
//       const data = await res.json();
//       if (!res.ok) {
//         toast.error(data?.error || "Failed to update password", { id: toastId });
//         throw new Error(data?.error || "Failed to update password");
//       }

//       toast.success("Password updated", { id: toastId });
//       setPasswords({ current: "", newPass: "", confirm: "" });
//     setShowCurrent(false);
//     setShowNew(false);
//     setShowConfirm(false);

//     } catch (error) {
//       console.log("savePassword error:", error);
//       toast.error(error?.message || "Could not save password", { id: toastId });
//     }
//     finally{
//       setLoading(false);
//     }
  
    
//   };

//   const logoutAllDevices = async() => {
//     let toastId = toast.loading("Logging out... ");
//      await signOut({
//       callbackUrl: "/login",})
//       toast.success("Logged out of all devices", { id: toastId });
//   };

//   return (
//     <div className={`${poppins.className} min-h-screen bg-[#0f1230] py-6 px-3`}>
//       <div className="mx-auto max-w-[1180px]">
//         <Toaster />
//         <div className="rounded-[18px] bg-white overflow-hidden shadow-xl">
//           {/* grid: single column on mobile, two columns on md+ */}
//           <div className="grid grid-cols-1 md:grid-cols-2">
//             {/* Left column - profile */}
//             <div className="bg-[#F3F5F8] px-4 py-5 md:px-8 md:py-8">
//               <div className="flex items-start justify-between mb-4 md:mb-6">
//                 <h2 className="text-xl md:text-2xl font-semibold text-[#252525]">Account Settings</h2>
//                 <button className="text-[#111827]/60 p-2 rounded hover:bg-white/50 hidden md:inline-flex">
//                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                     <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" stroke="#111827" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
//                     <path d="M20.71 7.04a1 1 0 0 0 0-1.41L18.37 3.29a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" stroke="#111827" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
//                   </svg>
//                 </button>
//               </div>

//               <form onSubmit={saveProfile} className="space-y-3 md:space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-[#252525] mb-2">Full Name</label>
//                   <input
//                     name="name"
//                     placeholder="Enter your name"
//                     value={profile.name}
//                     onChange={handleProfileChange}
//                     className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm md:px-4 md:py-2 outline-none focus:ring-2 focus:ring-[#E9D9FF]"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-[#252525] mb-2">Phone Number</label>
//                   <input
//                     name="phone"
//                     value={profile.phone}
//                     onChange={handleProfileChange}
//                     placeholder="Enter your phone number"
//                     className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm md:px-4 md:py-2 outline-none focus:ring-2 focus:ring-[#E9D9FF]"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-[#252525] mb-2">Personal Email</label>
//                   <input
//                     name="email"
//                     value={profile.email}
//                     onChange={handleProfileChange}
//                     placeholder="Enter your email"
//                     className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm md:px-4 md:py-2 outline-none focus:ring-2 focus:ring-[#E9D9FF]"
//                   />
//                 </div>


//                   <div>
//                     <label className="block text-sm font-medium text-[#252525] mb-2">Boutique name</label>
//                     <input
//                       name="boutiqueName"
//                       value={profile.boutiqueName}
//                       onChange={handleProfileChange}
//                       placeholder="Enter your boutique name"
//                       className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#E9D9FF]"
//                     />
//                   </div>



                
//                   <div>
//                     <label className="block text-sm font-medium text-[#252525] mb-2">Boutique type</label>
//                     <input
//                       name="boutiqueType"
//                       value={profile.boutiqueType}
//                       onChange={handleProfileChange}
//                       placeholder="Enter your boutique type"
//                       className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#E9D9FF]"
//                     />
//                   </div>

//                 <div>
//                   <label className="block text-sm font-medium text-[#252525] mb-2">Store address</label>
//                   <textarea
//                     name="address"
//                     value={profile.address}
//                     onChange={handleProfileChange}
//                     placeholder="Enter"
//                     className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#E9D9FF] h-20 resize-none"
//                   />
//                 </div>

//                 <div className="pt-1">
//                   <button
//   type="submit"
//   disabled={loading}
//   className={`w-full md:w-44 bg-gradient-to-r from-[#5E3BA4] to-[#A78CF6] text-white py-2 rounded-full font-semibold shadow
//     ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
// >
//   {loading ? "Saving..." : "Save"}
// </button>

//                 </div>
//               </form>
//             </div>

//             {/* Right column - password & devices */}
//             <div className="px-4 py-5 md:px-8 md:py-8 bg-white">
//               <div className="space-y-6">
//                 <div>
//                   <h3 className="text-lg font-semibold text-[#252525] mb-3">Change password</h3>

//                   <form onSubmit={savePassword} className="space-y-3">
//                     <div>
//                       <label className="block text-sm text-slate-700 mb-2">Current Password</label>
//                       <div className="relative">
//                         <input
//                           name="current"
//                           placeholder="Enter your current password"
//                           type={showCurrent ? "text" : "password"}
//                           value={passwords.current}
//                           onChange={handlePasswordChange}
//                           className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none pr-10"
//                         />
//                         <button
//                           type="button"
//                           onClick={() => setShowCurrent((s) => !s)}
//                           className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 p-1"
//                           aria-label="Toggle current password"
//                         >
//                           {showCurrent ? (
//                             <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 3l18 18" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round"/></svg>
//                           ) : (
//                             <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round"/></svg>
//                           )}
//                         </button>
//                       </div>
//                     </div>

//                     <div>
//                       <label className="block text-sm text-slate-700 mb-2">New Password</label>
//                       <div className="relative">
//                         <input
//                           name="newPass"
//                           type={showNew ? "text" : "password"}
//                           value={passwords.newPass}
//                           onChange={handlePasswordChange}
//                           placeholder="Enter"
//                           className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none pr-10"
//                         />
//                         <button
//                           type="button"
//                           onClick={() => setShowNew((s) => !s)}
//                           className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 p-1"
//                           aria-label="Toggle new password"
//                         >
//                           {showNew ? (
//                             <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 3l18 18" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round"/></svg>
//                           ) : (
//                             <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round"/></svg>
//                           )}
//                         </button>
//                       </div>
//                     </div>

//                     <div>
//                       <label className="block text-sm text-slate-700 mb-2">Confirm Password</label>
//                       <div className="relative">
//                         <input
//                           name="confirm"
//                           type={showConfirm ? "text" : "password"}
//                           value={passwords.confirm}
//                           onChange={handlePasswordChange}
//                           placeholder="Enter"
//                           className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none pr-10"
//                         />
//                         <button
//                           type="button"
//                           onClick={() => setShowConfirm((s) => !s)}
//                           className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 p-1"
//                           aria-label="Toggle confirm password"
//                         >
//                           {showConfirm ? (
//                             <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 3l18 18" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round"/></svg>
//                           ) : (
//                             <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round"/></svg>
//                           )}
//                         </button>
//                       </div>
//                     </div>

//                     <div className="pt-1">
//                       <button
//   type="submit"
//   disabled={loading}
//   className={`w-full md:w-44 bg-gradient-to-r from-[#5E3BA4] to-[#A78CF6] text-white py-2 rounded-full font-semibold shadow
//     ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
// >
//   {loading ? "Saving..." : "Save"}
// </button>

//                     </div>
//                   </form>
//                 </div>

//                 <div>
//                   <h4 className="font-semibold text-[#252525] mb-2">Your devices</h4>
//                   <div className="text-sm text-slate-500 mb-3">Devices linked to this account</div>

//                   <div className="mb-3">
//                     <button
//                       onClick={logoutAllDevices}
//                       className="w-full bg-[#F3E9FF] text-[#3B1F7A] py-2 rounded-md"
//                     >
//                       Log out from all devices
//                     </button>
//                   </div>

//                   <div className="space-y-3">
//                     {devices.map((d) => (
//                       <div key={d.id} className="border-t pt-3 first:border-t-0">
//                         <div className="flex items-center justify-between">
//                           <div className="flex items-center gap-3">
//                             <div className="w-9 h-9 rounded-full bg-[#F3F4F6] grid place-items-center">
//                               <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="12" rx="2" stroke="#6B7280" strokeWidth="1.2"/></svg>
//                             </div>
//                             <div>
//                               <div className="font-medium text-[#111827]">{d.title}</div>
//                               <div className="text-xs text-slate-500">{d.meta}</div>
//                             </div>
//                           </div>

//                           <button title="Sign out this device" className="text-slate-500 p-2 rounded hover:bg-slate-50">
//                             <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M10 17l5-5-5-5" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
//                           </button>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             </div>
//             {/* end right */}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
