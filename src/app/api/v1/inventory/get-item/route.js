import { connectDB } from "@/app/api/lib/db";
import InventoryItem from "@/app/api/models/InventoryItem";


export  async function GET(){
    await connectDB()
    try {
        const items=await InventoryItem.find({})
        if(!items || items.length === 0){
            return new Response(JSON.stringify({ message: "No items found" }), { status: 404 });
        }
        return new Response(JSON.stringify({items}), { status: 200 });
    } catch (error) {
        console.error("Error fetching items:", error);
        return new Response(JSON.stringify({ error: "Failed to fetch items" }), { status: 500 });
    }
}