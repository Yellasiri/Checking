import { connectDB } from "@/app/api/lib/db";
import Users from "@/app/api/models/Users";
import bcrypt from "bcryptjs";

 export async function POST(req){
    await connectDB();
    try {
        const { id,  currentPassword, newPassword } = await req.json();
        if (!id)  {
            return new Response(JSON.stringify({ error: "ID is required" }), {
                status: 400,
            });
        }
        const user = await Users.findById(id);
        if (!user) {
            return new Response(JSON.stringify({ error: "User not found" }), {
                status: 404,
            });
        }
        const isPasswordMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordMatch) {
            return new Response(JSON.stringify({ error: "Current password is incorrect" }), {
                status: 401,
            });
        }
        let  newhashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = newhashedPassword;
        await user.save();

       
        
        return new Response(JSON.stringify({ user }), {
            status: 200,
        });
    }
    catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
        });
    }
 }