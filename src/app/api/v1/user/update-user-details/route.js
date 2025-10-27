import { connectDB } from "@/app/api/lib/db";
import Users from "@/app/api/models/Users";


export async function POST(req){
   await connectDB();
   try {
       const { id, name, email, phone,boutiqueName,boutiqueType,address } = await req.json();
       if (!id)  {
           return new Response(JSON.stringify({ error: "ID is required" }), {
               status: 400,
           });
       }

       const user = await Users.findByIdAndUpdate(
           id,
           { name, email, phone,boutiqueName,boutiqueType,address },
           { new: true }
       );
       
       if (!user) {
           return new Response(JSON.stringify({ error: "User not found" }), {
               status: 404,
           });
       }
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