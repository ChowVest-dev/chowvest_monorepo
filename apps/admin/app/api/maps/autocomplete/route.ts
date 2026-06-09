import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const { input } = await req.json();

    if (!input) {
      return NextResponse.json({ suggestions: [] });
    }

    const options = {
      method: "POST",
      url: "https://google-map-places-new-v2.p.rapidapi.com/v1/places:autocomplete",
      headers: {
        "x-rapidapi-key": "04082f6d57msh8052ff38a951369p10d90ajsnc7390354caf8",
        "x-rapidapi-host": "google-map-places-new-v2.p.rapidapi.com",
        "Content-Type": "application/json",
        "X-Goog-FieldMask": "*",
      },
      data: {
        input: input,
      },
    };

    const response = await axios.request(options);
    // console.log("Autocomplete API Response:", JSON.stringify(response.data, null, 2));
    
    // Google API returns suggestions in `suggestions` array
    // Each suggestion has a `placePrediction.text.text`
    return NextResponse.json({ suggestions: response.data.suggestions || [] });
  } catch (error) {
    console.error("Autocomplete API Error:", error);
    return NextResponse.json({ error: "Failed to fetch autocomplete suggestions", suggestions: [] }, { status: 500 });
  }
}
