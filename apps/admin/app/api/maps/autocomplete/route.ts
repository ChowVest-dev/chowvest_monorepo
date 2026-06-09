import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const { input } = await req.json();

    if (!input) {
      return NextResponse.json({ suggestions: [] });
    }

    try {
      // Primary API
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
      
      if (response.data && response.data.suggestions) {
         return NextResponse.json({ suggestions: response.data.suggestions });
      }
      throw new Error("Primary API returned no suggestions array");
    } catch (primaryError: any) {
      console.warn("Primary API failed, falling back to secondary API...");
      
      // Fallback API
      const fallbackOptions = {
        method: "GET",
        url: "https://google-place-autocomplete-and-place-info.p.rapidapi.com/maps/api/place/autocomplete/json",
        params: { input: input },
        headers: {
          "x-rapidapi-key": "04082f6d57msh8052ff38a951369p10d90ajsnc7390354caf8",
          "x-rapidapi-host": "google-place-autocomplete-and-place-info.p.rapidapi.com",
        },
      };

      const fallbackResponse = await axios.request(fallbackOptions);
      // The fallback returns { predictions: [...] }
      return NextResponse.json({ suggestions: fallbackResponse.data.predictions || [] });
    }

  } catch (error) {
    console.error("Autocomplete API Error:", error);
    return NextResponse.json({ error: "Failed to fetch autocomplete suggestions", suggestions: [] }, { status: 500 });
  }
}
